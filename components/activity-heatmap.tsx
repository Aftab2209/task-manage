"use client"

const DAYS = ["S", "M", "T", "W", "T", "F", "S"]

interface ActivityHeatmapProps {
  data: number[]       // values aligned with dates[]
  dates: string[]      // same length as data, consecutive dates (YYYY-MM-DD)
  activityType: "jobs" | "study"
}

export default function ActivityHeatmap({ data, dates, activityType }: ActivityHeatmapProps) {
  const JOBS_THRESHOLD = 30
  const STUDY_THRESHOLD = 2

  // helper: parse "YYYY-MM-DD" into local Date (no UTC shift)
  const parseLocal = (s: string) => {
    const [y, m, d] = s.split("-").map(Number)
    return new Date(y, m - 1, d)
  }

  // map dateStr -> value for fast lookup (safety if any dates missing)
  const valueByDate = new Map<string, number>()
  for (let i = 0; i < Math.min(data.length, dates.length); i++) {
    valueByDate.set(dates[i], data[i])
  }

  // early return
  if (!dates || !dates.length) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400">
        No activity data available
      </div>
    )
  }

  // Build full timeline from start -> end (inclusive)
  const startDate = parseLocal(dates[0])
  const endDate = parseLocal(dates[dates.length - 1])

  // compute total days between start and end inclusive
  const msPerDay = 24 * 60 * 60 * 1000
  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / msPerDay) + 1

  // startPad = weekday index of startDate (0=Sun). This places dates in correct weekday column.
  const startPad = startDate.getDay()

  // number of cells needed = startPad (empty before first date) + totalDays
  const totalCells = startPad + totalDays
  const totalWeeks = Math.ceil(totalCells / 7) // rows (weeks)

  // initialize grid: rows = totalWeeks, cols = 7; fill with null
  const grid: (number | null)[][] = Array.from({ length: totalWeeks }, () => Array(7).fill(null))

  // Fill grid by iterating each day in timeline
  for (let offset = 0; offset < totalDays; offset++) {
    const current = new Date(startDate.getTime() + offset * msPerDay)
    const y = current.getFullYear()
    const m = current.getMonth() + 1
    const d = current.getDate()
    const dateStr = `${y.toString().padStart(4, "0")}-${m.toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`

    const weekday = current.getDay() // 0..6
    // absolute index in flattened padded array
    const absIndex = startPad + offset
    const weekIndex = Math.floor(absIndex / 7) // row
    // put value (or 0 if missing)
    const val = valueByDate.has(dateStr) ? valueByDate.get(dateStr)! : 0
    grid[weekIndex][weekday] = val
  }

  // compute max for color intensity
  const flatValues = Array.from(valueByDate.values()).filter(v => v > 0)
  const maxValue = flatValues.length ? Math.max(...flatValues) : 1

  const getColor = (value: number | null, maxValue: number) => {
    if (!value || value === 0) return "#E8E8F0"
    if (activityType === "jobs" && value > 0 && value < JOBS_THRESHOLD) return "#FFB3B3"
    if (activityType === "study" && value > 0 && value < STUDY_THRESHOLD) return "#FFB3B3"
    const intensity = value / maxValue
    if (intensity < 0.25) return "#D8D8FF"
    if (intensity < 0.5) return "#B0B8FF"
    if (intensity < 0.75) return "#6B7FFF"
    return "#3B50FF"
  }

  return (
    <div className="w-full overflow-x-auto ">
      <div className="inline-flex flex-col gap-2 p-4 rounded-lg" style={{ backgroundColor: "#F9F9FB" }}>
        {/* day labels */}
        <div className="flex gap-1 pl-0 ">
          {DAYS.map(day => (
            <div key={day} className="w-10 h-6 flex items-center justify-center text-xs font-medium" style={{ color: "#9A9A9A" }}>
              {day}
            </div>
          ))}
        </div>

        {/* grid: rows = weeks, cols = weekdays */}
        <div className="flex flex-col-reverse gap-1 ">
          {grid.map((weekRow, weekIdx) => (
            <div key={weekIdx} className="flex gap-1">
              {weekRow.map((val, dayIdx) => {
                if (val === null) return <div key={`${weekIdx}-${dayIdx}`} className="w-10 h-10" />
                const bg = getColor(val, maxValue)
                const isWarning =
                  (activityType === "jobs" && val > 0 && val < JOBS_THRESHOLD) ||
                  (activityType === "study" && val > 0 && val < STUDY_THRESHOLD)
                const textColor = (val > maxValue * 0.6 && !isWarning) ? "#FFFFFF" : "#1C1C1E"

                return (
                  <div
                    key={`${weekIdx}-${dayIdx}`}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold transition-all hover:scale-110 cursor-default"
                    style={{
                      backgroundColor: bg,
                      color: textColor,
                      fontSize: (val > 99 ? "11px" : "12px")
                    }}
                    title={`${val} ${activityType === "jobs" ? "jobs" : "hours"}${isWarning ? " (below target)" : ""}`}
                  >
                    {val > 0 ? val : ""}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* legend */}
        <div className="flex items-center justify-center gap-4 mt-2 text-xs" style={{ color: "#7A7A7A" }}>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FFB3B3" }} />
            <span>Below target</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#3B50FF" }} />
            <span>On track</span>
          </div>
        </div>
      </div>
    </div>
  )
}
