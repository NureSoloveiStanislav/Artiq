import React, { useState } from 'react';
import Home from './pages/Home/Home';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { TypeUser } from './types/TypeUser';

function App() {
  const [user, setUser] = useState<TypeUser>(null);

  const [showLoginForm, setShowLoginForm] = useState<boolean>(false);

  return (
    <Router>
      <Routes>
        <Route path={'/'}
               element={<Home user={user} setUser={setUser} showLoginForm={showLoginForm} setShowLoginForm={setShowLoginForm} />} />
        <Route path={'/test'} element={<h2>sadsadsa</h2>}/>
      </Routes>
    </Router>
  );
}

export default App;
