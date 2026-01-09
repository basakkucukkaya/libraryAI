import { useState, useEffect, useContext } from 'react';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getReadingLists, createReadingList, getBooks } from '@/services/api';
import { ReadingList, Book } from '@/types';
import { formatDate } from '@/utils/formatters';
import { handleApiError, showSuccess } from '@/utils/errorHandling';
import { AuthContext } from '@/contexts/AuthContext';


const AI_API_URL = 'https://j50akimnag.execute-api.us-east-1.amazonaws.com/analyze';

export function ReadingLists() {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const [lists, setLists] = useState<ReadingList[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, any>>({});
  const [isAiLoading, setIsAiLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [listsData, booksData] = await Promise.all([
        getReadingLists(),
        getBooks()
      ]);
      setLists(listsData);
      setAllBooks(booksData);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiAnalyze = async (listId: string, bookIds: string[]) => {
    const titles = allBooks
      .filter(book => bookIds.includes(book.id))
      .map(book => book.title);

    if (titles.length === 0) {
      alert("Please add some books to the list first!");
      return;
    }

    setIsAiLoading(prev => ({ ...prev, [listId]: true }));
    try {
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titles })
      });

      const data = await response.json();
      console.log("AI Raw Data:", data); 

      
      if (data && data.recommendations && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        setAiAnalysis(prev => ({ ...prev, [listId]: data }));
      } else {
        console.error("Format Error:", data);
        alert("AI responded, but the format was not what we expected. Check console.");
      }
    } catch (error) {
      console.error("AI Fetch Error:", error);
      alert("Could not connect to AI. Check your CORS settings or API URL.");
    } finally {
      setIsAiLoading(prev => ({ ...prev, [listId]: false }));
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim() || !user?.id) return;
    setIsLoading(true);
    try {
      const newList = await createReadingList({
        userId: user.id,
        name: newListName,
        description: newListDescription,
        bookIds: [],
      });
      setLists((prevLists) => [...prevLists, newList]);
      setIsModalOpen(false);
      setNewListName('');
      setNewListDescription('');
      showSuccess('Reading list created successfully!');
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBookTitles = (bookIds: string[] = []) => {
    const titles = allBooks
      .filter(book => bookIds.includes(book.id))
      .map(book => book.title);
    return titles.length > 0 ? titles.join(', ') : 'No books added yet';
  };

  if (isLoading && lists.length === 0) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">My Reading Lists</h1>
            <p className="text-slate-600">Analyze your collection with AI</p>
          </div>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>Create New List</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <div key={list.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold mb-2 text-slate-800">{list.name}</h3>
              <p className="text-slate-500 mb-4 text-sm line-clamp-2">{list.description}</p>
              
              <div className="mb-4 p-3 bg-slate-50 rounded-lg text-sm italic text-slate-600 border border-slate-100">
                {getBookTitles(list.bookIds)}
              </div>

              {/* AI ANALİZ KUTUSU */}
              {aiAnalysis[list.id] && aiAnalysis[list.id].recommendations && (
                <div className="mt-2 mb-4 p-4 bg-violet-50 rounded-xl border border-violet-100">
                  <div className="flex items-center gap-2 mb-2 text-violet-700">
                    <span className="text-lg">✨</span>
                    <h4 className="font-bold text-xs uppercase tracking-wider">AI Librarian Analysis</h4>
                  </div>
                  <p className="text-xs text-slate-700 mb-3 italic">"{aiAnalysis[list.id].analysis}"</p>
                  
                  <div className="bg-white p-3 rounded-lg border border-violet-100 shadow-sm">
                    <p className="text-[10px] font-bold text-violet-500 uppercase mb-1">Recommended for you</p>
                    <p className="text-sm font-bold text-slate-900">{aiAnalysis[list.id].recommendations[0].title}</p>
                    <p className="text-[11px] text-slate-500 mb-2">by {aiAnalysis[list.id].recommendations[0].author}</p>
                    <p className="text-[11px] text-slate-600 leading-snug bg-slate-50 p-2 rounded">
                        {aiAnalysis[list.id].recommendations[0].reason}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-violet-500" 
                          style={{ width: `${(aiAnalysis[list.id].recommendations[0].confidence || 0.9) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-violet-600">
                        {Math.round((aiAnalysis[list.id].recommendations[0].confidence || 0.9) * 100)}% Match
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-slate-100">
                <Button 
                  variant="secondary" 
                  className="w-full bg-violet-600 text-white hover:bg-violet-700 border-none shadow-sm h-10 mb-3"
                  onClick={() => handleAiAnalyze(list.id, list.bookIds)}
                  disabled={isAiLoading[list.id]}
                >
                  {isAiLoading[list.id] ? <LoadingSpinner size="sm" /> : '✨ Analyze with AI'}
                </Button>
                
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{list.bookIds?.length || 0} books</span>
                  <span>Created: {formatDate(list.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New List">
          <div className="space-y-4 pt-2">
            <Input label="List Name" value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder="e.g., Summer 2026 Reads" required />
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea value={newListDescription} onChange={(e) => setNewListDescription(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg min-h-[100px] text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none" placeholder="What is this list about?" />
            </div>
            <Button variant="primary" onClick={handleCreateList} className="w-full h-11" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create List'}
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}