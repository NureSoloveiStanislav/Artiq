import React, { FC, useEffect, useState } from 'react';
import { Alert, Button, Form, Row, Col, InputGroup, Badge } from 'react-bootstrap';
import api from '../../api/axios';
import { TypeNewItem } from '../../types/TypeNewItem';
import BidModal from '../BidModal/BidModal';
import { TypeItem } from '../../types/TypeItem';
import { ItemStatus } from '../../types/TypeItem';
import './ItemsList.scss';
import AddReviewModal from '../AddReviewModal/AddReviewModal';
import { Link } from 'react-router-dom';

type TypeItemsList = {
  items: TypeItem[],
  userId?: number, // Current user ID
  userName?: string, // Current user name
  openAddItemModal: () => void,
}

// Extended to include last bidder info
type ExtendedTypeItem = TypeItem & {
  lastBidderName?: string;
  lastBidderId?: number;
}

const ItemsList: FC<TypeItemsList> = ({ openAddItemModal, items, userId, userName }) => {
  const [bidItem, setBidItem] = useState<ExtendedTypeItem | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [auctionItems, setAuctionItems] = useState<ExtendedTypeItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [itemForReview, setItemForReview] = useState<ExtendedTypeItem | undefined>(undefined);

  // Filter states
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showOnlyActive, setShowOnlyActive] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    setAuctionItems(items as ExtendedTypeItem[]);

    // Extract unique categories from items
    const uniqueCategories = Array.from(new Set(items.map(item => item.category)));
    setCategories(uniqueCategories);
  }, [items]);

  // Filter items based on selected filters
  const filteredItems = auctionItems.filter(item => {
    // Filter by category
    const categoryMatch = selectedCategory ? item.category === selectedCategory : true;

    // Filter by status
    const statusMatch = showOnlyActive ? item.status === ItemStatus.ACTIVE : true;

    // Filter by search query
    const searchMatch = searchQuery
      ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return categoryMatch && statusMatch && searchMatch;
  });

  // Check on component mount and when items change if user is the last bidder
  // on any item to keep the bid modal open
  useEffect(() => {
    if (userId) {
      const userLastBidItem = auctionItems.find(item =>
        item.status === ItemStatus.ACTIVE && item.lastBidderId === userId
      );

      if (userLastBidItem && !showBidModal) {
        setBidItem(userLastBidItem);
        setShowBidModal(true);
      }
    }
  }, [auctionItems, userId]);

  const handleOpenBidModal = (item: ExtendedTypeItem) => {
    setBidItem(item);
    setShowBidModal(true);
  };

  const handleCloseBidModal = () => {
    // Only close the modal if the current user is not the last bidder
    if (bidItem?.lastBidderId !== userId) {
      setShowBidModal(false);
      setBidItem(null);
    }
  };

  const handleBidPlaced = async (itemId: number, amount: number) => {
    try {
      console.log('Placing bid:', { itemId, amount, userId });

      if (!userId) {
        setError('You must be logged in to place a bid.');
        return;
      }

      const response = await api.post('/bids', {
        itemId: itemId,
        amount: amount,
        userId: userId
      });

      console.log('Bid response:', response.data);

      if (response.data.status === 'success') {
        // Get the updated item data from the response
        const updatedItem = response.data.data.item;

        // Update the item in the local state with server data
        setAuctionItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId
              ? {
                ...item,
                currentPrice: updatedItem.currentPrice,
                firstBidTime: updatedItem.firstBidTime,
                endTime: updatedItem.endTime, // Use server-provided end time
                lastBidderName: updatedItem.lastBidderName,
                lastBidderId: updatedItem.lastBidderId
              }
              : item
          )
        );
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      setError('Failed to place bid. Please try again.');
    }
  };

  const closeAuction = async (itemId: number) => {
    try {
      console.log(`Closing auction for item ${itemId}...`);
      const response = await api.put(`/items/${itemId}/close`);

      if (response.data.status === 'success') {
        console.log(`Successfully closed auction for item ${itemId}`);

        // Update the item in the local state
        setAuctionItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId
              ? {
                ...item,
                status: ItemStatus.SOLD
              }
              : item
          )
        );

        const closedItem = auctionItems.find(item => item.id === itemId);

        // If the closed auction is the current bidding item, close the modal
        if (bidItem?.id === itemId) {
          setShowBidModal(false);
          setBidItem(null);
        }
        if (closedItem?.lastBidderId === userId) {
          setShowReviewModal(true);
          setItemForReview(closedItem);
        }
      } else {
        console.error('Error closing auction:', response.data);
      }
    } catch (error) {
      console.error('Error closing auction:', error);
    }
  };

  // Also update the timer logic to actually close auctions when time expires
  useEffect(() => {
    // Set up timers for items with active auctions
    const timers: NodeJS.Timeout[] = [];

    auctionItems.forEach(item => {
      if (item.status === ItemStatus.ACTIVE && item.firstBidTime) {
        // Use the server-provided endTime instead of calculating it
        const endTime = item.endTime ? new Date(item.endTime) : new Date(new Date(item.firstBidTime).getTime() + 60000);
        const now = new Date();
        const timeLeft = Math.max(0, endTime.getTime() - now.getTime());

        if (timeLeft > 0) {
          // Set timer to close the auction when time expires
          const timer = setTimeout(() => {
            closeAuction(item.id);
          }, timeLeft);

          timers.push(timer);
        } else if (timeLeft === 0) {
          // If time has already expired, close the auction immediately
          closeAuction(item.id);
        }
      }
    });

    // Cleanup timers when component unmounts or items change
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [auctionItems]);

  const getTimeRemaining = (firstBidTime: string, endTime?: string) => {
    // If no first bid time, there's no timer
    if (!firstBidTime) return null;

    // Use the server-provided endTime if available, otherwise calculate from firstBidTime
    const auctionEndTime = endTime
      ? new Date(endTime)
      : new Date(new Date(firstBidTime).getTime() + 60000);

    const now = new Date();
    const timeLeft = Math.max(0, auctionEndTime.getTime() - now.getTime());

    if (timeLeft <= 0) return 'Auction ended';

    const seconds = Math.floor((timeLeft / 1000) % 60);
    return `${seconds}s remaining`;
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory('');
    setShowOnlyActive(true);
    setSearchQuery('');
  };


// Update the part where you check if the user is the last bidder

// In the ItemsList component, improve the check for determining if the user is the last bidder
  const isUserLastBidder = (item: ExtendedTypeItem): boolean => {
    // Only return true if both IDs are valid numbers and they match
    return (
      typeof userId === 'number' &&
      userId > 0 &&
      typeof item.lastBidderId === 'number' &&
      item.lastBidderId > 0 &&
      userId === item.lastBidderId
    );
  };

  const getBidItemWithLatestData = (originalItem: ExtendedTypeItem): ExtendedTypeItem => {
    // Try to find the most up-to-date version of this item in our auctionItems state
    const updatedItem = auctionItems.find(item => item.id === originalItem.id);
    return updatedItem || originalItem;
  };

  return (
    <div>
      <div className="filter-section mb-4">
        <h3>Filter Auctions</h3>
        <Row>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Check
                type="switch"
                id="status-switch"
                label="Show only active auctions"
                checked={showOnlyActive}
                onChange={(e) => setShowOnlyActive(e.target.checked)}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Search</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by title or description"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearchQuery('')}
                  >
                    ×
                  </Button>
                )}
              </InputGroup>
            </Form.Group>
          </Col>
          <Col md={2} className="d-flex align-items-end">
            <Button
              variant="secondary"
              onClick={handleResetFilters}
              className="mb-3"
            >
              Reset Filters
            </Button>
          </Col>
        </Row>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="items-grid">
        <div>
          <Button
            variant="outline-secondary"
            onClick={() => openAddItemModal()}
            className="create-button"
          >
            +
          </Button>
        </div>

        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="item-card">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="item-image"
                />
              )}
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              {item.currentPrice && !isNaN(item.currentPrice) && (
                <div className="price-info">
                  <span>Current Price: ${Number(item.currentPrice).toFixed(2)}</span>
                  {item.lastBidderName && (
                    <Badge bg="info">Last bid by: {item.lastBidderName}</Badge>
                  )}
                </div>
              )}
              <div className="item-details">
                <span> Starting Price: ${item.startingPrice && !isNaN(item.startingPrice)
                  ? Number(item.startingPrice).toFixed(2)
                  : '0.00'}</span>

                <span>Category: {item.category}</span>
                <span>Seller: {item.userId ? (
                  <Link
                    to={`/users/${item.userId}`}
                    className="seller-link"
                  >{item.sellerName}</Link>
                ) : (
                  item.sellerName
                )}</span>
                <span className={`status-badge ${item.status}`}>
                  Status: {item.status}
                </span>
                {item.firstBidTime && item.endTime && (
                  <span className="auction-timer">
                    {getTimeRemaining(item.firstBidTime, item.endTime)}
                  </span>
                )}
              </div>
              {/* Only show bid button if item is active and user is not the seller */}
              {item.status === ItemStatus.ACTIVE && userId && userId !== item.userId && (
                <Button
                  variant="primary"
                  onClick={() => handleOpenBidModal(item)}
                  className="bid-button"
                >
                  Place Bid
                </Button>
              )}
            </div>
          ))
        ) : (
          <p>No items match your filters. <Button variant="link" onClick={handleResetFilters}>Reset filters</Button></p>
        )}
      </div>
      {showBidModal && bidItem && (
        <BidModal
          show={showBidModal}
          onHide={handleCloseBidModal}
          item={getBidItemWithLatestData(bidItem)}
          onBidPlaced={handleBidPlaced}
          isLastBidder={isUserLastBidder(getBidItemWithLatestData(bidItem))}
          userId={userId}
        />
      )}
      {showReviewModal && itemForReview && (
        <AddReviewModal
          show={showReviewModal}
          onHide={() => setShowReviewModal(false)}
          sellerId={itemForReview?.userId || 0}
          sellerName={itemForReview?.sellerName || ''}
          itemId={itemForReview?.id || 0}
          itemTitle={itemForReview?.title || ''}
          buyerId={userId || 0}
        />
      )
      }
    </div>
  );
};

export default ItemsList;