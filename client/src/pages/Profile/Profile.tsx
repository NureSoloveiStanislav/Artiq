import React, { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Container, Row, Col, Badge, Tab, Tabs, Image, ListGroup, Alert } from 'react-bootstrap';
import Header from '../../UIComponents/Header/Header';
import LoginForm from '../../UIComponents/LoginForm/LoginForm';
import { TypeUser } from '../../types/TypeUser';
import api from '../../api/axios';
import './Profile.scss';
import { useLanguage } from '../../context/LanguageContext';

type TypeProfile = {
  setShowLoginForm: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<TypeUser>>;
  showLoginForm: boolean;
  customClassName?: string;
  user: TypeUser;
}

type ProfileUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  rating: number | null;
}

type Review = {
  review_id: number;
  reviewer_id: number;
  reviewee_id: number;
  rating: number;
  comment: string;
  reviewer_name?: string;
  created_at?: string;
}

type WonAuction = {
  item_id: number;
  title: string;
  description: string;
  final_price: number;
  image_url: string;
  end_time: string;
  category: string;
  seller_name?: string;
}

const Profile: FC<TypeProfile> = ({ setShowLoginForm, setUser, showLoginForm, user, customClassName }) => {
  const { id } = useParams();
  const { language, translations } = useLanguage();
  const t = translations.profile[language];

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wonAuctions, setWonAuctions] = useState<WonAuction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const userResponse = await api.get(`/users/${id}`);
        setProfileUser(userResponse.data);

        if (user && user.id === parseInt(id)) {
          setIsOwnProfile(true);
        }

        const reviewsResponse = await api.get(`/users/${id}/reviews`);
        setReviews(reviewsResponse.data.data || []);
        // console.log(reviewsResponse.data.data);

        const ratingResponse = await api.get(`/users/${id}/rating`);
        setAverageRating(ratingResponse.data.data?.averageRating || 0);

        const auctionsResponse = await api.get(`/items/${id}/won`);
        setWonAuctions(auctionsResponse.data.data || []);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(t.errorLoading);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id, user, t]);

  const getRoleTranslation = (role: string) => {
    switch (role) {
      case 'seller':
        return t.seller;
      case 'buyer':
        return t.buyer;
      case 'admin':
        return t.admin;
      default:
        return role;
    }
  };

  return (
    <div className={`profile-page ${customClassName || ''}`}>
      <LoginForm
        user={user}
        setShowLoginForm={setShowLoginForm}
        showLoginForm={showLoginForm}
        setUser={setUser}
      />
      <Header
        setShowLoginForm={setShowLoginForm}
        user={user}
        setUser={setUser}
      />

      <Container className="py-4">
        {loading && <Alert variant="info">{t.loadingProfile}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        {profileUser && (
          <>
            <Row className="mb-4">
              <Col md={4}>
                <Card className="profile-card">
                  <Card.Body className="text-center">
                    <Image
                      src={`https://ui-avatars.com/api/?name=${profileUser.firstName}+${profileUser.lastName}&background=random&size=128`}
                      roundedCircle
                      className="mb-3 profile-avatar"
                    />
                    <Card.Title>
                      {profileUser.firstName} {profileUser.lastName}
                      {isOwnProfile && <Badge bg="info" className="ms-2">{t.you}</Badge>}
                    </Card.Title>
                    <div className="user-rating mb-2">
                      <span className="stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`bi ${profileUser.rating && star <= profileUser.rating
                              ? 'bi-star-fill'
                              : (profileUser.rating && star - 0.5 <= profileUser.rating
                                ? 'bi-star-half'
                                : 'bi-star')}`}
                          ></i>
                        ))}
                      </span>
                      <span className="rating-value">
                        {profileUser.rating ? profileUser.rating.toFixed(1) : t.noRating}
                      </span>
                    </div>
                    <Badge bg={profileUser.role === 'seller' ? 'primary' : 'success'} className="mb-3">
                      {getRoleTranslation(profileUser.role)}
                    </Badge>
                    <ListGroup variant="flush" className="text-start">
                      <ListGroup.Item>
                        <i className="bi bi-envelope me-2"></i> {profileUser.email}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <i className="bi bi-telephone me-2"></i> {profileUser.phone}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <i className="bi bi-star-fill me-2"></i>
                        {t.rating}: {averageRating ? Number(averageRating).toFixed(1) : '0.0'}
                        <span className="text-muted ms-2">({reviews.length} {t.reviewsCount})</span>
                      </ListGroup.Item>
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={8}>
                <Tabs defaultActiveKey="reviews" className="mb-3">
                  <Tab eventKey="reviews" title={t.reviews}>
                    {reviews.length === 0 ? (
                      <Alert variant="light">{t.noReviews}</Alert>
                    ) : (
                      reviews.map((review: any) => (
                        <Card key={review.id} className="mb-3 review-card">
                          <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                            <div className="d-flex align-items-center">
                              <Image
                                src={`https://ui-avatars.com/api/?name=${review.reviewerName || t.user}&background=random&size=32`}
                                roundedCircle
                                className="me-2"
                                width={32}
                                height={32}
                              />
                              <div>
                                <strong>{review.reviewerName || t.user}</strong>
                                <div className="d-flex align-items-center">
                                  <div className="review-stars-container">
                                    {[...Array(5)].map((_, i) => (
                                      <span
                                        key={i}
                                        className={`review-star ${i < review.rating ? 'filled' : 'empty'}`}
                                      >
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                  <small className="text-muted">{review.rating}/5</small>
                                </div>
                              </div>
                            </div>
                            {review.createdAt && (
                              <div className="text-muted text-end">
                                <small>
                                  {new Date(review.createdAt).toLocaleDateString(language === 'ua' ? 'uk-UA' : 'en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </small>
                                <br />
                                <small>
                                  {new Date(review.createdAt).toLocaleTimeString(language === 'ua' ? 'uk-UA' : 'en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </small>
                              </div>
                            )}
                          </Card.Header>
                          <Card.Body>
                            <Card.Text>
                              {review.comment || <em className="text-muted">{t.noComment}</em>}
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      ))
                    )}
                  </Tab>

                  <Tab eventKey="won-auctions" title={t.wonAuctions}>
                    {wonAuctions.length === 0 ? (
                      <Alert variant="light">{t.noWonAuctions}</Alert>
                    ) : (
                      <Row xs={1} md={2} className="g-4">
                        {wonAuctions.map(auction => (
                          <Col key={auction.item_id}>
                            <Card className="h-100 auction-card">
                              <div className="auction-img-container">
                                <Card.Img
                                  variant="top"
                                  src={auction.image_url}
                                  className="auction-img"
                                />
                              </div>
                              <Card.Body>
                                <Card.Title>{auction.title}</Card.Title>
                                <Badge bg="secondary" className="mb-2">{auction.category}</Badge>
                                <Card.Text className="auction-description">
                                  {auction.description}
                                </Card.Text>
                                <div className="d-flex justify-content-between align-items-center">
                                  <Badge bg="success" className="price-badge">
                                    ${auction.final_price}
                                  </Badge>
                                  <small className="text-muted">
                                    {t.finishedOn}: {new Date(auction.end_time).toLocaleDateString(language === 'ua' ? 'uk-UA' : 'en-US')}
                                  </small>
                                </div>
                                {auction.seller_name && (
                                  <small className="text-muted d-block mt-2">
                                    {t.seller}: {auction.seller_name}
                                  </small>
                                )}
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </Tab>
                </Tabs>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
};

export default Profile;