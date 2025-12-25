import { Link, useLocation } from 'react-router-dom'
import { LogOut, User, Shield, Home } from 'lucide-react'
import { useAuthStore } from '../store/auth'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="font-semibold text-gray-900">Hub</span>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  to="/"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                    location.pathname === '/'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Apps
                </Link>
                {user?.is_admin && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      isAdminPage
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
              </nav>
            </div>

            {/* User menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>
                  {user?.last_name && user?.first_name
                    ? `${user.last_name} ${user.first_name} ${user.middle_name || ''}`.trim()
                    : user?.display_name || user?.email}
                </span>
                {user?.is_admin && (
                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                    Admin
                  </span>
                )}
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
