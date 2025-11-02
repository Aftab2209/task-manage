"use client"

import { useState } from "react"
import Dashboard from "@/components/dashboard"
import TaskList from "@/components/task-list"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "tasks">("dashboard")

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {activeTab === "dashboard" ? <Dashboard setActiveTab={setActiveTab} /> : <TaskList setActiveTab={setActiveTab} userId= {"67549a3e8a9e47b3f0d2c001"} />}

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-purple-200 bg-white flex justify-around items-center h-20 md:hidden shadow-lg">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition ${
            activeTab === "dashboard" ? "text-purple-600" : "text-gray-400"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span className="text-xs font-medium">Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition ${
            activeTab === "tasks" ? "text-purple-600" : "text-gray-400"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          <span className="text-xs font-medium">Tasks</span>
        </button>
      </nav>
    </main>
  )
}
