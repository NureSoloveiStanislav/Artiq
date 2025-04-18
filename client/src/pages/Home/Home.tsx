import React, { FC, useState } from 'react';
import Header from '../../UIComponents/Header/Header';
import './Home.scss'
import LoginForm from '../../UIComponents/LoginForm/LoginForm';
import { TypeUser } from '../../types/TypeUser';
import { Button, Modal } from 'react-bootstrap';

type TypeHome = {
  setShowLoginForm: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<TypeUser>>;
  showLoginForm: boolean;
  customClassName?: string;
  user: TypeUser;
}

const Home: FC<TypeHome> = ({user, setShowLoginForm, setUser, showLoginForm, customClassName}) => {
  return (
    <div id="Home" className={customClassName}>
      { (<LoginForm user={user} setShowLoginForm={setShowLoginForm} showLoginForm={showLoginForm} setUser={setUser} />)}
      <Header setShowLoginForm={setShowLoginForm} />
      <h1>Home</h1>
    </div>
  );
};

export default Home;