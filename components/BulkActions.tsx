'use client'

import { useState } from 'react'
import { Calendar, Clock, CheckCircle, Archive, Trash2, X } from 'lucide-react'
import { getQuickScheduleOptions } from '@/lib/utils'

interface BulkActionsProps {
  selectedIds: string[]
  onComplete: () => void
}

export default function BulkActions({ selectedIds, onComplete }: BulkActionsProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: ''
  })

  const quickScheduleOptions = getQuickScheduleOptions()

  const handleBulkSchedule = async () => {
    if (!scheduleData.date) {
      alert('Please select a date')
      return
    }

    try {
      // Here you would call your API to bulk update articles
      console.log('Bulk scheduling articles:', {
        ids: selectedIds,
        scheduled_date: scheduleData.date,
        scheduled_time: scheduleData.time
      })

      alert(`${selectedIds.length} articles scheduled successfully!`)
      setActiveAction(null)
      onComplete()
    } catch (error) {
      console.error('Error bulk scheduling:', error)
      alert('Failed to schedule articles. Please try again.')
    }
  }

  const handleBulkStatusChange = async (status: string) => {
    try {
      // Here you would call your API to bulk update article status
      console.log('Bulk status change:', {
        ids: selectedIds,
        status
      })

      alert(`${selectedIds.length} articles marked as ${status} successfully!`)
      onComplete()
    } catch (error) {
      console.error('Error bulk status change:', error)
      alert('Failed to update articles. Please try again.')
    }
  }

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} articles? This action cannot be undone.`)) {
      try {
        // Here you would call your API to bulk delete articles
        console.log('Bulk deleting articles:', selectedIds)

        alert(`${selectedIds.length} articles deleted successfully!`)
        onComplete()
      } catch (error) {
        console.error('Error bulk deleting:', error)
        alert('Failed to delete articles. Please try again.')
      }
    }
  }

  const handleQuickSchedule = (option: { date: string; time: string }) => {
    setScheduleData({
      date: option.date,
      time: option.time
    })
  }

  return (
    <div className="card p-4 bg-primary/5 border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {selectedIds.length} article{selectedIds.length !== 1 ? 's' : ''} selected
          </span>
        </div>
        <button
          onClick={onComplete}
          className="btn btn-ghost p-1 h-6 w-6"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setActiveAction(activeAction === 'schedule' ? null : 'schedule')}
          className={`btn btn-sm ${activeAction === 'schedule' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Calendar className="h-4 w-4" />
          Schedule All
        </button>

        <button
          onClick={() => handleBulkStatusChange('read')}
          className="btn btn-secondary btn-sm"
        >
          <CheckCircle className="h-4 w-4" />
          Mark as Read
        </button>

        <button
          onClick={() => handleBulkStatusChange('archived')}
          className="btn btn-secondary btn-sm"
        >
          <Archive className="h-4 w-4" />
          Archive All
        </button>

        <button
          onClick={handleBulkDelete}
          className="btn btn-secondary btn-sm text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete All
        </button>
      </div>

      {/* Schedule Panel */}
      {activeAction === 'schedule' && (
        <div className="space-y-4 p-4 bg-background border rounded-lg animate-fade-in">
          <h4 className="font-medium">Schedule {selectedIds.length} articles</h4>

          {/* Quick Schedule Options */}
          <div>
            <label className="text-sm font-medium mb-2 block">Quick Schedule</label>
            <div className="flex flex-wrap gap-2">
              {quickScheduleOptions.map((option) => (
                <button
                  key={option.label}
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
              <label className="text-sm font-medium mb-1 block">Date</label>
              <input
                type="date"
                value={scheduleData.date}
                onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Time
              </label>
              <input
                type="text"
                value={scheduleData.time}
                onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                placeholder="9:00 AM"
                className="input w-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setActiveAction(null)}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkSchedule}
              disabled={!scheduleData.date}
              className="btn btn-primary"
            >
              Schedule {selectedIds.length} Articles
            </button>
          </div>
        </div>
      )}
    </div>
  )
}