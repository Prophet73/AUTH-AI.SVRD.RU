import { ExternalLink } from 'lucide-react'

interface Application {
  id: string
  name: string
  slug: string
  description: string | null
  base_url: string | null
  icon_url: string | null
}

interface AppCardProps {
  application: Application
}

export default function AppCard({ application }: AppCardProps) {
  const handleClick = () => {
    if (application.base_url) {
      // Open application in new tab
      window.open(application.base_url, '_blank')
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`
        bg-white rounded-xl border border-gray-200 p-6
        ${application.base_url ? 'cursor-pointer hover:border-blue-300 hover:shadow-md' : 'opacity-60'}
        transition-all duration-200
      `}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
          {application.icon_url ? (
            <img
              src={application.icon_url}
              alt={application.name}
              className="w-8 h-8 object-contain"
            />
          ) : (
            <span className="text-white font-bold text-lg">
              {application.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">
              {application.name}
            </h3>
            {application.base_url && (
              <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
          </div>
          {application.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {application.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
