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
  status: 'active' | 'sold';
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
  // Состояния для данных из разных таблиц
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Состояния для модальных окон редактирования
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [showItemModal, setShowItemModal] = useState<boolean>(false);
  const [showBidModal, setShowBidModal] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  // Состояния для текущих редактируемых записей
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const [currentItem, setCurrentItem] = useState<Partial<Item>>({});
  const [currentBid, setCurrentBid] = useState<Partial<Bid>>({});
  const [currentReview, setCurrentReview] = useState<Partial<Review>>({});

  // Состояние для уведомлений
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    message: '',
    variant: 'success'
  });

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchUsers();
    fetchItems();
    fetchBids();
    fetchReviews();
  }, []);

  // Функции для получения данных
  const fetchUsers = async (): Promise<void> => {
    try {
      const response = await api.get<User[]>('/admin/users');
      setUsers(response.data);
    } catch (error) {
      showAlert('Ошибка при загрузке пользователей', 'danger');
    }
  };

  const fetchItems = async (): Promise<void> => {
    try {
      const response = await api.get<Item[]>('/admin/items');
      setItems(response.data);
    } catch (error) {
      showAlert('Ошибка при загрузке товаров', 'danger');
    }
  };

  const fetchBids = async (): Promise<void> => {
    try {
      const response = await api.get<Bid[]>('/admin/bids');
      setBids(response.data);
    } catch (error) {
      showAlert('Ошибка при загрузке ставок', 'danger');
    }
  };

  const fetchReviews = async (): Promise<void> => {
    try {
      const response = await api.get<Review[]>('/admin/reviews');
      setReviews(response.data);
    } catch (error) {
      showAlert('Ошибка при загрузке отзывов', 'danger');
    }
  };

  // Функции для управления пользователями
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
        showAlert('Пользователь успешно обновлен', 'success');
      } else {
        // Для нового пользователя (если такая функциональность будет добавлена)
      }
      setShowUserModal(false);
      fetchUsers();
    } catch (error) {
      showAlert('Ошибка при сохранении пользователя', 'danger');
    }
  };

  const handleDeleteUser = async (id: number): Promise<void> => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        showAlert('Пользователь успешно удален', 'success');
        fetchUsers();
      } catch (error) {
        showAlert('Ошибка при удалении пользователя', 'danger');
      }
    }
  };

  // Функции для управления товарами
  const handleSaveItem = async (): Promise<void> => {
    try {
      if (currentItem.item_id) {
        await api.put(`/admin/items/${currentItem.item_id}`, currentItem);
        showAlert('Товар успешно обновлен', 'success');
      }
      setShowItemModal(false);
      fetchItems();
    } catch (error) {
      showAlert('Ошибка при сохранении товара', 'danger');
    }
  };

  const handleDeleteItem = async (id: number): Promise<void> => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        await api.delete(`/admin/items/${id}`);
        showAlert('Товар успешно удален', 'success');
        fetchItems();
      } catch (error) {
        showAlert('Ошибка при удалении товара', 'danger');
      }
    }
  };

  // Функции для управления ставками
  const handleSaveBid = async (): Promise<void> => {
    try {
      if (currentBid.bid_id) {
        await api.put(`/admin/bids/${currentBid.bid_id}`, currentBid);
        showAlert('Ставка успешно обновлена', 'success');
      }
      setShowBidModal(false);
      fetchBids();
    } catch (error) {
      showAlert('Ошибка при сохранении ставки', 'danger');
    }
  };

  const handleDeleteBid = async (id: number): Promise<void> => {
    if (window.confirm('Вы уверены, что хотите удалить эту ставку?')) {
      try {
        await api.delete(`/admin/bids/${id}`);
        showAlert('Ставка успешно удалена', 'success');
        fetchBids();
      } catch (error) {
        showAlert('Ошибка при удалении ставки', 'danger');
      }
    }
  };

  // Функции для управления отзывами
  const handleSaveReview = async (): Promise<void> => {
    try {
      if (currentReview.review_id) {
        await api.put(`/admin/reviews/${currentReview.review_id}`, currentReview);
        showAlert('Отзыв успешно обновлен', 'success');
      }
      setShowReviewModal(false);
      fetchReviews();
    } catch (error) {
      showAlert('Ошибка при сохранении отзыва', 'danger');
    }
  };

  const handleDeleteReview = async (id: number): Promise<void> => {
    if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      try {
        await api.delete(`/admin/reviews/${id}`);
        showAlert('Отзыв успешно удален', 'success');
        fetchReviews();
      } catch (error) {
        showAlert('Ошибка при удалении отзыва', 'danger');
      }
    }
  };

  // Функции для управления пользователями
  const handleEditUser = (user: User): void => {
    setCurrentUser(user);
    setShowUserModal(true);
  };

  // Функции для управления товарами
  const handleEditItem = (item: Item): void => {
    setCurrentItem(item);
    setShowItemModal(true);
  };

  // Функции для управления ставками
  const handleEditBid = (bid: Bid): void => {
    setCurrentBid(bid);
    setShowBidModal(true);
  };

  // Функции для управления отзывами
  const handleEditReview = (review: Review): void => {
    setCurrentReview(review);
    setShowReviewModal(true);
  };

  // Вспомогательная функция для уведомлений
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
        <h1 className="mb-4">Панель администратора</h1>

        {alert.show && (
          <Alert variant={alert.variant} onClose={() => setAlert({...alert, show: false})} dismissible>
            {alert.message}
          </Alert>
        )}

        <Tabs defaultActiveKey="users" className="mb-4">
          {/* Вкладка пользователей */}
          <Tab eventKey="users" title="Пользователи">
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                <tr>
                  <th>ID</th>
                  <th>Имя</th>
                  <th>Фамилия</th>
                  <th>Email</th>
                  <th>Телефон</th>
                  <th>Роль</th>
                  <th>Действия</th>
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
                        Редактировать
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteUser(user.id)}>
                        Удалить
                      </Button>
                    </td>
                  </tr>
                ))}
                </tbody>
              </Table>
            </div>
          </Tab>

          {/* Вкладка товаров */}
          <Tab eventKey="items" title="Товары">
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Категория</th>
                  <th>Нач. цена</th>
                  <th>Текущая цена</th>
                  <th>Статус</th>
                  <th>Продавец</th>
                  <th>Действия</th>
                </tr>
                </thead>
                <tbody>
                {items.map((item) => (
                  <tr key={item.item_id}>
                    <td>{item.item_id}</td>
                    <td>{item.title}</td>
                    <td>{item.category}</td>
                    <td>${item.starting_price.toFixed(2)}</td>
                    <td>${item.current_price.toFixed(2)}</td>
                    <td>{item.status}</td>
                    <td>{item.seller_name || item.user_id}</td>
                    <td>
                      <Button variant="primary" size="sm" className="me-2" onClick={() => handleEditItem(item)}>
                        Редактировать
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteItem(item.item_id)}>
                        Удалить
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
                  <th>Сумма</th>
                  <th>Время</th>
                  <th>Пользователь</th>
                  <th>Товар</th>
                  <th>Действия</th>
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
                        Редактировать
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteBid(bid.bid_id)}>
                        Удалить
                      </Button>
                    </td>
                  </tr>
                ))}
                </tbody>
              </Table>
            </div>
          </Tab>

          {/* Вкладка отзывов */}
          <Tab eventKey="reviews" title="Отзывы">
            <div className="table-responsive">
              <Table striped bordered hover>
                <thead>
                <tr>
                  <th>ID</th>
                  <th>От пользователя</th>
                  <th>О пользователе</th>
                  <th>Оценка</th>
                  <th>Комментарий</th>
                  <th>Дата создания</th>
                  <th>Действия</th>
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
                        Редактировать
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteReview(review.review_id)}>
                        Удалить
                      </Button>
                    </td>
                  </tr>
                ))}
                </tbody>
              </Table>
            </div>
          </Tab>
        </Tabs>

        {/* Модальное окно для редактирования пользователя */}
        <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Редактирование пользователя</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Имя</Form.Label>
                <Form.Control
                  type="text"
                  value={currentUser.firstName || ''}
                  onChange={(e) => setCurrentUser({...currentUser, firstName: e.target.value})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Фамилия</Form.Label>
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
                  <option value="admin">Администратор</option>
                  <option value="buyer">Покупатель</option>
                  <option value="seller">Продавец</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowUserModal(false)}>
              Отмена
            </Button>
            <Button variant="primary" onClick={handleSaveUser}>
              Сохранить
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Модальное окно для редактирования товара */}
        <Modal show={showItemModal} onHide={() => setShowItemModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Редактирование товара</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Название</Form.Label>
                <Form.Control
                  type="text"
                  value={currentItem.title || ''}
                  onChange={(e) => setCurrentItem({...currentItem, title: e.target.value})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Описание</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={currentItem.description || ''}
                  onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Начальная цена</Form.Label>
                <Form.Control
                  type="number"
                  value={currentItem.starting_price || 0}
                  onChange={(e) => setCurrentItem({...currentItem, starting_price: Number(e.target.value)})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Текущая цена</Form.Label>
                <Form.Control
                  type="number"
                  value={currentItem.current_price || 0}
                  onChange={(e) => setCurrentItem({...currentItem, current_price: Number(e.target.value)})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Категория</Form.Label>
                <Form.Control
                  type="text"
                  value={currentItem.category || ''}
                  onChange={(e) => setCurrentItem({...currentItem, category: e.target.value})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Статус</Form.Label>
                <Form.Select
                  disabled
                  value={currentItem.status || 'active'}
                  onChange={(e) => setCurrentItem({...currentItem, status: e.target.value as Item['status']})}
                >
                  <option value="active">Активный</option>
                  <option value="sold">Продано</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>URL изображения</Form.Label>
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
              Отмена
            </Button>
            <Button variant="primary" onClick={handleSaveItem}>
              Сохранить
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Модальное окно для редактирования ставки */}
        <Modal show={showBidModal} onHide={() => setShowBidModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Редактирование ставки</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Сумма</Form.Label>
                <Form.Control
                  type="number"
                  value={currentBid.amount || 0}
                  onChange={(e) => setCurrentBid({...currentBid, amount: Number(e.target.value)})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Время</Form.Label>
                <Form.Control
                  type="datetime-local"
                  disabled
                  value={currentBid.time ? new Date(currentBid.time).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setCurrentBid({...currentBid, time: e.target.value})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>ID пользователя</Form.Label>
                <Form.Control
                  disabled
                  type="number"
                  value={currentBid.user_id || ''}
                  onChange={(e) => setCurrentBid({...currentBid, user_id: Number(e.target.value)})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>ID товара</Form.Label>
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
              Отмена
            </Button>
            <Button variant="primary" onClick={handleSaveBid}>
              Сохранить
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Модальное окно для редактирования отзыва */}
        <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Редактирование отзыва</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>ID оставившего отзыв</Form.Label>
                <Form.Control
                  type="number"
                  value={currentReview.reviewer_id || ''}
                  onChange={(e) => setCurrentReview({...currentReview, reviewer_id: Number(e.target.value)})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>ID получателя отзыва</Form.Label>
                <Form.Control
                  type="number"
                  value={currentReview.reviewee_id || ''}
                  onChange={(e) => setCurrentReview({...currentReview, reviewee_id: Number(e.target.value)})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Оценка</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="5"
                  value={currentReview.rating || 5}
                  onChange={(e) => setCurrentReview({...currentReview, rating: Number(e.target.value)})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Комментарий</Form.Label>
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
              Отмена
            </Button>
            <Button variant="primary" onClick={handleSaveReview}>
              Сохранить
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default Admin;