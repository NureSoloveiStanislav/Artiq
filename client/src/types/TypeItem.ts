import { ItemStatus } from '../enums/ItemStatus';

export type TypeItem = {
  id: number,
  title: string,
  description: string,
  startingPrice: 0,
  currentPrice: number | null,
  status: ItemStatus,
  firstBidTime: string | null,
  category: string,
  endTime: string | null,
  image: string | null,
};