// Задание 4: Интеграция с DOM (Парсинг сырых данных)
// Преобразование данных из HTML-формы в строго типизированный объект

import type { Book } from "./task1-types";

/**
 * Создаёт объект Book из данных HTML-формы.
 * 
 * ВАЖНО: Данные из формы всегда приходят как строки. 
 * Ваша задача — преобразовать их в правильные типы и проверить границы значений.
 */
export function createBookFromForm(formData: FormData): Book {
  // TODO 1: Получите сырые значения полей формы через formData.get(...).
  // Поля: title, authors, year, rating. Учитывайте, что get() может вернуть File или null.
  const getString = (name: string): string => {
    const value = formData.get(name);
    return typeof value === "string" ? value.trim() : "";
  };

  const title = getString("title");
  const authorsRaw = getString("authors");
  const yearRaw = getString("year");
  const ratingRaw = getString("rating");

  if (!title) throw new Error("Укажите название книги");

  // TODO 2: Разбейте авторов по запятой, удалите пробелы и пустые значения.
  const authors = authorsRaw
    .split(",")
    .map((author) => author.trim())
    .filter((author) => author.length > 0);

  if (authors.length === 0) {
    throw new Error("Укажите хотя бы одного автора");
  }

  // TODO 3: Преобразуйте заполненный год в целое число; пустое поле оставьте undefined.
  let year: number | undefined;
  if (yearRaw) {
    year = Number(yearRaw);
    if (!Number.isInteger(year) || year < 1) {
      throw new Error("Год должен быть положительным целым числом");
    }
  }

  // TODO 4: Преобразуйте рейтинг и проверьте, что это число от 0 до 5.
  let rating: number | undefined;
  if (ratingRaw) {
    rating = Number(ratingRaw);
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      throw new Error("Рейтинг должен быть числом от 0 до 5");
    }
  }

  // TODO 5: Сгенерируйте уникальный id с помощью crypto.randomUUID().
  // TODO 6: Верните итоговый объект Book.
  return {
    id: crypto.randomUUID(),
    title,
    authors,
    year,
    rating,
  };
}
