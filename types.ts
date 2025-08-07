// Base Cosmic object interface
export interface CosmicObject {
  id: string;
  slug: string;
  title: string;
  content?: string;
  metadata: Record<string, any>;
  type: string;
  created_at: string;
  modified_at: string;
}

// Article interface matching the Cosmic CMS structure
export interface Article extends CosmicObject {
  type: 'articles';
  metadata: {
    title?: string;
    url: string;
    description?: string;
    domain?: string;
    tags?: string[];
    estimated_read_time?: number;
    date_added: string;
    status: ArticleStatus;
    scheduled_date?: string;
    scheduled_time?: string;
    email_batch_id?: string;
    email_sent_date?: string;
    user_id: string;
  };
}

// User interface matching the Cosmic CMS structure
export interface User extends CosmicObject {
  type: 'users';
  metadata: {
    email: string;
    name?: string;
    subscription_tier: SubscriptionTier;
    articles_limit: number;
    email_grouping?: EmailGrouping;
    include_summaries?: boolean;
    default_email_time?: string;
    articles_saved_this_week?: number;
    total_articles_read?: number;
    account_created: string;
  };
}

// Email Batch interface
export interface EmailBatch extends CosmicObject {
  type: 'email-batches';
  metadata: {
    user_id: string;
    sent_date: string;
    article_count: number;
    batch_status: BatchStatus;
    email_opened?: boolean;
    articles_clicked?: string[];
    mailgun_message_id?: string;
  };
}

// Shared List interface
export interface SharedList extends CosmicObject {
  type: 'shared-lists';
  metadata: {
    list_name: string;
    created_by_user_id: string;
    description?: string;
    is_public?: boolean;
    article_ids?: string[];
    shared_with_users?: string[];
  };
}

// Type literals for select-dropdown values
export type ArticleStatus = 'scheduled' | 'sent' | 'read' | 'archived';
export type SubscriptionTier = 'free' | 'paid';
export type EmailGrouping = 'by_category' | 'by_date_added' | 'mixed';
export type BatchStatus = 'scheduled' | 'sent' | 'failed';

// API response types
export interface CosmicResponse<T> {
  objects: T[];
  total: number;
  limit: number;
  skip: number;
}

// Component prop types
export interface ArticleCardProps {
  article: Article;
  onUpdate?: (article: Article) => void;
  onDelete?: (articleId: string) => void;
  isSelected?: boolean;
  onSelect?: (articleId: string, selected: boolean) => void;
}

export interface ArticleFormData {
  url: string;
  title?: string;
  description?: string;
  tags?: string[];
  scheduled_date?: string;
  scheduled_time?: string;
}

export interface UrlMetadata {
  title: string;
  description: string;
  domain: string;
  image?: string;
}

export interface FilterOptions {
  status?: ArticleStatus;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  domain?: string;
}

export interface BulkActions {
  selectedIds: string[];
  action: 'schedule' | 'mark_read' | 'archive' | 'delete';
  payload?: {
    scheduled_date?: string;
    scheduled_time?: string;
    status?: ArticleStatus;
  };
}

// Type guards for runtime validation
export function isArticle(obj: CosmicObject): obj is Article {
  return obj.type === 'articles';
}

export function isUser(obj: CosmicObject): obj is User {
  return obj.type === 'users';
}

export function isEmailBatch(obj: CosmicObject): obj is EmailBatch {
  return obj.type === 'email-batches';
}

export function isSharedList(obj: CosmicObject): obj is SharedList {
  return obj.type === 'shared-lists';
}

// Utility types
export type CreateArticleData = Omit<Article, 'id' | 'created_at' | 'modified_at'>;
export type UpdateArticleData = Partial<Article['metadata']>;
export type UserPreferences = Pick<User['metadata'], 'email_grouping' | 'include_summaries' | 'default_email_time'>;

// Error types
export interface CosmicError extends Error {
  status?: number;
  code?: string;
}