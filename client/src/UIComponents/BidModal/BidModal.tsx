import React, { useEffect, useRef, useState } from 'react';
import { Alert, Badge, Button, Form, Modal } from 'react-bootstrap';
import { TypeItem, ItemStatus } from '../../types/TypeItem';
import api from '../../api/axios';

type BidModalProps = {
  show: boolean;
  onHide: () => void;
  item: TypeItem;
  onBidPlaced: (itemId: number, amount: number) => void;
  isLastBidder: boolean;
  userId?: number;
};

const BidModal: React.FC<BidModalProps> = ({
                                             show,
                                             onHide,
                                             item,
                                             onBidPlaced,
                                             isLastBidder,
                                             userId
                                           }) => {
  const [bidAmount, setBidAmount] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [currentItem, setCurrentItem] = useState<TypeItem>(item);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [auctionEndedMessageShown, setAuctionEndedMessageShown] = useState<boolean>(false);

  // Update current item when item prop changes
  useEffect(() => {
    setCurrentItem(item);
  }, [item]);

  // Determine if current user is the highest bidder
  const isCurrentBidder = React.useMemo(() => {
    return (
      userId !== null &&
      typeof currentItem.lastBidderId === 'number' &&
      userId === currentItem.lastBidderId
    );
  }, [currentItem.lastBidderId, userId]);

  // Handle auction ending
  useEffect(() => {
    // Check if the auction has ended based on the status or time remaining
    const isAuctionEnded =
      currentItem.status === ItemStatus.SOLD ||
      (timeLeft !== null && timeLeft <= 0);

    if (isAuctionEnded) {
      console.log('Auction has ended');

      onHide();
    }
  }, [currentItem.status, timeLeft, isCurrentBidder, onHide, auctionEndedMessageShown, item]);

  // В эффекте для опроса обновлений, добавьте явное закрытие окна, когда элемент помечен как SOLD
  useEffect(() => {
    if (!show || !item || !item.id) return;

    const fetchItemUpdates = async () => {
      try {
        const response = await api.get(`/items/${item.id}`);
        if (response.data) {
          // console.log('Updated item data:', response.data);

          // Check if status changed to SOLD
          // if (response.data.status === ItemStatus.SOLD &&
          //   currentItem.status !== ItemStatus.SOLD) {
          //   console.log('Item was sold, closing modal now...');
          //   onHide();
          // }

          setCurrentItem(response.data);

          // Show outbid message if needed
          if (response.data.lastBidderId &&
            userId !== response.data.lastBidderId &&
            response.data.status !== ItemStatus.SOLD) {
            setError(`You've been outbid! ${response.data.lastBidderName} is now the highest bidder.`);
          } else if (response.data.status !== ItemStatus.SOLD) {
            // Only clear error if auction is still active and not outbid
            setError(null);
          }
        }
      } catch (error) {
        console.error('Error fetching item updates:', error);
      }
    };

    // Остальная часть кода без изменений...

    // Initial fetch immediately when modal opens
    fetchItemUpdates();

    // Set up polling interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(fetchItemUpdates, 1000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [show, item?.id, userId, currentItem.status, isCurrentBidder, onHide]);

  // Time remaining calculation
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!show) return;

    const updateTimeLeft = () => {
      let endTimeValue;

      if (currentItem.endTime) {
        endTimeValue = new Date(currentItem.endTime);
      } else if (currentItem.firstBidTime) {
        endTimeValue = new Date(new Date(currentItem.firstBidTime).getTime() + 60000);
      } else {
        return false;
      }

      const now = new Date();
      const remaining = Math.max(0, endTimeValue.getTime() - now.getTime());
      setTimeLeft(remaining);

      // If time has run out and the item is still active, trigger notification
      if (remaining <= 0 && currentItem.status === ItemStatus.ACTIVE) {
        console.log('Timer reached zero, auction should end soon');
      }

      return remaining > 0;
    };

    // Initial update
    const hasTimeLeft = updateTimeLeft();
    if (!hasTimeLeft) return;

    // Set up the interval for updating time
    timerRef.current = setInterval(() => {
      const hasTimeLeft = updateTimeLeft();
      if (!hasTimeLeft && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [show, currentItem.endTime, currentItem.firstBidTime, currentItem.status]);

  // Bid submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bidAmount) {
      setError('Please enter a bid amount');
      return;
    }

    if (bidAmount < getMinimumBidAmount(currentItem)) {
      setError(`Bid amount must be at least $${getMinimumBidAmount(currentItem).toFixed(2)}`);
      return;
    }

    if (!currentItem || !currentItem.id) {
      setError('Item data is missing or incomplete. Please try again.');
      console.error('currentItem is missing id:', currentItem);
      return;
    }

    try {
      await onBidPlaced(currentItem.id, bidAmount);

      // Get updated data after placing bid
      try {
        const response = await api.get(`/items/${currentItem.id}`);
        if (response.data) {
          setCurrentItem(response.data);
        }
      } catch (fetchError) {
        console.error('Error fetching updated item data:', fetchError);
      }

      setError(null);
    } catch (error) {
      console.error('Error placing bid:', error);
      setError('Failed to place bid. Please try again.');
    }
  };

  const formatTimeLeft = () => {
    if (timeLeft === null) return '';
    if (timeLeft <= 0) return 'Auction has ended';
    const seconds = Math.floor((timeLeft / 1000) % 60);
    return `${seconds} seconds remaining`;
  };

  // Calculate minimum bid amount
  const getMinimumBidAmount = (item: TypeItem): number => {
    const basePrice = item.currentPrice || item.startingPrice;
    return Math.ceil(basePrice * 1.1 * 100) / 100; // Round up to 2 decimal places
  };

  // Set initial bid amount
  useEffect(() => {
    if (show) {
      setBidAmount(getMinimumBidAmount(currentItem));
    }
  }, [show, currentItem]);

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton={!isCurrentBidder || auctionEndedMessageShown}>
        <Modal.Title>
          {isCurrentBidder
            ? 'You are the highest bidder!'
            : `Place Bid on ${currentItem.title}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <div className="mb-3">
          <p>
            <strong>Current Price:</strong> ${
            typeof currentItem.currentPrice === 'number'
              ? currentItem.currentPrice.toFixed(2)
              : typeof currentItem.startingPrice === 'number'
                ? currentItem.startingPrice.toFixed(2)
                : '0.00'
          }
          </p>
          <p>
            <strong>Minimum Bid:</strong> ${
            getMinimumBidAmount(currentItem).toFixed(2)
          }
          </p>

          {currentItem.lastBidderName && (
            <p>
              <strong>Last Bidder:</strong>{' '}
              {isCurrentBidder ? (
                <Badge bg="success">You</Badge>
              ) : (
                <Badge bg="info">{currentItem.lastBidderName}</Badge>
              )}
            </p>
          )}

          {currentItem.endTime && (
            <div className="auction-timer-modal">
              <strong>Time Remaining:</strong> {formatTimeLeft()}
              {timeLeft !== null && timeLeft > 0 && (
                <div className="progress mt-2">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${(timeLeft / 60000) * 100}%` }}
                    aria-valuenow={(timeLeft / 60000) * 100}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
              )}
            </div>
          )}
          {timeLeft !== null && timeLeft <= 0 && currentItem.status === ItemStatus.SOLD && (
            <Alert variant={isCurrentBidder ? 'success' : 'info'} className="mt-2">
              {isCurrentBidder
                ? 'Congratulations! You won this auction!'
                : 'This auction has ended.'}
            </Alert>
          )}
        </div>

        {isCurrentBidder && !auctionEndedMessageShown ? (
          <Alert variant="success">
            You currently have the highest bid. The auction will close automatically when the timer expires.
          </Alert>
        ) : !auctionEndedMessageShown ? (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Your Bid Amount ($)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min={getMinimumBidAmount(currentItem)}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value ? parseFloat(e.target.value) : '')}
                placeholder={`Enter amount (min: $${getMinimumBidAmount(currentItem).toFixed(2)})`}
              />
              <Form.Text className="text-muted">
                Must be at least 10% higher than the current price
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end">
              {!isCurrentBidder && (
                <Button variant="secondary" onClick={onHide} className="me-2">
                  Cancel
                </Button>
              )}
              <Button variant="primary" type="submit">
                Place Bid
              </Button>
            </div>
          </Form>
        ) : null}
      </Modal.Body>
    </Modal>
  );
};

export default BidModal;