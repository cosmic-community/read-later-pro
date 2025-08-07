import { createBucketClient } from '@cosmicjs/sdk'
import type { Article, User, EmailBatch, SharedList, CosmicError } from '@/types'

export const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
  apiEnvironment: 'staging'
})

// Error helper for Cosmic SDK
function hasStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}

// Article operations
export async function getArticles(userId?: string, limit = 20, skip = 0): Promise<Article[]> {
  try {
    const query: Record<string, any> = { type: 'articles' };
    if (userId) {
      query['metadata.user_id'] = userId;
    }

    const response = await cosmic.objects
      .find(query)
      .props(['id', 'title', 'slug', 'metadata', 'created_at'])
      .limit(limit)
      .skip(skip)
      .sort('-created_at');
    
    return response.objects as Article[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch articles');
  }
}

export async function getArticle(slug: string): Promise<Article | null> {
  try {
    const response = await cosmic.objects.findOne({
      type: 'articles',
      slug
    });
    
    const article = response.object as Article;
    
    if (!article || !article.metadata) {
      return null;
    }
    
    return article;
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createArticle(articleData: {
  title: string;
  url: string;
  description?: string;
  domain?: string;
  tags?: string[];
  scheduled_date?: string;
  scheduled_time?: string;
  user_id: string;
}): Promise<Article> {
  try {
    const slug = generateSlug(articleData.title);
    
    const response = await cosmic.objects.insertOne({
      type: 'articles',
      title: articleData.title,
      slug,
      metadata: {
        title: articleData.title,
        url: articleData.url,
        description: articleData.description || '',
        domain: articleData.domain || '',
        tags: articleData.tags || [],
        status: 'scheduled',
        date_added: new Date().toISOString(),
        scheduled_date: articleData.scheduled_date,
        scheduled_time: articleData.scheduled_time,
        user_id: articleData.user_id
      }
    });
    
    return response.object as Article;
  } catch (error) {
    console.error('Error creating article:', error);
    throw new Error('Failed to create article');
  }
}

export async function updateArticle(articleId: string, updates: Partial<Article['metadata']>): Promise<Article> {
  try {
    const response = await cosmic.objects.updateOne(articleId, {
      metadata: updates
    });
    
    return response.object as Article;
  } catch (error) {
    console.error('Error updating article:', error);
    throw new Error('Failed to update article');
  }
}

export async function deleteArticle(articleId: string): Promise<void> {
  try {
    await cosmic.objects.deleteOne(articleId);
  } catch (error) {
    console.error('Error deleting article:', error);
    throw new Error('Failed to delete article');
  }
}

// User operations
export async function getUser(email: string): Promise<User | null> {
  try {
    const response = await cosmic.objects.findOne({
      type: 'users',
      'metadata.email': email
    });
    
    return response.object as User;
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createUser(userData: {
  email: string;
  name?: string;
  subscription_tier?: 'free' | 'paid';
}): Promise<User> {
  try {
    const slug = generateSlug(userData.email);
    
    const response = await cosmic.objects.insertOne({
      type: 'users',
      title: userData.name || userData.email,
      slug,
      metadata: {
        email: userData.email,
        name: userData.name || '',
        subscription_tier: userData.subscription_tier || 'free',
        articles_limit: userData.subscription_tier === 'paid' ? 999 : 5,
        articles_saved_this_week: 0,
        total_articles_read: 0,
        account_created: new Date().toISOString()
      }
    });
    
    return response.object as User;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}

export async function updateUser(userId: string, updates: Partial<User['metadata']>): Promise<User> {
  try {
    const response = await cosmic.objects.updateOne(userId, {
      metadata: updates
    });
    
    return response.object as User;
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
}

// Email batch operations
export async function createEmailBatch(batchData: {
  user_id: string;
  article_count: number;
  batch_status: 'scheduled' | 'sent' | 'failed';
}): Promise<EmailBatch> {
  try {
    const slug = generateSlug(`batch-${batchData.user_id}-${Date.now()}`);
    
    const response = await cosmic.objects.insertOne({
      type: 'email-batches',
      title: `Email Batch - ${new Date().toLocaleDateString()}`,
      slug,
      metadata: {
        user_id: batchData.user_id,
        sent_date: new Date().toISOString(),
        article_count: batchData.article_count,
        batch_status: batchData.batch_status,
        email_opened: false,
        articles_clicked: []
      }
    });
    
    return response.object as EmailBatch;
  } catch (error) {
    console.error('Error creating email batch:', error);
    throw new Error('Failed to create email batch');
  }
}

// Shared list operations
export async function getSharedLists(userId: string): Promise<SharedList[]> {
  try {
    const response = await cosmic.objects
      .find({
        type: 'shared-lists',
        'metadata.created_by_user_id': userId
      })
      .props(['id', 'title', 'slug', 'metadata'])
      .sort('-created_at');
    
    return response.objects as SharedList[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch shared lists');
  }
}

// Utility functions
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Filter and search utilities
export async function searchArticles(
  userId: string,
  query: string,
  filters?: {
    status?: string;
    tags?: string[];
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<Article[]> {
  try {
    const cosmicQuery: Record<string, any> = {
      type: 'articles',
      'metadata.user_id': userId
    };
    
    if (filters?.status) {
      cosmicQuery['metadata.status'] = filters.status;
    }
    
    if (query) {
      cosmicQuery['$or'] = [
        { title: { $regex: query, $options: 'i' } },
        { 'metadata.title': { $regex: query, $options: 'i' } },
        { 'metadata.description': { $regex: query, $options: 'i' } }
      ];
    }
    
    const response = await cosmic.objects
      .find(cosmicQuery)
      .props(['id', 'title', 'slug', 'metadata', 'created_at'])
      .sort('-created_at');
    
    return response.objects as Article[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to search articles');
  }
}