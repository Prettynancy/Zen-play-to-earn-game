export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  requirement: number
  currentProgress: number
  reward: number
  completed: boolean
  category: "games" | "coins" | "streak" | "level"
}

export interface DailyBonus {
  day: number
  reward: number
  claimed: boolean
}

export interface RewardSystem {
  dailyBonuses: DailyBonus[]
  achievements: Achievement[]
  streakBonus: number
  lastClaimDate: string
  currentStreak: number
}

class RewardsService {
  private getRewardData(): RewardSystem {
    const data = localStorage.getItem("gameRewards")
    if (data) {
      return JSON.parse(data)
    }

    return this.initializeRewards()
  }

  private saveRewardData(data: RewardSystem) {
    localStorage.setItem("gameRewards", JSON.stringify(data))
  }

  private initializeRewards(): RewardSystem {
    const achievements: Achievement[] = [
      {
        id: "first_game",
        title: "First Steps",
        description: "Play your first game",
        icon: "play",
        requirement: 1,
        currentProgress: 0,
        reward: 50,
        completed: false,
        category: "games",
      },
      {
        id: "game_master",
        title: "Game Master",
        description: "Play 10 games",
        icon: "trophy",
        requirement: 10,
        currentProgress: 0,
        reward: 200,
        completed: false,
        category: "games",
      },
      {
        id: "coin_collector",
        title: "Coin Collector",
        description: "Earn 1000 coins",
        icon: "coins",
        requirement: 1000,
        currentProgress: 0,
        reward: 100,
        completed: false,
        category: "coins",
      },
      {
        id: "streak_warrior",
        title: "Streak Warrior",
        description: "Maintain a 7-day streak",
        icon: "fire",
        requirement: 7,
        currentProgress: 0,
        reward: 300,
        completed: false,
        category: "streak",
      },
      {
        id: "level_up",
        title: "Rising Star",
        description: "Reach level 5",
        icon: "star",
        requirement: 5,
        currentProgress: 1,
        reward: 250,
        completed: false,
        category: "level",
      },
    ]

    const dailyBonuses: DailyBonus[] = Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      reward: 50 + i * 25, // Increasing rewards: 50, 75, 100, 125, 150, 175, 200
      claimed: false,
    }))

    const rewardSystem: RewardSystem = {
      dailyBonuses,
      achievements,
      streakBonus: 0,
      lastClaimDate: "",
      currentStreak: 0,
    }

    this.saveRewardData(rewardSystem)
    return rewardSystem
  }

  getDailyBonuses(): DailyBonus[] {
    const data = this.getRewardData()
    return data.dailyBonuses
  }

  claimDailyBonus(): { success: boolean; reward: number; newStreak: number } {
    const data = this.getRewardData()
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    // Check if already claimed today
    if (data.lastClaimDate === today) {
      return { success: false, reward: 0, newStreak: data.currentStreak }
    }

    // Calculate streak
    let newStreak = 1
    if (data.lastClaimDate === yesterday) {
      newStreak = data.currentStreak + 1
    }

    // Reset daily bonuses if starting new cycle
    if (newStreak === 1 && data.currentStreak > 0) {
      data.dailyBonuses.forEach((bonus) => (bonus.claimed = false))
    }

    // Claim today's bonus
    const todayBonus = data.dailyBonuses[Math.min(newStreak - 1, 6)]
    todayBonus.claimed = true

    // Update data
    data.currentStreak = newStreak
    data.lastClaimDate = today
    data.streakBonus = newStreak >= 7 ? 100 : 0

    this.saveRewardData(data)
    return {
      success: true,
      reward: todayBonus.reward + data.streakBonus,
      newStreak,
    }
  }

  getAchievements(): Achievement[] {
    const data = this.getRewardData()
    return data.achievements
  }

  updateAchievementProgress(category: Achievement["category"], value: number): Achievement[] {
    const data = this.getRewardData()
    const completedAchievements: Achievement[] = []

    data.achievements.forEach((achievement) => {
      if (achievement.category === category && !achievement.completed) {
        achievement.currentProgress = value

        if (achievement.currentProgress >= achievement.requirement) {
          achievement.completed = true
          completedAchievements.push(achievement)
        }
      }
    })

    this.saveRewardData(data)
    return completedAchievements
  }

  getCurrentStreak(): number {
    const data = this.getRewardData()
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    // If last claim was yesterday, streak continues
    if (data.lastClaimDate === yesterday || data.lastClaimDate === today) {
      return data.currentStreak
    }

    // Streak broken
    return 0
  }

  canClaimDailyBonus(): boolean {
    const data = this.getRewardData()
    const today = new Date().toDateString()
    return data.lastClaimDate !== today
  }
}

export const rewardsService = new RewardsService()
