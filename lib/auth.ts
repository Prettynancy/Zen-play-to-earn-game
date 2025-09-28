export interface User {
  id: string
  username: string
  email: string
  coins: number
  xp: number
  level: number
  gamesPlayed: number
  totalScore: number
  createdAt: string
}

export interface GameStats {
  userId: string
  gameType: string
  score: number
  coinsEarned: number
  xpEarned: number
  playedAt: string
}

class AuthService {
  private currentUser: User | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.loadUser()
    }
  }

  private loadUser() {
    if (typeof window === "undefined") return

    const userData = localStorage.getItem("gameUser")
    if (userData) {
      this.currentUser = JSON.parse(userData)
    }
  }

  private saveUser() {
    if (typeof window === "undefined") return

    if (this.currentUser) {
      localStorage.setItem("gameUser", JSON.stringify(this.currentUser))
    }
  }

  register(username: string, email: string): User {
    const user: User = {
      id: crypto.randomUUID(),
      username,
      email,
      coins: 100, // Starting coins
      xp: 0,
      level: 1,
      gamesPlayed: 0,
      totalScore: 0,
      createdAt: new Date().toISOString(),
    }

    this.currentUser = user
    this.saveUser()
    return user
  }

  login(username: string): User | null {
    if (typeof window === "undefined") return null

    // Simple username-based login for demo
    const userData = localStorage.getItem("gameUser")
    if (userData) {
      const user = JSON.parse(userData)
      if (user.username === username) {
        this.currentUser = user
        return user
      }
    }
    return null
  }

  logout() {
    this.currentUser = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("gameUser")
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  updateUserStats(coinsEarned: number, xpEarned: number, score: number) {
    if (!this.currentUser) return

    this.currentUser.coins += coinsEarned
    this.currentUser.xp += xpEarned
    this.currentUser.totalScore += score
    this.currentUser.gamesPlayed += 1

    // Level up logic
    const newLevel = Math.floor(this.currentUser.xp / 1000) + 1
    if (newLevel > this.currentUser.level) {
      this.currentUser.level = newLevel
      this.currentUser.coins += 50 // Bonus coins for leveling up
    }

    this.saveUser()
  }

  saveGameStats(gameType: string, score: number, coinsEarned: number, xpEarned: number) {
    if (typeof window === "undefined") return

    const stats: GameStats = {
      userId: this.currentUser?.id || "",
      gameType,
      score,
      coinsEarned,
      xpEarned,
      playedAt: new Date().toISOString(),
    }

    const existingStats = JSON.parse(localStorage.getItem("gameStats") || "[]")
    existingStats.push(stats)
    localStorage.setItem("gameStats", JSON.stringify(existingStats))
  }

  getGameStats(): GameStats[] {
    if (typeof window === "undefined") return []

    return JSON.parse(localStorage.getItem("gameStats") || "[]")
  }
}

export const authService = new AuthService()
