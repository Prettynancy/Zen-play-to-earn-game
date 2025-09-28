"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authService } from "@/lib/auth"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: () => void
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      if (isLogin) {
        const user = authService.login(username)
        if (user) {
          onAuthSuccess()
          onClose()
        } else {
          setError("User not found. Please register first.")
        }
      } else {
        if (!username || !email) {
          setError("Please fill in all fields")
          return
        }
        authService.register(username, email)
        onAuthSuccess()
        onClose()
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>{isLogin ? "Welcome Back!" : "Join the Game"}</CardTitle>
          <CardDescription>
            {isLogin ? "Sign in to continue your gaming journey" : "Create an account to start earning"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            {!isLogin && (
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
