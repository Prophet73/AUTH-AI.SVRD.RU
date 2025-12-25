import { useEffect, useState } from 'react'
import { Search, Shield, ShieldOff, UserCheck, UserX, ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'

interface User {
  id: string
  email: string
  display_name: string | null
  first_name: string | null
  last_name: string | null
  department: string | null
  is_active: boolean
  is_admin: boolean
  last_login_at: string | null
  created_at: string
  groups: string[]
}

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [filterAdmin, setFilterAdmin] = useState<boolean | null>(null)
  const [filterActive, setFilterActive] = useState<boolean | null>(null)

  useEffect(() => {
    loadUsers()
  }, [search, filterAdmin, filterActive])

  const loadUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (filterAdmin !== null) params.append('is_admin', String(filterAdmin))
      if (filterActive !== null) params.append('is_active', String(filterActive))

      const response = await api.get(`/api/admin/users?${params}`)
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
  }

  const selectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)))
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.size === 0) return

    try {
      await api.post('/api/admin/users/bulk', {
        user_ids: Array.from(selectedUsers),
        action
      })
      setSelectedUsers(new Set())
      loadUsers()
    } catch (error) {
      console.error('Bulk action failed:', error)
    }
  }

  const toggleUserAdmin = async (user: User) => {
    try {
      await api.patch(`/api/admin/users/${user.id}`, {
        is_admin: !user.is_admin
      })
      loadUsers()
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const toggleUserActive = async (user: User) => {
    try {
      await api.patch(`/api/admin/users/${user.id}`, {
        is_active: !user.is_active
      })
      loadUsers()
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filterAdmin === null ? '' : String(filterAdmin)}
            onChange={(e) => setFilterAdmin(e.target.value === '' ? null : e.target.value === 'true')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All roles</option>
            <option value="true">Admins only</option>
            <option value="false">Users only</option>
          </select>

          <select
            value={filterActive === null ? '' : String(filterActive)}
            onChange={(e) => setFilterActive(e.target.value === '' ? null : e.target.value === 'true')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All status</option>
            <option value="true">Active only</option>
            <option value="false">Inactive only</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
          <span className="text-blue-700">
            {selectedUsers.size} user(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('activate')}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
            >
              Activate
            </button>
            <button
              onClick={() => handleBulkAction('deactivate')}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Deactivate
            </button>
            <button
              onClick={() => handleBulkAction('make_admin')}
              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
            >
              Make Admin
            </button>
            <button
              onClick={() => handleBulkAction('remove_admin')}
              className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
            >
              Remove Admin
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === users.length && users.length > 0}
                    onChange={selectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Groups</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className={!user.is_active ? 'bg-gray-50' : ''}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{getUserName(user)}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {user.department || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.groups.length > 0 ? (
                        user.groups.map((group, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            {group}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(user.last_login_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {user.is_admin && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                          Admin
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        user.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleUserAdmin(user)}
                        className={`p-1.5 rounded hover:bg-gray-100 ${
                          user.is_admin ? 'text-purple-600' : 'text-gray-400'
                        }`}
                        title={user.is_admin ? 'Remove admin' : 'Make admin'}
                      >
                        {user.is_admin ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => toggleUserActive(user)}
                        className={`p-1.5 rounded hover:bg-gray-100 ${
                          user.is_active ? 'text-green-600' : 'text-red-600'
                        }`}
                        title={user.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
