import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dice6 } from 'lucide-react'

interface DiceRollProps {
  onRoll: (result: number) => void
  isRolling: boolean
  result?: number
}

export function DiceRoll({ onRoll, isRolling, result }: DiceRollProps) {
  const [showResult, setShowResult] = useState(false)

  const handleRoll = () => {
    setShowResult(false)
    const diceResult = Math.floor(Math.random() * 6) + 1
    
    // Simulate rolling animation delay
    setTimeout(() => {
      setShowResult(true)
      onRoll(diceResult)
    }, 2000)
  }

  const getDiceFace = (num: number) => {
    const faces = {
      1: '⚀',
      2: '⚁', 
      3: '⚂',
      4: '⚃',
      5: '⚄',
      6: '⚅'
    }
    return faces[num as keyof typeof faces] || '⚀'
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <div 
          className={`
            w-24 h-24 bg-white rounded-xl flex items-center justify-center text-4xl font-bold text-gray-800 dice-shadow
            ${isRolling ? 'dice-roll' : ''}
            ${result === 6 ? 'win-glow' : ''}
          `}
        >
          {showResult && result ? getDiceFace(result) : '⚀'}
        </div>
        
        {isRolling && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/20 to-yellow-500/20 animate-pulse" />
        )}
      </div>

      {!isRolling && !result && (
        <Button 
          onClick={handleRoll}
          className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold px-8 py-3 rounded-xl neon-glow transition-all duration-300"
        >
          <Dice6 className="mr-2 h-5 w-5" />
          Roll the Dice!
        </Button>
      )}

      {isRolling && (
        <div className="text-center">
          <p className="text-orange-400 font-semibold animate-pulse">Rolling...</p>
          <p className="text-gray-400 text-sm">Good luck! 🍀</p>
        </div>
      )}

      {result && (
        <div className="text-center space-y-2">
          <p className="text-2xl font-bold">
            You rolled a <span className={result === 6 ? 'text-yellow-400 neon-text' : 'text-white'}>{result}</span>!
          </p>
          {result === 6 ? (
            <p className="text-yellow-400 font-semibold neon-text">🎉 WINNER! 🎉</p>
          ) : (
            <p className="text-gray-400">Better luck next time!</p>
          )}
        </div>
      )}
    </div>
  )
}