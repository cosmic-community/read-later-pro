import Link from 'next/link'
import { Search, Settings, User, Bell } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">RL</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">
              Read Later Pro
            </span>
          </Link>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search articles..."
                className="input pl-9 w-full"
              />
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex items-center space-x-2">
            {/* Mobile Search */}
            <button className="btn btn-ghost p-2 md:hidden">
              <Search className="h-4 w-4" />
            </button>
            
            {/* Notifications */}
            <button className="btn btn-ghost p-2 relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-accent rounded-full"></span>
            </button>
            
            {/* Settings */}
            <Link href="/settings" className="btn btn-ghost p-2">
              <Settings className="h-4 w-4" />
            </Link>
            
            {/* Profile */}
            <button className="btn btn-ghost p-2">
              <User className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}