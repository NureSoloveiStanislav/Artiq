import React, { FC, useState } from 'react';
import { Button, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { TypeUser } from '../../types/TypeUser';
import api from '../../api/axios';
import './Header.scss';

type TypeHeader = {
  setShowLoginForm: React.Dispatch<React.SetStateAction<boolean>>;
  user: TypeUser;
  setUser: React.Dispatch<React.SetStateAction<TypeUser>>;
}

const Header: FC<TypeHeader> = ({ setShowLoginForm, user, setUser }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Navbar 
      expand="lg" 
      className="header-container" 
      expanded={expanded}
      onToggle={setExpanded}
      sticky="top"
    >
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          {/*<img */}
          {/*  src={logo} */}
          {/*  alt="Artiq Logo" */}
          {/*  className="header-logo" */}
          {/*  width="40" */}
          {/*  height="40"*/}
          {/*/>*/}
          <span className="brand-name ms-2">Artiq</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)}>Головна</Nav.Link>
            <Nav.Link as={Link} to="/services" onClick={() => setExpanded(false)}>Послуги</Nav.Link>
            <Nav.Link as={Link} to="/portfolio" onClick={() => setExpanded(false)}>Портфоліо</Nav.Link>
            <Nav.Link as={Link} to="/about" onClick={() => setExpanded(false)}>Про нас</Nav.Link>
            <Nav.Link as={Link} to="/contacts" onClick={() => setExpanded(false)}>Контакти</Nav.Link>
          </Nav>
          
          <Nav>
            {user ? (
              <NavDropdown 
                title={`Вітаємо, ${user.firstName}!`} 
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile" onClick={() => setExpanded(false)}>
                  Профіль
                </NavDropdown.Item>
                {user.role === 'admin' && (
                  <NavDropdown.Item as={Link} to="/admin" onClick={() => setExpanded(false)}>
                    Адмін-панель
                  </NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => {
                  handleLogout();
                  setExpanded(false);
                }}>
                  Вийти
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Button 
                variant="outline-primary" 
                onClick={() => {
                  setShowLoginForm(true);
                  setExpanded(false);
                }}
                className="login-button"
              >
                Увійти
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;