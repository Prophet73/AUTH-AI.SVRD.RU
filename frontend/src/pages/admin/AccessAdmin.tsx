import { useEffect, useState } from 'react'
import { ChevronLeft, Check, X, Globe, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'

interface Application {
  id: string
  name: string
  slug: string
  is_active: boolean
  is_public?: boolean
}

interface User {
  id: string
  email: string
  display_name: string | null
  first_name: string | null
  last_name: string | null
}

interface Group {
  id: string
  name: string
  color: string
  member_count: number
}

interface AppAccess {
  application_id: string
  application_name: string
  is_public: boolean
  direct_users: User[]
  groups: Group[]
}

export default function AccessAdmin() {
  const [applications, setApplications] = useState<Application[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [appAccess, setAppAccess] = useState<AppAccess | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [appsRes, usersRes, groupsRes] = await Promise.all([
        api.get('/api/applications'),
        api.get('/api/admin/users?limit=500'),
        api.get('/api/admin/groups')
      ])
      setApplications(appsRes.data)
      setUsers(usersRes.data)
      setGroups(groupsRes.data)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAppAccess = async (app: Application) => {
    try {
      const response = await api.get(`/api/admin/applications/${app.id}/access`)
      setAppAccess(response.data)
      setSelectedApp(app)
      setShowModal(true)
    } catch (error) {
      console.error('Failed to load access:', error)
    }
  }

  const togglePublic = async (app: Application) => {
    try {
      await api.patch(`/api/admin/applications/${app.id}/public?is_public=${!app.is_public}`)
      loadData()
      if (appAccess && appAccess.application_id === app.id) {
        setAppAccess({ ...appAccess, is_public: !app.is_public })
      }
    } catch (error) {
      console.error('Failed to toggle public:', error)
    }
  }

  const grantAccess = async (type: 'user' | 'group', id: string) => {
    if (!selectedApp) return

    try {
      await api.post('/api/admin/access/grant', {
        application_id: selectedApp.id,
        user_ids: type === 'user' ? [id] : [],
        group_ids: type === 'group' ? [id] : []
      })
      loadAppAccess(selectedApp)
    } catch (error) {
      console.error('Failed to grant access:', error)
    }
  }

  const revokeAccess = async (type: 'user' | 'group', id: string) => {
    if (!selectedApp) return

    try {
      await api.post('/api/admin/access/revoke', {
        application_id: selectedApp.id,
        user_ids: type === 'user' ? [id] : [],
        group_ids: type === 'group' ? [id] : []
      })
      loadAppAccess(selectedApp)
    } catch (error) {
      console.error('Failed to revoke access:', error)
    }
  }

  const getUserName = (user: User) => {
    if (user.last_name && user.first_name) {
      return `${user.last_name} ${user.first_name}`
    }
    return user.display_name || user.email.split('@')[0]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Access Control</h1>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-700 text-sm">
          <strong>Public apps</strong> are visible to all authenticated users.
          <strong> Private apps</strong> require explicit access granted to users or groups.
        </p>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visibility</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Access</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.id}>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{app.name}</p>
                      <p className="text-sm text-gray-500">{app.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => togglePublic(app)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                        app.is_public
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {app.is_public ? (
                        <>
                          <Globe className="h-4 w-4" />
                          Public
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Private
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {app.is_public ? (
                      <span className="text-green-600">All users</span>
                    ) : (
                      <span>Restricted</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => loadAppAccess(app)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Manage Access
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Access Modal */}
      {showModal && selectedApp && appAccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Access for "{selectedApp.name}"</h2>
                <p className="text-sm text-gray-500">
                  {appAccess.is_public ? 'Public - visible to all users' : 'Private - requires explicit access'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedApp(null)
                  setAppAccess(null)
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-auto grid grid-cols-2 gap-6">
              {/* Users */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Users with Access</h3>

                {/* Current users */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Direct access ({appAccess.direct_users.length})</p>
                  <div className="space-y-1 max-h-40 overflow-auto">
                    {appAccess.direct_users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between bg-green-50 p-2 rounded">
                        <span className="text-sm">{getUserName(user)}</span>
                        <button
                          onClick={() => revokeAccess('user', user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {appAccess.direct_users.length === 0 && (
                      <p className="text-gray-400 text-sm">No direct user access</p>
                    )}
                  </div>
                </div>

                {/* Add users */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Grant access to user</p>
                  <div className="space-y-1 max-h-48 overflow-auto border rounded-lg p-2">
                    {users
                      .filter(u => !appAccess.direct_users.find(du => du.id === u.id))
                      .map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-1 hover:bg-gray-50 rounded">
                          <div>
                            <p className="text-sm font-medium">{getUserName(user)}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          <button
                            onClick={() => grantAccess('user', user.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Groups */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Groups with Access</h3>

                {/* Current groups */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Group access ({appAccess.groups.length})</p>
                  <div className="space-y-1 max-h-40 overflow-auto">
                    {appAccess.groups.map((group) => (
                      <div key={group.id} className="flex items-center justify-between bg-purple-50 p-2 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }}></div>
                          <span className="text-sm">{group.name}</span>
                          <span className="text-xs text-gray-500">({group.member_count} members)</span>
                        </div>
                        <button
                          onClick={() => revokeAccess('group', group.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {appAccess.groups.length === 0 && (
                      <p className="text-gray-400 text-sm">No group access</p>
                    )}
                  </div>
                </div>

                {/* Add groups */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Grant access to group</p>
                  <div className="space-y-1 max-h-48 overflow-auto border rounded-lg p-2">
                    {groups
                      .filter(g => !appAccess.groups.find(ag => ag.id === g.id))
                      .map((group) => (
                        <div key={group.id} className="flex items-center justify-between p-1 hover:bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }}></div>
                            <span className="text-sm font-medium">{group.name}</span>
                            <span className="text-xs text-gray-500">({group.member_count})</span>
                          </div>
                          <button
                            onClick={() => grantAccess('group', group.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedApp(null)
                  setAppAccess(null)
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
