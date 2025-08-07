import { clsx, type ClassValue } from 'clsx'
import { format, parseISO, isValid, addDays, startOfWeek } from 'date-fns'
import type { UrlMetadata, Article } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// URL processing utilities
export function extractDomain(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Mock URL metadata extraction (in production, use a service like Mercury Parser)
export async function extractUrlMetadata(url: string): Promise<UrlMetadata> {
  try {
    // In a real implementation, you'd use a service like:
    // - Mercury Parser API
    // - Readability API
    // - Custom scraping service
    
    const domain = extractDomain(url);
    
    // Mock response - replace with actual API call
    return {
      title: `Article from ${domain}`,
      description: `Interesting article from ${domain}`,
      domain: domain,
      image: `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&h=200&fit=crop&auto=format`
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {
      title: 'Unknown Article',
      description: '',
      domain: extractDomain(url)
    };
  }
}

// Date utilities
export function formatDate(dateString: string, formatStr = 'MMM d, yyyy'): string {
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, formatStr) : 'Invalid date';
  } catch {
    return 'Invalid date';
  }
}

export function formatDateTime(dateString: string, timeString?: string): string {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid date';
    
    const dateFormatted = format(date, 'MMM d, yyyy');
    return timeString ? `${dateFormatted} at ${timeString}` : dateFormatted;
  } catch {
    return 'Invalid date';
  }
}

export function getQuickScheduleOptions() {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const thisWeekend = addDays(startOfWeek(today), 6);
  const nextWeek = addDays(startOfWeek(today), 7);
  
  return [
    {
      label: 'Tomorrow Morning',
      date: format(tomorrow, 'yyyy-MM-dd'),
      time: '9:00 AM'
    },
    {
      label: 'This Weekend',
      date: format(thisWeekend, 'yyyy-MM-dd'),
      time: '10:00 AM'
    },
    {
      label: 'Next Week',
      date: format(nextWeek, 'yyyy-MM-dd'),
      time: '9:00 AM'
    }
  ];
}

// Article utilities
export function getStatusColor(status: string): string {
  switch (status) {
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'sent':
      return 'bg-green-100 text-green-800';
    case 'read':
      return 'bg-gray-100 text-gray-800';
    case 'archived':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'scheduled':
      return '📅';
    case 'sent':
      return '✉️';
    case 'read':
      return '✅';
    case 'archived':
      return '📦';
    default:
      return '📄';
  }
}

// Tag utilities
export const availableTags = [
  'Technology',
  'Business',
  'Personal Development',
  'Health',
  'Science',
  'Design',
  'Marketing',
  'Finance',
  'Education',
  'News'
];

export function getTagColor(tag: string): string {
  const colors = [
    'bg-red-100 text-red-800',
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-orange-100 text-orange-800',
    'bg-teal-100 text-teal-800',
    'bg-cyan-100 text-cyan-800'
  ];
  
  const index = tag.length % colors.length;
  return colors[index] || 'bg-gray-100 text-gray-800';
}

// Reading time estimation
export function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUrl(url: string): boolean {
  const urlRegex = /^https?:\/\/.+/;
  return urlRegex.test(url);
}

// Storage utilities for client-side data
export function saveToLocalStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
}

// Bulk operations utilities
export function groupArticlesByDate(articles: Article[]): Record<string, Article[]> {
  return articles.reduce((groups, article) => {
    const date = article.metadata.scheduled_date || article.metadata.date_added;
    const dateKey = formatDate(date, 'yyyy-MM-dd');
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(article);
    
    return groups;
  }, {} as Record<string, Article[]>);
}

export function groupArticlesByStatus(articles: Article[]): Record<string, Article[]> {
  return articles.reduce((groups, article) => {
    const status = article.metadata.status;
    
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(article);
    
    return groups;
  }, {} as Record<string, Article[]>);
}

// Search and filter utilities
export function filterArticles(articles: Article[], filters: {
  status?: string;
  tags?: string[];
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}): Article[] {
  return articles.filter(article => {
    // Status filter
    if (filters.status && article.metadata.status !== filters.status) {
      return false;
    }
    
    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const articleTags = article.metadata.tags || [];
      const hasMatchingTag = filters.tags.some(tag => 
        articleTags.includes(tag)
      );
      if (!hasMatchingTag) return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = article.title.toLowerCase().includes(searchLower);
      const descMatch = (article.metadata.description || '').toLowerCase().includes(searchLower);
      const urlMatch = article.metadata.url.toLowerCase().includes(searchLower);
      
      if (!titleMatch && !descMatch && !urlMatch) {
        return false;
      }
    }
    
    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const articleDate = new Date(article.metadata.scheduled_date || article.metadata.date_added);
      
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (articleDate < fromDate) return false;
      }
      
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        if (articleDate > toDate) return false;
      }
    }
    
    return true;
  });
}