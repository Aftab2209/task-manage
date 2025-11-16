"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

const activityData = [
  [2, 9, 35, 7, 9, 6, 1],
  [1, 7, 18, 24, 18, 9, 24],
  [6, 18, 9, 8, 24, 24, 8],
  [32, 8, 24, 2, 9],
]

const getColorIntensity = (value: number) => {
  if (value === 0) return "bg-slate-100"
  if (value <= 5) return "bg-purple-200"
  if (value <= 10) return "bg-blue-300"
  if (value <= 20) return "bg-blue-500"
  return "bg-blue-600"
}

const getTextColor = (value: number) => {
  if (value <= 10) return "text-slate-700"
  return "text-white"
}

export default function PostActivityCard() {
  const [period, setPeriod] = useState("15 Feb - 15 May, 2024")

  return (
    <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Post Activity</h1>
          <p className="text-sm text-slate-500 mt-1">From {period}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full text-blue-500 border-blue-500 hover:bg-blue-50 bg-transparent"
          onClick={() => setPeriod("Custom Period")}
        >
          Change Period
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div>
          <p className="text-3xl font-bold text-slate-900">687</p>
          <p className="text-xs text-slate-500 mt-1">Stories</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-900">189</p>
          <p className="text-xs text-slate-500 mt-1">Posts</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-900">24</p>
          <p className="text-xs text-slate-500 mt-1">Reels</p>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div>
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-slate-400">
              {day}
            </div>
          ))}
        </div>

        {/* Activity circles */}
        <div className="space-y-2">
          {activityData.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-2">
              {row.map((value, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold transition-transform hover:scale-110 cursor-pointer ${getColorIntensity(
                    value,
                  )} ${getTextColor(value)}`}
                >
                  {value}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
