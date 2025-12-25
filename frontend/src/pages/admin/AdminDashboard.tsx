import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Building2, Shield, Download, Trash2, BarChart3 } from 'lucide-react'
import { api } from '../../api/client'

interface Stats {
  users: { total: number; active: number; admins: number }
  applications: { total: number; active: number }
  groups: { total: number }
  tokens: { total: number; active: number }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [cleanupResult, setCleanupResult] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await api.get('/api/admin/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCleanup = async () => {
    try {
      const response = await api.post('/api/admin/cleanup-tokens')
      setCleanupResult(`Deleted ${response.data.deleted_codes} codes and ${response.data.deleted_tokens} tokens`)
      setTimeout(() => setCleanupResult(null), 5000)
      loadStats()
    } catch (error) {
      console.error('Cleanup failed:', error)
    }
  }

  const handleExport = async (type: 'users' | 'applications') => {
    try {
      const response = await api.get(`/api/admin/export/${type}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `hub_${type}_${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/users" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.users.total || 0}</p>
              <p className="text-xs text-gray-400">{stats?.users.active || 0} active, {stats?.users.admins || 0} admins</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/groups" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Groups</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.groups.total || 0}</p>
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Applications</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.applications.total || 0}</p>
              <p className="text-xs text-gray-400">{stats?.applications.active || 0} active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Tokens</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.tokens.active || 0}</p>
              <p className="text-xs text-gray-400">{stats?.tokens.total || 0} total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleExport('users')}
            className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Download className="h-5 w-5" />
            Export Users (Excel)
          </button>

          <button
            onClick={() => handleExport('applications')}
            className="flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Download className="h-5 w-5" />
            Export Apps (Excel)
          </button>

          <button
            onClick={handleCleanup}
            className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
            Cleanup Expired Tokens
          </button>
        </div>

        {cleanupResult && (
          <div className="px-6 pb-4">
            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm">
              {cleanupResult}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Management</h2>
        </div>
        <div className="divide-y divide-gray-200">
          <Link to="/admin/users" className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors">
            <Users className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium text-gray-900">User Management</p>
              <p className="text-sm text-gray-500">Manage users, assign roles and permissions</p>
            </div>
          </Link>
          <Link to="/admin/groups" className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors">
            <Shield className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Group Management</p>
              <p className="text-sm text-gray-500">Create groups and manage memberships</p>
            </div>
          </Link>
          <Link to="/admin/access" className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors">
            <Building2 className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Access Control</p>
              <p className="text-sm text-gray-500">Configure application access for users and groups</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
