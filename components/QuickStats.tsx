'use client'

import { useEffect, useState } from 'react'
import { Calendar, CheckCircle, Clock, Archive } from 'lucide-react'

interface Stats {
  scheduled: number
  sent: number
  read: number
  archived: number
  thisWeekSaved: number
  articlesLimit: number
}

export default function QuickStats() {
  const [stats, setStats] = useState<Stats>({
    scheduled: 0,
    sent: 0,
    read: 0,
    archived: 0,
    thisWeekSaved: 0,
    articlesLimit: 5
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Mock stats - replace with actual API call
        setStats({
          scheduled: 12,
          sent: 45,
          read: 128,
          archived: 23,
          thisWeekSaved: 3,
          articlesLimit: 5
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-8 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const weeklyProgress = (stats.thisWeekSaved / stats.articlesLimit) * 100

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
      
      {/* Weekly Limit Progress */}
      <div className="mb-6 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">This Week</span>
          <span className="text-sm text-muted-foreground">
            {stats.thisWeekSaved} / {stats.articlesLimit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              weeklyProgress >= 100 ? 'bg-red-500' : weeklyProgress >= 80 ? 'bg-yellow-500' : 'bg-accent'
            }`}
            style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
          ></div>
        </div>
        {stats.thisWeekSaved >= stats.articlesLimit && (
          <p className="text-xs text-red-600 mt-1">
            Weekly limit reached. Consider upgrading to paid plan.
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Scheduled</span>
          </div>
          <span className="font-medium">{stats.scheduled}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-500" />
            <span className="text-sm">Sent</span>
          </div>
          <span className="font-medium">{stats.sent}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-purple-500" />
            <span className="text-sm">Read</span>
          </div>
          <span className="font-medium">{stats.read}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Archived</span>
          </div>
          <span className="font-medium">{stats.archived}</span>
        </div>
      </div>

      {/* Total */}
      <div className="mt-4 pt-3 border-t">
        <div className="flex items-center justify-between font-medium">
          <span>Total Articles</span>
          <span>{stats.scheduled + stats.sent + stats.read + stats.archived}</span>
        </div>
      </div>

      {/* Upgrade Prompt (for free users) */}
      <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm text-primary font-medium mb-1">Free Plan</p>
        <p className="text-xs text-primary/80 mb-2">
          Upgrade to save unlimited articles and access premium features.
        </p>
        <button className="btn btn-primary btn-sm w-full">
          Upgrade to Pro
        </button>
      </div>
    </div>
  )
}