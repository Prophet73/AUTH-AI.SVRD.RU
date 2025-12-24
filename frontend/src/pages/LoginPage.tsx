import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuthStore } from '../store/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, isLoading } = useAuthStore()

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/')
    }
  }, [user, isLoading, navigate])

  const handleSSOLogin = () => {
    // Redirect to SSO login endpoint
    window.location.href = '/auth/sso/login?redirect_to=/'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Hub</h1>
            <p className="text-gray-500 mt-2">Application Portal</p>
          </div>

          <button
            onClick={handleSSOLogin}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Corporate SSO
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Use your corporate account to access applications
          </p>

          {/* Dev login - только для разработки */}
          {import.meta.env.DEV && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-xs text-gray-400 mb-3">Development Only</p>
              <button
                onClick={() => window.location.href = '/auth/dev-login'}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Dev Login (bypass SSO)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
