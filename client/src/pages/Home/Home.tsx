import React, { FC, useState } from 'react';
import Header from '../../UIComponents/Header/Header';
import './Home.scss';
import LoginForm from '../../UIComponents/LoginForm/LoginForm';
import { TypeUser } from '../../types/TypeUser';
import { Button } from 'react-bootstrap';
import AddItemModal from '../../UIComponents/AddItemModal/AddItemModal';
import ItemsList from '../../UIComponents/ItemsList/ItemsList';

type TypeHome = {
  setShowLoginForm: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<TypeUser>>;
  showLoginForm: boolean;
  customClassName?: string;
  user: TypeUser;
}

const Home: FC<TypeHome> = ({ user, setShowLoginForm, setUser, showLoginForm, customClassName }) => {
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);

  const openAddItemModal = (): void => {
    if (user) {
      setShowAddItemModal(true);
    } else {
      setShowLoginForm(true);
    }
  };

  return (
    <div id="Home" className={customClassName}>
      <LoginForm
        user={user}
        setShowLoginForm={setShowLoginForm}
        showLoginForm={showLoginForm}
        setUser={setUser}
      />
      <AddItemModal userId={user?.id} showAddItemModal={showAddItemModal} setShowAddItemModal={setShowAddItemModal} />
      <Header
        setShowLoginForm={setShowLoginForm}
        user={user}
        setUser={setUser}
      />
      <ItemsList />
      <Button variant="outline-secondary" onClick={() => openAddItemModal()}>
        Створити
      </Button>
    </div>
  );
};

export default Home;