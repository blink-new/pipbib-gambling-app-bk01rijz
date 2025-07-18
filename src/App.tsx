import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Link, Loader2, AlertCircle, DollarSign, Dice6, Trophy, Sparkles } from 'lucide-react'
import { blink } from '@/blink/client'
import { DiceRoll } from '@/components/DiceRoll'
import { ProductCard } from '@/components/ProductCard'
import { GameHistory } from '@/components/GameHistory'
import { BalanceCard } from '@/components/BalanceCard'
import type { ProductInfo, Game, UserBalance } from '@/types/game'

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [productUrl, setProductUrl] = useState('')
  const [manualPrice, setManualPrice] = useState('')
  const [product, setProduct] = useState<ProductInfo | null>(null)
  const [isScrapingPrice, setIsScrapingPrice] = useState(false)
  const [showManualPrice, setShowManualPrice] = useState(false)
  const [isRolling, setIsRolling] = useState(false)
  const [diceResult, setDiceResult] = useState<number | undefined>()
  const [gameResult, setGameResult] = useState<{ won: boolean; payout?: number } | null>(null)
  const [games, setGames] = useState<Game[]>([])
  const [balance, setBalance] = useState<UserBalance | null>(null)
  const [error, setError] = useState('')
  const [showResultModal, setShowResultModal] = useState(false)

  // Auth state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      // Load user data when authenticated
      if (state.user?.id) {
        loadUserData()
      }
    })
    return unsubscribe
  }, [loadUserData])

  const loadUserData = useCallback(async () => {
    if (!user?.id) return

    try {
      // Load or create user balance
      const existingBalance = await blink.db.userBalances.list({
        where: { userId: user.id },
        limit: 1
      })

      if (existingBalance.length === 0) {
        // Create new user balance
        await blink.db.userBalances.create({
          id: user.id,
          userId: user.id,
          balance: 100.0,
          totalWinnings: 0.0,
          totalBets: 0.0,
          gamesPlayed: 0
        })
        setBalance({
          userId: user.id,
          balance: 100.0,
          totalWinnings: 0.0,
          totalBets: 0.0,
          gamesPlayed: 0,
          updatedAt: new Date().toISOString()
        })
      } else {
        setBalance(existingBalance[0])
      }

      // Load game history
      const userGames = await blink.db.games.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 20
      })
      setGames(userGames)
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }, [user?.id])

  const scrapeProductPrice = async (url: string) => {
    setIsScrapingPrice(true)
    setError('')
    
    try {
      // Use Blink's data extraction to scrape the product page
      const pageContent = await blink.data.scrape(url)
      
      // Try to extract price from the scraped content
      const priceMatch = pageContent.markdown.match(/\$[\d,]+\.?\d*/g)
      
      if (priceMatch && priceMatch.length > 0) {
        // Get the first price found and clean it
        const priceStr = priceMatch[0].replace(/[$,]/g, '')
        const price = parseFloat(priceStr)
        
        if (price > 0) {
          // Try to extract product name from title or headings
          const nameMatch = pageContent.metadata.title || 
                           pageContent.extract.headings?.[0] || 
                           'Product'
          
          setProduct({
            url,
            name: nameMatch.substring(0, 100), // Limit length
            price
          })
          setShowManualPrice(false)
          return
        }
      }
      
      // If no price found, show manual input
      setShowManualPrice(true)
      setProduct({ url, name: pageContent.metadata.title || 'Product' })
      
    } catch (error) {
      console.error('Error scraping product:', error)
      setShowManualPrice(true)
      setProduct({ url, name: 'Product' })
    } finally {
      setIsScrapingPrice(false)
    }
  }

  const handleUrlSubmit = async () => {
    if (!productUrl.trim()) return
    
    // Basic URL validation
    try {
      new URL(productUrl)
    } catch {
      setError('Please enter a valid URL')
      return
    }
    
    await scrapeProductPrice(productUrl)
  }

  const handleManualPriceSubmit = () => {
    const price = parseFloat(manualPrice)
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price')
      return
    }
    
    setProduct(prev => prev ? { ...prev, price } : { url: productUrl, price })
    setShowManualPrice(false)
    setError('')
  }

  const handleDiceRoll = async (result: number) => {
    if (!product?.price || !balance || !user?.id) return

    setIsRolling(true)
    setDiceResult(result)
    
    const betAmount = product.price * 0.2
    const won = result === 6
    const payout = won ? product.price : 0

    try {
      // Create game record
      const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await blink.db.games.create({
        id: gameId,
        userId: user.id,
        productUrl: product.url,
        productName: product.name,
        productPrice: product.price,
        betAmount,
        diceRoll: result,
        won,
        payoutAmount: payout
      })

      // Update user balance
      const newBalance = balance.balance - betAmount + payout
      const newTotalWinnings = balance.totalWinnings + payout
      const newTotalBets = balance.totalBets + betAmount
      const newGamesPlayed = balance.gamesPlayed + 1

      await blink.db.userBalances.update(user.id, {
        balance: newBalance,
        totalWinnings: newTotalWinnings,
        totalBets: newTotalBets,
        gamesPlayed: newGamesPlayed
      })

      // Update local state
      setBalance({
        ...balance,
        balance: newBalance,
        totalWinnings: newTotalWinnings,
        totalBets: newTotalBets,
        gamesPlayed: newGamesPlayed
      })

      setGameResult({ won, payout: won ? payout : undefined })
      setShowResultModal(true)
      
      // Reload game history
      await loadUserData()
      
    } catch (error) {
      console.error('Error processing game:', error)
      setError('Error processing game. Please try again.')
    }
  }

  const resetGame = () => {
    setProduct(null)
    setProductUrl('')
    setManualPrice('')
    setShowManualPrice(false)
    setDiceResult(undefined)
    setGameResult(null)
    setIsRolling(false)
    setShowResultModal(false)
    setError('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-400 mx-auto" />
          <p className="text-gray-400">Loading Pipbib...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/50 border-border backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white neon-text">
              🎲 Pipbib
            </CardTitle>
            <p className="text-gray-400">Product Price Gambling</p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-300">
              Paste any product URL, pay 20% of the price, roll a dice, and win the full amount if you roll a 6!
            </p>
            <Button 
              onClick={() => blink.auth.login()}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold neon-glow"
            >
              Sign In to Play
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const betAmount = product?.price ? product.price * 0.2 : 0
  const canAffordBet = balance ? balance.balance >= betAmount : false

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white neon-text">
            🎲 Pipbib
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Paste any product URL, pay 20% of the price, roll a dice, and win the full purchase amount if you roll a 6!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* URL Input */}
            {!product && (
              <Card className="bg-card/50 border-border backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Link className="mr-2 h-5 w-5 text-orange-400" />
                    Enter Product URL
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-gray-300">
                      Product URL (Amazon, ASOS, etc.)
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="url"
                        value={productUrl}
                        onChange={(e) => setProductUrl(e.target.value)}
                        placeholder="https://www.amazon.com/product..."
                        className="bg-input border-border text-white placeholder-gray-400"
                        onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                      />
                      <Button 
                        onClick={handleUrlSubmit}
                        disabled={isScrapingPrice || !productUrl.trim()}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        {isScrapingPrice ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Scrape Price'
                        )}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <Alert className="border-red-500/50 bg-red-500/10">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-400">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Manual Price Input */}
            {showManualPrice && (
              <Card className="bg-card/50 border-border backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-orange-400" />
                    Enter Product Price
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="border-yellow-500/50 bg-yellow-500/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-yellow-400">
                      We couldn't automatically detect the price. Please enter it manually.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-gray-300">
                      Product Price (USD)
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={manualPrice}
                        onChange={(e) => setManualPrice(e.target.value)}
                        placeholder="99.99"
                        className="bg-input border-border text-white placeholder-gray-400"
                        onKeyPress={(e) => e.key === 'Enter' && handleManualPriceSubmit()}
                      />
                      <Button 
                        onClick={handleManualPriceSubmit}
                        disabled={!manualPrice.trim()}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Set Price
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product Display */}
            {product && product.price && (
              <ProductCard product={product} betAmount={betAmount} />
            )}

            {/* Dice Roll Section */}
            {product && product.price && (
              <Card className="bg-card/50 border-border backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Dice6 className="mr-2 h-5 w-5 text-orange-400" />
                    Roll for Victory!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!canAffordBet ? (
                    <Alert className="border-red-500/50 bg-red-500/10">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-400">
                        Insufficient balance. You need ${betAmount.toFixed(2)} to play this game.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="text-center space-y-2">
                        <p className="text-gray-300">
                          Bet Amount: <span className="text-orange-400 font-semibold">${betAmount.toFixed(2)}</span>
                        </p>
                        <p className="text-gray-300">
                          Potential Win: <span className="text-yellow-400 font-semibold">${product.price.toFixed(2)}</span>
                        </p>
                      </div>
                      
                      <Separator className="bg-border" />
                      
                      <DiceRoll 
                        onRoll={handleDiceRoll}
                        isRolling={isRolling}
                        result={diceResult}
                      />
                    </>
                  )}
                  
                  {(diceResult || gameResult) && (
                    <div className="text-center space-y-4">
                      <Separator className="bg-border" />
                      <Button 
                        onClick={resetGame}
                        variant="outline"
                        className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                      >
                        Play Again
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {balance && <BalanceCard balance={balance} />}
            <GameHistory games={games} />
          </div>
        </div>

        {/* Result Modal */}
        <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-white">
                {gameResult?.won ? (
                  <span className="text-yellow-400 neon-text">🎉 YOU WON! 🎉</span>
                ) : (
                  <span className="text-red-400">Better Luck Next Time!</span>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <div className="text-center space-y-4 py-4">
              {gameResult?.won ? (
                <>
                  <div className="space-y-2">
                    <p className="text-lg text-white">
                      Congratulations! You rolled a <span className="text-yellow-400 font-bold">6</span>!
                    </p>
                    <div className="flex items-center justify-center space-x-2">
                      <Trophy className="h-6 w-6 text-yellow-400" />
                      <Badge className="bg-yellow-500/20 text-yellow-400 text-lg px-4 py-2">
                        +${gameResult.payout?.toFixed(2)}
                      </Badge>
                      <Sparkles className="h-6 w-6 text-yellow-400" />
                    </div>
                    <p className="text-gray-300">
                      The full purchase amount has been added to your balance!
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-lg text-white">
                    You rolled a <span className="text-red-400 font-bold">{diceResult}</span>
                  </p>
                  <p className="text-gray-300">
                    You needed a 6 to win. Try again with another product!
                  </p>
                </>
              )}
              
              <Button 
                onClick={() => {
                  setShowResultModal(false)
                  resetGame()
                }}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold px-8 py-3"
              >
                Play Again
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default App