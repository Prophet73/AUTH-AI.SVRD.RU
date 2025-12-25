import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Users, ChevronLeft, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'

interface Group {
  id: string
  name: string
  description: string | null
  color: string
  member_count: number
  created_at: string
  members?: GroupMember[]
}

interface GroupMember {
  id: string
  email: string
  display_name: string | null
  first_name: string | null
  last_name: string | null
  department: string | null
}

interface User {
  id: string
  email: string
  display_name: string | null
  first_name: string | null
  last_name: string | null
}

export default function GroupsAdmin() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])

  // Form state
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formColor, setFormColor] = useState('#6366f1')

  useEffect(() => {
    loadGroups()
    loadAllUsers()
  }, [])

  const loadGroups = async () => {
    try {
      const response = await api.get('/api/admin/groups')
      setGroups(response.data)
    } catch (error) {
      console.error('Failed to load groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAllUsers = async () => {
    try {
      const response = await api.get('/api/admin/users?limit=500')
      setAllUsers(response.data)
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const loadGroupMembers = async (group: Group) => {
    try {
      const response = await api.get(`/api/admin/groups/${group.id}`)
      setSelectedGroup(response.data)
      setShowMembersModal(true)
    } catch (error) {
      console.error('Failed to load group members:', error)
    }
  }

  const handleCreateGroup = async () => {
    try {
      await api.post('/api/admin/groups', {
        name: formName,
        description: formDescription || null,
        color: formColor
      })
      setShowCreateModal(false)
      resetForm()
      loadGroups()
    } catch (error) {
      console.error('Failed to create group:', error)
    }
  }

  const handleUpdateGroup = async () => {
    if (!selectedGroup) return

    try {
      await api.patch(`/api/admin/groups/${selectedGroup.id}`, {
        name: formName,
        description: formDescription || null,
        color: formColor
      })
      setShowEditModal(false)
      resetForm()
      loadGroups()
    } catch (error) {
      console.error('Failed to update group:', error)
    }
  }

  const handleDeleteGroup = async (group: Group) => {
    if (!confirm(`Delete group "${group.name}"? This will remove all member associations.`)) return

    try {
      await api.delete(`/api/admin/groups/${group.id}`)
      loadGroups()
    } catch (error) {
      console.error('Failed to delete group:', error)
    }
  }

  const handleAddMember = async (userId: string) => {
    if (!selectedGroup) return

    try {
      await api.post(`/api/admin/groups/${selectedGroup.id}/members`, {
        user_ids: [userId],
        group_id: selectedGroup.id,
        action: 'add'
      })
      loadGroupMembers(selectedGroup)
      loadGroups()
    } catch (error) {
      console.error('Failed to add member:', error)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!selectedGroup) return

    try {
      await api.post(`/api/admin/groups/${selectedGroup.id}/members`, {
        user_ids: [userId],
        group_id: selectedGroup.id,
        action: 'remove'
      })
      loadGroupMembers(selectedGroup)
      loadGroups()
    } catch (error) {
      console.error('Failed to remove member:', error)
    }
  }

  const openEditModal = (group: Group) => {
    setSelectedGroup(group)
    setFormName(group.name)
    setFormDescription(group.description || '')
    setFormColor(group.color)
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormName('')
    setFormDescription('')
    setFormColor('#6366f1')
    setSelectedGroup(null)
  }

  const getUserName = (user: GroupMember | User) => {
    if ('last_name' in user && user.last_name && 'first_name' in user && user.first_name) {
      return `${user.last_name} ${user.first_name}`
    }
    return user.display_name || user.email.split('@')[0]
  }

  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6', '#6b7280'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Group Management</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Create Group
        </button>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No groups yet. Create your first group to organize users.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-2" style={{ backgroundColor: group.color }}></div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{group.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(group)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => loadGroupMembers(group)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Users className="h-4 w-4" />
                    {group.member_count} member(s)
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {showCreateModal ? 'Create Group' : 'Edit Group'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setShowEditModal(false)
                  resetForm()
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Group name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormColor(color)}
                      className={`w-8 h-8 rounded-full ${
                        formColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setShowEditModal(false)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={showCreateModal ? handleCreateGroup : handleUpdateGroup}
                disabled={!formName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {showCreateModal ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Members of "{selectedGroup.name}"
              </h2>
              <button
                onClick={() => {
                  setShowMembersModal(false)
                  setSelectedGroup(null)
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              {/* Current Members */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Current Members ({selectedGroup.members?.length || 0})</h3>
                {selectedGroup.members && selectedGroup.members.length > 0 ? (
                  <div className="space-y-2">
                    {selectedGroup.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{getUserName(member)}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No members yet</p>
                )}
              </div>

              {/* Add Members */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Add Members</h3>
                <div className="space-y-2 max-h-64 overflow-auto">
                  {allUsers
                    .filter(u => !selectedGroup.members?.find(m => m.id === u.id))
                    .map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{getUserName(user)}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <button
                          onClick={() => handleAddMember(user.id)}
                          className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  setShowMembersModal(false)
                  setSelectedGroup(null)
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
