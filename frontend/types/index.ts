export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  timezone?: string;
  locale?: string;
  settings?: Record<string, any>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  timezone?: string;
  locale?: string;
}

export interface Card {
  id: string;
  name: string;
  imageUrl: string;
  smallImageUrl: string;
  largeImageUrl: string;
  supertype: string;
  subtype: string;
  types: string[];
  hp: string;
  retreatCost: string[];
  number: string;
  artist: string;
  rarity: string;
  flavorText: string;
  setId: string;
  setName: string;
  setSeries: string;
  setTotalCards: number;
  setPrintedTotal: number;
  setReleaseDate: Date;
  abilities: any[];
  attacks: any[];
  weaknesses: any[];
  resistances: any[];
  legalities: any;
  variants: {
    normal: boolean;
    reverse: boolean;
    holo: boolean;
    firstEdition: boolean;
    wPromo: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CardPrice {
  id: string;
  cardId: string;
  tcgplayerNormalMarket: string;
  tcgplayerNormalLow: string;
  tcgplayerNormalMid: string;
  tcgplayerNormalHigh: string;
  tcgplayerNormalDirectLow: string;
  tcgplayerHolofoilMarket: string;
  tcgplayerHolofoilLow: string;
  tcgplayerHolofoilMid: string;
  tcgplayerHolofoilHigh: string;
  tcgplayerHolofoilDirectLow: string;
  tcgplayerReverseHolofoilMarket: string;
  tcgplayerReverseHolofoilLow: string;
  tcgplayerReverseHolofoilMid: string;
  tcgplayerReverseHolofoilHigh: string;
  tcgplayerReverseHolofoilDirectLow: string;
  tcgplayerFirstEditionNormalMarket: string;
  tcgplayerFirstEditionNormalLow: string;
  tcgplayerFirstEditionNormalMid: string;
  tcgplayerFirstEditionNormalHigh: string;
  tcgplayerFirstEditionNormalDirectLow: string;
  tcgplayerFirstEditionHolofoilMarket: string;
  tcgplayerFirstEditionHolofoilLow: string;
  tcgplayerFirstEditionHolofoilMid: string;
  tcgplayerFirstEditionHolofoilHigh: string;
  tcgplayerFirstEditionHolofoilDirectLow: string;
  cardmarketAvg1: string;
  cardmarketAvg7: string;
  cardmarketAvg30: string;
  cardmarketLow: string;
  cardmarketTrend: string;
  cardmarketSuggestedPrice: string;
  createdAt: Date;
}

export enum CollectionVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
  UNLISTED = 'unlisted',
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  visibility: CollectionVisibility;
  colorTheme?: string;
  icon?: string;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum CardCondition {
  MINT = 'mint',
  NEAR_MINT = 'near-mint',
  LIGHTLY_PLAYED = 'lightly-played',
  MODERATELY_PLAYED = 'moderately-played',
  HEAVILY_PLAYED = 'heavily-played',
  DAMAGED = 'damaged',
}

export interface CollectionCard {
  id: string;
  collectionId: string;
  cardId: string;
  card: Card; // Populated card data
  quantity: number;
  quantityFoil: number;
  purchasePrice?: number;
  condition?: CardCondition;
  language?: string;
  isGraded: boolean;
  gradeCompany?: string;
  gradeValue?: string;
  notes?: string;
  acquiredDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  prices: CardPrice;
}

export interface CreateCollectionDto {
  name: string;
  description?: string;
  visibility?: CollectionVisibility;
  colorTheme?: string;
  icon?: string;
  settings?: Record<string, any>;
}

export interface EditCollectionDto {
  name: string;
  description?: string;
  visibility?: CollectionVisibility;
  colorTheme?: string;
  icon?: string;
  settings?: Record<string, any>;
}

export interface AddCardToCollectionDto {
  cardId: string;
  normalQuantity?: number;
  holoQuantity?: number;
  reverseQuantity?: number;
  firstEditionQuantity?: number;
  wPromoQuantity?: number;
  purchasePrice?: number;
  condition?: CardCondition;
  language?: string;
  isGraded?: boolean;
  gradeCompany?: string;
  gradeValue?: string;
  notes?: string;
  acquiredDate?: string;
}

export interface UpdateCollectionCardDto extends Partial<AddCardToCollectionDto> {}

export interface GetCardsFilter {
  page?: number;
  limit?: number;
  search?: string;
  set?: string;
  rarity?: string;
  type?: string;
  supertype?: string;
}

export interface SearchCardsFilter {
  name?: string;
  sets?: string[];
  types?: string[];
  rarities?: string[];
  hpRange?: { min?: number; max?: number };
  priceRange?: { min?: number; max?: number };
  artist?: string;
  hasAbilities?: boolean;
  retreatCost?: { min?: number; max?: number };
}

export interface SearchCardsSort {
  field: string;
  order: 'ASC' | 'DESC';
}

export interface SearchCardsDto {
  filters?: SearchCardsFilter;
  sort?: SearchCardsSort;
  page?: number;
  limit?: number;
}

export interface PokemonSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  releaseDate: Date;
  symbolUrl: string;
  logoUrl: string;
}

export interface UserStats {
  totalCollections: number;
  totalCardsOwned: number;
  totalUniqueCardsOwned: number;
  totalEstimatedValue: number;
  totalPurchasePrice: number;
  profitLoss: number;
  setsCompletedCount: number;
  setsInProgressCount: number;
  overallCompletionPercentage: number;
}

export interface CollectionStats {
  totalCards: number;
  totalUniqueCards: number;
  totalNormalQuantity: number;
  totalHoloQuantity: number;
  totalReverseQuantity: number;
  totalFirstEditionQuantity: number;
  totalWPromoQuantity: number;
}

export interface ValueStats {
  totalEstimatedValue: number;
  totalHolofoilValue: number;
  profitLoss: number;
  totalQuantity: number;
}

export interface DashboardStats {
  user: UserStats;
}

export interface CollectionSummaryStats {
  collection: CollectionStats;
}
