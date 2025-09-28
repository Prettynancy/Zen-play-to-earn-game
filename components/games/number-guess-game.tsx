"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, Coins, RotateCcw, CheckCircle, XCircle } from "lucide-react"

interface NumberGuessGameProps {
  onGameComplete: (won: boolean, coinsEarned: number) => void
  onClose: () => void
}

export function NumberGuessGame({ onGameComplete, onClose }: NumberGuessGameProps) {
  const [targetNumber, setTargetNumber] = useState(0)
  const [guess, setGuess] = useState("")
  const [attempts, setAttempts] = useState(0)
  const [maxAttempts] = useState(5)
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing")
  const [feedback, setFeedback] = useState("")
  const [timeLeft, setTimeLeft] = useState(30)
  const [coinsEarned, setCoinsEarned] = useState(0)

  useEffect(() => {
    // Initialize game
    setTargetNumber(Math.floor(Math.random() * 100) + 1)
  }, [])

  useEffect(() => {
    // Timer countdown
    if (gameStatus === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameStatus === "playing") {
      setGameStatus("lost")
      onGameComplete(false, 0)
    }
  }, [timeLeft, gameStatus, onGameComplete])

  const handleGuess = () => {
    const guessNum = Number.parseInt(guess)
    if (isNaN(guessNum) || guessNum < 1 || guessNum > 100) {
      setFeedback("Please enter a number between 1 and 100")
      return
    }

    const newAttempts = attempts + 1
    setAttempts(newAttempts)

    if (guessNum === targetNumber) {
      setGameStatus("won")
      const baseCoins = 50
      const timeBonus = Math.floor(timeLeft * 2)
      const attemptBonus = Math.floor((maxAttempts - newAttempts) * 10)
      const totalCoins = baseCoins + timeBonus + attemptBonus
      setCoinsEarned(totalCoins)
      setFeedback(`Correct! You earned ${totalCoins} coins!`)
      onGameComplete(true, totalCoins)
    } else if (newAttempts >= maxAttempts) {
      setGameStatus("lost")
      setFeedback(`Game over! The number was ${targetNumber}`)
      onGameComplete(false, 0)
    } else {
      if (guessNum < targetNumber) {
        setFeedback("Too low! Try higher")
      } else {
        setFeedback("Too high! Try lower")
      }
    }

    setGuess("")
  }

  const resetGame = () => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1)
    setGuess("")
    setAttempts(0)
    setGameStatus("playing")
    setFeedback("")
    setTimeLeft(30)
    setCoinsEarned(0)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Number Guess Game
        </CardTitle>
        <div className="flex justify-between items-center">
          <Badge variant="outline">
            Attempts: {attempts}/{maxAttempts}
          </Badge>
          <Badge variant={timeLeft > 10 ? "secondary" : "destructive"}>Time: {timeLeft}s</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Guess a number between 1 and 100</p>
          <Progress value={(attempts / maxAttempts) * 100} className="h-2" />
        </div>

        {gameStatus === "playing" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter your guess"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleGuess()}
                min="1"
                max="100"
              />
              <Button onClick={handleGuess} disabled={!guess}>
                Guess
              </Button>
            </div>
          </div>
        )}

        {feedback && (
          <div
            className={`text-center p-3 rounded-lg ${
              gameStatus === "won"
                ? "bg-success/10 text-success"
                : gameStatus === "lost"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {gameStatus === "won" && <CheckCircle className="w-4 h-4" />}
              {gameStatus === "lost" && <XCircle className="w-4 h-4" />}
              <span className="text-sm">{feedback}</span>
            </div>
            {gameStatus === "won" && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <Coins className="w-4 h-4" />
                <span className="font-semibold">+{coinsEarned} coins</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {gameStatus !== "playing" && (
            <Button onClick={resetGame} variant="outline" className="flex-1 bg-transparent">
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          )}
          <Button onClick={onClose} variant="secondary" className="flex-1">
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
