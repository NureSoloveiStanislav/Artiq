import React, { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import api from '../../api/axios';

type Item = {
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

const ItemsList: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        const response = await api.get('/items');
        setItems(response.data?.data || []);
        setError(null);
      } catch (err) {
        setError('Failed to load items. Please try again later.');
        console.error('Error loading items:', err);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  useEffect(() => {
    console.log(items);
  }, [items]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }

  return (
    <div className="items-grid">
      {Array.isArray(items) && items.length > 0 ? (
        items.map((item) => (
          <div key={item.item_id} className="item-card">
            <div key={item.item_id} className="item-card">
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="item-image"
                />
              )}
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="item-details">
                <span>Price: ${item.starting_price}</span>
                <span>Category: {item.category}</span>
                <span>Seller: {item.seller_name}</span>
                <span>Status: {item.status}</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No items found.</p>
      )}
    </div>
  );
};

export default ItemsList;