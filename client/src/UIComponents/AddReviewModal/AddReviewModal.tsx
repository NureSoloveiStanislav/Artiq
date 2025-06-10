import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import api from '../../api/axios';
import './AddReviewModal.scss';
import { useLanguage } from '../../context/LanguageContext';
import { PayPalButtons } from '@paypal/react-paypal-js';

interface AddReviewModalProps {
  show: boolean;
  onHide: () => void;
  sellerId: number;
  sellerName: string;
  itemId: number;
  itemTitle: string;
  buyerId: number;
  finalPrice?: number | null;
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({
                                                         show,
                                                         onHide,
                                                         sellerId,
                                                         sellerName,
                                                         itemId,
                                                         itemTitle,
                                                         buyerId,
                                                         finalPrice
                                                       }) => {
  const { language, translations } = useLanguage();
  const t = translations.review[language];

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
      setError(t.errorSubmitting);
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

  const getRatingText = () => {
    switch (rating) {
      case 1:
        return t.ratingPoor;
      case 2:
        return t.ratingFair;
      case 3:
        return t.ratingGood;
      case 4:
        return t.ratingVeryGood;
      case 5:
        return t.ratingExcellent;
      default:
        return t.ratingExcellent;
    }
  };

  const createOrder = async () => {
    if (finalPrice === null) throw new Error('Final price is null');
    try {
      const response = await api.post('/paypal/create-order', {
        total: finalPrice
      });
      const { orderID } = response.data;
      return orderID;
    } catch (err) {
      console.error('Error creating PayPal order:', err);
      throw err;
    }
  };

  const onApprove = async (data: any) => {
    try {
      const response = await api.post(`/paypal/capture-order/${data.orderID}`);
      // console.log('PayPal payment approved:', response.data);

      if (response.data?.status === 'COMPLETED') {
        alert('Payment completed successfully!');
      }

      return response.data;
    } catch (err) {
      console.error('Error capturing PayPal order:', err);
      alert('Payment failed. Please try again.');
      throw err;
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" className="review-modal">
      <Modal.Header closeButton>
        <Modal.Title>{t.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && (
          <Alert variant="success">
            {t.thankYouMessage}
          </Alert>
        )}

        {!success && (
          <Form onSubmit={handleSubmit}>
            <div className="congratulations-message">
              <h4>{t.congratsHeading}</h4>
              <p>{t.congratsMessage} <strong>{itemTitle}</strong></p>
            </div>

            <div className="seller-info mb-4">
              <p>{t.sellerExperience} <strong>{sellerName}</strong>:</p>
            </div>

            <div className="rating-container mb-4">
              <div className="stars-container">
                {renderStars()}
              </div>
              <div className="rating-text">
                {getRatingText()}
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>{t.commentLabel}</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t.commentPlaceholder}
                maxLength={255}
              />
              <Form.Text className="text-muted">
                {255 - comment.length} {t.charactersRemaining}
              </Form.Text>
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button
                variant="primary"
                type="submit"
                disabled={isSubmitting}
                className="submit-review-btn"
              >
                {isSubmitting ? t.submitting : t.submitButton}
              </Button>
            </div>
            <div style={{ minHeight: '40px', overflow: 'hidden', marginTop: '10px' }}>
              <PayPalButtons
                createOrder={createOrder}
                onApprove={onApprove}
                style={{
                  layout: 'horizontal',
                  height: 40,
                  label: 'pay',
                  color: 'gold',
                  shape: 'rect',
                  tagline: false,
                }}
              />
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AddReviewModal;