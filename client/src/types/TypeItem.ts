// In TypeItem.ts
export enum ItemStatus {
  ACTIVE = 'active',
  SOLD = 'sold'
}

export type TypeItem = {
  id: number,
  title: string,
  description: string,
  startingPrice: number,
  currentPrice: number | null,
  status: ItemStatus,
  firstBidTime: string | null,
  category: string,
  endTime: string | null,
  image: string | null,
  userId: number,
  sellerName?: string,
  lastBidderId?: number,
  lastBidderName?: string
};