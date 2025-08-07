import { Suspense } from 'react'
import Header from '@/components/Header'
import ArticleForm from '@/components/ArticleForm'
import ArticleList from '@/components/ArticleList'
import QuickStats from '@/components/QuickStats'
import LoadingSpinner from '@/components/LoadingSpinner'
import TestEmailButton from '@/components/TestEmailButton'

export default async function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Add Article Form */}
            <section className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Save New Article</h2>
              <ArticleForm />
            </section>
            
            {/* Articles List */}
            <section className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Your Articles</h2>
              </div>
              <Suspense fallback={<LoadingSpinner />}>
                <ArticleList />
              </Suspense>
            </section>
          </div>
          
          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Suspense fallback={<LoadingSpinner />}>
              <QuickStats />
            </Suspense>
            
            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="btn btn-secondary w-full justify-start">
                  📅 Schedule Today's Articles
                </button>
                <button className="btn btn-secondary w-full justify-start">
                  📊 View Analytics
                </button>
                <button className="btn btn-secondary w-full justify-start">
                  ⚙️ Email Preferences
                </button>
                <button className="btn btn-secondary w-full justify-start">
                  📋 Shared Lists
                </button>
              </div>
            </div>
            
            {/* Test Email Section */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Email Testing</h3>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-3">
                  Send a test email to verify your email configuration and see how your digest will look.
                </p>
                <TestEmailButton 
                  variant="primary"
                  userEmail="test@example.com"
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Popular Tags */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Technology',
                  'Business',
                  'Design',
                  'Marketing',
                  'Health',
                  'Science'
                ].map((tag) => (
                  <button
                    key={tag}
                    className="tag-badge text-xs"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}