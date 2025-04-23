import React, { FC } from 'react';
import { Button } from 'react-bootstrap';
import { TypeUser } from '../../types/TypeUser';
import api from '../../api/axios';

type TypeHeader = {
  setShowLoginForm: React.Dispatch<React.SetStateAction<boolean>>;
  user: TypeUser;
  setUser: React.Dispatch<React.SetStateAction<TypeUser>>;
}

const Header: FC<TypeHeader> = ({ setShowLoginForm, user, setUser }) => {
  const handleLogout = async () => {
    try {
      await api.post('/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="header-container d-flex justify-content-between align-items-center p-3">
      {user ? (
        <div className="d-flex align-items-center gap-3">
          <span>Вітаємо, {user.firstName}!</span>
          <Button variant="outline-danger" onClick={handleLogout}>
            Вийти
          </Button>
        </div>
      ) : (
        <Button 
          variant="primary" 
          onClick={(): void => setShowLoginForm(true)}
        >
          Увійти
        </Button>
      )}
    </div>
  );
};

export default Header;