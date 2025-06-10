import React, { createContext, useState, useContext, ReactNode } from 'react';

export type Language = 'ua' | 'en';

type TranslationErrors = {
  userIdNotDefined: string;
  fillRequiredFields: string;
  imageTooLarge: string;
  invalidFileType: string;
  unexpectedError: string;
};

type AddItemTranslation = {
  title: string;
  itemName: string;
  description: string;
  startingPrice: string;
  category: string;
  image: string;
  close: string;
  save: string;
  saving: string;
  errors: TranslationErrors;
};

type HeaderTranslation = {
  home: string;
  login: string;
  profile: string;
  adminPanel: string;
  logout: string;
  welcome: string;
};

type LoginTranslation = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  register: string;
  auth: string;
  buyer: string;
  seller: string;
  registerAs: string;
  haveAccount: string;
  noAccount: string;
  close: string;
  save: string;
  loading: string;
};

type ReviewTranslation = {
  title: string;
  congratsHeading: string;
  congratsMessage: string;
  sellerExperience: string;
  ratingPoor: string;
  ratingFair: string;
  ratingGood: string;
  ratingVeryGood: string;
  ratingExcellent: string;
  commentLabel: string;
  commentPlaceholder: string;
  charactersRemaining: string;
  submitButton: string;
  submitting: string;
  thankYouMessage: string;
  errorSubmitting: string;
};

type BidTranslation = {
  highestBidder: string;
  placeBidOn: string;
  currentPrice: string;
  minimumBid: string;
  lastBidder: string;
  you: string;
  timeRemaining: string;
  auctionEnded: string;
  congratsWon: string;
  auctionHasEnded: string;
  highestBidMessage: string;
  bidAmountLabel: string;
  bidAmountHelp: string;
  enterAmount: string;
  cancel: string;
  placeBid: string;
  errorEnterAmount: string;
  errorMinimumBid: string;
  errorMissingData: string;
  errorPlacingBid: string;
  errorOutbid: string;
  secondsRemaining: string;
};

type ItemCardTranslation = {
  currentPrice: string;
  timeLeft: string;
  winner: string;
  placeBid: string;
  signInToPlaceBids: string;
  auctionEnded: string;
  sold: string;
  active: string;
  minutes: string;
  seconds: string;
  failedToPlaceBid: string;
};

type ItemsListTranslation = {
  filterAuctions: string;
  category: string;
  allCategories: string;
  status: string;
  showOnlyActive: string;
  search: string;
  searchPlaceholder: string;
  resetFilters: string;
  noItemsMatch: string;
  currentPrice: string;
  lastBidBy: string;
  startingPrice: string;
  seller: string;
  remainingTime: string;
  placeBid: string;
  mustBeLoggedIn: string;
  failedToPlaceBid: string;
  auctionEnded: string;
  seconds: string;
};

type ProfileTranslation = {
  loadingProfile: string;
  errorLoading: string;
  you: string;
  seller: string;
  buyer: string;
  admin: string;
  noRating: string;
  email: string;
  phone: string;
  rating: string;
  reviews: string;
  reviewsCount: string;
  wonAuctions: string;
  noReviews: string;
  noWonAuctions: string;
  user: string;
  noComment: string;
  finishedOn: string;
};

// Define the structure of translations
type TranslationsType = {
  header: Record<Language, HeaderTranslation>;
  login: Record<Language, LoginTranslation>;
  addItem: Record<Language, AddItemTranslation>;
  review: Record<Language, ReviewTranslation>;
  bid: Record<Language, BidTranslation>;
  itemCard: Record<Language, ItemCardTranslation>;
  itemsList: Record<Language, ItemsListTranslation>;
  profile: Record<Language, ProfileTranslation>;
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: TranslationsType;
};

const translations: TranslationsType = {
  header: {
    ua: {
      home: 'Головна',
      login: 'Увійти',
      profile: 'Профіль',
      adminPanel: 'Адмін-панель',
      logout: 'Вийти',
      welcome: 'Вітаємо'
    },
    en: {
      home: 'Home',
      login: 'Login',
      profile: 'Profile',
      adminPanel: 'Admin Panel',
      logout: 'Logout',
      welcome: 'Welcome'
    }
  },
  login: {
    ua: {
      email: 'Введіть електронну пошту',
      password: 'Введіть пароль',
      firstName: 'Ім\'я',
      lastName: 'Прізвище',
      phone: 'Мобільний номер',
      register: 'Реєстрація',
      auth: 'Авторизація',
      buyer: 'Покупець',
      seller: 'Продавець',
      registerAs: 'Зареєструватися як:',
      haveAccount: 'У мене вже є акаунт',
      noAccount: 'У мене ще намає акаунту',
      close: 'Закрити',
      save: 'Зберегти',
      loading: 'Завантаження...'
    },
    en: {
      email: 'Enter email',
      password: 'Enter password',
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone Number',
      register: 'Register',
      auth: 'Login',
      buyer: 'Buyer',
      seller: 'Seller',
      registerAs: 'Register as:',
      haveAccount: 'I already have an account',
      noAccount: 'I don\'t have an account yet',
      close: 'Close',
      save: 'Save',
      loading: 'Loading...'
    }
  },
  addItem: {
    ua: {
      title: 'Додати предмет',
      itemName: 'Назва',
      description: 'Опис',
      startingPrice: 'Початкова ціна',
      category: 'Категорія',
      image: 'Зображення',
      close: 'Закрити',
      save: 'Зберегти',
      saving: 'Збереження...',
      errors: {
        userIdNotDefined: 'Помилка: ID користувача не визначено.',
        fillRequiredFields: 'Будь ласка, заповніть всі обов\'язкові поля правильно.',
        imageTooLarge: 'Файл зображення занадто великий. Будь ласка, виберіть менший файл.',
        invalidFileType: 'Невірний тип файлу. Будь ласка, завантажуйте тільки зображення.',
        unexpectedError: 'Виникла неочікувана помилка. Спробуйте ще раз.'
      }
    },
    en: {
      title: 'Add Item',
      itemName: 'Title',
      description: 'Description',
      startingPrice: 'Starting Price',
      category: 'Category',
      image: 'Image',
      close: 'Close',
      save: 'Save',
      saving: 'Saving...',
      errors: {
        userIdNotDefined: 'Error: User ID is not defined.',
        fillRequiredFields: 'Please fill in all required fields correctly.',
        imageTooLarge: 'The image file is too large. Please choose a smaller file.',
        invalidFileType: 'Invalid file type. Please upload only images.',
        unexpectedError: 'An unexpected error occurred. Please try again.'
      }
    }
  },
  review: {
    ua: {
      title: 'Оцініть ваш досвід',
      congratsHeading: 'Вітаємо! 🎉',
      congratsMessage: 'Ви виграли аукціон для',
      sellerExperience: 'Будь ласка, оцініть ваш досвід з продавцем',
      ratingPoor: 'Погано',
      ratingFair: 'Задовільно',
      ratingGood: 'Добре',
      ratingVeryGood: 'Дуже добре',
      ratingExcellent: 'Відмінно',
      commentLabel: 'Додайте коментар (необов\'язково)',
      commentPlaceholder: 'Поділіться своїм досвідом з цим продавцем...',
      charactersRemaining: 'символів залишилось',
      submitButton: 'Надіслати відгук',
      submitting: 'Надсилання...',
      thankYouMessage: 'Дякуємо за ваш відгук! Це вікно закриється автоматично.',
      errorSubmitting: 'Не вдалося надіслати відгук. Будь ласка, спробуйте ще раз.'
    },
    en: {
      title: 'Rate Your Experience',
      congratsHeading: 'Congratulations! 🎉',
      congratsMessage: 'You\'ve won the auction for',
      sellerExperience: 'Please rate your experience with seller',
      ratingPoor: 'Poor',
      ratingFair: 'Fair',
      ratingGood: 'Good',
      ratingVeryGood: 'Very Good',
      ratingExcellent: 'Excellent',
      commentLabel: 'Add a comment (optional)',
      commentPlaceholder: 'Share your experience with this seller...',
      charactersRemaining: 'characters remaining',
      submitButton: 'Submit Review',
      submitting: 'Submitting...',
      thankYouMessage: 'Thank you for your review! This window will close automatically.',
      errorSubmitting: 'Failed to submit review. Please try again.'
    }
  },
  bid: {
    ua: {
      highestBidder: 'Ви є найвищим учасником торгів!',
      placeBidOn: 'Зробити ставку на',
      currentPrice: 'Поточна ціна:',
      minimumBid: 'Мінімальна ставка:',
      lastBidder: 'Останній учасник торгів:',
      you: 'Ви',
      timeRemaining: 'Залишилось часу:',
      auctionEnded: 'Аукціон завершено',
      congratsWon: 'Вітаємо! Ви виграли цей аукціон!',
      auctionHasEnded: 'Цей аукціон завершено.',
      highestBidMessage: 'У вас зараз найвища ставка. Аукціон автоматично закриється, коли закінчиться час.',
      bidAmountLabel: 'Сума вашої ставки ($)',
      bidAmountHelp: 'Має бути щонайменше на 10% вище поточної ціни',
      enterAmount: 'Введіть суму (мін:',
      cancel: 'Скасувати',
      placeBid: 'Зробити ставку',
      errorEnterAmount: 'Будь ласка, введіть суму ставки',
      errorMinimumBid: 'Сума ставки повинна бути не менше $',
      errorMissingData: 'Дані про товар відсутні або неповні. Будь ласка, спробуйте ще раз.',
      errorPlacingBid: 'Не вдалося зробити ставку. Будь ласка, спробуйте ще раз.',
      errorOutbid: 'Вас перебили! тепер є найвищим учасником торгів.',
      secondsRemaining: 'секунд залишилось'
    },
    en: {
      highestBidder: 'You are the highest bidder!',
      placeBidOn: 'Place Bid on',
      currentPrice: 'Current Price:',
      minimumBid: 'Minimum Bid:',
      lastBidder: 'Last Bidder:',
      you: 'You',
      timeRemaining: 'Time Remaining:',
      auctionEnded: 'Auction has ended',
      congratsWon: 'Congratulations! You won this auction!',
      auctionHasEnded: 'This auction has ended.',
      highestBidMessage: 'You currently have the highest bid. The auction will close automatically when the timer expires.',
      bidAmountLabel: 'Your Bid Amount ($)',
      bidAmountHelp: 'Must be at least 10% higher than the current price',
      enterAmount: 'Enter amount (min:',
      cancel: 'Cancel',
      placeBid: 'Place Bid',
      errorEnterAmount: 'Please enter a bid amount',
      errorMinimumBid: 'Bid amount must be at least $',
      errorMissingData: 'Item data is missing or incomplete. Please try again.',
      errorPlacingBid: 'Failed to place bid. Please try again.',
      errorOutbid: 'You\'ve been outbid! is now the highest bidder.',
      secondsRemaining: 'seconds remaining'
    }
  },
  itemCard: {
    ua: {
      currentPrice: 'Поточна ціна:',
      timeLeft: 'Залишилось часу:',
      winner: 'Переможець:',
      placeBid: 'Зробити ставку',
      signInToPlaceBids: 'Увійдіть, щоб робити ставки',
      auctionEnded: 'Аукціон завершено',
      sold: 'Продано',
      active: 'Активний',
      minutes: 'хв',
      seconds: 'с',
      failedToPlaceBid: 'Не вдалося зробити ставку. Будь ласка, спробуйте ще раз.'
    },
    en: {
      currentPrice: 'Current price:',
      timeLeft: 'Time left:',
      winner: 'Winner:',
      placeBid: 'Place a Bid',
      signInToPlaceBids: 'Sign in to place bids',
      auctionEnded: 'Auction ended',
      sold: 'Sold',
      active: 'Active',
      minutes: 'm',
      seconds: 's',
      failedToPlaceBid: 'Failed to place bid. Please try again.'
    }
  },
  itemsList: {
    ua: {
      filterAuctions: 'Фільтрувати аукціони',
      category: 'Категорія',
      allCategories: 'Всі категорії',
      status: 'Статус',
      showOnlyActive: 'Показувати тільки активні аукціони',
      search: 'Пошук',
      searchPlaceholder: 'Пошук за назвою або описом',
      resetFilters: 'Скинути фільтри',
      noItemsMatch: 'Жоден товар не відповідає вашим фільтрам.',
      currentPrice: 'Поточна ціна:',
      lastBidBy: 'Остання ставка від:',
      startingPrice: 'Початкова ціна:',
      seller: 'Продавець:',
      remainingTime: 'Залишилось:',
      placeBid: 'Зробити ставку',
      mustBeLoggedIn: 'Ви повинні увійти, щоб робити ставки.',
      failedToPlaceBid: 'Не вдалося зробити ставку. Будь ласка, спробуйте ще раз.',
      auctionEnded: 'Аукціон завершено',
      seconds: 'с залишилось'
    },
    en: {
      filterAuctions: 'Filter Auctions',
      category: 'Category',
      allCategories: 'All Categories',
      status: 'Status',
      showOnlyActive: 'Show only active auctions',
      search: 'Search',
      searchPlaceholder: 'Search by title or description',
      resetFilters: 'Reset Filters',
      noItemsMatch: 'No items match your filters.',
      currentPrice: 'Current Price:',
      lastBidBy: 'Last bid by:',
      startingPrice: 'Starting Price:',
      seller: 'Seller:',
      remainingTime: 'Remaining:',
      placeBid: 'Place Bid',
      mustBeLoggedIn: 'You must be logged in to place a bid.',
      failedToPlaceBid: 'Failed to place bid. Please try again.',
      auctionEnded: 'Auction ended',
      seconds: 's remaining'
    }
  },
  profile: {
    ua: {
      loadingProfile: 'Завантаження даних профілю...',
      errorLoading: 'Не вдалося завантажити дані профілю',
      you: 'Ви',
      seller: 'Продавець',
      buyer: 'Покупець',
      admin: 'Адміністратор',
      noRating: 'Немає оцінок',
      email: 'Електронна пошта',
      phone: 'Телефон',
      rating: 'Рейтинг',
      reviews: 'Відгуки',
      reviewsCount: 'відгуків',
      wonAuctions: 'Виграні аукціони',
      noReviews: 'У користувача поки немає відгуків',
      noWonAuctions: 'У користувача поки немає виграних аукціонів',
      user: 'Користувач',
      noComment: 'Немає коментаря',
      finishedOn: 'Завершено'
    },
    en: {
      loadingProfile: 'Loading profile data...',
      errorLoading: 'Failed to load profile data',
      you: 'You',
      seller: 'Seller',
      buyer: 'Buyer',
      admin: 'Administrator',
      noRating: 'No ratings',
      email: 'Email',
      phone: 'Phone',
      rating: 'Rating',
      reviews: 'Reviews',
      reviewsCount: 'reviews',
      wonAuctions: 'Won Auctions',
      noReviews: 'User has no reviews yet',
      noWonAuctions: 'User has no won auctions yet',
      user: 'User',
      noComment: 'No comment',
      finishedOn: 'Finished on'
    }
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ua');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};