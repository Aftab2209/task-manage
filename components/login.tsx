"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"

interface LoginDrawerProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess?: (user: any) => void
}

export default function LoginDrawer({ isOpen, onClose, onLoginSuccess }: LoginDrawerProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Login failed. Please try again.")
        return
      }

      // Store user in localStorage
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user))
      }

      // Call success callback and close drawer
      onLoginSuccess?.(data.user)
      router.refresh()
      setEmail("")
      setPassword("")
      onClose()
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error("[v0] Login error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/90 z-40 md:opacity-100 md:block"
        onClick={onClose}
        style={{
          animation: isOpen ? "fadeIn 0.3s ease-out" : "fadeOut 0.3s ease-out",
        }}
      />

      {/* Drawer/Modal */}
      <div
        className="fixed z-50 bg-white rounded-t-3xl md:rounded-2xl shadow-2xl md:shadow-xl
          bottom-0 left-0 right-0 md:bottom-auto md:left-1/2 md:top-1/2 md:max-w-sm
          md:transform md:-translate-x-1/2 md:-translate-y-1/2
          w-full md:w-96"
        style={{
          animation: isOpen
            ? "slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) md:popIn 0.3s ease-out"
            : "slideDown 0.3s ease-in",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 md:hidden">
          <h2 className="text-xl font-bold text-gray-900">Login</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Desktop Header */}
          <div className="hidden md:block mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-sm">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition placeholder-gray-400 text-gray-900"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition placeholder-gray-400 text-gray-900"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg
                hover:from-blue-600 hover:to-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                shadow-md hover:shadow-lg mt-6"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Mobile Bottom Spacing */}
          <div className="h-6 md:hidden" />
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(100%);
            opacity: 0;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 0.5;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 0.5;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes popIn {
          from {
            transform: translate(-50%, -50%) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}
