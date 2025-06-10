import React, { FC, useEffect, useRef, useState } from 'react';
import Header from '../../UIComponents/Header/Header';
import './Home.scss';
import LoginForm from '../../UIComponents/LoginForm/LoginForm';
import { TypeUser } from '../../types/TypeUser';
import AddItemModal from '../../UIComponents/AddItemModal/AddItemModal';
import ItemsList from '../../UIComponents/ItemsList/ItemsList';
import api from '../../api/axios';
import { TypeItem } from '../../types/TypeItem';

type TypeHome = {
  setShowLoginForm: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<TypeUser>>;
  showLoginForm: boolean;
  customClassName?: string;
  user: TypeUser;
}


const Home: FC<TypeHome> = ({ user, setShowLoginForm, setUser, showLoginForm, customClassName }) => {
    const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
    const [items, setItems] = useState<TypeItem[]>([]);

    const openAddItemModal = (): void => {
      if (user) {
        setShowAddItemModal(true);
      } else {
        setShowLoginForm(true);
      }
    };

    useEffect(() => {
      const loadItems = async () => {
        try {
          const response = await api.get('/items');
          if (response.data?.status === 'success') {
            setItems(response.data.data || []);
          } else {
            console.error('Unexpected response format:', response.data);
          }
        } catch (err) {
          console.error('Error loading items:', err);
          // Only show alert on first load, not during automatic refreshes
          if (!intervalRef.current) {
            alert('Failed to load items. Please try again later.');
          }
        }
      };

      // Load items immediately when component mounts
      loadItems();

      // Set up interval to refresh items every second
      const intervalRef = { current: setInterval(loadItems, 1000) };

      // Clean up interval on component unmount
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, []);

    const addItem = (newItem: TypeItem): void => {
      setItems(prevItems => {
        return [...prevItems, newItem];
      });
    };

    return (
      <div id="Home" className={customClassName}>
        <LoginForm
          user={user}
          setShowLoginForm={setShowLoginForm}
          showLoginForm={showLoginForm}
          setUser={setUser}
        />
        <AddItemModal
          userId={user?.id}
          showAddItemModal={showAddItemModal}
          setShowAddItemModal={setShowAddItemModal}
          addItem={addItem}
        />
        <Header
          setShowLoginForm={setShowLoginForm}
          user={user}
          setUser={setUser}
        />
        <ItemsList openAddItemModal={openAddItemModal} items={items} userId={user?.id} />
      </div>
    );
  }
;

export default Home;