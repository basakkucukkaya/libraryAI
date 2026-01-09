import { useState, useEffect } from 'react';
import { BookSearch } from '@/components/books/BookSearch';
import { BookGrid } from '@/components/books/BookGrid';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getBooks } from '@/services/api';
import { Book } from '@/types';
import { handleApiError } from '@/utils/errorHandling';

export function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('title');
  
  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 8;

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const data = await getBooks();
      setBooks(data);
      setFilteredBooks(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // SAYFALAMA HESAPLAMALARI
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  const handleSearch = (query: string) => {
    setCurrentPage(1); 
    if (!query.trim()) {
      setFilteredBooks(books);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = books.filter((book) => {
      const title = book.title?.toLowerCase() || '';
      const author = book.author?.toLowerCase() || '';
      const genre = book.genre?.toLowerCase() || '';
      return title.includes(lowercaseQuery) || author.includes(lowercaseQuery) || genre.includes(lowercaseQuery);
    });
    setFilteredBooks(filtered);
  };

  const handleSort = (value: string) => {
    setSortBy(value);
    const sorted = [...filteredBooks].sort((a, b) => {
      if (value === 'title') return (a.title || '').localeCompare(b.title || '');
      if (value === 'author') return (a.author || '').localeCompare(b.author || '');
      if (value === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      if (value === 'year') return (Number(b.publishedYear) || 0) - (Number(a.publishedYear) || 0);
      return 0;
    });
    setFilteredBooks(sorted);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            <span className="gradient-text">Book Catalog</span>
          </h1>
          <p className="text-slate-600 text-xl">
            Browse our collection of{' '}
            <span className="font-bold text-violet-600">{books.length}</span> amazing books
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <BookSearch onSearch={handleSearch} />
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="glass-effect px-4 py-2 rounded-xl border border-white/20">
            <p className="text-slate-700 font-semibold">
              Showing <span className="text-violet-600">{currentBooks.length}</span> of{' '}
              <span className="text-violet-600">{filteredBooks.length}</span> books
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-700 font-semibold">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="input-modern px-4 py-2.5 text-sm font-medium bg-white"
            >
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="rating">Rating</option>
              <option value="year">Year</option>
            </select>
          </div>
        </div>

        {/* Book Grid */}
        <BookGrid books={currentBooks} />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-6 py-2 rounded-xl glass-effect border border-white/20 disabled:opacity-30 font-bold text-violet-600 hover:bg-white/40 transition-all"
            >
              Previous
            </button>
            
            <div className="glass-effect px-4 py-2 rounded-lg border border-white/10">
              <span className="font-semibold text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-6 py-2 rounded-xl glass-effect border border-white/20 disabled:opacity-30 font-bold text-violet-600 hover:bg-white/40 transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}