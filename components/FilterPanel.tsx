'use client'

import { X, Calendar, Tag } from 'lucide-react'
import { availableTags } from '@/lib/utils'
import type { FilterOptions } from '@/types'

interface FilterPanelProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  onClose: () => void
}

export default function FilterPanel({ filters, onFiltersChange, onClose }: FilterPanelProps) {
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const toggleTag = (tag: string) => {
    const currentTags = filters.tags || []
    const updatedTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    
    updateFilter('tags', updatedTags)
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  return (
    <div className="card p-4 space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Filters</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={clearFilters}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="btn btn-ghost p-1 h-6 w-6"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) => updateFilter('status', e.target.value || undefined)}
            className="select w-full"
          >
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="sent">Sent</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            From Date
          </label>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => updateFilter('dateFrom', e.target.value || undefined)}
            className="input w-full"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            To Date
          </label>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => updateFilter('dateTo', e.target.value || undefined)}
            className="input w-full"
          />
        </div>

        {/* Domain */}
        <div>
          <label className="text-sm font-medium mb-2 block">Domain</label>
          <input
            type="text"
            value={filters.domain || ''}
            onChange={(e) => updateFilter('domain', e.target.value || undefined)}
            placeholder="e.g. techcrunch.com"
            className="input w-full"
          />
        </div>
      </div>

      {/* Tags Filter */}
      <div>
        <label className="text-sm font-medium mb-2 flex items-center gap-1">
          <Tag className="h-4 w-4" />
          Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => {
            const isSelected = filters.tags?.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`badge transition-colors ${
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.status || filters.tags?.length || filters.dateFrom || filters.dateTo || filters.domain) && (
        <div className="pt-3 border-t">
          <h4 className="text-sm font-medium mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2 text-sm">
            {filters.status && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Status: {filters.status}
              </span>
            )}
            {filters.tags?.map(tag => (
              <span key={tag} className="bg-green-100 text-green-800 px-2 py-1 rounded">
                Tag: {tag}
              </span>
            ))}
            {filters.dateFrom && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                From: {filters.dateFrom}
              </span>
            )}
            {filters.dateTo && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                To: {filters.dateTo}
              </span>
            )}
            {filters.domain && (
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                Domain: {filters.domain}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}