import React, { useState, useEffect } from 'react';
import { Tab, Tabs, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import api from '../../api/axios';
import Header from '../../UIComponents/Header/Header';
import { TypeUser } from '../../types/TypeUser';
import LoginForm from '../../UIComponents/LoginForm/LoginForm';

// Define interfaces for each data model
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'buyer' | 'seller';
}

interface Item {
  item_id: number;
  title: string;
  description?: string;
  category: string;
  starting_price: number;
  current_price: number;
  status: 'active' | 'sold' | 'created';
  user_id: number;
  image_url?: string;
  seller_name?: string; // Added to display seller name
}

interface Bid {
  bid_id: number;
  amount: number;
  time: string;
  user_id: number;
  item_id: number;
  bidder_name?: string; // Added to display bidder name
  item_title?: string;  // Added to display item title
}

interface Review {
  review_id: number;
  reviewer_id: number;
  reviewee_id: number;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_name?: string; // Added to display reviewer name
  reviewee_name?: string; // Added to display reviewee name
}

// Define interface for alert state
interface AlertState {
  show: boolean;
  message: string;
  variant: 'success' | 'danger' | 'warning' | 'info';
}

type TypeAdmin = {
  setShowLoginForm: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<TypeUser>>;
  user: TypeUser;
  showLoginForm: boolean;
}

const Admin: React.FC<TypeAdmin> = ({setShowLoginForm, user, setUser, showLoginForm}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [showItemModal, setShowItemModal] = useState<boolean>(false);
  const [showBidModal, setShowBidModal] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const [currentItem, setCurrentItem] = useState<Partial<Item>>({});
  const [currentBid, setCurrentBid] = useState<Partial<Bid>>({});
  const [currentReview, setCurrentReview] = useState<Partial<Review>>({});

  const [alert, setAlert] = useState<AlertState>({
    show: false,
    message: '',
    variant: 'success'
  });

  useEffect(() => {
    fetchUsers();
    fetchItems();
    fetchBids();
    fetchReviews();
  }, []);

  const fetchUsers = async (): Promise<void> => {
    try {
      const response = await api.get<User[]>('/admin/users');
      setUsers(response.data);
    } catch (error: any) {
      showAlert(error.response.data.message, 'danger');
    }
  };

  const fetchItems = async (): Promise<void> => {
    try {
      const response = await api.get<Item[]>('/admin/items');
      setItems(response.data);
    } catch (error: any) {
      showAlert(error.response.data.message, 'danger');
    }
  };

  const fetchBids = async (): Promise<void> => {
    try {
      const response = await api.get<Bid[]>('/admin/bids');
      setBids(response.data);
    } catch (error: any) {
      showAlert(error.response.data.message, 'danger');
    }
  };

  const fetchReviews = async (): Promise<void> => {
    try {
      const response = await api.get<Review[]>('/admin/reviews');
      setReviews(response.data);
    } catch (error: any) {
      showAlert(error.response.data.message, 'danger');
    }
  };

  const handleSaveUser = async (): Promise<void> => {
    try {
      if (currentUser.id) {
        await api.put(`/admin/users/${currentUser.id}`, {
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email,
          phone: currentUser.phone,
          role: currentUser.role
        });
        showAlert('Користувач успішно оновлений', 'success');
      }
      setShowUserModal(false);
      fetchUsers();
    } catch (error) {
      showAlert('Помилка при збережені користувача', 'danger');
    }
  };

  // const handleDeleteUser = async (id: number): Promise<void> => {
  //   if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
  //     try {
  //       await api.delete(`/admin/users/${id}`);
  //       fetchUsers();
  //     } catch (error) {
  //     }
  //   }
  // };

  const handleSaveItem = async (): Promise<void> => {
    try {
      if (currentItem.item_id) {
        await api.put(`/admin/items/${currentItem.item_id}`, currentItem);
        showAlert('Товар успішно оновлений', 'success');
      }
      setShowItemModal(false);
      fetchItems();
    } catch (error) {
      showAlert('Помилка при збережені товару', 'danger');
    }
  };

  const handleDeleteItem = async (id: number): Promise<void> => {
    if (window.confirm('Ви впевнені, що хочете видалити цей товар?')) {
      try {
        await api.delete(`/admin/items/${id}`);
        showAlert('Товар успішно оновлений', 'success');
        fetchItems();
      } catch (error) {
        showAlert('Помилка при видалені товару', 'danger');
      }
    }
  };

  const handleSaveBid = async (): Promise<void> => {
    try {
      if (currentBid.bid_id) {
        await api.put(`/admin/bids/${currentBid.bid_id}`, currentBid);
        showAlert('Ставка успішно оновлена', 'success');
      }
      setShowBidModal(false);
      fetchBids();
    } catch (error) {
      showAlert('Помилка при збереженні ставки', 'danger');
    }
  };

  const handleDeleteBid = async (id: number): Promise<void> => {
    if (window.confirm('Ви впевнені, що хочете видалити цю ставку?')) {
      try {
        await api.delete(`/admin/bids/${id}`);
        showAlert('Ставка успішно видалена', 'success');
        fetchBids();
      } catch (error) {
        showAlert('Помилка при видалені ставки', 'danger');
      }
    }
  };

  const handleSaveReview = async (): Promise<void> => {
    try {
      if (currentReview.review_id) {
        await api.put(`/admin/reviews/${currentReview.review_id}`, currentReview);
        showAlert('Відгук успішно оновлений', 'success');
      }
      setShowReviewModal(false);
      fetchReviews();
    } catch (error) {
      showAlert('Помилка при збереженні відгуку', 'danger');
    }
  };

  const handleDeleteReview = async (id: number): Promise<void> => {
    if (window.confirm('Ви впевнені, що хочете видалити відгук?')) {
      try {
        await api.delete(`/admin/reviews/${id}`);
        showAlert('Відгук успішно видалений', 'success');
        fetchReviews();
      } catch (error) {
        showAlert('Помилка при видалені відгуку', 'danger');
      }
    }
  };

  const handleEditUser = (user: User): void => {
    setCurrentUser(user);
    setShowUserModal(true);
  };

  const handleEditItem = (item: Item): void => {
    setCurrentItem(item);
    setShowItemModal(true);
  };

  const handleEditBid = (bid: Bid): void => {
    setCurrentBid(bid);
    setShowBidModal(true);
  };

  const handleEditReview = (review: Review): void => {
    setCurrentReview(review);
    setShowReviewModal(true);
  };

  const showAlert = (message: string, variant: AlertState['variant']): void => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000);
  };

  return (
    <>
      <LoginForm
        user={user}
        setShowLoginForm={setShowLoginForm}
        showLoginForm={showLoginForm}
        setUser={setUser}
      />
      <Header setShowLoginForm={setShowLoginForm} user={user} setUser={setUser} />
      <div className="container-fluid mt-4">
        <h1 className="mb-4">Панель адміністратора</h1>

        {alert.show && (
          <Alert variant={alert.variant} onClose={() => setAlert({...alert, show: false})} dismissible>
            {alert.message}
          </Alert>
        )}

        <Tabs defaultActiveKey="users" className="mb-4">
          {/* Користувачі */}
          <Tab eventKey="users" title="Користувачі">
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                <tr>
                  <th>ID</th>
                  <th>Ім'я</th>
                  <th>Прізвище</th>
                  <th>Email</th>
                  <th>Телефон</th>
                  <th>Роль</th>
                  <th>Дії</th>
                </tr>
                </thead>
                <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>{user.role}</td>
                    <td>
                      <Button variant="primary" size="sm" className="me-2" onClick={() => handleEditUser(user)}>
                        Редагувати
                      </Button>
                    </td>
                  </tr>
                ))}
                </tbody>
              </Table>
            </div>
          </Tab>

          {/* Вкладка товарів */}
          <Tab eventKey="items" title="Товари">
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                <tr>
                  <th>ID</th>
                  <th>Назва</th>
                  <th>Категорія</th>
                  <th>Початкова ціна</th>
                  <th>Поточна ціна</th>
                  <th>Статус</th>
                  <th>Продавець</th>
                  <th>Дії</th>
                </tr>
                </thead>
                <tbody>
                {items.map((item) => (
                  <tr key={item.item_id}>
                    <td>{item.item_id}</td>
                    <td>{item.title}</td>
                    <td>{item.category}</td>
                    <td>${item.starting_price.toFixed(2)}</td>
                    <td>{item.current_price ? `$${item.current_price.toFixed(2)}` : '-'}</td>
                    <td>{item.status}</td>
                    <td>{item.seller_name || item.user_id}</td>
                    <td>
                      <Button variant="primary" size="sm" className="me-2" onClick={() => handleEditItem(item)}>
                        Редагувати
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteItem(item.item_id)}>
                        Видалити
                      </Button>
                    </td>
                  </tr>
                ))}
                </tbody>
              </Table>
            </div>
          </Tab>

          {/* Вкладка ставок */}
          <Tab eventKey="bids" title="Ставки">
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                <tr>
                  <th>ID</th>
                  <th>Сума</th>
                  <th>Час</th>
                  <th>Користувач</th>
                  <th>Товар</th>
                  <th>Дії</th>
                </tr>
                </thead>
                <tbody>
                {bids.map((bid) => (
                  <tr key={bid.bid_id}>
                    <td>{bid.bid_id}</td>
                    <td>${bid.amount.toFixed(2)}</td>
                    <td>{new Date(bid.time).toLocaleString()}</td>
                    <td>{bid.bidder_name || bid.user_id}</td>
                    <td>{bid.item_title || bid.item_id}</td>
                    <td>
                      <Button variant="primary" size="sm" className="me-2" onClick={() => handleEditBid(bid)}>
                        Редагувати
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteBid(bid.bid_id)}>
                        Видалити
                      </Button>
                    </td>
                  </tr>
                ))}
                </tbody>
              </Table>
            </div>
          </Tab>

          {/* Вкладка відгуків */}
          <Tab eventKey="reviews" title="Відгуки">
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                <tr>
                  <th>ID</th>
                  <th>Від користувача</th>
                  <th>Про користувача</th>
                  <th>Оцінка</th>
                  <th>Коментар</th>
                  <th>Дата створення</th>
                  <th>Дії</th>
                </tr>
                </thead>
                <tbody>
                {reviews.map((review) => (
                  <tr key={review.review_id}>
                    <td>{review.review_id}</td>
                    <td>{review.reviewer_name || review.reviewer_id}</td>
                    <td>{review.reviewee_name || review.reviewee_id}</td>
                    <td>{review.rating}</td>
                    <td>{review.comment}</td>
                    <td>{new Date(review.created_at).toLocaleString()}</td>
                    <td>
                      <Button variant="primary" size="sm" className="me-2" onClick={() => handleEditReview(review)}>
                        Редагувати
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteReview(review.review_id)}>
                        Видалити
                      </Button>
                    </td>
                  </tr>
                ))}
                </tbody>
              </Table>
            </div>
          </Tab>
        </Tabs>

        {/* Модальне вікно для редагування користувача */}
        <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Редагування користувача</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Ім'я</Form.Label>
                <Form.Control
                  type="text"
                  value={currentUser.firstName || ''}
                  onChange={(e) => setCurrentUser({...currentUser, firstName: e.target.value})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Прізвище</Form.Label>
                <Form.Control
                  type="text"
                  value={currentUser.lastName || ''}
                  onChange={(e) => setCurrentUser({...currentUser, lastName: e.target.value})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={currentUser.email || ''}
                  onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Телефон</Form.Label>
                <Form.Control
                  type="text"
                  value={currentUser.phone || ''}
                  onChange={(e) => setCurrentUser({...currentUser, phone: e.target.value})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Роль</Form.Label>
                <Form.Select
                  value={currentUser.role || 'buyer'}
                  onChange={(e) => setCurrentUser({...currentUser, role: e.target.value as User['role']})}
                >
                  <option value="admin">Адмін</option>
                  <option value="buyer">Покупець</option>
                  <option value="seller">Продавець</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowUserModal(false)}>
              Відміна
            </Button>
            <Button variant="primary" onClick={handleSaveUser}>
              Зберегти
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Модальне вікно для редагування товару */}
        <Modal show={showItemModal} onHide={() => setShowItemModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Редагування товару</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Назва</Form.Label>
                <Form.Control
                  type="text"
                  value={currentItem.title || ''}
                  onChange={(e) => setCurrentItem({...currentItem, title: e.target.value})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Опис</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={currentItem.description || ''}
                  onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Початкова ціна</Form.Label>
                <Form.Control
                  type="number"
                  value={currentItem.starting_price || 0}
                  onChange={(e) => setCurrentItem({...currentItem, starting_price: Number(e.target.value)})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Поточна ціна</Form.Label>
                <Form.Control
                  type="number"
                  value={currentItem.current_price || 0}
                  onChange={(e) => setCurrentItem({...currentItem, current_price: Number(e.target.value)})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Категорія</Form.Label>
                <Form.Control
                  type="text"
                  value={currentItem.category || ''}
                  onChange={(e) => setCurrentItem({...currentItem, category: e.target.value})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Статус</Form.Label>
                <Form.Select
                  value={currentItem.status || 'active'}
                  onChange={(e) => setCurrentItem({...currentItem, status: e.target.value as Item['status']})}
                >
                  <option value="active">Активний</option>
                  <option value="created">Створений</option>
                  <option value="sold">Проданий</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>URL зображення</Form.Label>
                <Form.Control
                  disabled
                  type="text"
                  value={currentItem.image_url || ''}
                  onChange={(e) => setCurrentItem({...currentItem, image_url: e.target.value})}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowItemModal(false)}>
              Відміна
            </Button>
            <Button variant="primary" onClick={handleSaveItem}>
              Зберегти
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Модальне вікно для редагування ставки */}
        <Modal show={showBidModal} onHide={() => setShowBidModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Редагування ставки</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Сума</Form.Label>
                <Form.Control
                  type="number"
                  value={currentBid.amount || 0}
                  onChange={(e) => setCurrentBid({...currentBid, amount: Number(e.target.value)})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Час</Form.Label>
                <Form.Control
                  type="datetime-local"
                  disabled
                  value={currentBid.time ? new Date(currentBid.time).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setCurrentBid({...currentBid, time: e.target.value})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>ID користувача</Form.Label>
                <Form.Control
                  disabled
                  type="number"
                  value={currentBid.user_id || ''}
                  onChange={(e) => setCurrentBid({...currentBid, user_id: Number(e.target.value)})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>ID товару</Form.Label>
                <Form.Control
                  disabled
                  type="number"
                  value={currentBid.item_id || ''}
                  onChange={(e) => setCurrentBid({...currentBid, item_id: Number(e.target.value)})}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowBidModal(false)}>
              Відміна
            </Button>
            <Button variant="primary" onClick={handleSaveBid}>
              Зберегти
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Модальне вікно для редагування відгуку */}
        <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Редагування відгука</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>ID залишевшого відгук</Form.Label>
                <Form.Control
                  type="number"
                  value={currentReview.reviewer_id || ''}
                  onChange={(e) => setCurrentReview({...currentReview, reviewer_id: Number(e.target.value)})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>ID отримувача відгука</Form.Label>
                <Form.Control
                  type="number"
                  value={currentReview.reviewee_id || ''}
                  onChange={(e) => setCurrentReview({...currentReview, reviewee_id: Number(e.target.value)})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Оцінка</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="5"
                  value={currentReview.rating || 5}
                  onChange={(e) => setCurrentReview({...currentReview, rating: Number(e.target.value)})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Коментар</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={currentReview.comment || ''}
                  onChange={(e) => setCurrentReview({...currentReview, comment: e.target.value})}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
              Відміна
            </Button>
            <Button variant="primary" onClick={handleSaveReview}>
              Зберегти
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default Admin;