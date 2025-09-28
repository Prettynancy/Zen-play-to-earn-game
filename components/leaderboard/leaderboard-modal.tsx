"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Crown, X, Clock, Target } from "lucide-react"
import { leaderboardService, type PlayerStats } from "@/lib/leaderboard"

interface LeaderboardModalProps {
  isOpen: boolean
  onClose: () => void
  currentUserId?: string
}

export function LeaderboardModal({ isOpen, onClose, currentUserId }: LeaderboardModalProps) {
  const [leaderboard, setLeaderboard] = useState<PlayerStats[]>([])
  const [userStats, setUserStats] = useState<any>(null)

  useEffect(() => {
    if (isOpen) {
      setLeaderboard(leaderboardService.getLeaderboard())
      if (currentUserId) {
        setUserStats(leaderboardService.getUserGameStats(currentUserId))
      }
    }
  }, [isOpen, currentUserId])

  if (!isOpen) return null

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
    return <Trophy className="w-4 h-4 text-muted-foreground" />
  }

  const getRankBadgeVariant = (rank: number) => {
    if (rank === 1) return "default"
    if (rank <= 3) return "secondary"
    return "outline"
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="relative">
          <Button variant="ghost" size="sm" className="absolute right-0 top-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            Leaderboard & Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          <Tabs defaultValue="leaderboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="leaderboard">Global Leaderboard</TabsTrigger>
              <TabsTrigger value="stats">My Stats</TabsTrigger>
            </TabsList>

            <TabsContent value="leaderboard" className="space-y-4">
              <div className="space-y-2">
                {leaderboard.slice(0, 20).map((player) => (
                  <div
                    key={player.userId}
                    className={`
                      flex items-center gap-4 p-4 rounded-lg border transition-all
                      ${
                        player.userId === currentUserId
                          ? "bg-primary/5 border-primary/20 ring-1 ring-primary/20"
                          : "bg-card hover:bg-muted/50"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 min-w-[60px]">
                      {getRankIcon(player.rank)}
                      <Badge variant={getRankBadgeVariant(player.rank)} className="min-w-[32px] justify-center">
                        #{player.rank}
                      </Badge>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm truncate">
                          {player.username}
                          {player.userId === currentUserId && <span className="text-primary ml-1">(You)</span>}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          Level {player.level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{player.totalCoins.toLocaleString()} coins</span>
                        <span>{player.gamesPlayed} games</span>
                        <span>{player.winRate}% win rate</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium">{player.totalScore.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Total Score</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              {userStats && (
                <>
                  {/* Overview Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <div className="text-2xl font-bold text-primary">{userStats.totalGames}</div>
                        <p className="text-xs text-muted-foreground">Games Played</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6 text-center">
                        <div className="text-2xl font-bold text-success">{userStats.gamesWon}</div>
                        <p className="text-xs text-muted-foreground">Games Won</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6 text-center">
                        <div className="text-2xl font-bold text-warning">{userStats.winRate}%</div>
                        <p className="text-xs text-muted-foreground">Win Rate</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6 text-center">
                        <div className="text-2xl font-bold text-secondary">{userStats.averageScore}</div>
                        <p className="text-xs text-muted-foreground">Avg Score</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Game Type Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Game Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(userStats.gameTypeStats).map(([gameType, stats]: [string, any]) => (
                          <div key={gameType} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Target className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium text-sm capitalize">{gameType.replace("-", " ")}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {stats.played} games • {Math.round((stats.won / stats.played) * 100)}% win rate
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{Math.round(stats.totalScore / stats.played)}</div>
                              <div className="text-xs text-muted-foreground">Avg Score</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Games */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Recent Games
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {userStats.recentGames.slice(0, 5).map((game: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-2 h-2 rounded-full ${game.won ? "bg-success" : "bg-muted-foreground"}`}
                              />
                              <div>
                                <h4 className="font-medium text-sm capitalize">{game.gameType.replace("-", " ")}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(game.playedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{game.score}</div>
                              <div className="text-xs text-success">+{game.coinsEarned} coins</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
