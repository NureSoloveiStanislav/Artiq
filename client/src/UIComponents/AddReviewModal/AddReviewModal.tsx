import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import api from '../../api/axios';
import './AddReviewModal.scss';

interface AddReviewModalProps {
  show: boolean;
  onHide: () => void;
  sellerId: number;
  sellerName: string;
  itemId: number;
  itemTitle: string;
  buyerId: number;
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({
                                                         show,
                                                         onHide,
                                                         sellerId,
                                                         sellerName,
                                                         itemId,
                                                         itemTitle,
                                                         buyerId
                                                       }) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleStarHover = (starValue: number) => {
    setHoveredStar(starValue);
  };

  const handleStarClick = (starValue: number) => {
    setRating(starValue);
  };

  const handleStarLeave = () => {
    setHoveredStar(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.post('/reviews', {
        reviewerId: buyerId,
        revieweeId: sellerId,
        rating,
        comment
      });

      setSuccess(true);
      setTimeout(() => {
        onHide();
      }, 2000);

    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= (hoveredStar || rating) ? 'filled' : 'empty'}`}
          onMouseEnter={() => handleStarHover(i)}
          onMouseLeave={handleStarLeave}
          onClick={() => handleStarClick(i)}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" className="review-modal">
      <Modal.Header closeButton>
        <Modal.Title>Rate Your Experience</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && (
          <Alert variant="success">
            Thank you for your review! This window will close automatically.
          </Alert>
        )}

        {!success && (
          <Form onSubmit={handleSubmit}>
            <div className="congratulations-message">
              <h4>Congratulations! 🎉</h4>
              <p>You've won the auction for <strong>{itemTitle}</strong></p>
            </div>

            <div className="seller-info mb-4">
              <p>Please rate your experience with seller <strong>{sellerName}</strong>:</p>
            </div>

            <div className="rating-container mb-4">
              <div className="stars-container">
                {renderStars()}
              </div>
              <div className="rating-text">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Add a comment (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this seller..."
                maxLength={255}
              />
              <Form.Text className="text-muted">
                {255 - comment.length} characters remaining
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting}
                className="submit-review-btn"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AddReviewModal;