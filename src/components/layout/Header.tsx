import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from './Navigation';
import { useAuth } from '@/hooks/useAuth'; // 1. Hook'u import et

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth(); // 2. Auth bilgilerini çek

  return (
    <header className="glass-effect sticky top-0 z-50 border-b border-white/20 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-xl group-hover:shadow-violet-500/40 transition-all duration-300 group-hover:scale-110">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <span className="text-xl font-bold gradient-text">LibraryAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <Navigation />
          </div>

          {/* User Actions - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated && user ? (
              // --- GİRİŞ YAPILMIŞSA ---
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-slate-800">
                    Hoş geldin, {user.name || user.email.split('@')[0]}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-violet-600 font-bold">
  {user?.role === 'admin' ? 'Admin' : 'User'}
</span>
                </div>
                <button
                  onClick={() => logout()}
                  className="bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 px-4 py-2 rounded-lg transition-all font-semibold border border-slate-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              // --- GİRİŞ YAPILMAMIŞSA ---
              <>
                <Link to="/login" className="text-slate-700 hover:text-violet-600 transition-colors font-semibold px-4 py-2 rounded-lg hover:bg-violet-50">
                  Login
                </Link>
                <Link to="/signup" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 font-semibold transform hover:-translate-y-0.5">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button (Öncekiyle aynı) */}
          <button className="md:hidden text-slate-700 hover:text-violet-600 p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             {/* SVG buraya gelecek */}
          </button>
        </div>

        {/* Mobile Navigation (Auth desteği eklendi) */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20 animate-slide-in">
            <Navigation mobile />
            <div className="mt-4 space-y-2 px-2">
              {isAuthenticated ? (
                <button onClick={() => logout()} className="w-full text-center bg-red-50 text-red-600 py-3 rounded-xl font-bold">
                  Logout ({user?.email})
                </button>
              ) : (
                <>
                  <Link to="/login" className="block text-center text-slate-700 py-2 font-semibold">Login</Link>
                  <Link to="/signup" className="block bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl text-center font-bold">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}