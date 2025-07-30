import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CardPrice } from '@/types';

export function SectionCardPrices({ prices }: { prices: CardPrice }) {
  const keys = Object.keys(prices);
  const priceCards = keys.map((key) => {
    if (parseFloat(prices[key]) > 0) {
      return (
        <Card key={prices.cardId + '-' + key} className="@container/card">
          <CardHeader>
            <CardDescription>{key} price</CardDescription>
            <CardTitle className="text-1xl font-semibold tabular-nums @[250px]/card:text-3xl">${prices[key]}</CardTitle>
          </CardHeader>
        </Card>
      );
    }
  });
  return (
    <div className="">
      {priceCards}
      {parseFloat(prices.tcgplayerNormalMarket) > 0 ? (
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Normal market price</CardDescription>
            <CardTitle className="text-1xl font-semibold tabular-nums @[250px]/card:text-3xl">
              ${prices.tcgplayerNormalMarket}
            </CardTitle>
          </CardHeader>
        </Card>
      ) : null}
    </div>
  );
}
