"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Coins,
  Trophy,
  Zap,
  Star,
  Target,
  User,
  LogOut,
  GamepadIcon,
  BarChart3,
  Award,
  Crown,
  Gift,
} from "lucide-react"
import { NumberGuessGame } from "@/components/games/number-guess-game"
import { QuickClickGame } from "@/components/games/quick-click-game"
import { AuthModal } from "@/components/auth/auth-modal"
import { DailyBonusModal } from "@/components/rewards/daily-bonus-modal"
import { AchievementsPanel } from "@/components/rewards/achievements-panel"
import { authService, type User as UserType } from "@/lib/auth"
import { rewardsService } from "@/lib/rewards"
import { LeaderboardModal } from "@/components/leaderboard/leaderboard-modal"
import { leaderboardService } from "@/lib/leaderboard"
import Image from "next/image"

export default function GameDashboard() {
  const [user, setUser] = useState<UserType | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showDailyBonus, setShowDailyBonus] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [activeTab, setActiveTab] = useState("games")

  const [activeGame, setActiveGame] = useState<"number-guess" | "quick-click" | null>(null)
  const [gamesPlayed, setGamesPlayed] = useState(0)
  const [gamesWon, setGamesWon] = useState(0)
  const [userRank, setUserRank] = useState(0)

  const closeGame = () => {
    setActiveGame(null)
  }

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setGamesPlayed(currentUser.gamesPlayed)
      setUserRank(leaderboardService.getUserRank(currentUser.id))

      if (rewardsService.canClaimDailyBonus()) {
        setShowDailyBonus(true)
      }
    } else {
      setShowAuthModal(true)
    }
  }, [])

  const handleAuthSuccess = () => {
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setGamesPlayed(currentUser.gamesPlayed)
      setUserRank(leaderboardService.getUserRank(currentUser.id))

      if (rewardsService.canClaimDailyBonus()) {
        setShowDailyBonus(true)
      }
    }
  }

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    setShowAuthModal(true)
  }

  const handleGameComplete = (won: boolean, coinsEarned: number) => {
    if (!user) return

    const xpEarned = won ? 50 : 10
    authService.updateUserStats(coinsEarned, xpEarned, won ? 100 : 0)
    authService.saveGameStats(activeGame || "unknown", won ? 100 : 0, coinsEarned, xpEarned)

    const updatedUser = authService.getCurrentUser()
    if (updatedUser) {
      rewardsService.updateAchievementProgress("games", updatedUser.gamesPlayed)
      rewardsService.updateAchievementProgress("coins", updatedUser.coins)
      rewardsService.updateAchievementProgress("level", updatedUser.level)
      rewardsService.updateAchievementProgress("streak", rewardsService.getCurrentStreak())

      setUser(updatedUser)
      setGamesPlayed(updatedUser.gamesPlayed)
      setUserRank(leaderboardService.getUserRank(updatedUser.id))
      if (won) {
        setGamesWon((prev) => prev + 1)
      }
    }
  }

  const handleDailyBonusClaim = (reward: number) => {
    if (!user) return

    authService.updateUserStats(reward, 0, 0)
    const updatedUser = authService.getCurrentUser()
    if (updatedUser) {
      setUser(updatedUser)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} />
      </div>
    )
  }

  if (activeGame === "number-guess") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <NumberGuessGame onGameComplete={handleGameComplete} onClose={closeGame} />
      </div>
    )
  }

  if (activeGame === "quick-click") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <QuickClickGame onGameComplete={handleGameComplete} onClose={closeGame} />
      </div>
    )
  }

  const xpForCurrentLevel = (user.level - 1) * 1000
  const xpForNextLevel = user.level * 1000
  const currentLevelXp = user.xp - xpForCurrentLevel
  const xpNeededForNext = xpForNextLevel - user.xp

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src="/logo.jpg"
                  alt="ZEN PLAY TO EARN Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-balance">ZEN PLAY TO EARN</h1>
                <p className="text-sm text-muted-foreground">Play • Earn • Dominate</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{user.username}</span>
              </div>
              <div className="flex items-center gap-2 bg-success/10 px-3 py-1 rounded-full">
                <Coins className="w-4 h-4 text-success" />
                <span className="font-semibold text-success">{user.coins.toLocaleString()}</span>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Star className="w-3 h-3" />
                Level {user.level}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="games" className="flex items-center gap-2">
              <GamepadIcon className="w-4 h-4" />
              Games
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Rewards
            </TabsTrigger>
          </TabsList>

          {/* Games Tab */}
          <TabsContent value="games" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Main Game Card */}
                <Card className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
                  <CardHeader className="relative">
                    <CardTitle className="text-center text-balance">Ready to Play?</CardTitle>
                    <div className="flex justify-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center pulse-glow">
                        <Zap className="w-16 h-16 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative text-center space-y-4">
                    <p className="text-muted-foreground text-balance">
                      Complete challenges, earn coins, and climb the leaderboard!
                    </p>
                    <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                      <Button size="lg" onClick={() => setActiveGame("number-guess")} className="w-full">
                        Number Guess
                      </Button>
                      <Button
                        size="lg"
                        variant="secondary"
                        onClick={() => setActiveGame("quick-click")}
                        className="w-full"
                      >
                        Quick Click
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Available Games */}
                <Card>
                  <CardHeader>
                    <CardTitle>Available Games</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className="p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
                        onClick={() => setActiveGame("number-guess")}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4 text-primary" />
                          </div>
                          <h3 className="font-semibold">Number Guess</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">Guess the number and earn coins!</p>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">Easy</Badge>
                          <span className="text-sm font-medium text-success">+50-100 coins</span>
                        </div>
                      </div>

                      <div
                        className="p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
                        onClick={() => setActiveGame("quick-click")}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 text-secondary" />
                          </div>
                          <h3 className="font-semibold">Quick Click</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">Test your reflexes!</p>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">Medium</Badge>
                          <span className="text-sm font-medium text-success">+50-150 coins</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats Sidebar */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="text-center">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Coins className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-2xl font-bold text-primary">{user.coins.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Total Coins</p>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Star className="w-6 h-6 text-secondary" />
                      </div>
                      <div className="text-2xl font-bold text-secondary">{user.level}</div>
                      <p className="text-xs text-muted-foreground">Level</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Progress Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-secondary" />
                      Level Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">Level {user.level}</div>
                      <p className="text-sm text-muted-foreground">{currentLevelXp} / 1000 XP</p>
                    </div>
                    <Progress value={(currentLevelXp / 1000) * 100} className="h-2" />
                    <p className="text-xs text-center text-muted-foreground">{xpNeededForNext} XP to next level</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Coins className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-primary">{user.coins.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total Coins</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="text-2xl font-bold text-secondary">{user.level}</div>
                  <p className="text-xs text-muted-foreground">Level</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Target className="w-6 h-6 text-accent" />
                  </div>
                  <div className="text-2xl font-bold text-accent">{user.gamesPlayed}</div>
                  <p className="text-xs text-muted-foreground">Games Played</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Trophy className="w-6 h-6 text-warning" />
                  </div>
                  <div className="text-2xl font-bold text-warning">#{userRank || "N/A"}</div>
                  <p className="text-xs text-muted-foreground">Rank</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Game Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Games Played</span>
                        <span className="font-medium">{user.gamesPlayed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Games Won</span>
                        <span className="font-medium">{gamesWon}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Win Rate</span>
                        <span className="font-medium">
                          {user.gamesPlayed > 0 ? Math.round((gamesWon / user.gamesPlayed) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold">Progress</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total XP</span>
                        <span className="font-medium">{user.xp.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Current Level</span>
                        <span className="font-medium">Level {user.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Global Rank</span>
                        <span className="font-medium">#{userRank || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <AchievementsPanel />
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-warning" />
                    Global Leaderboard
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setShowLeaderboard(true)}>
                    View Detailed
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-warning/5 rounded-lg border">
                    <Badge
                      variant="secondary"
                      className="w-8 h-8 rounded-full p-0 flex items-center justify-center text-sm bg-warning text-warning-foreground"
                    >
                      1
                    </Badge>
                    <div className="flex-1">
                      <p className="font-semibold">CryptoKing</p>
                      <p className="text-sm text-muted-foreground">15,420 coins</p>
                    </div>
                    <Trophy className="w-5 h-5 text-warning" />
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Badge
                      variant="outline"
                      className="w-8 h-8 rounded-full p-0 flex items-center justify-center text-sm"
                    >
                      2
                    </Badge>
                    <div className="flex-1">
                      <p className="font-semibold">GameMaster</p>
                      <p className="text-sm text-muted-foreground">12,890 coins</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Badge
                      variant="outline"
                      className="w-8 h-8 rounded-full p-0 flex items-center justify-center text-sm"
                    >
                      3
                    </Badge>
                    <div className="flex-1">
                      <p className="font-semibold">ProPlayer</p>
                      <p className="text-sm text-muted-foreground">11,250 coins</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <Badge
                        variant="default"
                        className="w-8 h-8 rounded-full p-0 flex items-center justify-center text-sm"
                      >
                        {userRank || "?"}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-semibold">{user.username} (You)</p>
                        <p className="text-sm text-muted-foreground">{user.coins.toLocaleString()} coins</p>
                      </div>
                      <User className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Daily Bonus</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDailyBonus(true)}
                      disabled={!rewardsService.canClaimDailyBonus()}
                    >
                      {rewardsService.canClaimDailyBonus() ? "Claim Now" : "Claimed"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Gift className="w-8 h-8 text-success" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {rewardsService.canClaimDailyBonus()
                        ? "Your daily bonus is ready to claim!"
                        : "Come back tomorrow for your next bonus!"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      Current Streak: {rewardsService.getCurrentStreak()} days
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Daily Challenges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.gamesPlayed >= 3 ? "bg-success" : "bg-warning"}`} />
                      <span className="text-sm">Play 3 games</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {user.gamesPlayed}/3
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.coins >= 1500 ? "bg-success" : "bg-warning"}`} />
                      <span className="text-sm">Earn 1500 coins</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {user.coins}/1500
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${gamesWon >= 5 ? "bg-success" : "bg-muted-foreground"}`} />
                      <span className="text-sm">Win 5 games</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {gamesWon}/5
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} />

      <DailyBonusModal
        isOpen={showDailyBonus}
        onClose={() => setShowDailyBonus(false)}
        onClaim={handleDailyBonusClaim}
      />

      <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} currentUserId={user?.id} />
    </div>
  )
}
