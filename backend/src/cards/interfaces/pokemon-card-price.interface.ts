interface PokemonCardInfo {
  name: string;
  tcgplayer?: {
    prices?: {
      normal?: TcgPlayerPrices;
      reverseHolo?: TcgPlayerPrices;
      holofoil?: TcgPlayerPrices;
      firstEditionHolofoil?: TcgPlayerPrices;
      firstEditionNormal?: TcgPlayerPrices;
    };
  };
  cardmarket?: { prices?: CardMarketPrices };
}

interface TcgPlayerPrices {
  low: number;
  mid: number;
  high: number;
  market: number;
  directLow: number;
}

interface CardMarketPrices {
  avg1: number;
  avg7: number;
  avg30: number;
  reverseHoloAvg1: number;
  reverseHoloAvg7: number;
  reverseHoloAvg30: number;
  reverseHoloSell: number;
  reverseHoloLow: number;
  reverseHoloTrend: number;
  averageSellPrice: number;
  lowPrice: number;
  trendPrice: number;
  suggestedPrice: number;
  germanProLow: number;
  lowPriceExPlus: number;
}

export interface PokemonCardResponseData {
  data: PokemonCardInfo;
}
