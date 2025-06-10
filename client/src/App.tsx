import React, { useState, useEffect } from 'react';
import Home from './pages/Home/Home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { TypeUser } from './types/TypeUser';
import api from './api/axios';
import axios from 'axios';
import Profile from './pages/Profile/Profile';
import Admin from './pages/Admin/Admin';
import { LanguageProvider } from './context/LanguageContext';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

function App() {
  const [user, setUser] = useState<TypeUser>(null);
  const [showLoginForm, setShowLoginForm] = useState<boolean>(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get('/check-session');
        if (response.data.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.code !== 'ECONNABORTED') {
          console.error('Session check failed:', error);
        }
      }
    };

    checkSession();
  }, []);

  return (
    <PayPalScriptProvider options={{
      clientId: 'AYvOXMEh6UxakN0CGI-fUK8mIUO3SW-HMdgFZqsvt9cBz55qKFXEDoy66U7zPPOlqHn1qr4eFHCtXbro',
      currency: 'USD'
    }}>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route
              path={'/'}
              element={
                <Home
                  user={user}
                  setUser={setUser}
                  showLoginForm={showLoginForm}
                  setShowLoginForm={setShowLoginForm}
                />
              }
            />
            <Route path={'/users/:id'} element={<Profile user={user}
                                                         setUser={setUser}
                                                         showLoginForm={showLoginForm}
                                                         setShowLoginForm={setShowLoginForm} />} />
            <Route
              path="/admin"
              element={
                <Admin user={user}
                       showLoginForm={showLoginForm}
                       setUser={setUser}
                       setShowLoginForm={setShowLoginForm} />
              }
            />
          </Routes>
        </Router>
      </LanguageProvider>
    </PayPalScriptProvider>
  );
};

export default App;