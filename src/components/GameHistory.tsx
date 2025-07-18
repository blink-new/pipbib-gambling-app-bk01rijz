import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trophy, X } from 'lucide-react'
import type { Game } from '@/types/game'

interface GameHistoryProps {
  games: Game[]
}

export function GameHistory({ games }: GameHistoryProps) {
  if (games.length === 0) {
    return (
      <Card className="bg-card/50 border-border backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-orange-400" />
            Game History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-8">
            No games played yet. Start your first game!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/50 border-border backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Trophy className="mr-2 h-5 w-5 text-orange-400" />
          Game History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {games.map((game) => (
              <div 
                key={game.id}
                className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {game.won ? (
                      <Trophy className="h-4 w-4 text-yellow-400" />
                    ) : (
                      <X className="h-4 w-4 text-red-400" />
                    )}
                    <span className="text-sm font-medium text-white">
                      Roll: {game.dice_roll}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={game.won ? "default" : "secondary"}
                      className={game.won ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}
                    >
                      ${game.bet_amount.toFixed(2)}
                    </Badge>
                    {game.won && (
                      <Badge className="bg-green-500/20 text-green-400">
                        Won ${game.payout_amount?.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-gray-400">
                    {new Date(game.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}