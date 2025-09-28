"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Play, Coins, Flame, Star } from "lucide-react"
import { rewardsService, type Achievement } from "@/lib/rewards"

const iconMap = {
  play: Play,
  trophy: Trophy,
  coins: Coins,
  fire: Flame,
  star: Star,
}

export function AchievementsPanel() {
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    setAchievements(rewardsService.getAchievements())
  }, [])

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName as keyof typeof iconMap] || Trophy
    return Icon
  }

  const completedCount = achievements.filter((a) => a.completed).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-warning" />
          Achievements
          <Badge variant="secondary" className="ml-auto">
            {completedCount}/{achievements.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {achievements.map((achievement) => {
          const Icon = getIcon(achievement.icon)
          const progress = Math.min((achievement.currentProgress / achievement.requirement) * 100, 100)

          return (
            <div
              key={achievement.id}
              className={`
                p-3 rounded-lg border transition-all
                ${achievement.completed ? "bg-success/5 border-success/20" : "bg-muted/30 border-border"}
              `}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${achievement.completed ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}
                `}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    {achievement.completed && (
                      <Badge variant="secondary" className="text-xs">
                        +{achievement.reward}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>

                  {!achievement.completed && (
                    <div className="space-y-1">
                      <Progress value={progress} className="h-1" />
                      <p className="text-xs text-muted-foreground">
                        {achievement.currentProgress} / {achievement.requirement}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
