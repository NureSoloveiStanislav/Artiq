import React, {FC, HTMLInputTypeAttribute} from 'react';
import './CustomInput.scss';

type CustomInputProps = {
  label: string,
  type: HTMLInputTypeAttribute,
  name: string,
  state: string | number,
  setState: React.Dispatch<React.SetStateAction<any>>,
  isValid: boolean,
  id?: string,
  maxLength?: number,
  customClassName?: string,
}

const CustomInput: FC<CustomInputProps> = ({customClassName, maxLength, isValid, label, id, name, type, state, setState}) => {
  const onChangeCustomInput = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setState((prevState: any) => ({
      ...prevState,
      [name]: event.target.value,
    }))
  };

  return (
    <div className={`custom-input-container ${customClassName}`}>
      <input id={id} className={`custom-input ${state ? `${isValid ? 'success' : 'error'}` : ''}`} type={type}
             value={state} name={name} maxLength={maxLength ? maxLength : 20}
             onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChangeCustomInput(event)}
      />
      <label htmlFor={id}>{label}</label>
    </div>

  );
};

export default CustomInput;