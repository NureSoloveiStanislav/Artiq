import React, { FC, useEffect, useState } from 'react';
import "./LoginForm.scss";
import { Button, Modal } from 'react-bootstrap';
import { TypeUser } from '../../types/TypeUser';
import CustomInput from '../CustomInput/CustomInput';
import { UserRole } from '../../enums/UserRole';
import Form from 'react-bootstrap/Form';

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
  const [showRegisterForm, setShowRegisterForm] = useState<boolean>(false);

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
      console.log('Register user data:', registerFormData);
      // Здесь можно отправить данные на сервер
    } else if (!showRegisterForm && validateFields(errorLoginForm)) {
      console.log('Login user data:', loginFormData);
      // Здесь можно отправить данные на сервер
    }
  };

  const validateFields = (errorForm:  TypeErrorLoginForm | TypeErrorRegisterForm): boolean => {
    return Object.values(errorForm).every(value => !value);
  }

  const validatePassword: RegExp = /^[a-zA-Z0-9]+$/;

  useEffect(() => {
    if (loginFormData.email.length > 5) {
      setErrorLoginForm((prevState: TypeErrorLoginForm) => ({
        ...prevState,
        email: false,
      }));
    } else {
      setErrorLoginForm((prevState: TypeErrorLoginForm) => ({
        ...prevState,
        email: true,
      }));
    }
  }, [loginFormData.email]);

  useEffect(() => {
    if (validatePassword.test(loginFormData.password) && loginFormData.password.length > 4) {
      setErrorLoginForm((prevState: TypeErrorLoginForm) => ({
        ...prevState,
        password: false,
      }));
    } else {
      setErrorLoginForm((prevState: TypeErrorLoginForm) => ({
        ...prevState,
        password: true,
      }));
    }
  }, [loginFormData.password]);

  useEffect(() => {
    if (registerFormData.firstName.length > 2) {
      setErrorRegisterForm((prevState: TypeErrorRegisterForm) => ({
        ...prevState,
        firstName: false,
      }));
    } else {
      setErrorRegisterForm((prevState: TypeErrorRegisterForm) => ({
        ...prevState,
        firstName: true,
      }));
    }
  }, [registerFormData.firstName]);

  useEffect(() => {
    if (registerFormData.lastName.length > 2) {
      setErrorRegisterForm((prevState: TypeErrorRegisterForm) => ({
        ...prevState,
        lastName: false,
      }));
    } else {
      setErrorRegisterForm((prevState: TypeErrorRegisterForm) => ({
        ...prevState,
        lastName: true,
      }));
    }
  }, [registerFormData.lastName]);

  useEffect(() => {
    if (registerFormData.phone.length > 5) {
      setErrorRegisterForm((prevState: TypeErrorRegisterForm) => ({
        ...prevState,
        phone: false,
      }));
    } else {
      setErrorRegisterForm((prevState: TypeErrorRegisterForm) => ({
        ...prevState,
        phone: true,
      }));
    }
  }, [registerFormData.phone]);

  useEffect(() => {
    if (registerFormData.email.length > 5) {
      setErrorRegisterForm((prevState: TypeErrorRegisterForm) => ({
        ...prevState,
        email: false,
      }));
    } else {
      setErrorRegisterForm((prevState: TypeErrorRegisterForm) => ({
        ...prevState,
        email: true,
      }));
    }
  }, [registerFormData.email]);

  useEffect(() => {
    if (validatePassword.test(registerFormData.password) && registerFormData.password.length > 4) {
      setErrorRegisterForm((prevState: TypeErrorRegisterForm) => ({
        ...prevState,
        password: false,
      }));
    } else {
      setErrorRegisterForm((prevState: TypeErrorRegisterForm) => ({
        ...prevState,
        password: true,
      }));
    }
  }, [registerFormData.password]);

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
            {showRegisterForm ? 'Реєстрація' : 'Авторизація'}
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={(event: React.FormEvent<HTMLFormElement>) => onSubmitForm(event)}>
          {
            showRegisterForm ? (
              <Modal.Body>
                <CustomInput type={'email'} name={'email'} state={registerFormData.email}
                             isValid={!errorRegisterForm.email}
                             label={'Введіть електронну пошту'} setState={setRegisterFormData} />
                <CustomInput type={'password'} name={'password'} state={registerFormData.password}
                             isValid={!errorRegisterForm.password} label={'Введіть пароль'}
                             setState={setRegisterFormData} />
                <CustomInput type={'text'} name={'firstName'} state={registerFormData.firstName}
                             isValid={!errorRegisterForm.firstName} label={'Ім\'я'} setState={setRegisterFormData} />
                <CustomInput type={'text'} name={'lastName'} state={registerFormData.lastName}
                             isValid={!errorRegisterForm.lastName} label={'Прізвище'} setState={setRegisterFormData} />
                <CustomInput type={'tel'} name={'phone'} state={registerFormData.phone}
                             isValid={!errorRegisterForm.phone} label={'Мобільний номер'}
                             setState={setRegisterFormData} />
                <Form.Select value={registerFormData.role}
                             onChange={(e) =>
                               setRegisterFormData({
                                 ...registerFormData,
                                 role: e.target.value as UserRole
                               })
                             }>
                  <option disabled>Зареєструватися як:</option>
                  <option value={UserRole.Buyer}>Покупець</option>
                  <option value={UserRole.Seller}>Продавець</option>
                </Form.Select>
              </Modal.Body>
            ) : (
              <Modal.Body>
                <CustomInput type={'email'} name={'email'} state={loginFormData.email} isValid={!errorLoginForm.email}
                             label={'Введіть електронну пошту'} setState={setLoginFormData} />
                <CustomInput type={'password'} name={'password'} state={loginFormData.password}
                             isValid={!errorLoginForm.password} label={'Введіть пароль'} setState={setLoginFormData} />
              </Modal.Body>
            )
          }
          <Modal.Footer>
            <p
              onClick={(): void => setShowRegisterForm(!showRegisterForm)}>{showRegisterForm ? 'У мене вже є акаунт' : 'У мене ще намає акаунту'}</p>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default LoginForm;