import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import type { ProductInfo } from '@/types/game'

interface ProductCardProps {
  product: ProductInfo
  betAmount: number
}

export function ProductCard({ product, betAmount }: ProductCardProps) {
  return (
    <Card className="bg-card/50 border-border backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {product.image && (
            <img 
              src={product.image} 
              alt={product.name || 'Product'} 
              className="w-20 h-20 object-cover rounded-lg border border-border"
            />
          )}
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-white line-clamp-2">
                {product.name || 'Product'}
              </h3>
              <a 
                href={product.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                ${product.price?.toFixed(2) || '0.00'}
              </Badge>
              <span className="text-gray-400 text-sm">Full Price</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                ${betAmount.toFixed(2)}
              </Badge>
              <span className="text-gray-400 text-sm">Your Bet (20%)</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/50">
          <p className="text-sm text-gray-300">
            <span className="text-orange-400 font-semibold">Win Condition:</span> Roll a 6 to win the full ${product.price?.toFixed(2)} purchase amount!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}