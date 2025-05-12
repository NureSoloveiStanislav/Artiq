// client/src/components/ItemCard/ItemCard.tsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { TypeItem } from '../../types/TypeItem';
import api from '../../api/axios';
import './ItemCard.scss';
import BidModal from '../BidModal/BidModal';
import { ItemStatus } from '../../enums/ItemStatus';

interface ItemCardProps {
  item: TypeItem;
  currentUserId: number | undefined;
  onItemUpdated: (updatedItem: TypeItem) => void;
}

// Extended TypeItem to include last bidder information
interface ExtendedTypeItem extends TypeItem {
  lastBidderId?: number;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, currentUserId, onItemUpdated }) => {
  const [showBidModal, setShowBidModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [winner, setWinner] = useState<any>(null);
  const [extendedItem, setExtendedItem] = useState<ExtendedTypeItem>(item);

  useEffect(() => {
    setExtendedItem(item as ExtendedTypeItem);
    console.log('logs: ' + item);
    console.log(item);
  }, [item]);

  useEffect(() => {
    // If the item has an end time, calculate time remaining
    if (item.endTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const end = new Date(item.endTime || '');
        const diff = end.getTime() - now.getTime();
        
        if (diff <= 0) {
          setTimeLeft('Auction ended');
          setAuctionEnded(true);
          clearInterval(interval);
          handleAuctionEnd();
        } else {
          // Format the remaining time
          const seconds = Math.floor((diff / 1000) % 60);
          const minutes = Math.floor((diff / 1000 / 60) % 60);
          setTimeLeft(`${minutes}m ${seconds}s`);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [item.endTime]);

  // Poll for updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/items/${item.id}`); // исправлено с /api/items/${item.id}
        if (response.data) {
          onItemUpdated(response.data);
        }
      } catch (error) {
        console.error('Error polling for item updates:', error);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [item.id, onItemUpdated]);

  const handleBidClick = () => {
    setShowBidModal(true);
  };

  const handleBidPlaced = async (itemId: number, amount: number) => {
    try {
      const response = await api.post('/bids', {
        itemId,
        amount,
        userId: currentUserId
      });
      
      if (response.data.status === 'success') {
        // Update the item with new current price and last bidder info
        const updatedItem = {
          ...response.data.data.item,
          lastBidderId: currentUserId // Add the current user as last bidder
        };
        
        setExtendedItem(updatedItem);
        onItemUpdated(response.data.data.item);
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      alert('Failed to place bid. Please try again.');
    }
  };

  const handleAuctionEnd = async () => {
    try {
      if (item.status !== 'sold') {
        const response = await api.put(`/items/${item.id}/close`);
        if (response.data.status === 'success') {
          setWinner(response.data.data.winner);
          
          // Update item status
          const updatedItem = {
            ...item,
            status: ItemStatus.SOLD  // Using the enum constant instead of string
          };
          onItemUpdated(updatedItem);
        }
      }
    } catch (error) {
      console.error('Error closing auction:', error);
    }
  };

  // Calculate minimum bid amount (10% higher than current price)
  const getMinimumBidAmount = (): number => {
    const basePrice = item.currentPrice || item.startingPrice;
    return Math.ceil(basePrice * 1.1 * 100) / 100; // Round up to 2 decimal places
  };

  // Check if current user is the last bidder
  const isCurrentUserLastBidder = (): boolean => {
    return currentUserId !== undefined && extendedItem.lastBidderId === currentUserId;
  };

  const isOwner = currentUserId === item.userId;
  const currentPrice = item.currentPrice || item.startingPrice;
  const isSold = item.status === 'sold';

  return (
    <Card className="item-card mb-4">
      {item.image && (
        <Card.Img 
          variant="top" 
          src={item.image} 
          alt={item.title} 
          className="item-image"
        />
      )}
      <Card.Body>
        <Card.Title>{item.title}</Card.Title>
        <Card.Text>{item.description}</Card.Text>
        
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <Badge bg="info">{item.category}</Badge>
            <Badge bg={isSold ? "secondary" : "success"} className="ms-2">
              {isSold ? "Sold" : "Active"}
            </Badge>
          </div>
          
          <div className="price-info">
            <div>Current price: ${currentPrice.toFixed(2)}</div>
            {timeLeft && <div className="time-left">Time left: {timeLeft}</div>}
          </div>
        </div>
        
        {winner && (
          <div className="winner-info mt-3">
            <Badge bg="warning" text="dark">
              Winner: {winner.name} - ${winner.amount.toFixed(2)}
            </Badge>
          </div>
        )}
        
        {!isOwner && !isSold && !auctionEnded && (
          <Button 
            variant="primary" 
            className="mt-3 w-100"
            onClick={handleBidClick}
            disabled={!currentUserId}
          >
            Place a Bid
          </Button>
        )}
        
        {!currentUserId && (
          <Card.Text className="text-muted mt-2 text-center">
            Sign in to place bids
          </Card.Text>
        )}
      </Card.Body>
      
      <BidModal 
        show={showBidModal}
        onHide={() => setShowBidModal(false)}
        item={item}
        onBidPlaced={handleBidPlaced}
        isLastBidder={isCurrentUserLastBidder()}
      />
    </Card>
  );
};

export default ItemCard;