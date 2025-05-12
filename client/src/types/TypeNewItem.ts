export type TypeNewItem = {
  item_id: number;
  title: string;
  description: string;
  starting_price: number;
  status: 'active' | 'sold';
  category: string;
  image_url: string | null;
  seller_name: string;
  created_at: string;
};