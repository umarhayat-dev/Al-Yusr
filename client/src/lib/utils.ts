import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `$${numPrice.toFixed(0)}`;
}

export function getCategoryIcon(category: string): string {
  switch (category) {
    case 'quran':
      return 'fas fa-quran';
    case 'arabic':
      return 'fas fa-language';
    case 'islamic-studies':
      return 'fas fa-star-and-crescent';
    case 'tajweed':
      return 'fas fa-mosque';
    default:
      return 'fas fa-book';
  }
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'quran':
      return 'from-primary-500 to-primary-700';
    case 'arabic':
      return 'from-emerald-500 to-emerald-700';
    case 'islamic-studies':
      return 'from-purple-500 to-purple-700';
    case 'tajweed':
      return 'from-orange-500 to-orange-700';
    default:
      return 'from-slate-500 to-slate-700';
  }
}

export function getLevelBadgeColor(level: string): string {
  switch (level) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'advanced':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Email validation utility
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Email input validation class helper
export function getEmailInputClass(email: string, hasInteracted: boolean = false): string {
  if (!hasInteracted || email === '') return '';
  return isValidEmail(email) ? '' : 'border-red-500 focus:border-red-500 focus:ring-red-500';
}
