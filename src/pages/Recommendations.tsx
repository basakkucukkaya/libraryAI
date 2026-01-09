import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { handleApiError } from '@/utils/errorHandling';

// API Gateway URL'niz
const AI_API_URL = 'https://j50akimnag.execute-api.us-east-1.amazonaws.com/analyze';

interface AIRecommendation {
  type: 'EXPLORE' | 'EXPAND' | 'SURPRISE' | 'SYSTEM';
  title: string;
  author: string;
  reason: string;
  confidence: number;
}

export function Recommendations() {
  const [query, setQuery] = useState('');
  const [curatorNote, setCuratorNote] = useState('');
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    try {
      // 1. LocalStorage'dan mevcut kütüphaneyi çekiyoruz
      const savedBooks = JSON.parse(localStorage.getItem('readingList') || '[]');
      const titles = savedBooks.map((b: any) => b.title);

      // 2. Lambda'ya hem kütüphaneyi hem de kullanıcının "modunu" gönderiyoruz
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          titles: titles,
          userQuery: query || "Suggest something based on my library" 
        })
      });

      const data = await response.json();

      if (data) {
        setCuratorNote(data.curator_note || '');
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error("AI Error:", error);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-slate-50">
      <div className="container mx-auto max-w-5xl">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold mb-4 text-slate-900">
            AI <span className="text-violet-600">Librarian</span>
          </h1>
          <p className="text-slate-600 text-xl max-w-2xl mx-auto">
            Your personalized reading discovery engine.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 mb-12">
          <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-widest">
            Current Mood or Specific Request (Optional)
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'I want something dark and mysterious' or 'I need a fast-paced thriller'..."
            className="w-full px-6 py-4 border-2 border-slate-100 rounded-2xl focus:border-violet-500 focus:ring-0 transition-all min-h-[100px] text-lg outline-none mb-6"
          />
          <Button
            variant="primary"
            size="lg"
            onClick={handleGetRecommendations}
            disabled={isLoading}
            className="w-full bg-violet-600 hover:bg-violet-700 py-6 text-xl shadow-lg shadow-violet-200 transition-transform active:scale-[0.98]"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : '✨ Discover My Next Read'}
          </Button>
        </div>

        {/* AI Results Section */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-slate-500 font-medium animate-pulse">Analyzing your reading DNA...</p>
          </div>
        )}

        {!isLoading && recommendations.length > 0 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Curator Note / DNA Analysis */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-8 md:p-12 shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.435.292-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.435.292 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.435.292-3.5.804V12a1 1 0 11-2 0V4.804z"/></svg>
              </div>
              <h3 className="text-violet-400 text-xs font-black uppercase tracking-[0.3em] mb-4">Librarian's Assessment</h3>
              <p className="text-white text-2xl md:text-3xl font-light leading-relaxed italic border-l-4 border-violet-500 pl-6">
                "{curatorNote}"
              </p>
            </div>

            {/* Recommendation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recommendations.map((rec, idx) => (
                <div 
                  key={idx} 
                  className="group bg-white rounded-3xl p-8 border border-slate-200 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-full h-2 ${
                    rec.type === 'EXPLORE' ? 'bg-blue-500' : 
                    rec.type === 'EXPAND' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                  
                  <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full mb-6 inline-block tracking-tighter">
                    {rec.type} STRATEGY
                  </span>
                  
                  <h4 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-violet-600 transition-colors">
                    {rec.title}
                  </h4>
                  <p className="text-sm font-medium text-slate-400 mb-6 border-b border-slate-50 pb-4">
                    by {rec.author}
                  </p>
                  
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {rec.reason}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-bold text-slate-300 italic">
                      Match: {Math.round(rec.confidence * 100)}%
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-violet-50 group-hover:text-violet-500 transition-colors">
                      →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}