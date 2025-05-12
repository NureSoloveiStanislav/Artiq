import React, { FC, useEffect, useState } from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import CustomInput from '../CustomInput/CustomInput';
import axios from 'axios';
import api from '../../api/axios';

type TypeAddItemModal = {
  customClassName?: string,
  showAddItemModal: boolean,
  userId: number | undefined,
  setShowAddItemModal: React.Dispatch<React.SetStateAction<boolean>>,
  addItem: (newItem: any) => void,
}

type TypeAddItem = {
  title: string,
  description: string,
  startingPrice: number,
  category: string,
  image: File | null,
};

type TypeErrorAddItem = {
  title: boolean,
  description: boolean,
  startingPrice: boolean,
  category: boolean,
}

type AlertMessage = {
  type: 'success' | 'danger' | 'warning';
  text: string;
};


const AddItemModal: FC<TypeAddItemModal> = ({
                                              userId,
                                              customClassName,
                                              showAddItemModal,
                                              setShowAddItemModal,
                                              addItem
                                            }) => {
  const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);
  const [addItemData, setAddItemData] = useState<TypeAddItem>({
    title: '',
    description: '',
    startingPrice: 0,
    category: '',
    image: null
  });

  const [errorAddItem, setErrorAddItem] = useState<TypeErrorAddItem>({
    title: true,
    description: true,
    startingPrice: true,
    category: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (addItemData.title.length > 5) {
      setErrorAddItem((prevState: TypeErrorAddItem) => ({
        ...prevState,
        title: false
      }));
    } else {
      setErrorAddItem((prevState: TypeErrorAddItem) => ({
        ...prevState,
        title: true
      }));
    }
  }, [addItemData.title]);

  useEffect(() => {
    if (addItemData.description.length > 5) {
      setErrorAddItem((prevState: TypeErrorAddItem) => ({
        ...prevState,
        description: false
      }));
    } else {
      setErrorAddItem((prevState: TypeErrorAddItem) => ({
        ...prevState,
        description: true
      }));
    }
  }, [addItemData.description]);

  useEffect(() => {
    if (addItemData.category.length > 5) {
      setErrorAddItem((prevState: TypeErrorAddItem) => ({
        ...prevState,
        category: false
      }));
    } else {
      setErrorAddItem((prevState: TypeErrorAddItem) => ({
        ...prevState,
        category: true
      }));
    }
  }, [addItemData.category]);


  useEffect(() => {
    const price = Number(addItemData.startingPrice);
    if (!isNaN(price) && price > 0 && price <= 1000000) {
      setErrorAddItem((prevState: TypeErrorAddItem) => ({
        ...prevState,
        startingPrice: false
      }));
    } else {
      setErrorAddItem((prevState: TypeErrorAddItem) => ({
        ...prevState,
        startingPrice: true
      }));
    }
  }, [addItemData.startingPrice]);

  const handleClose = (): void => {
    setShowAddItemModal(false);
    setAlertMessage(null);
    setAddItemData({
      title: '',
      description: '',
      startingPrice: 0,
      category: '',
      image: null
    });
    setErrorAddItem({
      title: true,
      description: true,
      startingPrice: true,
      category: true
    });
  };

  const onSubmitForm = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setAlertMessage(null);
    setIsSubmitting(true);

    try {
      if (!userId) {
        setAlertMessage({
          type: 'danger',
          text: 'Error: User ID is not defined.'
        });
        setIsSubmitting(false);
        return;
      }

      if (errorAddItem.title || errorAddItem.description ||
        errorAddItem.startingPrice || errorAddItem.category) {
        setAlertMessage({
          type: 'warning',
          text: 'Please fill in all required fields correctly.'
        });
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('title', addItemData.title);
      formData.append('description', addItemData.description);
      formData.append('startingPrice', addItemData.startingPrice.toString());
      formData.append('category', addItemData.category);
      formData.append('userId', userId.toString());

      if (addItemData.image) {
        formData.append('image', addItemData.image);
      }

      const response = await api.post('/items', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200 || response.status === 201) {
        addItem(response.data.data);
        handleClose();
        // console.log('Add Item: ');
        // console.log(response.data.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'An error occurred while adding the item';
        setAlertMessage({
          type: 'danger',
          text: errorMessage
        });

        if (error.response?.status === 413) {
          setAlertMessage({
            type: 'danger',
            text: 'The image file is too large. Please choose a smaller file.'
          });
        } else if (error.response?.status === 415) {
          setAlertMessage({
            type: 'danger',
            text: 'Invalid file type. Please upload only images.'
          });
        }
      } else {
        setAlertMessage({
          type: 'danger',
          text: 'An unexpected error occurred. Please try again.'
        });
      }
      console.error('Error adding item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="AddItemModal" className={customClassName}>
      <Modal
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={showAddItemModal}
        className="add-item-modal"
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            Додати предмет
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={(event: React.FormEvent<HTMLFormElement>) => onSubmitForm(event)}>
          <Modal.Body>
            {alertMessage && (
              <Alert
                variant={alertMessage.type}
                onClose={() => setAlertMessage(null)}
                dismissible
              >
                {alertMessage.text}
              </Alert>
            )}
            <CustomInput
              type={'text'}
              name={'title'}
              state={addItemData.title}
              isValid={!errorAddItem.title}
              label={'Назва'}
              setState={setAddItemData}
              maxLength={75}
            />
            <CustomInput type={'text'} name={'description'} state={addItemData.description}
                         isValid={!errorAddItem.description}
                         label={'Опис'} setState={setAddItemData} maxLength={255} />
            <CustomInput type={'number'} name={'startingPrice'} state={addItemData.startingPrice}
                         isValid={!errorAddItem.startingPrice}
                         label={''} setState={setAddItemData} />
            <CustomInput type={'text'} name={'category'} state={addItemData.category} isValid={!errorAddItem.category}
                         label={'Категорія'} setState={setAddItemData} maxLength={45} />
            <input type="file" accept="image/*" name="image"
                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                     const file = e.target.files?.[0];
                     if (file) {
                       setAddItemData({ ...addItemData, image: file });
                     }
                   }}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Збереження...' : 'Зберегти'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default AddItemModal;