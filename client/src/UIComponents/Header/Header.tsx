import React, { FC, useState } from 'react';
import { Button, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { TypeUser } from '../../types/TypeUser';
import api from '../../api/axios';
import './Header.scss';
import { useLanguage } from '../../context/LanguageContext';

type TypeHeader = {
  setShowLoginForm: React.Dispatch<React.SetStateAction<boolean>>;
  user: TypeUser;
  setUser: React.Dispatch<React.SetStateAction<TypeUser>>;
}

const Header: FC<TypeHeader> = ({ setShowLoginForm, user, setUser }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const { language, setLanguage, translations } = useLanguage();

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ua' ? 'en' : 'ua');
  };

  const t = translations.header[language];

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
          <span className="brand-name ms-2">Artiq</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)}>{t.home}</Nav.Link>
          </Nav>
          <Nav>
            <Button
              variant="outline-secondary"
              className="me-2"
              onClick={toggleLanguage}
            >
              {language === 'ua' ? 'EN' : 'UA'}
            </Button>

            {user ? (
              <NavDropdown
                title={`${t.welcome}, ${user.firstName}!`}
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to={`/users/${user.id}`} onClick={() => setExpanded(false)}>
                  {t.profile}
                </NavDropdown.Item>
                {user.role === 'admin' && (
                  <NavDropdown.Item as={Link} to="/admin" onClick={() => setExpanded(false)}>
                    {t.adminPanel}
                  </NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => {
                  handleLogout();
                  setExpanded(false);
                }}>
                  {t.logout}
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
                {t.login}
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;