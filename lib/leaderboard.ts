export interface PlayerStats {
  userId: string
  username: string
  totalCoins: number
  level: number
  gamesPlayed: number
  gamesWon: number
  totalScore: number
  winRate: number
  averageScore: number
  rank: number
  lastActive: string
}

export interface GameHistory {
  id: string
  userId: string
  gameType: string
  score: number
  coinsEarned: number
  xpEarned: number
  won: boolean
  playedAt: string
  duration: number
}

class LeaderboardService {
  private generateMockPlayers(): PlayerStats[] {
    const mockPlayers = [
      { username: "CryptoKing", totalCoins: 15420, level: 12, gamesPlayed: 89, gamesWon: 67 },
      { username: "GameMaster", totalCoins: 12890, level: 10, gamesPlayed: 76, gamesWon: 58 },
      { username: "ProPlayer", totalCoins: 11250, level: 9, gamesPlayed: 65, gamesWon: 48 },
      { username: "CoinHunter", totalCoins: 9800, level: 8, gamesPlayed: 58, gamesWon: 41 },
      { username: "SkillMaster", totalCoins: 8750, level: 7, gamesPlayed: 52, gamesWon: 36 },
      { username: "QuickShot", totalCoins: 7600, level: 6, gamesPlayed: 45, gamesWon: 31 },
      { username: "NumberWiz", totalCoins: 6800, level: 6, gamesPlayed: 41, gamesWon: 27 },
      { username: "FastClick", totalCoins: 5900, level: 5, gamesPlayed: 38, gamesWon: 24 },
      { username: "GameNinja", totalCoins: 5200, level: 5, gamesPlayed: 34, gamesWon: 21 },
      { username: "CoinSeeker", totalCoins: 4500, level: 4, gamesPlayed: 31, gamesWon: 18 },
    ]

    return mockPlayers.map((player, index) => ({
      userId: `mock-${index}`,
      username: player.username,
      totalCoins: player.totalCoins,
      level: player.level,
      gamesPlayed: player.gamesPlayed,
      gamesWon: player.gamesWon,
      totalScore: player.gamesWon * 100 + (player.gamesPlayed - player.gamesWon) * 25,
      winRate: Math.round((player.gamesWon / player.gamesPlayed) * 100),
      averageScore: Math.round(
        (player.gamesWon * 100 + (player.gamesPlayed - player.gamesWon) * 25) / player.gamesPlayed,
      ),
      rank: index + 1,
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }))
  }

  getLeaderboard(): PlayerStats[] {
    const mockPlayers = this.generateMockPlayers()
    const currentUser = this.getCurrentUserStats()

    if (currentUser) {
      // Insert current user into leaderboard
      const userRank = mockPlayers.findIndex((p) => p.totalCoins < currentUser.totalCoins)
      if (userRank === -1) {
        // User has lowest score
        currentUser.rank = mockPlayers.length + 1
        mockPlayers.push(currentUser)
      } else {
        // Insert user at appropriate position
        currentUser.rank = userRank + 1
        mockPlayers.splice(userRank, 0, currentUser)
        // Update ranks for players below
        for (let i = userRank + 1; i < mockPlayers.length; i++) {
          mockPlayers[i].rank = i + 1
        }
      }
    }

    return mockPlayers
  }

  getCurrentUserStats(): PlayerStats | null {
    const userData = localStorage.getItem("gameUser")
    if (!userData) return null

    const user = JSON.parse(userData)
    const gameStats = this.getGameHistory()
    const userGames = gameStats.filter((g) => g.userId === user.id)

    const gamesWon = userGames.filter((g) => g.won).length
    const totalScore = userGames.reduce((sum, g) => sum + g.score, 0)

    return {
      userId: user.id,
      username: user.username,
      totalCoins: user.coins,
      level: user.level,
      gamesPlayed: user.gamesPlayed,
      gamesWon,
      totalScore: user.totalScore,
      winRate: user.gamesPlayed > 0 ? Math.round((gamesWon / user.gamesPlayed) * 100) : 0,
      averageScore: user.gamesPlayed > 0 ? Math.round(totalScore / user.gamesPlayed) : 0,
      rank: 0, // Will be calculated in getLeaderboard
      lastActive: new Date().toISOString(),
    }
  }

  getGameHistory(): GameHistory[] {
    const history = localStorage.getItem("gameStats")
    if (!history) return []

    const stats = JSON.parse(history)
    return stats.map((stat: any, index: number) => ({
      id: `game-${index}`,
      userId: stat.userId,
      gameType: stat.gameType,
      score: stat.score,
      coinsEarned: stat.coinsEarned,
      xpEarned: stat.xpEarned,
      won: stat.score > 0,
      playedAt: stat.playedAt,
      duration: Math.floor(Math.random() * 120) + 30, // Mock duration
    }))
  }

  getUserRank(userId: string): number {
    const leaderboard = this.getLeaderboard()
    const userEntry = leaderboard.find((p) => p.userId === userId)
    return userEntry?.rank || 0
  }

  getTopPlayers(limit = 10): PlayerStats[] {
    return this.getLeaderboard().slice(0, limit)
  }

  getUserGameStats(userId: string) {
    const history = this.getGameHistory().filter((g) => g.userId === userId)
    const totalGames = history.length
    const gamesWon = history.filter((g) => g.won).length
    const totalCoins = history.reduce((sum, g) => sum + g.coinsEarned, 0)
    const totalXP = history.reduce((sum, g) => sum + g.xpEarned, 0)
    const averageScore = totalGames > 0 ? Math.round(history.reduce((sum, g) => sum + g.score, 0) / totalGames) : 0

    const gameTypeStats = history.reduce(
      (acc, game) => {
        if (!acc[game.gameType]) {
          acc[game.gameType] = { played: 0, won: 0, totalScore: 0 }
        }
        acc[game.gameType].played++
        if (game.won) acc[game.gameType].won++
        acc[game.gameType].totalScore += game.score
        return acc
      },
      {} as Record<string, { played: number; won: number; totalScore: number }>,
    )

    return {
      totalGames,
      gamesWon,
      winRate: totalGames > 0 ? Math.round((gamesWon / totalGames) * 100) : 0,
      totalCoins,
      totalXP,
      averageScore,
      gameTypeStats,
      recentGames: history.slice(-10).reverse(),
    }
  }
}

export const leaderboardService = new LeaderboardService()
