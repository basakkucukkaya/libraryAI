import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getBook, getReadingLists, addBookToReadingList, addReview } from '@/services/api';
import { Book, ReadingList } from '@/types';
import { formatRating } from '@/utils/formatters';
import { handleApiError } from '@/utils/errorHandling';

export function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [lists, setLists] = useState<ReadingList[]>([]);
  const [selectedListId, setSelectedListId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // --- REVIEW STATES ---
  const [reviews, setReviews] = useState<any[]>([]); // Yorumları tutan state
  const [newReview, setNewReview] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (bookId: string) => {
    setIsLoading(true);
    try {
      const [bookData, listsData] = await Promise.all([
        getBook(bookId),
        getReadingLists()
      ]);

      if (!bookData) {
        navigate('/404');
        return;
      }
      setBook(bookData);
      setLists(listsData);
      
      // Kitap datası geldikten sonra yorumları çek
      await loadReviews(bookId);
    } catch (error) {
      console.error("Data loading error:", error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- YORUMLARI ÇEKEN FONKSİYON ---
  const loadReviews = async (bookId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/books/${bookId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data || []);
      }
    } catch (error) {
      console.error("Reviews fetch error:", error);
    }
  };

  const handleAddToList = async () => {
    if (!selectedListId || !book) {
      alert('Please select a list first!');
      return;
    }
    const targetList = lists.find(l => l.id === selectedListId);
    if (!targetList) return;

    setIsAdding(true);
    try {
      await addBookToReadingList(targetList, book.id);
      alert(`"${book.title}" added to "${targetList.name}" successfully!`);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsAdding(false);
    }
  };

  // --- POST REVIEW FUNCTION ---
  const handlePostReview = async () => {
    if (!newReview.trim()) {
      alert("Please write a review first!");
      return;
    }

    setIsPosting(true);
    try {
      await addReview(id!, newReview);
      alert("Your review has been saved successfully!");
      setNewReview('');
      
      // Yorum eklendikten sonra listeyi hemen güncelle
      await loadReviews(id!);
    } catch (error) {
      console.error("Review posting error:", error);
      alert("Error saving review. Please check your connection.");
    } finally {
      setIsPosting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  if (!book) return null;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 hover:text-violet-600 mb-8 transition-colors group glass-effect px-4 py-2 rounded-xl border border-white/20 w-fit"
        >
          <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-semibold">Back to Catalog</span>
        </button>

        <div className="glass-effect rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 md:p-12">
            <div className="md:col-span-1">
              <img
                src={book.coverImage || 'https://via.placeholder.com/300x400?text=No+Cover'}
                alt={book.title}
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>

            <div className="md:col-span-2 text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">{book.title}</h1>
              <p className="text-xl text-slate-600 mb-6 font-medium">by {book.author}</p>

              <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="flex items-center bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                  <svg className="w-5 h-5 text-amber-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-lg font-bold text-amber-700">{formatRating(book.rating)}</span>
                </div>
                <span className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-semibold">{book.genre}</span>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                  <span className="w-1 h-6 bg-violet-600 rounded-full mr-3"></span>Description
                </h2>
                <p className="text-slate-700 leading-relaxed text-lg">{book.description || 'No description available.'}</p>
              </div>

              <div className="p-6 bg-violet-50/50 rounded-2xl border border-violet-100 mb-8">
                <label className="block text-sm font-bold text-violet-900 mb-3">Add to Reading List:</label>
                <div className="flex gap-4">
                  <select
                    className="flex-1 p-2 rounded-xl border border-violet-200 outline-none bg-white"
                    value={selectedListId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                  >
                    <option value="">-- Choose a list --</option>
                    {lists.map((list) => (
                      <option key={list.id} value={list.id}>{list.name}</option>
                    ))}
                  </select>
                  <Button variant="primary" onClick={handleAddToList} disabled={isAdding || !selectedListId}>
                    {isAdding ? 'Adding...' : 'Add to List'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div className="mt-8 glass-effect rounded-3xl shadow-xl border border-white/20 p-8 md:p-12 text-left">
          <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
            <span className="w-1 h-8 bg-violet-600 rounded-full mr-3"></span>Reviews
          </h2>
          
          {/* Yorum Yazma Formu */}
          <div className="space-y-4 mb-10">
            <textarea
              className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 outline-none bg-white/50"
              placeholder="What do you think about this book?"
              rows={3}
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
            />
            <Button onClick={handlePostReview} disabled={isPosting} className="bg-violet-600 text-white px-8 py-3 rounded-xl hover:bg-violet-700 transition-colors">
              {isPosting ? 'Posting...' : 'Post Review'}
            </Button>
          </div>

          {/* Yorumları Listeleme */}
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((r, index) => (
                <div key={index} className="p-6 bg-white/40 rounded-2xl border border-white/20 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-800">{r.userName || 'Anonymous'}</span>
                    <span className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-700 italic">"{r.reviewText}"</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic text-center py-4">No reviews yet. Be the first to share your thoughts!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}