"use client"

import { useAuth } from "@/lib/hooks/useAuth"
import { useEffect, useState } from "react"
import ActivityHeatmap from "./activity-heatmap"

interface DashboardProps {
  setActiveTab: (tab: "dashboard" | "tasks") => void
}

interface StatsData {
  studyHours: {
    totalHours: number
    last7Days: number
  } | null
  jobsApplied: {
    totalJobs: number
    last7Days: number
  } | null
  fines: {
    totalFinesAllTime: number
    unpaidFines: number
    last7DaysFines: number
  } | null
}

interface HeatmapData {
  jobs: number[]
  study: number[]
  dates: string[]
  startDate: string
  endDate: string
}

export default function DashboardContent({ setActiveTab }: DashboardProps) {
  const [stats, setStats] = useState<StatsData>({
    studyHours: null,
    jobsApplied: null,
    fines: null,
  })
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedActivity, setSelectedActivity] = useState<"jobs" | "study">("jobs")
  const { user, logout, isLoading } = useAuth()


  useEffect(() => {
    if (isLoading) {
      return
    }

    if (!user?._id) {
      setLoading(false)
      return
    }

    async function fetchStats() {
      setLoading(true)
      try {
        const userId = user?._id

        const [studyRes, jobsRes, finesRes, heatmapRes] = await Promise.all([
          fetch(`/api/stats/${userId}/study-hours`),
          fetch(`/api/stats/${userId}/jobs-applied`),
          fetch(`/api/stats/${userId}/fines`),
          fetch(`/api/stats/${userId}/heatmap-activity`),
        ])

        const [studyData, jobsData, finesData, heatmapActivityData] = await Promise.all([
          studyRes.json(),
          jobsRes.json(),
          finesRes.json(),
          heatmapRes.json(),
        ])

        setStats({
          studyHours: studyData,
          jobsApplied: jobsData,
          fines: finesData,
        })


        setHeatmapData(heatmapActivityData)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user?._id, isLoading])

  if (isLoading) {
    return <div></div>
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F5FF" }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b flex items-center justify-between" style={{ borderColor: "#E6E6E6" }}>
        <h1 className="text-[22px] font-semibold" style={{ color: "#1C1C1E" }}>
          Hi {user?.name || "User"}
        </h1>
        <button onClick={() => logout()} className="p-2 rounded-full transition hover:bg-gray-200" title="Logout">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#7A7A7A" }}>
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
          </svg>
        </button>
      </div>

      {/* Main content */}
      <div className="px-6 py-4 space-y-4">
        <div>
          <h2 className="text-[16px] font-bold mb-4" style={{ color: "#1C1C1E" }}>
            Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div
              className="rounded-[16px] p-4 shadow-sm"
              style={{
                backgroundColor: "#FFFFFF",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div className="text-[12px] font-medium" style={{ color: "#7A7A7A" }}>
                Total Jobs Applied
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="text-[28px] md:text-[32px] font-bold" style={{ color: "#1C1C1E" }}>
                  {loading ? "-" : stats.jobsApplied?.totalJobs || "0"}
                </div>
              </div>
            </div>

            <div
              className="rounded-[16px] p-4 shadow-sm"
              style={{
                backgroundColor: "#FFFFFF",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div className="text-[12px] font-medium" style={{ color: "#7A7A7A" }}>
                Total Study Hours
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="text-[28px] md:text-[32px] font-bold" style={{ color: "#1C1C1E" }}>
                  {loading ? "-" : `${stats.studyHours?.totalHours?.toFixed(0)}h`}
                </div>
              </div>
            </div>

            <div
              className="rounded-[16px] p-4 shadow-sm"
              style={{
                backgroundColor: "#FFFFFF",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div className="text-[12px] font-medium" style={{ color: "#7A7A7A" }}>
                Total Fine Given
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="text-[28px] md:text-[32px] font-bold" style={{ color: "#1C1C1E" }}>
                  ₹ {loading ? "-" : stats.fines?.totalFinesAllTime || "0"}
                </div>
              </div>
            </div>

            <div
              className="rounded-[16px] p-4 shadow-sm"
              style={{
                backgroundColor: "#FFFFFF",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div className="text-[12px] font-medium" style={{ color: "#7A7A7A" }}>
                Streak (Days)
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="text-[28px] md:text-[32px] font-bold" style={{ color: "#1C1C1E" }}>
                  12
                </div>
              </div>
            </div>

            
          </div>
        </div>

        {/* Activity Type Picker and Heatmap Section */}
        <div>
          <h2 className="text-[16px] font-bold mb-4" style={{ color: "#1C1C1E" }}>
            Activity (Last 30 Days)
          </h2>

          <div
            className="rounded-[20px] p-6 shadow-sm"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <div className="flex gap-2  mb-6 justify-center">
              {[
                { value: "jobs", label: "Jobs Applied" },
                { value: "study", label: "Study Hours" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedActivity(option.value as "jobs" | "study")}
                  className="px-3 py-1 rounded-full text-sm font-medium transition"
                  style={{
                    backgroundColor: selectedActivity === option.value ? "#5B5FFF" : "#F0F0F0",
                    color: selectedActivity === option.value ? "#FFFFFF" : "#7A7A7A",
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Heatmap Calendar */}
            {loading || !heatmapData ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-400">Loading activity data...</div>
              </div>
            ) : (
              <ActivityHeatmap
                data={heatmapData[selectedActivity] || []}
                dates={heatmapData?.dates || []}
                activityType={selectedActivity}
              />

            )}
          </div>
        </div>

        {/* Bottom Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div
            className="rounded-[16px] p-4 shadow-sm"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div className="text-[12px] font-medium" style={{ color: "#7A7A7A" }}>
              Last 7 Days
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="text-[20px] font-bold" style={{ color: "#1C1C1E" }}>
                {loading ? "-" : `${stats.jobsApplied?.last7Days || 0}`}
              </div>
              <div
                className="text-[10px] font-medium px-2 py-1 rounded"
                style={{ backgroundColor: "rgba(52, 199, 89, 0.1)", color: "#34C759" }}
              >
                Active
              </div>
            </div>
          </div>

          <div
            className="rounded-[16px] p-4 shadow-sm"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div className="text-[12px] font-medium" style={{ color: "#7A7A7A" }}>
              Unpaid Fines
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="text-[20px] font-bold" style={{ color: "#1C1C1E" }}>
                ₹{loading ? "-" : stats.fines?.unpaidFines || 0}
              </div>
              <div
                className="text-[10px] font-medium px-2 py-1 rounded"
                style={{ backgroundColor: "rgba(255, 59, 48, 0.1)", color: "#FF3B30" }}
              >
                Pending
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom padding for mobile */}
      <div className="h-20" />
    </div>
  )
}