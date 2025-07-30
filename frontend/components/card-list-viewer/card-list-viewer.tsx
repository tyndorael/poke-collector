'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, Collection, AddCardToCollectionDto } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card as UICard, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Eye, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface CardListViewerProps {
  cards: Card[];
  collections: Collection[];
  selectedCollection: string;
  className?: string;
}

interface CardDetailDialogProps {
  card: Card;
  selectedCollection: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface VariantQuantities {
  normalQuantity: number;
  holoQuantity: number;
  reverseQuantity: number;
  firstEditionQuantity: number;
  wPromoQuantity: number;
}

const CardDetailDialog = ({ card, selectedCollection, isOpen, onOpenChange }: CardDetailDialogProps) => {
  const [dialogImageSrc, setDialogImageSrc] = useState(
    card.largeImageUrl || card.imageUrl || '/pkm_placeholder.webp'
  );
  const [quantities, setQuantities] = useState<VariantQuantities>({
    normalQuantity: 0,
    holoQuantity: 0,
    reverseQuantity: 0,
    firstEditionQuantity: 0,
    wPromoQuantity: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuantityChange = (variant: keyof VariantQuantities, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [variant]: Math.max(0, prev[variant] + change)
    }));
  };

  const handleAddToCollection = async () => {
    if (!selectedCollection) {
      toast('Please select a collection from the page');
      return;
    }

    const totalQuantity = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
    if (totalQuantity === 0) {
      toast('Please add at least one card variant');
      return;
    }

    setIsSubmitting(true);
    try {
      const data: AddCardToCollectionDto = {
        cardId: card.id,
        normalQuantity: quantities.normalQuantity,
        holoQuantity: quantities.holoQuantity,
        reverseQuantity: quantities.reverseQuantity,
        firstEditionQuantity: quantities.firstEditionQuantity,
        wPromoQuantity: quantities.wPromoQuantity,
      };

      await api.post(`/collections/${selectedCollection}/cards`, data);
      toast('Card added to collection successfully!');
      
      // Reset quantities after successful addition
      setQuantities({
        normalQuantity: 0,
        holoQuantity: 0,
        reverseQuantity: 0,
        firstEditionQuantity: 0,
        wPromoQuantity: 0,
      });
    } catch (error) {
      console.error('Error adding card to collection:', error);
      toast('Failed to add card to collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const VariantRow = ({ 
    label, 
    variant, 
    available 
  }: { 
    label: string; 
    variant: keyof VariantQuantities;
    available: boolean;
  }) => {
    if (!available) return null;

    return (
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <span className="font-medium">{label}</span>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuantityChange(variant, -1)}
            disabled={quantities[variant] === 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center font-medium">
            {quantities[variant]}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuantityChange(variant, 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{card.name}</DialogTitle>
          <DialogDescription>
            {card.setName} • #{card.number}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card Image */}
          <div className="flex justify-center lg:col-span-1">
            <Image
              src={dialogImageSrc}
              alt={card.name}
              width={300}
              height={420}
              className="rounded-lg shadow-lg"
              style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
              onError={() => setDialogImageSrc('/pkm_placeholder.webp')}
            />
          </div>
          
          {/* Card Details */}
          <div className="space-y-4 lg:col-span-1">
            <div>
              <h3 className="font-semibold text-lg mb-2">Basic Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{card.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Number:</span>
                  <span>#{card.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rarity:</span>
                  <Badge variant="secondary">{card.rarity}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Supertype:</span>
                  <span>{card.supertype}</span>
                </div>
                {card.subtype && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtype:</span>
                    <span>{card.subtype}</span>
                  </div>
                )}
                {card.hp && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">HP:</span>
                    <span>{card.hp}</span>
                  </div>
                )}
                {card.artist && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Artist:</span>
                    <span>{card.artist}</span>
                  </div>
                )}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Set Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Set Name:</span>
                  <span className="font-medium">{card.setName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Series:</span>
                  <span>{card.setSeries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Cards:</span>
                  <span>{card.setTotalCards}</span>
                </div>
                {card.setReleaseDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Release Date:</span>
                    <span>{new Date(card.setReleaseDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
            
            {card.types && card.types.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {card.types.map((type, index) => (
                      <Badge key={index} variant="outline">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {card.flavorText && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Flavor Text</h3>
                  <p className="text-sm text-muted-foreground italic">
                    {card.flavorText}
                  </p>
                </div>
              </>
            )}

            {selectedCollection ? (
                <>
                <Separator />
                <div>
                  <div className="space-y-3">
                    <VariantRow
                      label="Normal"
                      variant="normalQuantity"
                      available={card.variants.normal}
                    />
                    
                    <VariantRow
                      label="Holofoil"
                      variant="holoQuantity"
                      available={card.variants.holo}
                    />
                    
                    <VariantRow
                      label="Reverse Holo"
                      variant="reverseQuantity"
                      available={card.variants.reverse}
                    />
                    
                    <VariantRow
                      label="1st Edition"
                      variant="firstEditionQuantity"
                      available={card.variants.firstEdition}
                    />
                    
                    <VariantRow
                      label="W Promo"
                      variant="wPromoQuantity"
                      available={card.variants.wPromo}
                    />
                  </div>

                  <Button
                    onClick={handleAddToCollection}
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? 'Adding...' : 'Add to Collection'}
                  </Button>
                </div>
                </>    
              ) : (
                <div className="text-center text-muted-foreground text-sm p-4 border border-dashed rounded-lg">
                  <p>Please select a collection from the page above to add cards.</p>
                </div>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CardItem = ({ card, selectedCollection }: { card: Card; selectedCollection: string }) => {
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [cardImageSrc, setCardImageSrc] = useState(
    card.smallImageUrl || card.imageUrl || '/pkm_placeholder.webp'
  );

  return (
    <>
      <UICard className="group hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="p-0">
          <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
            <Image
              src={cardImageSrc}
              alt={card.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setCardImageSrc('/pkm_placeholder.webp')}
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-4 space-y-3">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
              {card.name}
            </h3>
            
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between items-center">
                <span>Set:</span>
                <span className="font-medium text-foreground line-clamp-1">
                  {card.setName}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Number:</span>
                <span className="font-medium text-foreground">#{card.number}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Rarity:</span>
                <Badge variant="secondary" className="text-xs">
                  {card.rarity}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsDetailDialogOpen(true)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Details
            </Button>
          </div>
        </CardContent>
      </UICard>
      
      <CardDetailDialog
        card={card}
        selectedCollection={selectedCollection}
        isOpen={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />
    </>
  );
};

export const CardListViewer = ({ cards, selectedCollection, className }: CardListViewerProps) => {
  if (!cards || cards.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 text-center ${className || ''}`}>
        <div className="text-muted-foreground">
          <div className="text-lg font-medium mb-2">No cards found</div>
          <div className="text-sm">There are no cards to display.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${className || ''}`}>
      {cards.map((card) => (
        <CardItem key={card.id} card={card} selectedCollection={selectedCollection} />
      ))}
    </div>
  );
};
