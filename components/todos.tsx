"use client"

import { useState, useEffect } from "react"
import { Check, Plus, Calendar, AlertCircle, X, Edit2, Copy, ExternalLink } from "lucide-react"

interface SubTask {
  _id: string
  title: string
  completed: boolean
}

interface Link {
  title: string
  url: string
}

interface Todo {
  _id: string
  title: string
  description: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  dueDate: string
  category: string
  tags: string[]
  subTasks: SubTask[]
  links: Link[]
  notes: string
  completedAt?: string
}

const priorityColors = {
  low: "#c8e6c9",
  medium: "#ffe0b2",
  high: "#e1bee7",
  urgent: "#ffcdd2",
}

const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
}

export default function Todos() {
  const [user, setUser] = useState<any>(null)
  const [todos, setTodos] = useState<Todo[]>([])
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    dueDate: "",
    category: "Work",
    tags: [] as string[],
    subTasks: [] as SubTask[],
    links: [] as Link[],
    notes: "",
  })
  const [tagInput, setTagInput] = useState("")
  const [linkInput, setLinkInput] = useState({ title: "", url: "" })
  const [subtaskInput, setSubtaskInput] = useState("")
  const [copiedLinkId, setCopiedLinkId] = useState<number | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      fetchTodos(userData._id)
    }
  }, [])

  const fetchTodos = async (userId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/todos?userId=${userId}`)
      const data = await response.json()
      setTodos(data)
    } catch (error) {
      console.log("[v0] Error fetching todos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let filtered = todos

    if (selectedStatus !== "all") {
      filtered = filtered.filter((todo) => todo.status === selectedStatus)
    }

    setFilteredTodos(filtered)
  }, [todos, selectedStatus])

  const handleCompleteTodo = async (todoId: string) => {
    try {
      const response = await fetch(`/api/todos/${todoId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        await fetchTodos(user._id)
        if (selectedTodo?._id === todoId) {
          setSelectedTodo(null)
          setIsDetailDrawerOpen(false)
        }
      }
    } catch (error) {
      console.log("[v0] Error completing todo:", error)
    }
  }

  const handleUndoComplete = async (todoId: string) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending" }),
      })

      if (response.ok) {
        await fetchTodos(user._id)
        if (selectedTodo?._id === todoId) {
          const updatedTodo = todos.find((t) => t._id === todoId)
          if (updatedTodo) setSelectedTodo(updatedTodo)
        }
      }
    } catch (error) {
      console.log("[v0] Error undoing complete:", error)
    }
  }

  const handleDeleteTodo = async (todoId: string) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchTodos(user._id)
        setIsDetailDrawerOpen(false)
        setSelectedTodo(null)
      }
    } catch (error) {
      console.log("[v0] Error deleting todo:", error)
    }
  }

  const handleAddTodo = async () => {
    if (!formData.title.trim()) return

    try {
      const subtasksWithoutId = formData.subTasks.map(({ _id, ...rest }) => rest)

      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          subTasks: subtasksWithoutId,
          userId: user._id,
        }),
      })

      if (response.ok) {
        await fetchTodos(user._id)
        resetForm()
        setIsAddDrawerOpen(false)
      }
    } catch (error) {
      console.log("[v0] Error adding todo:", error)
    }
  }

  const handleUpdateTodo = async () => {
    if (!selectedTodo || !formData.title.trim()) return

    try {
      const subtasksWithoutId = formData.subTasks.map(({ _id, ...rest }) => rest)

      const response = await fetch(`/api/todos/${selectedTodo._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          subTasks: subtasksWithoutId,
        }),
      })

      if (response.ok) {
        await fetchTodos(user._id)
        setIsEditMode(false)
        const updatedTodo = todos.find((t) => t._id === selectedTodo._id)
        if (updatedTodo) setSelectedTodo(updatedTodo)
      }
    } catch (error) {
      console.log("[v0] Error updating todo:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      dueDate: "",
      category: "Work",
      tags: [],
      subTasks: [],
      links: [],
      notes: "",
    })
    setTagInput("")
    setLinkInput({ title: "", url: "" })
    setSubtaskInput("")
  }

  const openDetailDrawer = (todo: Todo) => {
    setSelectedTodo(todo)
    setFormData({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      status: todo.status,
      dueDate: todo.dueDate,
      category: todo.category,
      tags: todo.tags || [],
      subTasks: todo.subTasks || [],
      links: todo.links || [],
      notes: todo.notes,
    })
    setIsDetailDrawerOpen(true)
  }

  const getCardBackgroundColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-gradient-to-br from-green-200 to-green-300"
      case "in_progress":
        return "bg-gradient-to-br from-yellow-200 to-yellow-300"
      case "pending":
        return "bg-gradient-to-br from-gray-100 to-gray-200"
      case "cancelled":
        return "bg-gradient-to-br from-red-200 to-red-300"
      default:
        return "bg-gradient-to-br from-gray-100 to-gray-200"
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString()
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const completedCount = todos.filter((t) => t.status === "completed").length
  const pendingCount = todos.filter((t) => t.status === "pending").length
  const inProgressCount = todos.filter((t) => t.status === "in_progress").length

  const copyToClipboard = (text: string, linkId: number) => {
    navigator.clipboard.writeText(text)
    setCopiedLinkId(linkId)
    setTimeout(() => setCopiedLinkId(null), 2000)
  }

  return (
    <main className="pb-32 md:pb-0">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Todo</h2>
        </div>

        {/* Filters with Badges */}
        <div className="flex gap-2 flex-wrap mb-6">
          <FilterButton
            label="All"
            isActive={selectedStatus === "all"}
            onClick={() => setSelectedStatus("all")}
            badge={todos.length}
          />
          <FilterButton
            label="Pending"
            isActive={selectedStatus === "pending"}
            onClick={() => setSelectedStatus("pending")}
            badge={pendingCount}
          />
          <FilterButton
            label="In Progress"
            isActive={selectedStatus === "in_progress"}
            onClick={() => setSelectedStatus("in_progress")}
            badge={inProgressCount}
          />
          <FilterButton
            label="Completed"
            isActive={selectedStatus === "completed"}
            onClick={() => setSelectedStatus("completed")}
            badge={completedCount}
          />
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading todos...</div>
          ) : filteredTodos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No todos yet. Create one to get started!</div>
          ) : (
            filteredTodos.map((todo) => (
              <div
                key={todo._id}
                onClick={() => openDetailDrawer(todo)}
                className={`${getCardBackgroundColor(
                  todo.status,
                )} rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (todo.status === "completed") {
                        handleUndoComplete(todo._id)
                      } else {
                        handleCompleteTodo(todo._id)
                      }
                    }}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition mt-1 ${
                      todo.status === "completed"
                        ? "bg-white border-white cursor-pointer hover:bg-gray-100"
                        : "border-white hover:bg-white hover:bg-opacity-30"
                    }`}
                  >
                    {todo.status === "completed" && <Check className="w-4 h-4 text-green-600" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold text-base ${
                        todo.status === "completed" ? "line-through opacity-60" : ""
                      } text-gray-900`}
                    >
                      {todo.title}
                    </h3>
                    {todo.description && <p className="text-sm text-gray-700 opacity-80 mt-1">{todo.description}</p>}

                    <div className="flex items-center gap-3 flex-wrap text-sm mt-2 text-gray-800">
                      {todo.dueDate && (
                        <div
                          className={`flex items-center gap-1 ${isOverdue(todo.dueDate) ? "text-red-600 font-semibold" : ""}`}
                        >
                          {isOverdue(todo.dueDate) && <AlertCircle className="w-4 h-4" />}
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(todo.dueDate)}</span>
                        </div>
                      )}
                      {todo.category && (
                        <span className="bg-white bg-opacity-50 px-2 py-0.5 rounded text-xs font-medium">
                          {todo.category}
                        </span>
                      )}
                      {(todo.tags?.length || 0) > 0 && (
                        <span className="text-xs font-medium bg-white bg-opacity-50 px-2 py-0.5 rounded">
                          {todo.tags.length} tags
                        </span>
                      )}
                      {(todo.links?.length || 0) > 0 && (
                        <span className="text-xs font-medium bg-white bg-opacity-50 px-2 py-0.5 rounded">
                          {todo.links.length} links
                        </span>
                      )}
                      {(todo.subTasks?.length || 0) > 0 && (
                        <span className="text-xs font-medium bg-white bg-opacity-50 px-2 py-0.5 rounded">
                          {todo.subTasks.filter((st) => st.completed).length}/{todo.subTasks.length}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: priorityColors[todo.priority] }}
                  >
                    {priorityLabels[todo.priority]}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <button
        onClick={() => {
          resetForm()
          setIsEditMode(false)
          setIsAddDrawerOpen(true)
        }}
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 bg-gradient-to-br from-purple-400 to-blue-400 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center hover:scale-110 z-40"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Detail Drawer */}
      {isDetailDrawerOpen && selectedTodo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[90vh] md:max-h-none overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-900">{isEditMode ? "Edit Todo" : "Todo Details"}</h2>
              <button
                onClick={() => {
                  setIsDetailDrawerOpen(false)
                  setIsEditMode(false)
                  setSelectedTodo(null)
                }}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {isEditMode ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Tags Section */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                    <div className="flex gap-2 mb-2 flex-wrap">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"
                        >
                          {tag}
                          <button
                            onClick={() => setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add tag"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => {
                          if (tagInput.trim()) {
                            setFormData({ ...formData, tags: [...formData.tags, tagInput] })
                            setTagInput("")
                          }
                        }}
                        className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Links</label>
                    <div className="space-y-2 mb-2">
                      {formData.links.map((link, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-gray-100 rounded">
                          <div className="text-sm flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{link.title}</p>
                            <p className="text-xs text-gray-600 truncate">{link.url}</p>
                          </div>
                          <button
                            onClick={() =>
                              setFormData({ ...formData, links: formData.links.filter((_, i) => i !== idx) })
                            }
                            className="flex-shrink-0 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={linkInput.title}
                        onChange={(e) => setLinkInput({ ...linkInput, title: e.target.value })}
                        placeholder="Link title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={linkInput.url}
                          onChange={(e) => setLinkInput({ ...linkInput, url: e.target.value })}
                          placeholder="URL"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => {
                            if (linkInput.title && linkInput.url) {
                              setFormData({ ...formData, links: [...formData.links, linkInput] })
                              setLinkInput({ title: "", url: "" })
                            }
                          }}
                          className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subtasks Section */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subtasks</label>
                    <div className="space-y-2 mb-2">
                      {formData.subTasks.map((subtask) => (
                        <div key={subtask._id} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={subtask.completed} readOnly className="w-4 h-4 rounded" />
                          <span className={subtask.completed ? "line-through text-gray-400" : "text-gray-700"}>
                            {subtask.title}
                          </span>
                          <button
                            onClick={() =>
                              setFormData({
                                ...formData,
                                subTasks: formData.subTasks.filter((st) => st._id !== subtask._id),
                              })
                            }
                            className="ml-auto text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={subtaskInput}
                        onChange={(e) => setSubtaskInput(e.target.value)}
                        placeholder="Add subtask"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => {
                          if (subtaskInput.trim()) {
                            setFormData({
                              ...formData,
                              subTasks: [
                                ...formData.subTasks,
                                { _id: Date.now().toString(), title: subtaskInput, completed: false },
                              ],
                            })
                            setSubtaskInput("")
                          }
                        }}
                        className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleUpdateTodo}
                      className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditMode(false)}
                      className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Title</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedTodo.title}</p>
                  </div>

                  {selectedTodo.description && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Description</p>
                      <p className="text-gray-700">{selectedTodo.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Priority</p>
                      <p
                        className="inline-block px-3 py-1 rounded-full text-white text-sm font-medium"
                        style={{ backgroundColor: priorityColors[selectedTodo.priority] }}
                      >
                        {priorityLabels[selectedTodo.priority]}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Status</p>
                      <p className="text-gray-700 font-medium capitalize">{selectedTodo.status.replace("_", " ")}</p>
                    </div>
                  </div>

                  {selectedTodo.dueDate && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Due Date</p>
                      <p className="text-gray-700">{formatDate(selectedTodo.dueDate)}</p>
                    </div>
                  )}

                  {selectedTodo.category && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Category</p>
                      <p className="text-gray-700">{selectedTodo.category}</p>
                    </div>
                  )}

                  {selectedTodo.tags && selectedTodo.tags.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTodo.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTodo.links && selectedTodo.links.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Links</p>
                      <div className="space-y-2">
                        {selectedTodo.links.map((link, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-gray-100 rounded">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-blue-600 hover:underline text-sm font-medium"
                            >
                              {link.title}
                            </a>
                            <div className="flex gap-1">
                              <button
                                onClick={() => copyToClipboard(link.url, idx)}
                                className="p-1 hover:bg-gray-200 rounded transition"
                                title="Copy link"
                              >
                                {copiedLinkId === idx ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4 text-gray-600" />
                                )}
                              </button>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 hover:bg-gray-200 rounded transition"
                                title="Open link"
                              >
                                <ExternalLink className="w-4 h-4 text-gray-600" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTodo.subTasks && selectedTodo.subTasks.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Subtasks</p>
                      <div className="space-y-2">
                        {selectedTodo.subTasks.map((subtask) => (
                          <div key={subtask._id} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={subtask.completed} readOnly className="w-4 h-4 rounded" />
                            <span className={subtask.completed ? "line-through text-gray-400" : "text-gray-700"}>
                              {subtask.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTodo.notes && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Notes</p>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedTodo.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteTodo(selectedTodo._id)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Drawer */}
      {isAddDrawerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-md max-h-[90vh] md:max-h-none overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-900">Add New Todo</h2>
              <button
                onClick={() => {
                  setIsAddDrawerOpen(false)
                  resetForm()
                }}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Todo title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Todo details..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Work, Personal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Links</label>
                <div className="space-y-2 mb-2">
                  {formData.links.map((link, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-gray-100 rounded">
                      <div className="text-sm flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{link.title}</p>
                        <p className="text-xs text-gray-600 truncate">{link.url}</p>
                      </div>
                      <button
                        onClick={() => setFormData({ ...formData, links: formData.links.filter((_, i) => i !== idx) })}
                        className="flex-shrink-0 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={linkInput.title}
                    onChange={(e) => setLinkInput({ ...linkInput, title: e.target.value })}
                    placeholder="Link title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={linkInput.url}
                      onChange={(e) => setLinkInput({ ...linkInput, url: e.target.value })}
                      placeholder="URL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => {
                        if (linkInput.title && linkInput.url) {
                          setFormData({ ...formData, links: [...formData.links, linkInput] })
                          setLinkInput({ title: "", url: "" })
                        }
                      }}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      if (tagInput.trim()) {
                        setFormData({ ...formData, tags: [...formData.tags, tagInput] })
                        setTagInput("")
                      }
                    }}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subtasks</label>
                <div className="space-y-2 mb-2">
                  {formData.subTasks.map((subtask) => (
                    <div key={subtask._id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={subtask.completed} readOnly className="w-4 h-4 rounded" />
                      <span className={subtask.completed ? "line-through text-gray-400" : "text-gray-700"}>
                        {subtask.title}
                      </span>
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            subTasks: formData.subTasks.filter((st) => st._id !== subtask._id),
                          })
                        }
                        className="ml-auto text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={subtaskInput}
                    onChange={(e) => setSubtaskInput(e.target.value)}
                    placeholder="Add subtask"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      if (subtaskInput.trim()) {
                        setFormData({
                          ...formData,
                          subTasks: [
                            ...formData.subTasks,
                            { _id: Date.now().toString(), title: subtaskInput, completed: false },
                          ],
                        })
                        setSubtaskInput("")
                      }
                    }}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddTodo}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-400 to-blue-400 text-white rounded-lg font-semibold hover:opacity-90 transition"
              >
                Create Todo
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function FilterButton({
  label,
  isActive,
  onClick,
  badge,
}: {
  label: string
  isActive: boolean
  onClick: () => void
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition relative ${
        isActive
          ? "text-white bg-gradient-to-r from-purple-400 to-blue-400"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-white text-gray-900">
          {badge}
        </span>
      )}
    </button>
  )
}
