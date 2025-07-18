export interface Game {
  id: string
  user_id: string
  product_url?: string
  product_name?: string
  product_price: number
  bet_amount: number
  dice_roll: number
  won: boolean
  payout_amount?: number
  created_at: string
}

export interface UserBalance {
  userId: string  // Keep camelCase for UI consistency
  balance: number
  totalWinnings: number
  totalBets: number
  gamesPlayed: number
  updatedAt: string
}

// Database schema types (snake_case)
export interface DbUserBalance {
  user_id: string
  balance: number
  total_winnings: number
  total_bets: number
  games_played: number
  updated_at: string
}

export interface ProductInfo {
  name?: string
  price?: number
  image?: string
  url: string
}