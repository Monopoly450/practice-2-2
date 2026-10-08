import './styles.css';
import { formatBook } from './task1-types';
import type { Book, Catalog } from './task1-types';
import { addBook, removeBook } from './task2-functions';
import { applyFilters, filterByAuthor, filterByMinYear } from './task3-filters';
import { createBookFromForm } from "./task4-integration";
import { filterByTitle, sortBooks } from './task5-utils';

// ============================================================
// ИСХОДНОЕ СОСТОЯНИЕ
// ============================================================
const initialCatalog: Catalog = {
  '1': { id: '1', title: 'TypeScript Guide', authors: ['John Doe'], year: 2024 },
  '2': { id: '2', title: 'JavaScript Basics', authors: ['Jane Smith'], year: 2022 },
};

function isBook(value: unknown): value is Book {
  if (!value || typeof value !== 'object') return false;
  const book = value as Partial<Book>;
  return typeof book.id === 'string'
    && typeof book.title === 'string'
    && Array.isArray(book.authors)
    && book.authors.every((author) => typeof author === 'string')
    && (book.year === undefined || (typeof book.year === 'number' && Number.isFinite(book.year)))
    && (book.rating === undefined || (
      typeof book.rating === 'number'
      && Number.isFinite(book.rating)
      && book.rating >= 0
      && book.rating <= 5
    ));
}

function isCatalog(value: unknown): value is Catalog {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.entries(value).every(([id, book]) => isBook(book) && book.id === id);
}

function loadCatalog(): Catalog {
  try {
    const saved = localStorage.getItem('catalog');
    if (!saved) return initialCatalog;

    const parsed: unknown = JSON.parse(saved);
    if (isCatalog(parsed)) return parsed;
  } catch {
    // Повреждённые или недоступные данные не должны ломать запуск приложения.
  }
  return initialCatalog;
}

let catalog: Catalog = loadCatalog();

// ============================================================
// СОХРАНЕНИЕ В localStorage (Задание 1)
// ============================================================
function saveCatalog(): void {
  try {
    localStorage.setItem('catalog', JSON.stringify(catalog));
  } catch {
    errorMessage.textContent = 'Не удалось сохранить каталог в браузере.';
  }
}


// ============================================================
// DOM-элементы
// ============================================================
const bookList = document.querySelector('#bookList') as HTMLDivElement;
const form = document.querySelector('#bookForm') as HTMLFormElement;
const filterBtn = document.querySelector('#applyFilters') as HTMLButtonElement;
const authorInput = document.querySelector('#filterAuthor') as HTMLInputElement;
const yearInput = document.querySelector('#filterYear') as HTMLInputElement;
const errorMessage = document.querySelector('#errorMessage') as HTMLDivElement;

const searchInput = document.querySelector('#searchInput') as HTMLInputElement;
const sortBySelect = document.querySelector('#sortBy') as HTMLSelectElement;


function renderBooks(books: Book[]) {
  bookList.innerHTML = ''; 

  if (books.length === 0) {
    bookList.textContent = 'Книги не найдены. Попробуйте изменить фильтры.';
    return;
  }

  books.forEach(book => {
    const card = document.createElement('div');
    card.className = 'book-card fade-in';
    
    const titleEl = document.createElement('h3');
    titleEl.textContent = formatBook(book);
    
    const authorsEl = document.createElement('p');
    authorsEl.textContent = `Авторы: ${book.authors.join(', ')}`;
    
    card.append(titleEl, authorsEl);
    
    if (book.year !== undefined) {
      const yearEl = document.createElement('p');
      yearEl.textContent = `Год: ${book.year}`;
      card.append(yearEl);
    }
    if (book.rating !== undefined) {
      const ratingEl = document.createElement('p');
      ratingEl.textContent = `Рейтинг: ${book.rating}`;
      card.append(ratingEl);
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Удалить';
    deleteBtn.addEventListener('click', () => {
      catalog = removeBook(catalog, book.id);
      saveCatalog();
      updateBookList();
    });
    card.append(deleteBtn);
    
    bookList.append(card);
  });
}

function updateBookList(): void {
  const filters = [] as ((book: Book) => boolean)[];

  if (authorInput.value.trim()) {
    filters.push(filterByAuthor(authorInput.value.trim()));
  }
  if (yearInput.value) {
    filters.push(filterByMinYear(parseInt(yearInput.value, 10)));
  }
  if (searchInput.value.trim()) {
    filters.push(filterByTitle(searchInput.value.trim()));
  }

  const filteredBooks = applyFilters(Object.values(catalog), filters);
  const sortType = sortBySelect.value === 'rating' ? 'rating' : 'year';
  renderBooks(sortBooks(filteredBooks, sortType));
}

updateBookList();


// ============================================================
// ОБРАБОТЧИК ФОРМЫ
// ============================================================
form.addEventListener('submit', (e) => {
  e.preventDefault();
  errorMessage.textContent = '';
  try{
    const formData = new FormData(form);
    const newBook = createBookFromForm(formData);
    catalog = addBook(catalog, newBook);
    
    saveCatalog();
    
    form.reset();
    updateBookList();
  } catch(error){
    if(error instanceof Error){   
      errorMessage.textContent = error.message; 
    }
  }
});


// ============================================================
// ОБРАБОТЧИК ФИЛЬТРОВ
// ============================================================
filterBtn.addEventListener('click', updateBookList);
searchInput.addEventListener('input', updateBookList);
sortBySelect.addEventListener('change', updateBookList);
