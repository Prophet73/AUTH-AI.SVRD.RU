import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { api } from '../api/client'
import AppCard from '../components/AppCard'

interface Application {
  id: string
  name: string
  slug: string
  description: string | null
  base_url: string | null
  icon_url: string | null
}

export default function DashboardPage() {
  const { data: applications, isLoading, error } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const response = await api.get<Application[]>('/api/applications')
      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load applications</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-500 mt-1">
          Access your corporate applications
        </p>
      </div>

      {applications && applications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <AppCard key={app.id} application={app} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No applications available</p>
        </div>
      )}
    </div>
  )
}
