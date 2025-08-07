'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, MoreVertical, Calendar, Tag as TagIcon } from 'lucide-react'
import ArticleCard from '@/components/ArticleCard'
import FilterPanel from '@/components/FilterPanel'
import BulkActions from '@/components/BulkActions'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { Article, FilterOptions } from '@/types'

export default function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([])
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])
  const [filters, setFilters] = useState<FilterOptions>({})
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock articles data
        const mockArticles: Article[] = [
          {
            id: '1',
            slug: 'ai-revolution-2024',
            title: 'The AI Revolution: What 2024 Holds',
            type: 'articles',
            content: '',
            created_at: '2024-01-15T10:00:00Z',
            modified_at: '2024-01-15T10:00:00Z',
            metadata: {
              title: 'The AI Revolution: What 2024 Holds',
              url: 'https://techcrunch.com/ai-revolution-2024',
              description: 'An in-depth look at the latest AI developments and what they mean for the future.',
              domain: 'techcrunch.com',
              tags: ['Technology', 'AI', 'Future'],
              estimated_read_time: 8,
              date_added: '2024-01-15T09:30:00Z',
              status: 'scheduled',
              scheduled_date: '2024-01-16',
              scheduled_time: '9:00 AM',
              user_id: 'user123'
            }
          },
          {
            id: '2',
            slug: 'remote-work-productivity',
            title: 'Remote Work Productivity Tips',
            type: 'articles',
            content: '',
            created_at: '2024-01-14T15:30:00Z',
            modified_at: '2024-01-14T15:30:00Z',
            metadata: {
              title: 'Remote Work Productivity Tips',
              url: 'https://medium.com/remote-work-tips',
              description: 'Essential strategies for staying productive while working from home.',
              domain: 'medium.com',
              tags: ['Business', 'Productivity'],
              estimated_read_time: 5,
              date_added: '2024-01-14T15:00:00Z',
              status: 'sent',
              email_sent_date: '2024-01-15T09:00:00Z',
              user_id: 'user123'
            }
          },
          {
            id: '3',
            slug: 'sustainable-design-trends',
            title: 'Sustainable Design Trends for 2024',
            type: 'articles',
            content: '',
            created_at: '2024-01-13T11:15:00Z',
            modified_at: '2024-01-13T11:15:00Z',
            metadata: {
              title: 'Sustainable Design Trends for 2024',
              url: 'https://designmodo.com/sustainable-design-2024',
              description: 'How designers are incorporating sustainability into their work.',
              domain: 'designmodo.com',
              tags: ['Design', 'Sustainability'],
              estimated_read_time: 6,
              date_added: '2024-01-13T11:00:00Z',
              status: 'read',
              user_id: 'user123'
            }
          }
        ]
        
        setArticles(mockArticles)
        setFilteredArticles(mockArticles)
      } catch (error) {
        console.error('Error fetching articles:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticles()
  }, [])

  // Filter and search articles
  useEffect(() => {
    let filtered = articles.filter(article => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const titleMatch = article.metadata.title?.toLowerCase().includes(searchLower)
        const descMatch = article.metadata.description?.toLowerCase().includes(searchLower)
        const urlMatch = article.metadata.url.toLowerCase().includes(searchLower)
        
        if (!titleMatch && !descMatch && !urlMatch) {
          return false
        }
      }

      // Status filter
      if (filters.status && article.metadata.status !== filters.status) {
        return false
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const articleTags = article.metadata.tags || []
        const hasMatchingTag = filters.tags.some(tag => articleTags.includes(tag))
        if (!hasMatchingTag) return false
      }

      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        const articleDate = new Date(article.metadata.scheduled_date || article.metadata.date_added)
        
        if (filters.dateFrom && articleDate < new Date(filters.dateFrom)) {
          return false
        }
        
        if (filters.dateTo && articleDate > new Date(filters.dateTo)) {
          return false
        }
      }

      return true
    })

    // Sort articles
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'title':
          aValue = a.metadata.title || a.title
          bValue = b.metadata.title || b.title
          break
        case 'status':
          aValue = a.metadata.status
          bValue = b.metadata.status
          break
        case 'date':
        default:
          aValue = new Date(a.metadata.scheduled_date || a.metadata.date_added)
          bValue = new Date(b.metadata.scheduled_date || b.metadata.date_added)
          break
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    setFilteredArticles(filtered)
  }, [articles, searchQuery, filters, sortBy, sortOrder])

  const handleArticleUpdate = (updatedArticle: Article) => {
    setArticles(prev => prev.map(article => 
      article.id === updatedArticle.id ? updatedArticle : article
    ))
  }

  const handleArticleDelete = (articleId: string) => {
    setArticles(prev => prev.filter(article => article.id !== articleId))
    setSelectedArticles(prev => prev.filter(id => id !== articleId))
  }

  const handleSelectArticle = (articleId: string, selected: boolean) => {
    if (selected) {
      setSelectedArticles(prev => [...prev, articleId])
    } else {
      setSelectedArticles(prev => prev.filter(id => id !== articleId))
    }
  }

  const handleSelectAll = () => {
    if (selectedArticles.length === filteredArticles.length) {
      setSelectedArticles([])
    } else {
      setSelectedArticles(filteredArticles.map(article => article.id))
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="input pl-9 w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn btn-secondary ${showFilters ? 'bg-secondary' : ''}`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder]
              setSortBy(field)
              setSortOrder(order)
            }}
            className="select"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="status-asc">Status</option>
          </select>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Bulk Actions */}
      {selectedArticles.length > 0 && (
        <BulkActions
          selectedIds={selectedArticles}
          onComplete={() => setSelectedArticles([])}
        />
      )}

      {/* Articles Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium">
            {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
          </h3>
          
          {filteredArticles.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {selectedArticles.length === filteredArticles.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid gap-4">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onUpdate={handleArticleUpdate}
              onDelete={handleArticleDelete}
              isSelected={selectedArticles.includes(article.id)}
              onSelect={handleSelectArticle}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium mb-2">No articles found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || Object.keys(filters).length > 0
              ? 'Try adjusting your search or filters'
              : 'Start by adding your first article above'
            }
          </p>
          {(searchQuery || Object.keys(filters).length > 0) && (
            <button
              onClick={() => {
                setSearchQuery('')
                setFilters({})
              }}
              className="btn btn-secondary"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}