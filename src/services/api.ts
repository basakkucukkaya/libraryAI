import { Book, ReadingList, Review, Recommendation } from '@/types';
import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * AUTH HEADERS - Token yönetimini merkezi hale getirir
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.error("Auth hatası:", error);
    return { 'Content-Type': 'application/json' };
  }
}

/**
 * BOOKS - API (Listeleme ve Detay)
 */
export async function getBooks(): Promise<Book[]> {
  const response = await fetch(`${API_BASE_URL}/books`);
  if (!response.ok) throw new Error('Failed to fetch books');
  return response.json();
}

export async function getBook(id: string): Promise<Book | null> {
  const response = await fetch(`${API_BASE_URL}/books/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch book detail');
  }
  return response.json();
}

/**
 * ADMIN - Create/Delete Book
 */
export async function createBook(book: Omit<Book, 'id'>): Promise<Book> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/books`, {
    method: 'POST',
    headers: headers as HeadersInit,
    body: JSON.stringify(book),
  });
  if (!response.ok) throw new Error('Failed to create book');
  return response.json();
}

export async function deleteBook(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/books/${id}`, {
    method: 'DELETE',
    headers: headers as HeadersInit
  });
  if (!response.ok) throw new Error('Failed to delete book');
}

/**
 * READING LISTS - API
 */
export async function getReadingLists(): Promise<ReadingList[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/reading-lists`, {
    headers: headers as HeadersInit
  });
  if (!response.ok) throw new Error('Failed to fetch reading lists');
  return response.json();
}

export async function createReadingList(
  list: Omit<ReadingList, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ReadingList> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/reading-lists`, {
    method: 'POST',
    headers: headers as HeadersInit,
    body: JSON.stringify(list),
  });
  if (!response.ok) throw new Error('Failed to create reading list');
  return response.json();
}

export async function updateReadingList(id: string, list: Partial<ReadingList>): Promise<ReadingList> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/reading-lists/${id}`, {
    method: 'PUT',
    headers: headers as HeadersInit,
    body: JSON.stringify(list),
  });
  if (!response.ok) throw new Error('Failed to update reading list');
  return response.json();
}

/**
 * ADD BOOK TO READING LIST - Veritabanı ile tam uyumlu hali 🚀
 */
export async function addBookToReadingList(list: ReadingList, bookId: string): Promise<ReadingList> {
  // Veritabanından gelen list.bookIds veya list.books alanlarını kontrol et, yoksa [] yap
  // @ts-ignore
  const currentIds = list.bookIds || list.books || [];
  
  // Eğer kitap zaten listede yoksa ID'yi diziye ekle
  if (!currentIds.includes(bookId)) {
    const updatedBookIds = [...currentIds, bookId];

    // Hem 'bookIds' hem 'books' alanlarını güncelliyoruz (Tam uyumluluk için)
    return updateReadingList(list.id, { 
      bookIds: updatedBookIds,
      // @ts-ignore
      books: updatedBookIds 
    });
  }

  return list; // Kitap zaten varsa listeyi olduğu gibi dön
}

/**
 * REVIEWS - API (Yorum Yazma) 🚀
 */
export async function addReview(bookId: string, reviewText: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/books/${bookId}/reviews`, {
    method: 'POST',
    headers: headers as HeadersInit,
    body: JSON.stringify({
      reviewText,
      userName: "Kütüphane Üyesi"
    }),
  });
  
  if (!response.ok) throw new Error('Yorum gönderilemedi');
}

/**
 * AI & RECOMMENDATIONS (Sıradaki Adım: AWS Bedrock!)
 */
export async function getRecommendations(): Promise<Recommendation[]> {
  return [{ id: '1', bookId: '1', reason: 'Yapay zeka önerisi (Mock)', confidence: 0.92 }];
}

export async function getReviews(bookId: string): Promise<Review[]> {
  // Sayfa açıldığında yorumları getiren mock fonksiyon (İleride API'ye bağlanacak)
  return [{ id: '1', bookId, userId: '1', rating: 5, comment: 'Harika!', createdAt: new Date().toISOString() }];
}