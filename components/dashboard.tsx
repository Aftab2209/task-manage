"use client"

import { useEffect, useState } from "react"

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
  streak: {
    currentStreak: number
    longestStreak: number
  } | null
}

const cardData = [
  {
    status: "In Progress",
    count: 24,
    gradient: "linear-gradient(135deg, #7DA4FF 0%, #C1D1FF 100%)",
  },
  {
    status: "In Review",
    count: 56,
    gradient: "linear-gradient(135deg, #C38DFF 0%, #E5CFFF 100%)",
  },
  {
    status: "On Hold",
    count: 16,
    gradient: "linear-gradient(135deg, #FBC56E 0%, #FFE5A7 100%)",
  },
  {
    status: "Completed",
    count: 45,
    gradient: "linear-gradient(135deg, #7AD999 0%, #C4F3D1 100%)",
  },
]

const chartData = [
  { day: "M", progress: 15, review: 8, complete: 12 },
  { day: "T", progress: 20, review: 10, complete: 18 },
  { day: "W", progress: 18, review: 12, complete: 22 },
  { day: "T", progress: 25, review: 15, complete: 28 },
  { day: "F", progress: 22, review: 18, complete: 32 },
  { day: "S", progress: 12, review: 8, complete: 25 },
  { day: "S", progress: 8, review: 5, complete: 15 },
]

export default function Dashboard({ setActiveTab }: DashboardProps) {
  const [stats, setStats] = useState<StatsData>({
    studyHours: null,
    jobsApplied: null,
    fines: null,
    streak: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      
      try {
        const userId = "67549a3e8a9e47b3f0d2c001"

        const [studyRes, jobsRes, finesRes, streakRes] = await Promise.all([
          fetch(`/api/stats/${userId}/study-hours`),
          fetch(`/api/stats/${userId}/jobs-applied`),
          fetch(`/api/stats/${userId}/fines`),
          fetch(`/api/stats/${userId}/streak`),
        ])

        const [studyData, jobsData, finesData, streakData] = await Promise.all([
          studyRes.json(),
          jobsRes.json(),
          finesRes.json(),
          streakRes.json(),
        ])

        setStats({
          studyHours: studyData,
          jobsApplied: jobsData,
          fines: finesData,
          streak: streakData,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F5FF" }}>
      {/* Header */}
      <div className="px-6 pt-4 pb-4 border-b" style={{ borderColor: "#E6E6E6" }}>
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold" style={{ color: "#1C1C1E" }}>
            Dashboard
          </h1>
          <button className="p-2 rounded-full transition" style={{ color: "#B0B0B0" }}>
 <svg  className="w-8 h-8"  viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" fill-rule="evenodd">
    <circle cx="32" cy="32" r="30" fill="#B4DFFB"/>
    <ellipse cx="32" cy="30" fill="#595959" rx="10" ry="8"/>
    <path fill="#595959" d="M22.1389646 60.3416736C22.0475744 59.2550172 22 58.1386202 22 57 22 45.954305 26.4771525 37 32 37 37.5228475 37 42 45.954305 42 57 42 58.1386202 41.9524256 59.2550172 41.8610354 60.3416736 38.7725974 61.4161234 35.4544846 62 32 62 28.5455154 62 25.2274026 61.4161234 22.1389646 60.3416736zM28.6125273 23.0478694C28.6125273 23.0478694 26.6572522 18.5507674 24.4705652 17 24.4705652 17 22.1178789 23.1756087 23.3641084 28.2984482"/>
    <path fill="#595959" d="M40.6125273,23.0478694 C40.6125273,23.0478694 38.6572522,18.5507674 36.4705652,17 C36.4705652,17 34.1178789,23.1756087 35.3641084,28.2984482" transform="matrix(-1 0 0 1 75.613 0)"/>
  </g>
</svg>
          </button>
        </div>
      </div>

      {/* Main content - 24px left/right margin, 16px vertical spacing */}
      <div className="px-6 py-4 space-y-4">
        {/* Project Summary Section */}
        <div>
          <h2 className="text-[16px] font-bold mb-4" style={{ color: "#1C1C1E" }}>
            Stats Summary
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Card 1: Total Study Hours */}
            <div
              className="rounded-[16px] p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center items-start"
              style={{
                background: "linear-gradient(135deg, #7DA4FF 0%, #C1D1FF 100%)",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div className="text-[24px] font-semibold" style={{ color: "#1C1C1E" }}>
                {loading ? "-" : `${stats.studyHours?.totalHours.toFixed(1)}h`}
              </div>
              <div className="text-[14px] font-medium mt-1" style={{ color: "#7A7A7A" }}>
                Total Study Hours
              </div>
            </div>

            {/* Card 2: Total Jobs Applied */}
            <div
              className="rounded-[16px] p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center items-start"
              style={{
                background: "linear-gradient(135deg, #C38DFF 0%, #E5CFFF 100%)",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div className="text-[24px] font-semibold" style={{ color: "#1C1C1E" }}>
                {loading ? "-" : stats.jobsApplied?.totalJobs}
              </div>
              <div className="text-[14px] font-medium mt-1" style={{ color: "#7A7A7A" }}>
                Total Jobs Applied
              </div>
            </div>

            {/* Card 3: Total Fines Given */}
            <div
              className="rounded-[16px] p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center items-start"
              style={{
                background: "linear-gradient(135deg, #FBC56E 0%, #FFE5A7 100%)",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div className="text-[24px] font-semibold" style={{ color: "#1C1C1E" }}>
                {loading ? "-" : `₹${stats.fines?.totalFinesAllTime}`}
              </div>
              <div className="text-[14px] font-medium mt-1" style={{ color: "#7A7A7A" }}>
                Total Fine Given
              </div>
            </div>

            {/* Card 4: Current Streak */}
            <div
              className="rounded-[16px] p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center items-start"
              style={{
                background: "linear-gradient(135deg, #7AD999 0%, #C4F3D1 100%)",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div className="text-[24px] font-semibold" style={{ color: "#1C1C1E" }}>
                {loading ? "-" : stats.streak?.currentStreak}
              </div>
              <div className="text-[14px] font-medium mt-1" style={{ color: "#7A7A7A" }}>
                Streak (Days)
              </div>
            </div>
          </div>
        </div>

        {/* Project Statistics Section */}
        <div
          className="rounded-[20px] p-4 shadow-sm mt-4"
          style={{
            backgroundColor: "#FFFFFF",
            boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <h3 className="text-[16px] font-bold mb-4" style={{ color: "#1C1C1E" }}>
            Project Statistics
          </h3>

          <div className="h-[140px] flex items-end justify-between pb-3 gap-1">
            {chartData.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                {/* Stacked bars */}
                <div className="w-full flex flex-col items-center justify-end h-full gap-0.5">
                  <div
                    className="w-full rounded"
                    style={{
                      height: `${(item.progress / 35) * 100}%`,
                      backgroundColor: "#7DA4FF",
                      minHeight: "2px",
                    }}
                  />
                  <div
                    className="w-full rounded"
                    style={{
                      height: `${(item.review / 35) * 100}%`,
                      backgroundColor: "#C38DFF",
                      minHeight: "2px",
                    }}
                  />
                  <div
                    className="w-full rounded"
                    style={{
                      height: `${(item.complete / 35) * 100}%`,
                      backgroundColor: "#7AD999",
                      minHeight: "2px",
                    }}
                  />
                </div>
                <div className="text-[12px] font-medium mt-2" style={{ color: "#7A7A7A" }}>
                  {item.day}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-4 pt-3 border-t" style={{ borderColor: "#E6E6E6" }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded" style={{ backgroundColor: "#7DA4FF" }} />
              <span className="text-[12px] font-medium" style={{ color: "#7A7A7A" }}>
                Progress
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded" style={{ backgroundColor: "#C38DFF" }} />
              <span className="text-[12px] font-medium" style={{ color: "#7A7A7A" }}>
                Review
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded" style={{ backgroundColor: "#7AD999" }} />
              <span className="text-[12px] font-medium" style={{ color: "#7A7A7A" }}>
                Complete
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div
            className="rounded-[16px] p-4 shadow-sm border"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E6E6E6",
              boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div className="text-[12px] font-medium" style={{ color: "#7A7A7A" }}>
              Last 7 Days Study
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-[18px] font-semibold" style={{ color: "#1C1C1E" }}>
                {loading ? "-" : `${stats.studyHours?.last7Days.toFixed(1)}h`}
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
            className="rounded-[16px] p-4 shadow-sm border"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E6E6E6",
              boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div className="text-[12px] font-medium" style={{ color: "#7A7A7A" }}>
              Unpaid Fines
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-[18px] font-semibold" style={{ color: "#1C1C1E" }}>
                ₹{loading ? "-" : stats.fines?.unpaidFines}
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
