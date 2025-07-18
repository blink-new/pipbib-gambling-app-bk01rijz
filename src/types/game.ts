export interface Game {
  id: string
  userId: string
  productUrl?: string
  productName?: string
  productPrice: number
  betAmount: number
  diceRoll: number
  won: boolean
  payoutAmount?: number
  createdAt: string
}

export interface UserBalance {
  userId: string
  balance: number
  totalWinnings: number
  totalBets: number
  gamesPlayed: number
  updatedAt: string
}

export interface ProductInfo {
  name?: string
  price?: number
  image?: string
  url: string
}