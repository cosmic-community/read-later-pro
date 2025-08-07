'use client'

import { useState } from 'react'
import { Calendar, Clock, ExternalLink, MoreVertical, Tag, Trash2, Edit3, CheckSquare } from 'lucide-react'
import { formatDateTime, getStatusColor, getStatusIcon, getTagColor } from '@/lib/utils'
import type { ArticleCardProps, Article } from '@/types'

export default function ArticleCard({
  article,
  onUpdate,
  onDelete,
  isSelected,
  onSelect
}: ArticleCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = async (newStatus: Article['metadata']['status']) => {
    if (!onUpdate) return
    
    setIsLoading(true)
    try {
      const updatedArticle = {
        ...article,
        metadata: {
          ...article.metadata,
          status: newStatus,
          ...(newStatus === 'read' && { email_sent_date: new Date().toISOString() })
        }
      }
      onUpdate(updatedArticle)
    } catch (error) {
      console.error('Error updating article:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        onDelete(article.id)
      } catch (error) {
        console.error('Error deleting article:', error)
      }
    }
  }

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelect) {
      onSelect(article.id, e.target.checked)
    }
  }

  const scheduledDateTime = article.metadata.scheduled_date 
    ? formatDateTime(article.metadata.scheduled_date, article.metadata.scheduled_time)
    : null

  return (
    <div className={`card p-4 transition-all duration-200 hover:shadow-md ${
      isSelected ? 'ring-2 ring-primary' : ''
    }`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        {onSelect && (
          <input
            type="checkbox"
            checked={isSelected || false}
            onChange={handleSelect}
            className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
        )}

        {/* Article Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground leading-5 mb-1 line-clamp-2">
                {article.metadata.title || article.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="truncate">{article.metadata.domain}</span>
                {article.metadata.estimated_read_time && (
                  <>
                    <span>•</span>
                    <span>{article.metadata.estimated_read_time} min read</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="btn btn-ghost p-1 h-8 w-8"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {showActions && (
                <div className="absolute right-0 mt-1 w-48 bg-background border rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <a
                      href={article.metadata.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Article
                    </a>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted w-full text-left"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleStatusChange('read')}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted w-full text-left"
                      disabled={article.metadata.status === 'read'}
                    >
                      <CheckSquare className="h-4 w-4" />
                      Mark as Read
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-red-600 w-full text-left"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {article.metadata.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {article.metadata.description}
            </p>
          )}

          {/* Tags */}
          {article.metadata.tags && article.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {article.metadata.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className={`badge text-xs ${getTagColor(tag)}`}
                >
                  {tag}
                </span>
              ))}
              {article.metadata.tags.length > 3 && (
                <span className="badge text-xs bg-gray-100 text-gray-600">
                  +{article.metadata.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              {/* Status */}
              <div className="flex items-center gap-1">
                <span className="text-base">{getStatusIcon(article.metadata.status)}</span>
                <span className={`badge ${getStatusColor(article.metadata.status)}`}>
                  {article.metadata.status}
                </span>
              </div>

              {/* Scheduled Time */}
              {scheduledDateTime && article.metadata.status === 'scheduled' && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span className="text-xs">{scheduledDateTime}</span>
                </div>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}