'use client'

import { useState } from 'react'
import { Plus, Calendar, Clock, Tag } from 'lucide-react'
import { extractUrlMetadata, getQuickScheduleOptions, validateUrl } from '@/lib/utils'
import { availableTags } from '@/lib/utils'

export default function ArticleForm() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    scheduled_date: '',
    scheduled_time: '',
  })

  const quickScheduleOptions = getQuickScheduleOptions()

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateUrl(url)) {
      alert('Please enter a valid URL starting with http:// or https://')
      return
    }
    
    setIsLoading(true)
    
    try {
      const metadata = await extractUrlMetadata(url)
      setFormData({
        ...formData,
        title: metadata.title,
        description: metadata.description,
      })
      setShowAdvanced(true)
    } catch (error) {
      console.error('Error extracting metadata:', error)
      alert('Failed to extract article information. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      // Here you would call your API to save the article
      console.log('Saving article:', { url, ...formData })
      
      // Reset form
      setUrl('')
      setFormData({
        title: '',
        description: '',
        tags: [],
        scheduled_date: '',
        scheduled_time: '',
      })
      setShowAdvanced(false)
      
      alert('Article saved successfully!')
    } catch (error) {
      console.error('Error saving article:', error)
      alert('Failed to save article. Please try again.')
    }
  }

  const handleQuickSchedule = (option: { label: string; date: string; time: string }) => {
    setFormData({
      ...formData,
      scheduled_date: option.date,
      scheduled_time: option.time,
    })
  }

  const toggleTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.includes(tag)
        ? formData.tags.filter(t => t !== tag)
        : [...formData.tags, tag]
    })
  }

  return (
    <div className="space-y-4">
      {/* URL Input Form */}
      <form onSubmit={handleUrlSubmit} className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste article URL here..."
          className="input flex-1"
          required
        />
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="btn btn-primary"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </button>
      </form>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50 animate-fade-in">
          {/* Title and Description */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Article Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input w-full"
                placeholder="Article title"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="textarea w-full"
                placeholder="Article description or notes"
                rows={2}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-1">
              <Tag className="h-4 w-4" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`badge transition-colors ${
                    formData.tags.includes(tag)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Schedule Options */}
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Quick Schedule
            </label>
            <div className="flex flex-wrap gap-2">
              {quickScheduleOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleQuickSchedule(option)}
                  className="btn btn-secondary btn-sm"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Custom Date</label>
              <input
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                className="input w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Time
              </label>
              <input
                type="text"
                value={formData.scheduled_time}
                onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                placeholder="9:00 AM"
                className="input w-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowAdvanced(false)}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary"
            >
              Save Article
            </button>
          </div>
        </div>
      )}
    </div>
  )
}