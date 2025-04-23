import React, { useState, useEffect } from 'react';
import Home from './pages/Home/Home';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { TypeUser } from './types/TypeUser';
import api from './api/axios';
import axios from 'axios';

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
        <Route path={'/test'} element={<h2>test page</h2>} />
      </Routes>
    </Router>
  );
}

export default App;