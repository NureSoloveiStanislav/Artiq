import React, { FC } from 'react';
import { Button } from 'react-bootstrap';

type TypeHeader = {
  setShowLoginForm: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: FC<TypeHeader> = ({setShowLoginForm}) => {
  return (
    <div>
      <Button variant={'primary'} onClick={(): void => setShowLoginForm(true)}>Увійти</Button>
    </div>
  );
};

export default Header;