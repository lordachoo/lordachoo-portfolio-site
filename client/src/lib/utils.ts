import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
}

export function formatDateRange(startDate: string, endDate?: string | null): string {
  const start = new Date(startDate);
  const startFormatted = start.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  
  if (!endDate) {
    return `${startFormatted} - Present`;
  }
  
  const end = new Date(endDate);
  const endFormatted = end.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  
  return `${startFormatted} - ${endFormatted}`;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}
