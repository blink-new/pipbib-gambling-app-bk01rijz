import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wallet, TrendingUp, Target, Trophy } from 'lucide-react'
import type { UserBalance } from '@/types/game'

interface BalanceCardProps {
  balance: UserBalance
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const winRate = balance.gamesPlayed > 0 ? ((balance.totalWinnings / balance.totalBets) * 100) : 0

  return (
    <Card className="bg-card/50 border-border backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Wallet className="mr-2 h-5 w-5 text-orange-400" />
          Your Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
            <p className="text-2xl font-bold text-white">${balance.balance.toFixed(2)}</p>
            <p className="text-sm text-gray-400">Current Balance</p>
          </div>
          
          <div className="text-center p-3 bg-muted/20 rounded-lg border border-border/50">
            <p className="text-2xl font-bold text-yellow-400">${balance.totalWinnings.toFixed(2)}</p>
            <p className="text-sm text-gray-400">Total Winnings</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-gray-300">Games Played</span>
            </div>
            <Badge variant="outline" className="border-orange-500/30 text-orange-400">
              {balance.gamesPlayed}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-gray-300">Total Bets</span>
            </div>
            <Badge variant="outline" className="border-orange-500/30 text-orange-400">
              ${balance.totalBets.toFixed(2)}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-gray-300">Win Rate</span>
            </div>
            <Badge 
              variant="outline" 
              className={`${winRate > 16.67 ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'}`}
            >
              {winRate.toFixed(1)}%
            </Badge>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <p className="text-xs text-orange-300 text-center">
            🎯 Theoretical win rate: 16.67% (1 in 6 chance)
          </p>
        </div>
      </CardContent>
    </Card>
  )
}