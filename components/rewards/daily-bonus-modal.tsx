"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, Gift, Flame, X } from "lucide-react"
import { rewardsService, type DailyBonus } from "@/lib/rewards"

interface DailyBonusModalProps {
  isOpen: boolean
  onClose: () => void
  onClaim: (reward: number) => void
}

export function DailyBonusModal({ isOpen, onClose, onClaim }: DailyBonusModalProps) {
  const [dailyBonuses, setDailyBonuses] = useState<DailyBonus[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [canClaim, setCanClaim] = useState(false)
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setDailyBonuses(rewardsService.getDailyBonuses())
      setCurrentStreak(rewardsService.getCurrentStreak())
      setCanClaim(rewardsService.canClaimDailyBonus())
    }
  }, [isOpen])

  const handleClaim = async () => {
    setClaiming(true)
    const result = rewardsService.claimDailyBonus()

    if (result.success) {
      onClaim(result.reward)
      setCurrentStreak(result.newStreak)
      setCanClaim(false)
      setDailyBonuses(rewardsService.getDailyBonuses())
    }

    setClaiming(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="relative">
          <Button variant="ghost" size="sm" className="absolute right-0 top-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Daily Bonus
          </CardTitle>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">{currentStreak} day streak</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {dailyBonuses.map((bonus, index) => (
              <div
                key={bonus.day}
                className={`
                  p-2 rounded-lg text-center border-2 transition-all
                  ${
                    bonus.claimed
                      ? "bg-success/10 border-success text-success"
                      : index === currentStreak && canClaim
                        ? "bg-primary/10 border-primary text-primary animate-pulse"
                        : "bg-muted/50 border-border text-muted-foreground"
                  }
                `}
              >
                <div className="text-xs font-medium">Day {bonus.day}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Coins className="w-3 h-3" />
                  <span className="text-xs">{bonus.reward}</span>
                </div>
                {bonus.claimed && <div className="text-xs mt-1">✓</div>}
              </div>
            ))}
          </div>

          {currentStreak >= 7 && (
            <div className="p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
              <div className="flex items-center gap-2 text-orange-600">
                <Flame className="w-4 h-4" />
                <span className="font-medium">Streak Bonus!</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">+100 bonus coins for maintaining your streak!</p>
            </div>
          )}

          {canClaim ? (
            <Button onClick={handleClaim} disabled={claiming} className="w-full" size="lg">
              {claiming ? "Claiming..." : `Claim ${dailyBonuses[Math.min(currentStreak, 6)]?.reward || 50} Coins`}
            </Button>
          ) : (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Come back tomorrow for your next bonus!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
