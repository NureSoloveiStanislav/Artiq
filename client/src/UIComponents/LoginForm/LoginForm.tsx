import React, { FC, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { TypeUser } from '../../types/TypeUser';
import CustomInput from '../CustomInput/CustomInput';
import { UserRole } from '../../enums/UserRole';

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
        <form>
          {
            showRegisterForm ? (
              <Modal.Body>
                <CustomInput type={'email'} name={'email'} state={registerFormData.email} isValid={!errorRegisterForm.email}
                             label={'Введіть електронну пошту'} setState={setRegisterFormData} />
                <CustomInput type={'password'} name={'password'} state={registerFormData.password}
                             isValid={!errorRegisterForm.password} label={'Введіть пароль'} setState={setRegisterFormData} />
                <CustomInput type={'text'} name={'fisrtName'} state={registerFormData.firstName}
                             isValid={!errorRegisterForm.firstName} label={'Ім\'я'} setState={setRegisterFormData} />
                <CustomInput type={'text'} name={'lastName'} state={registerFormData.lastName}
                             isValid={!errorRegisterForm.lastName} label={'Прізвище'} setState={setRegisterFormData} />
                <CustomInput type={'tel'} name={'phone'} state={registerFormData.phone}
                             isValid={!errorRegisterForm.phone} label={'Мобільний номер'} setState={setRegisterFormData} />
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