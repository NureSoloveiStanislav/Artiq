import React, { FC, useEffect, useState } from 'react';
import './LoginForm.scss';
import { Button, Modal } from 'react-bootstrap';
import { TypeUser } from '../../types/TypeUser';
import CustomInput from '../CustomInput/CustomInput';
import { UserRole } from '../../enums/UserRole';
import Form from 'react-bootstrap/Form';
import api from '../../api/axios';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';

type TypeLoginForm = {
  setShowLoginForm: React.Dispatch<React.SetStateAction<boolean>>;
  user: TypeUser;
  setUser: React.Dispatch<React.SetStateAction<TypeUser>>;
  showLoginForm: boolean;
}

type TypeErrorLoginForm = {
  email: boolean,
  password: boolean,
}

type TypeErrorRegisterForm = {
  email: boolean,
  password: boolean,
  phone: boolean,
  firstName: boolean,
  lastName: boolean,
}

type TypeLoginFormData = {
  email: string,
  password: string,
}

type TypeRegisterFormData = {
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone: string,
  role: UserRole,
}

const LoginForm: FC<TypeLoginForm> = ({ user, setShowLoginForm, setUser, showLoginForm }) => {
  const { language, translations } = useLanguage();
  const t = translations.login[language];

  const [showRegisterForm, setShowRegisterForm] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [registerError, setRegisterError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginFormData, setLoginFormData] = useState<TypeLoginFormData>({
    email: '',
    password: ''
  });

  const [errorLoginForm, setErrorLoginForm] = useState<TypeErrorLoginForm>({
    email: true,
    password: true
  });

  const [errorRegisterForm, setErrorRegisterForm] = useState<TypeErrorRegisterForm>({
    email: true,
    password: true,
    lastName: true,
    firstName: true,
    phone: true
  });

  const [registerFormData, setRegisterFormData] = useState<TypeRegisterFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: UserRole.Buyer
  });

  const handleClose = (): void => {
    setShowLoginForm(false);
  };

  const onSubmitForm = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (showRegisterForm && validateFields(errorRegisterForm)) {
      await register();
    } else if (!showRegisterForm && validateFields(errorLoginForm)) {
      await login();
    }
  };

  const validateFields = (errorForm: TypeErrorLoginForm | TypeErrorRegisterForm): boolean => {
    return Object.values(errorForm).every(value => !value);
  };

  const validatePassword: RegExp = /^[a-zA-Z0-9]+$/;

  useEffect(() => {
    if (loginFormData.email.length > 5) {
      setErrorLoginForm((prevState: TypeErrorLoginForm) => ({
        ...prevState,
        email: false
      }));
    } else {
      setErrorLoginForm((prevState: TypeErrorLoginForm) => ({
        ...prevState,
        email: true
      }));
    }
  }, [loginFormData.email]);

  useEffect(() => {
    if (validatePassword.test(loginFormData.password) && loginFormData.password.length > 4) {
      setErrorLoginForm((prevState: TypeErrorLoginForm) => ({
        ...prevState,
        password: false
      }));
    } else {
      setErrorLoginForm((prevState: TypeErrorLoginForm) => ({
        ...prevState,
        password: true
      }));
    }
  }, [loginFormData.password]);

  useEffect(() => {
    if (registerFormData.firstName.length > 2) {
      setErrorRegisterForm((prevState: TypeErrorRegisterForm) => ({
        ...prevState,
        firstName: false
      }));
    } else {
      setErrorRegisterForm((prevState: TypeErrorRegisterForm) => ({
        ...prevState,
        firstName: true
      }));
    }
  }, [registerFormData.firstName]);

  useEffect(() => {
    if (registerFormData.lastName.length > 2) {
      setErrorRegisterForm((prevState: TypeErrorRegisterForm) => ({
        ...prevState,
        lastName: false
      }));
    } else {
      setErrorRegisterForm((prevState: TypeErrorRegisterForm) => ({
        ...prevState,
        lastName: true
      }));
    }
  }, [registerFormData.lastName]);

  useEffect(() => {
    if (registerFormData.phone.length > 5) {
      setErrorRegisterForm((prevState: TypeErrorRegisterForm) => ({
        ...prevState,
        phone: false
      }));
    } else {
      setErrorRegisterForm((prevState: TypeErrorRegisterForm) => ({
        ...prevState,
        phone: true
      }));
    }
  }, [registerFormData.phone]);

  useEffect(() => {
    if (registerFormData.email.length > 5) {
      setErrorRegisterForm((prevState: TypeErrorRegisterForm) => ({
        ...prevState,
        email: false
      }));
    } else {
      setErrorRegisterForm((prevState: TypeErrorRegisterForm) => ({
        ...prevState,
        email: true
      }));
    }
  }, [registerFormData.email]);

  useEffect(() => {
    if (validatePassword.test(registerFormData.password) && registerFormData.password.length > 4) {
      setErrorRegisterForm((prevState: TypeErrorRegisterForm) => ({
        ...prevState,
        password: false
      }));
    } else {
      setErrorRegisterForm((prevState: TypeErrorRegisterForm) => ({
        ...prevState,
        password: true
      }));
    }
  }, [registerFormData.password]);

  const clearForms = (): void => {
    setRegisterFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: UserRole.Buyer
    });
    setLoginFormData({
      email: '',
      password: ''
    });
  };

  const register = async () => {
    setIsLoading(true);
    setRegisterError('');

    try {
      const response = await api.post('/register', {
        email: registerFormData.email,
        password: registerFormData.password,
        phone: registerFormData.phone,
        firstName: registerFormData.firstName,
        lastName: registerFormData.lastName,
        role: registerFormData.role
      });

      if (response.status === 200) {
        const user = {
          id: response.data.id,
          email: registerFormData.email,
          firstName: registerFormData.firstName,
          phone: registerFormData.phone,
          lastName: registerFormData.lastName,
          role: registerFormData.role,
          rating: null
        };
        setUser(user);
        setShowLoginForm(false);
        clearForms();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          setRegisterError('Користувач з такою електронною поштою вже існує');
        } else if (error.response?.status === 400) {
          setRegisterError(error.response.data.message || 'Неправильні дані для реєстрації');
        } else {
          setRegisterError('Помилка при реєстрації. Спробуйте пізніше');
        }
      } else {
        setRegisterError('Виникла неочікувана помилка');
      }
      console.error('Error submitting the registration form: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    setIsLoading(true);
    setLoginError('');

    try {
      const { email, password } = loginFormData;

      const response = await api.post('/login', {
        email: email,
        password: password
      });

      if (response.status === 200 && response.data) {
        const { id, first_name, last_name, phone, role, rating } = response.data;

        const userData = {
          id: id,
          email: email,
          firstName: first_name || response.data.firstName,
          lastName: last_name || response.data.lastName,
          phone: phone,
          role: role,
          rating: rating || null
        };

        setUser(userData);
        setShowLoginForm(false);
        clearForms();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setLoginError('Неправильний email або пароль');
        } else if (error.response?.status === 404) {
          setLoginError('Користувача не знайдено');
        } else {
          setLoginError('Помилка при вході. Спробуйте пізніше');
        }
      } else {
        setLoginError('Виникла неочікувана помилка');
      }
      console.error('Error submitting the login form: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="LoginForm">
      <Modal
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={showLoginForm}
        className="login-form"
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            {showRegisterForm ? t.register : t.auth}
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={(event: React.FormEvent<HTMLFormElement>) => onSubmitForm(event)}>
          {
            showRegisterForm ? (
              <Modal.Body>
                <CustomInput type={'email'} name={'email'} state={registerFormData.email}
                             isValid={!errorRegisterForm.email} maxLength={70}
                             label={t.email} setState={setRegisterFormData} />
                <CustomInput type={'password'} name={'password'} state={registerFormData.password}
                             isValid={!errorRegisterForm.password} label={t.password}
                             setState={setRegisterFormData} />
                <CustomInput type={'text'} name={'firstName'} state={registerFormData.firstName}
                             isValid={!errorRegisterForm.firstName} label={t.firstName}
                             setState={setRegisterFormData} />
                <CustomInput type={'text'} name={'lastName'} state={registerFormData.lastName}
                             isValid={!errorRegisterForm.lastName} label={t.lastName} setState={setRegisterFormData} />
                <CustomInput type={'tel'} name={'phone'} state={registerFormData.phone}
                             isValid={!errorRegisterForm.phone} label={t.phone}
                             setState={setRegisterFormData} />
                <Form.Select value={registerFormData.role}
                             onChange={(e) =>
                               setRegisterFormData({
                                 ...registerFormData,
                                 role: e.target.value as UserRole
                               })
                             }>
                  <option disabled>{t.registerAs}</option>
                  <option value={UserRole.Buyer}>{t.buyer}</option>
                  <option value={UserRole.Seller}>{t.seller}</option>
                </Form.Select>
                {registerError && (
                  <div className="alert alert-danger" role="alert">
                    {registerError}
                  </div>
                )}
              </Modal.Body>
            ) : (
              <Modal.Body>
                <CustomInput type={'email'} name={'email'} state={loginFormData.email} isValid={!errorLoginForm.email}
                             label={t.email} setState={setLoginFormData} maxLength={70} />
                <CustomInput type={'password'} name={'password'} state={loginFormData.password}
                             isValid={!errorLoginForm.password} label={t.password} setState={setLoginFormData} />
                {loginError && (
                  <div className="alert alert-danger" role="alert">
                    {loginError}
                  </div>
                )}
              </Modal.Body>
            )
          }
          <Modal.Footer>
            <p
              onClick={(): void => setShowRegisterForm(!showRegisterForm)}>
              {showRegisterForm ? t.haveAccount : t.noAccount}
            </p>
            <Button variant="secondary" onClick={handleClose}>
              {t.close}
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? t.loading : t.save}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}

export default LoginForm;