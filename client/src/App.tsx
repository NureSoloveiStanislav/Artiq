import React, { useState, useEffect } from 'react';
import Home from './pages/Home/Home';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { TypeUser } from './types/TypeUser';
import api from './api/axios';
import axios from 'axios';
import Profile from './pages/Profile/Profile';
import Admin from './pages/Admin/Admin';

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

  useEffect(() => {
    console.log(user?.role);
  }, [user]);

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
                     setShowLoginForm={setShowLoginForm}/>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;