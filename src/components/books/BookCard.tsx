import { useNavigate } from 'react-router-dom';
import { Book } from '@/types';
import { formatRating } from '@/utils/formatters';
import { Button } from '@/components/common/Button';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const navigate = useNavigate();

  
  const handleViewDetails = () => {
    navigate(`/books/${book.id}`);
  };

  
  const handleAddToList = (e: React.MouseEvent) => {
    e.stopPropagation(); // Kartın tıklanma olayını (navigate) durdurur
    console.log("Eklenecek kitap ID:", book.id);
    alert(`${book.title} kitabını hangi listeye eklemek istersiniz? \n(Liste seçme menüsü buraya gelecek)`);
  };

  return (
    <div
      className="glass-effect rounded-2xl overflow-hidden card-hover cursor-pointer group border border-white/20 hover-glow h-full flex flex-col"
      onClick={handleViewDetails}
    >
      <div className="relative overflow-hidden aspect-[3/4]">
        <img
          src={book.coverImage || 'https://via.placeholder.com/300x400?text=No+Cover'}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=No+Cover';
          }}
        />
        
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Hover Butonları */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
          >
            Details
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            className="flex-none px-3 bg-violet-600 hover:bg-violet-700 text-white border-none"
            onClick={handleAddToList}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-lg flex items-center">
            <svg className="w-3.5 h-3.5 text-amber-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-bold text-slate-900">{formatRating(book.rating)}</span>
          </div>
        </div>
      </div>

      {/* Alt Kısım (Yazı Alanı) */}
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-md font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-violet-600 transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-slate-600 mb-3 font-medium">{book.author}</p>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="bg-violet-50 text-violet-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-violet-100">
            {book.genre}
          </span>
          <span className="text-[10px] font-medium text-slate-400">
            {book.publishedYear}
          </span>
        </div>
      </div>
    </div>
  );
}