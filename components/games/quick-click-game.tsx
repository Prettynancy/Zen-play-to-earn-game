"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Zap, Coins, RotateCcw, Timer, Target } from "lucide-react"

interface QuickClickGameProps {
  onGameComplete: (won: boolean, coinsEarned: number) => void
  onClose: () => void
}

export function QuickClickGame({ onGameComplete, onClose }: QuickClickGameProps) {
  const [gameStatus, setGameStatus] = useState<"waiting" | "ready" | "playing" | "finished">("waiting")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10)
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 })
  const [reactionTime, setReactionTime] = useState<number[]>([])
  const [startTime, setStartTime] = useState(0)
  const [coinsEarned, setCoinsEarned] = useState(0)

  const generateNewTarget = useCallback(() => {
    setTargetPosition({
      x: Math.random() * 80 + 10, // 10% to 90% to keep within bounds
      y: Math.random() * 60 + 20, // 20% to 80% to keep within bounds
    })
    setStartTime(Date.now())
  }, [])

  const startGame = () => {
    setGameStatus("ready")
    setScore(0)
    setTimeLeft(10)
    setReactionTime([])
    setCoinsEarned(0)

    // Start countdown
    setTimeout(() => {
      setGameStatus("playing")
      generateNewTarget()
    }, 1000)
  }

  const handleTargetClick = () => {
    if (gameStatus !== "playing") return

    const clickTime = Date.now()
    const reaction = clickTime - startTime
    setReactionTime((prev) => [...prev, reaction])
    setScore((prev) => prev + 1)
    generateNewTarget()
  }

  useEffect(() => {
    if (gameStatus === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameStatus === "playing") {
      setGameStatus("finished")

      // Calculate coins based on performance
      const avgReactionTime = reactionTime.reduce((a, b) => a + b, 0) / reactionTime.length
      const baseCoins = score * 10
      const speedBonus = avgReactionTime < 500 ? score * 5 : avgReactionTime < 800 ? score * 2 : 0
      const totalCoins = baseCoins + speedBonus

      setCoinsEarned(totalCoins)
      onGameComplete(score > 5, totalCoins) // Win if more than 5 clicks
    }
  }, [timeLeft, gameStatus, score, reactionTime, onGameComplete])

  const avgReactionTime =
    reactionTime.length > 0 ? Math.round(reactionTime.reduce((a, b) => a + b, 0) / reactionTime.length) : 0

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Zap className="w-5 h-5 text-secondary" />
          Quick Click Game
        </CardTitle>
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="gap-1">
            <Target className="w-3 h-3" />
            Score: {score}
          </Badge>
          <Badge variant={timeLeft > 5 ? "secondary" : "destructive"} className="gap-1">
            <Timer className="w-3 h-3" />
            {timeLeft}s
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {gameStatus === "waiting" && (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">Click the targets as fast as you can! You have 10 seconds.</p>
            <Button onClick={startGame} size="lg" className="w-full">
              Start Game
            </Button>
          </div>
        )}

        {gameStatus === "ready" && (
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-primary animate-pulse">Get Ready!</div>
            <p className="text-sm text-muted-foreground">Game starting...</p>
          </div>
        )}

        {gameStatus === "playing" && (
          <div className="relative">
            <div className="h-48 bg-muted/20 rounded-lg border-2 border-dashed border-border relative overflow-hidden">
              <button
                onClick={handleTargetClick}
                className="absolute w-12 h-12 bg-primary hover:bg-primary/80 rounded-full flex items-center justify-center transition-all duration-100 pulse-glow"
                style={{
                  left: `${targetPosition.x}%`,
                  top: `${targetPosition.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Target className="w-6 h-6 text-primary-foreground" />
              </button>
            </div>
            <Progress value={(10 - timeLeft) * 10} className="h-2 mt-2" />
          </div>
        )}

        {gameStatus === "finished" && (
          <div className="text-center space-y-4">
            <div className="p-4 bg-success/10 rounded-lg">
              <div className="text-2xl font-bold text-success mb-2">Game Complete!</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Targets Hit:</span>
                  <span className="font-semibold">{score}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Reaction:</span>
                  <span className="font-semibold">{avgReactionTime}ms</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-success/20">
                  <span className="flex items-center gap-1">
                    <Coins className="w-4 h-4" />
                    Coins Earned:
                  </span>
                  <span className="font-bold text-lg">+{coinsEarned}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={startGame} variant="outline" className="flex-1 bg-transparent">
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              <Button onClick={onClose} variant="secondary" className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
