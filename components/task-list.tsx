"use client"

import { useState, useEffect } from "react"

interface TaskType {
  _id: string
  name: string
  key: string
  inputType: "integer" | "decimal" | "boolean"
  completionRule: string
  fineIfFailed: number
  active: boolean
}

interface TaskEntry {
  taskType: TaskType
  value: number
  completed: boolean
  markedAt: string | null
}

interface DailyEntry {
  _id: string
  user: string
  date: string
  tasks: TaskEntry[]
  dailyFine: number
  fineCalculatedAt: string | null
  paymentStatus: "paid" | "unpaid"
  createdAt: string
  updatedAt: string
}

interface TaskListProps {
  userId: string // Pass this as prop: "67549a3e8a9e47b3f0d2c002"
  setActiveTab?: (tab: "dashboard" | "tasks") => void
}

export default function TaskList({ userId = "67549a3e8a9e47b3f0d2c001", setActiveTab }: TaskListProps) {
  const [dailyEntry, setDailyEntry] = useState<DailyEntry | null>(null)
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"Complete" | "To Do" | "In Progress">("To Do")
  const [showModal, setShowModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskEntry | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)

  // Get today's date in YYYY-MM-DD format (IST)
  const getTodayIST = () => {
    const now = new Date()
    const istOffset = 5.5 * 60 * 60 * 1000
    const istTime = new Date(now.getTime() + istOffset)
    return istTime.toISOString().split('T')[0]
  }

  const today = getTodayIST()

  // Fetch task types and today's entry
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch task types
        const taskTypesRes = await fetch('/api/task-types')
        const taskTypesData = await taskTypesRes.json()
        setTaskTypes(taskTypesData)



        // Fetch today's daily entry (auto-creates if doesn't exist)
        const entryRes = await fetch(`/api/daily-entries/${userId}/${today}`)
        const entryData = await entryRes.json()

        const populatedEntry = {
          ...entryData,
          tasks: entryData.tasks.map((task: any) => ({
            ...task,
            taskType: taskTypesData.find((tt: TaskType) => tt._id === task.taskType) || null
          }))
        }

        setDailyEntry(populatedEntry)


      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, today])

  // Map completion status to UI status
  const getTaskStatus = (task: TaskEntry): "Complete" | "To Do" | "In Progress" => {
    if (task.completed) {
      return "Complete"
    } else if (task.value > 0) {
      return "In Progress"
    } else {
      return "To Do"
    }
  }

  // Filter tasks based on status
  const filteredTasks = dailyEntry?.tasks.filter((task) => {
    // Defensive check: Skip tasks with null/undefined taskType
    if (!task.taskType) {
      console.warn('Task with missing taskType found:', task);
      return false;
    }
    return getTaskStatus(task) === filter;
  }) || []

  const counts = {
    Complete: dailyEntry?.tasks.filter((t) => t.taskType && getTaskStatus(t) === "Complete").length || 0,
    "To Do": dailyEntry?.tasks.filter((t) => t.taskType && getTaskStatus(t) === "To Do").length || 0,
    "In Progress": dailyEntry?.tasks.filter((t) => t.taskType && getTaskStatus(t) === "In Progress").length || 0,
  }

  const getPriorityColor = (fineAmount: number) => {
    // Map fine amount to priority colors
    if (fineAmount >= 150) {
      return "bg-red-100 text-red-700 border border-red-300"
    } else if (fineAmount >= 100) {
      return "bg-yellow-100 text-yellow-700 border border-yellow-300"
    } else {
      return "bg-green-100 text-green-700 border border-green-300"
    }
  }

  const getTaskBgColor = (status: string) => {
    switch (status) {
      case "Complete":
        return "bg-green-50"
      case "In Progress":
        return "bg-yellow-50"
      default:
        return "bg-white"
    }
  }

  // Update task value
  const handleUpdateTaskValue = async (taskTypeId: string, newValue: number) => {
    try {
      setUpdatingTaskId(taskTypeId)

      const res = await fetch(`/api/daily-entries/${userId}/${today}/update-task`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTypeId,
          value: newValue
        })
      })

      if (!res.ok) {
        throw new Error('Failed to update task')
      }


      // Fetch task types
      const taskTypesRes = await fetch('/api/task-types')
      const taskTypesData = await taskTypesRes.json()
      setTaskTypes(taskTypesData)

      const entryRes = await fetch(`/api/daily-entries/${userId}/${today}`)
      const entryData = await entryRes.json()

      const populatedEntry = {
        ...entryData,
        tasks: entryData.tasks.map((task: any) => ({
          ...task,
          taskType: taskTypesData.find((tt: TaskType) => tt._id === task.taskType) || null
        }))
      }

      setDailyEntry(populatedEntry)
      // const updatedEntry = await res.json()
      // setDailyEntry(updatedEntry)

      // Close modal after successful update
      setShowDetailModal(false)
      setSelectedTask(null)
    } catch (error) {
      console.error('Error updating task:', error)
      alert('Failed to update task. Please try again.')
    } finally {
      setUpdatingTaskId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-24 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-purple-100 p-4 md:p-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Today's Tasks</h1>
              <p className="text-sm text-gray-500">{today}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="p-2 hover:bg-purple-100 rounded-full transition text-purple-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            {dailyEntry && (
              <div className="px-3 py-2 bg-purple-100 rounded-full text-purple-700 font-semibold text-sm">
                Fine: ₹{dailyEntry.dailyFine}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {(["Complete", "To Do", "In Progress"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition ${filter === status
                ? "bg-gray-900 text-white shadow-md"
                : "bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-400"
                }`}
            >
              {status === "Complete" && "✓ "}
              {status} {counts[status]}
            </button>
          ))}
        </div>

        {/* Task Cards */}
        <div className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, idx) => {
              const status = getTaskStatus(task)
              const taskType = task.taskType

              return (
                <div
                  key={taskType._id}
                  onClick={() => {
                    setSelectedTask(task)
                    setShowDetailModal(true)
                  }}
                  className={`${getTaskBgColor(status)} rounded-2xl p-4 md:p-5 shadow-sm border-2 border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer animate-in fade-in`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Title and Current Value */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-base md:text-lg leading-snug">
                        {taskType.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Current: <span className="font-semibold text-purple-600">{task.value}</span>
                        {taskType.inputType === "integer" ? " times" : " hours"}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      {task.completed ? (
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <span
                      className={`text-xs md:text-sm font-semibold px-3 py-1 rounded-full ${getPriorityColor(taskType.fineIfFailed)}`}
                    >
                      Fine: ₹{taskType.fineIfFailed}
                    </span>
                    <span className={`text-xs md:text-sm font-semibold px-3 py-1 rounded-full ${task.completed
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-orange-100 text-orange-700 border border-orange-300"
                      }`}>
                      {task.completed ? "Completed ✓" : "Incomplete"}
                    </span>
                  </div>

                  {/* Footer Info */}
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Rule: {taskType.completionRule}</span>
                    {task.markedAt && (
                      <span>Updated: {new Date(task.markedAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}</span>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-lg font-medium">No tasks in this category</p>
              <p className="text-sm mt-2">Switch tabs to see other tasks</p>
            </div>
          )}
        </div>
      </div>

      {/* Update Task Modal */}
      {showDetailModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white w-full md:w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6 space-y-5 shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Update Task</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  setSelectedTask(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Task Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Task</label>
                <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-900 font-medium">
                  {selectedTask.taskType.name}
                </div>
              </div>

              {/* Current Value Display */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Value</label>
                <div className={`px-4 py-3 rounded-lg font-bold text-2xl text-center ${selectedTask.completed
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700"
                  }`}>
                  {selectedTask.value} {selectedTask.taskType.inputType === "integer" ? "times" : "hours"}
                </div>
              </div>

              {/* Quick Update Buttons */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Quick Update</label>
                <div className="grid grid-cols-3 gap-2">
                  {selectedTask.taskType.inputType === "integer" ? (
                    // Integer increments: +1, +2, +5
                    <>
                      <button
                        onClick={() => handleUpdateTaskValue(selectedTask.taskType._id, selectedTask.value + 1)}
                        disabled={updatingTaskId === selectedTask.taskType._id}
                        className="px-4 py-3 bg-purple-100 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 transition disabled:opacity-50"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleUpdateTaskValue(selectedTask.taskType._id, selectedTask.value + 2)}
                        disabled={updatingTaskId === selectedTask.taskType._id}
                        className="px-4 py-3 bg-purple-100 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 transition disabled:opacity-50"
                      >
                        +2
                      </button>
                      <button
                        onClick={() => handleUpdateTaskValue(selectedTask.taskType._id, selectedTask.value + 5)}
                        disabled={updatingTaskId === selectedTask.taskType._id}
                        className="px-4 py-3 bg-purple-100 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 transition disabled:opacity-50"
                      >
                        +5
                      </button>
                    </>
                  ) : (
                    // Decimal increments: +0.5, +1, +2
                    <>
                      <button
                        onClick={() => handleUpdateTaskValue(selectedTask.taskType._id, selectedTask.value + 0.5)}
                        disabled={updatingTaskId === selectedTask.taskType._id}
                        className="px-4 py-3 bg-purple-100 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 transition disabled:opacity-50"
                      >
                        +0.5
                      </button>
                      <button
                        onClick={() => handleUpdateTaskValue(selectedTask.taskType._id, selectedTask.value + 1)}
                        disabled={updatingTaskId === selectedTask.taskType._id}
                        className="px-4 py-3 bg-purple-100 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 transition disabled:opacity-50"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleUpdateTaskValue(selectedTask.taskType._id, selectedTask.value + 2)}
                        disabled={updatingTaskId === selectedTask.taskType._id}
                        className="px-4 py-3 bg-purple-100 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 transition disabled:opacity-50"
                      >
                        +2
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Manual Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Or Set Custom Value</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step={selectedTask.taskType.inputType === "decimal" ? "0.5" : "1"}
                    min="0"
                    defaultValue={selectedTask.value}
                    id="customValue"
                    className="w-2/3 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none bg-white text-gray-900"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('customValue') as HTMLInputElement
                      const newValue = parseFloat(input.value) || 0
                      handleUpdateTaskValue(selectedTask.taskType._id, newValue)
                    }}
                    disabled={updatingTaskId === selectedTask.taskType._id}
                    className="px-6 w-1/3 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50"
                  >
                    {updatingTaskId === selectedTask.taskType._id ? "Saving..." : "Set"}
                  </button>
                </div>
              </div>

              {/* Task Details */}
              <div className="pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Completion Rule:</span>
                  <span className="font-medium text-gray-900">{selectedTask.taskType.completionRule}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fine if Failed:</span>
                  <span className="font-medium text-red-600">₹{selectedTask.taskType.fineIfFailed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${selectedTask.completed ? "text-green-600" : "text-orange-600"}`}>
                    {selectedTask.completed ? "✓ Completed" : "Incomplete"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowDetailModal(false)
                setSelectedTask(null)
              }}
              className="w-full px-4 py-3 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* COMMENTED: Add New Task Type Modal - Only admin should do this via separate interface
      {showModal && (
        <div>Add Task Type Modal</div>
      )}
      */}

      {/* COMMENTED: Floating Action Button - Tasks are created from task_types, not manually
      <button className="fixed bottom-28 md:bottom-8 right-4">
        <svg>Add Icon</svg>
      </button>
      */}
    </div>
  )
}