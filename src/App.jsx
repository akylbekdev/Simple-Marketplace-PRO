import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  linkWithCredential,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth, db, provider, isFirebaseReady } from './config/firebase';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import BrowsePage from './components/BrowsePage';
import SellPage from './components/SellPage';
import MyAdsPage from './components/MyAdsPage';
import StatsPage from './components/StatsPage';
import HelpPage from './components/HelpPage';
import AboutPage from './components/AboutPage';
import ProfilePage from './components/ProfilePage';
import AdminPage from './components/AdminPage';
import TrackerPage from './components/TrackerPage';
import AuthBar from './components/AuthBar';
import AIControlWidget from './components/AIControlWidget';
import './App.css';

const ADMIN_EMAILS = ['admin@marketplace.com', 'manager@marketplace.com']; // Замените на реальные email администраторов
const SUPPORTED_LOCALES = ['ru', 'en', 'ky'];
const LANGUAGE_NAMES = {
  ru: 'Русский',
  en: 'English',
  ky: 'Кыргызча'
};

const HERO_ACTION_KEYS = ['browse', 'sell', 'profile', 'google'];

const DEMO_ADS = [
  {
    id: 'demo-1',
    title: 'iPhone 13 128GB, идеальное состояние',
    category: 'Электроника',
    price: 47000,
    userName: 'Алина',
    createdBy: 'demo-user-1',
    imageUrl: 'https://picsum.photos/seed/market-1/900/700',
    createdAt: '2026-04-18T08:10:00.000Z'
  },
  {
    id: 'demo-2',
    title: 'MacBook Air M2, 16/512',
    category: 'Электроника',
    price: 98000,
    userName: 'Руслан',
    createdBy: 'demo-user-2',
    imageUrl: 'https://picsum.photos/seed/market-2/900/700',
    createdAt: '2026-04-17T15:30:00.000Z'
  },
  {
    id: 'demo-3',
    title: 'Nike Air Force 1, размер 42',
    category: 'Одежда',
    price: 6200,
    userName: 'Айжан',
    createdBy: 'demo-user-3',
    imageUrl: 'https://picsum.photos/seed/market-3/900/700',
    createdAt: '2026-04-16T11:05:00.000Z'
  },
  {
    id: 'demo-4',
    title: 'Toyota Camry 55, 2018',
    category: 'Авто',
    price: 1820000,
    userName: 'Нурбек',
    createdBy: 'demo-user-4',
    imageUrl: 'https://picsum.photos/seed/market-4/900/700',
    createdAt: '2026-04-15T13:22:00.000Z'
  },
  {
    id: 'demo-5',
    title: 'Игровой монитор 27 дюймов 165Hz',
    category: 'Электроника',
    price: 19500,
    userName: 'Дамир',
    createdBy: 'demo-user-5',
    imageUrl: 'https://picsum.photos/seed/market-5/900/700',
    createdAt: '2026-04-14T10:55:00.000Z'
  },
  {
    id: 'demo-6',
    title: 'Кожаная куртка, новая',
    category: 'Одежда',
    price: 8900,
    userName: 'Сезим',
    createdBy: 'demo-user-6',
    imageUrl: 'https://picsum.photos/seed/market-6/900/700',
    createdAt: '2026-04-13T09:40:00.000Z'
  },
  {
    id: 'demo-7',
    title: 'Hyundai Tucson 2020, AWD',
    category: 'Авто',
    price: 2140000,
    userName: 'Бек',
    createdBy: 'demo-user-7',
    imageUrl: 'https://picsum.photos/seed/market-7/900/700',
    createdAt: '2026-04-12T16:00:00.000Z'
  },
  {
    id: 'demo-8',
    title: 'Диван-трансформер 3-местный',
    category: 'Другое',
    price: 28000,
    userName: 'Елена',
    createdBy: 'demo-user-8',
    imageUrl: 'https://picsum.photos/seed/market-8/900/700',
    createdAt: '2026-04-11T12:15:00.000Z'
  },
  {
    id: 'demo-9',
    title: 'PlayStation 5 + 2 геймпада',
    category: 'Электроника',
    price: 52000,
    userName: 'Тимур',
    createdBy: 'demo-user-9',
    imageUrl: 'https://picsum.photos/seed/market-9/900/700',
    createdAt: '2026-04-10T17:33:00.000Z'
  },
  {
    id: 'demo-10',
    title: 'Смарт-часы Garmin Venu 2',
    category: 'Электроника',
    price: 14500,
    userName: 'Медина',
    createdBy: 'demo-user-10',
    imageUrl: 'https://picsum.photos/seed/market-10/900/700',
    createdAt: '2026-04-09T14:05:00.000Z'
  },
  {
    id: 'demo-11',
    title: 'Горный велосипед Trek',
    category: 'Другое',
    price: 38000,
    userName: 'Арсен',
    createdBy: 'demo-user-11',
    imageUrl: 'https://picsum.photos/seed/market-11/900/700',
    createdAt: '2026-04-08T10:20:00.000Z'
  },
  {
    id: 'demo-12',
    title: 'Платье вечернее, размер M',
    category: 'Одежда',
    price: 4500,
    userName: 'Диана',
    createdBy: 'demo-user-12',
    imageUrl: 'https://picsum.photos/seed/market-12/900/700',
    createdAt: '2026-04-07T18:12:00.000Z'
  }
];

const translations = {
  ru: {
    appTitle: 'Simple Marketplace PRO',
    eyebrow: 'Твой маркетплейс на Firebase',
    homeHeadline: 'Маркетплейс для покупки и продажи товаров',
    tagline: 'Быстрый, современный и безопасный маркетплейс с Firebase Auth, Storage и реальным обновлением объявлений.',
    homeAbout: 'Проект Pablonik: удобная площадка, где можно быстро найти нужный товар или разместить свое объявление за пару минут.',
    homeCtaStart: 'Начать',
    homeCtaPublish: 'Разместить объявление',
    demoModeBadge: 'Демо-каталог: 12 тестовых товаров с ценами и фото',
    searchWithFilters: 'Поиск с фильтрами',
    heroTags: ['Объявления', 'Загрузка фото', 'Пользовательский доступ', 'Вход Google'],
    footer: '© 2026 Simple Marketplace. Все права защищены.',
    firebaseUnavailable: 'Firebase ещё не настроен. Добавьте VITE_FIREBASE_* переменные в .env.local.',
    userLoading: 'Загружаем профиль...',
    notAuthorized: 'Не авторизован',
    connectedStatus: 'Подключено к Firebase, объявления обновляются в реальном времени.',
    loginGoogle: 'Войти с Google',
    loginEmail: 'Войти по email',
    registerEmail: 'Создать аккаунт',
    authPanelTitle: 'Вход и регистрация',
    authPanelDescription: 'Используйте email и пароль или Google, чтобы сохранить свои объявления и профиль.',
    authModeLogin: 'Вход',
    authModeRegister: 'Регистрация',
    authNameLabel: 'Имя',
    authNamePlaceholder: 'Как вас показать в профиле',
    authEmailPlaceholder: 'you@example.com',
    authPasswordLabel: 'Пароль',
    authPasswordPlaceholder: 'Минимум 6 символов',
    authSubmitLogin: 'Войти',
    authSubmitRegister: 'Зарегистрироваться',
    authSubmitLoading: 'Подключаем...',
    authSwitchToLogin: 'Уже есть аккаунт?',
    authSwitchToRegister: 'Нет аккаунта?',
    authSwitchActionLogin: 'Войти',
    authSwitchActionRegister: 'Зарегистрироваться',
    authGuestHint: 'Сейчас вы как гость. Регистрация сохранит текущий профиль и объявления.',
    authExistingHint: 'Войдите по email или через Google.',
    authLoginSuccess: 'Вы вошли в аккаунт.',
    authRegisterSuccess: 'Аккаунт создан.',
    authEmailRequired: 'Введите email.',
    authPasswordRequired: 'Введите пароль.',
    authPasswordShort: 'Пароль должен быть не короче 6 символов.',
    authNameRequired: 'Введите имя для профиля.',
    signOut: 'Выйти',
    adminBadge: 'Администратор',
    adminTitle: 'Панель администратора',
    adminDescription: 'Мониторьте объявления, удаляйте нежелательные публикации и управляйте маркетплейсом.',
    totalAds: 'Всего объявлений',
    myAds: 'Моих объявлений',
    topCategory: 'Трендовая категория',
    newestAd: 'Новое объявление',
    activeCategories: 'Активные категории',
    noAdsYet: 'Пока нет объявлений',
    totalUsers: 'Уникальных продавцов',
    categoriesByAds: 'Категории по количеству объявлений',
    adTitle: 'Название',
    category: 'Категория',
    price: 'Цена',
    author: 'Автор',
    actions: 'Действия',
    anonymousUser: 'Гость',
    guestAnonymous: 'Гость (анонимный пользователь)',
    delete: 'Удалить',
    authRequired: 'Требуется авторизация для добавления объявления',
    fillAllFields: 'Пожалуйста, заполните все поля',
    invalidPrice: 'Цена должна быть положительным числом',
    addAdHeading: 'Добавить объявление',
    titleLabel: 'Название *',
    priceLabel: 'Цена (сом) *',
    home: 'Главная',
    browse: 'Каталог',
    sell: 'Продать',
    navMyAds: 'Мои объявления',
    stats: 'Статистика',
    help: 'Помощь',
    about: 'О сервисе',
    admin: 'Админ',
    profile: 'Профиль',
    dashboard: 'Дашборд',
    welcome: 'Добро пожаловать в Simple Marketplace!',
    profileSummary: 'Профиль',
    userEmail: 'Email',
    userUid: 'UID',
    userProvider: 'Провайдер',
    userPrefix: 'Пользователь',
    profileSigninPrompt: 'Войдите или зарегистрируйтесь через Google.',
    profileWelcomeText: 'Здесь вы можете управлять аккаунтом и выйти из системы.',
    loginOrRegister: 'Войти / Зарегистрироваться',
    descriptionLabel: 'Описание *',
    categoryLabel: 'Категория *',
    imageLabel: 'Фото товара',
    imageHint: 'Загрузите изображение для улучшенного просмотра.',
    addButton: 'Добавить объявление',
    savingButton: 'Сохраняем...',
    formHint: 'Войдите, чтобы разместить товар.',
    searchLabel: 'Поиск по названию:',
    searchPlaceholder: 'Введите название...',
    sortLabel: 'Сортировка:',
    sortNewest: 'Новые сначала',
    sortOldest: 'Старые сначала',
    sortAsc: 'Дешевле → Дороже',
    sortDesc: 'Дороже → Дешевле',
    showMine: 'Только мои объявления',
    allCategories: 'Все категории',
    loadingAds: '⏳ Загрузка объявлений...',
    errorLoadingAds: '❌ Ошибка: ',
    noAdsFound: '📭 Объявления не найдены',
    adsHeading: 'Объявления',
    dateUnknown: 'Дата неизвестна',
    postedBy: 'Размещено',
    noPhoto: 'Нет фото',
    confirmDelete: 'Вы уверены, что хотите удалить это объявление?',
    themeDark: 'Тёмная тема',
    themeLight: 'Светлая тема',
    themeLabel: 'Тема',
    selectLanguage: 'Язык',
    highlightLabel: 'Подсветка',
    highlightStyleLabel: 'Выбрать стиль подсветки',
    customHighlightLabel: 'Радужный круг',
    languageButton: 'EN',
    highlightOn: 'Подсветка включена',
    highlightOff: 'Подсветка',
    categories: ['Электроника', 'Одежда', 'Авто', 'Другое'],
    noCategoriesYet: 'Категорий пока нет',
    currencySuffix: 'сом',
    titlePlaceholder: 'Введите заголовок объявления',
    pricePlaceholder: 'Введите цену',
    descriptionPlaceholder: 'Опишите товар',
    uploading: 'Загрузка',
    helpTitle: 'Нужна помощь?',
    helpDescription: 'Здесь вы найдёте ответы на популярные вопросы и можете быстро начать работу.',
    faqTitle: 'Часто задаваемые вопросы',
    faq1: 'Как разместить объявление?',
    faq1Answer: 'Войдите через Google и перейдите на страницу «Продать», чтобы создать объявление.',
    faq2: 'Где я могу увидеть свои объявления?',
    faq2Answer: 'На странице «Мои объявления» вы увидите свои активные публикации.',
    aboutTitle: 'О Simple Marketplace',
    aboutDescription: 'Simple Marketplace PRO — это современная площадка на Firebase для продажи и покупки товаров.',
    tracker: 'Трекер расходов',
    trackerTitle: 'Трекер расходов',
    trackerDesc: 'Записывайте расходы и следите за бюджетом в реальном времени через Firebase.',
    trackerAddTitle: 'Добавить расход',
    trackerExpenseName: 'Название',
    trackerExpenseNamePlaceholder: 'Кофе, такси, продукты...',
    trackerExpenseAmount: 'Сумма',
    trackerExpenseAmountPlaceholder: 'Введите сумму',
    trackerExpenseCategory: 'Категория',
    trackerExpenseDate: 'Дата',
    trackerAddBtn: 'Добавить',
    trackerSavingBtn: 'Сохраняем...',
    trackerTotal: 'Итого потрачено',
    trackerNoExpenses: 'Расходов пока нет. Добавьте первый!',
    trackerLoginRequired: 'Войдите в аккаунт, чтобы использовать трекер расходов.',
    trackerDeleteConfirm: 'Удалить этот расход?',
    trackerCategories: ['Еда', 'Транспорт', 'Покупки', 'Развлечения', 'Здоровье', 'Другое'],
    trackerFilterAll: 'Все категории',
    trackerLoadingMsg: 'Загрузка расходов...',
    trackerThisMonth: 'Этот месяц',
    trackerAllTime: 'За всё время',
    locale: 'ru'
  },
  en: {
    appTitle: 'Simple Marketplace PRO',
    eyebrow: 'Your Firebase marketplace',
    homeHeadline: 'Marketplace for buying and selling goods',
    tagline: 'Fast, modern and secure marketplace with Firebase Auth, Storage and real-time updates.',
    homeAbout: 'Pablonik project: a practical place to discover products quickly and publish your own listings in minutes.',
    homeCtaStart: 'Start now',
    homeCtaPublish: 'Post listing',
    demoModeBadge: 'Demo catalog: 12 sample products with prices and photos',
    searchWithFilters: 'Search with filters',
    heroTags: ['Realtime Ads', 'Image Upload', 'User Ownership', 'Google Sign In'],
    footer: '© 2026 Simple Marketplace. All rights reserved.',
    firebaseUnavailable: 'Firebase is not configured yet. Add VITE_FIREBASE_* values to .env.local.',
    userLoading: 'Loading profile...',
    notAuthorized: 'Not authorized',
    connectedStatus: 'Connected to Firebase, ads update in real time.',
    loginGoogle: 'Sign in with Google',
    loginEmail: 'Sign in with email',
    registerEmail: 'Create account',
    authPanelTitle: 'Sign in and register',
    authPanelDescription: 'Use email and password or Google to keep your listings and profile.',
    authModeLogin: 'Sign in',
    authModeRegister: 'Register',
    authNameLabel: 'Name',
    authNamePlaceholder: 'How your profile should appear',
    authEmailPlaceholder: 'you@example.com',
    authPasswordLabel: 'Password',
    authPasswordPlaceholder: 'Minimum 6 characters',
    authSubmitLogin: 'Sign in',
    authSubmitRegister: 'Create account',
    authSubmitLoading: 'Connecting...',
    authSwitchToLogin: 'Already have an account?',
    authSwitchToRegister: 'Need an account?',
    authSwitchActionLogin: 'Sign in',
    authSwitchActionRegister: 'Register',
    authGuestHint: 'You are browsing as a guest. Registration will keep your current profile and listings.',
    authExistingHint: 'Sign in with email or continue with Google.',
    authLoginSuccess: 'Signed in successfully.',
    authRegisterSuccess: 'Account created successfully.',
    authEmailRequired: 'Enter an email address.',
    authPasswordRequired: 'Enter a password.',
    authPasswordShort: 'Password must be at least 6 characters.',
    authNameRequired: 'Enter a profile name.',
    signOut: 'Sign out',
    adminBadge: 'Administrator',
    adminTitle: 'Admin Dashboard',
    adminDescription: 'Monitor ads, remove unwanted listings and manage the marketplace.',
    totalAds: 'Total ads',
    myAds: 'My ads',
    topCategory: 'Trending category',
    newestAd: 'Newest ad',
    activeCategories: 'Active categories',
    noAdsYet: 'No ads found yet',
    totalUsers: 'Unique sellers',
    categoriesByAds: 'Categories by listing count',
    adTitle: 'Title',
    category: 'Category',
    price: 'Price',
    author: 'Author',
    actions: 'Actions',
    anonymousUser: 'Guest',
    guestAnonymous: 'Guest (anonymous user)',
    delete: 'Delete',
    authRequired: 'Authentication is required to add an ad',
    fillAllFields: 'Please fill in all fields',
    invalidPrice: 'Price must be a positive number',
    addAdHeading: 'Add an ad',
    titleLabel: 'Title *',
    priceLabel: 'Price (som) *',
    home: 'Home',
    browse: 'Browse',
    sell: 'Sell',
    navMyAds: 'My Ads',
    stats: 'Stats',
    help: 'Help',
    about: 'About',
    admin: 'Admin',
    profile: 'Profile',
    dashboard: 'Dashboard',
    welcome: 'Welcome to Simple Marketplace!',
    profileSummary: 'Profile',
    userEmail: 'Email',
    userUid: 'UID',
    userProvider: 'Provider',
    userPrefix: 'User',
    profileSigninPrompt: 'Sign in or register with Google.',
    profileWelcomeText: 'Manage your account here and sign out when needed.',
    loginOrRegister: 'Sign in / Register',
    descriptionLabel: 'Description *',
    categoryLabel: 'Category *',
    imageLabel: 'Item photo',
    imageHint: 'Upload an image for better listing visibility.',
    addButton: 'Add ad',
    savingButton: 'Saving...',
    formHint: 'Log in to create an ad.',
    searchLabel: 'Search by title:',
    searchPlaceholder: 'Type a title...',
    sortLabel: 'Sort by:',
    sortNewest: 'Newest first',
    sortOldest: 'Oldest first',
    sortAsc: 'Lowest → Highest',
    sortDesc: 'Highest → Lowest',
    showMine: 'Only my ads',
    allCategories: 'All categories',
    loadingAds: '⏳ Loading ads...',
    errorLoadingAds: '❌ Error: ',
    noAdsFound: '📭 No ads found',
    adsHeading: 'Ads',
    dateUnknown: 'Date unknown',
    postedBy: 'Posted by',
    noPhoto: 'No photo',
    confirmDelete: 'Are you sure you want to delete this ad?',
    themeDark: 'Dark theme',
    themeLight: 'Light theme',
    themeLabel: 'Theme',
    selectLanguage: 'Language',
    highlightLabel: 'Highlight',
    highlightStyleLabel: 'Choose highlight style',
    customHighlightLabel: 'Rainbow ring',
    languageButton: 'RU',
    highlightOn: 'Highlight on',
    highlightOff: 'Highlight off',
    categories: ['Electronics', 'Clothing', 'Auto', 'Other'],
    noCategoriesYet: 'No categories yet',
    currencySuffix: 'som',
    titlePlaceholder: 'Enter an ad title',
    pricePlaceholder: 'Enter a price',
    descriptionPlaceholder: 'Describe the item',
    uploading: 'Uploading',
    helpTitle: 'Need help?',
    helpDescription: 'Find answers to common questions and get started quickly.',
    faqTitle: 'Frequently Asked Questions',
    faq1: 'How do I post an ad?',
    faq1Answer: 'Sign in with Google and visit the Sell page to create a new listing.',
    faq2: 'Where can I see my listings?',
    faq2Answer: 'Your active ads are visible on the My Ads page.',
    aboutTitle: 'About Simple Marketplace',
    aboutDescription: 'Simple Marketplace PRO is a modern Firebase-powered marketplace for buying and selling items.',
    tracker: 'Expense Tracker',
    trackerTitle: 'Expense Tracker',
    trackerDesc: 'Log your expenses and track your budget in real time with Firebase.',
    trackerAddTitle: 'Add Expense',
    trackerExpenseName: 'Title',
    trackerExpenseNamePlaceholder: 'Coffee, taxi, groceries...',
    trackerExpenseAmount: 'Amount',
    trackerExpenseAmountPlaceholder: 'Enter amount',
    trackerExpenseCategory: 'Category',
    trackerExpenseDate: 'Date',
    trackerAddBtn: 'Add',
    trackerSavingBtn: 'Saving...',
    trackerTotal: 'Total spent',
    trackerNoExpenses: 'No expenses yet. Add your first!',
    trackerLoginRequired: 'Sign in to use the expense tracker.',
    trackerDeleteConfirm: 'Delete this expense?',
    trackerCategories: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Other'],
    trackerFilterAll: 'All categories',
    trackerLoadingMsg: 'Loading expenses...',
    trackerThisMonth: 'This month',
    trackerAllTime: 'All time',
    locale: 'en'
  },
  ky: {
    appTitle: 'Simple Marketplace PRO',
    eyebrow: 'Firebase базасындагы маркетплейс',
    homeHeadline: 'Товар сатып алуу жана сатуу үчүн маркетплейс',
    tagline: 'Firebase Auth, Storage жана реалдуу убакыт жаңыртуулар менен ылдам, заманбап жана коопсуз маркетплейс.',
    homeAbout: 'Pablonik долбоору: керектүү товарды бат табууга жана өз жарыяңызды бир нече мүнөттө жайгаштырууга ыңгайлуу аянтча.',
    homeCtaStart: 'Баштоо',
    homeCtaPublish: 'Жарыя жайгаштыруу',
    demoModeBadge: 'Демо-каталог: 12 тесттик товар, баалар жана сүрөттөр',
    searchWithFilters: 'Фильтр менен издөө',
    heroTags: ['Жандуу жарнамалар', 'Сүрөт жүктөө', 'Колдонуучу ээлик', 'Google кирүү'],
    footer: '© 2026 Simple Marketplace. Бардык укуктар корголгон.',
    firebaseUnavailable: 'Firebase али жөндөлө элек. .env.local файлына VITE_FIREBASE_* маанилерин кошуңуз.',
    userLoading: 'Профиль жүктөлүүдө...',
    notAuthorized: 'Ыксысыз',
    connectedStatus: 'Firebase менен туташты, жарнамалар реалдуу убакытта жаңыртылат.',
    loginGoogle: 'Google аркылуу кирүү',
    loginEmail: 'Email менен кирүү',
    registerEmail: 'Аккаунт түзүү',
    authPanelTitle: 'Кирүү жана катталуу',
    authPanelDescription: 'Жарнамаларыңызды жана профилди сактоо үчүн email, пароль же Google колдонуңуз.',
    authModeLogin: 'Кирүү',
    authModeRegister: 'Катталуу',
    authNameLabel: 'Аты-жөнү',
    authNamePlaceholder: 'Профилде кандай көрүнсүн',
    authEmailPlaceholder: 'you@example.com',
    authPasswordLabel: 'Пароль',
    authPasswordPlaceholder: 'Кеминде 6 белги',
    authSubmitLogin: 'Кирүү',
    authSubmitRegister: 'Катталуу',
    authSubmitLoading: 'Туташууда...',
    authSwitchToLogin: 'Аккаунтуңуз барбы?',
    authSwitchToRegister: 'Аккаунтуңуз жокпу?',
    authSwitchActionLogin: 'Кириңиз',
    authSwitchActionRegister: 'Катталыңыз',
    authGuestHint: 'Азыр сиз коноксуз. Катталсаңыз, учурдагы профиль жана жарнамалар сакталат.',
    authExistingHint: 'Email менен кириңиз же Google колдонуңуз.',
    authLoginSuccess: 'Аккаунтка кирдиңиз.',
    authRegisterSuccess: 'Аккаунт түзүлдү.',
    authEmailRequired: 'Email киргизиңиз.',
    authPasswordRequired: 'Пароль киргизиңиз.',
    authPasswordShort: 'Пароль кеминде 6 белгиден турушу керек.',
    authNameRequired: 'Профиль үчүн атты киргизиңиз.',
    signOut: 'Чыгуу',
    adminBadge: 'Админ',
    adminTitle: 'Админ панел',
    adminDescription: 'Жарнамаларды көзөмөлдөңүз, керексиз билдирүүлөрдү өчүрүңүз жана маркетплейсти башкарыңыз.',
    totalAds: 'Жалпы жарнамалар',
    myAds: 'Менин жарнамаларым',
    topCategory: 'Тренд категория',
    newestAd: 'Жаңы жарнама',
    activeCategories: 'Иштеп жаткан категориялар',
    noAdsYet: 'Азырынча жарнамалар жок',
    totalUsers: 'Уникалдуу сатуучулар',
    categoriesByAds: 'Жарнама саны боюнча категориялар',
    adTitle: 'Аты',
    category: 'Категория',
    price: 'Баасы',
    author: 'Автор',
    actions: 'Иштеп',
    anonymousUser: 'Конок',
    guestAnonymous: 'Конок (атсыз колдонуучу)',
    delete: 'Өчүрүү',
    authRequired: 'Жарнама кошуу үчүн кирүү керек',
    fillAllFields: 'Бардык талааларды толтуруңуз',
    invalidPrice: 'Баасы позитивдүү сан болуусу керек',
    addAdHeading: 'Жарнама кошуу',
    titleLabel: 'Аталышы *',
    priceLabel: 'Баасы (сом) *',
    home: 'Башкы',
    browse: 'Издөө',
    sell: 'Сатуу',
    navMyAds: 'Менин жарнамаларым',
    stats: 'Статистика',
    help: 'Жардам',
    about: 'Биз жөнүндө',
    admin: 'Админ',
    profile: 'Профиль',
    dashboard: 'Башкаруу панели',
    welcome: 'Simple Marketplaceке кош келиңиз!',
    profileSummary: 'Профиль',
    userEmail: 'Email',
    userUid: 'UID',
    userProvider: 'Провайдер',
    userPrefix: 'Колдонуучу',
    profileSigninPrompt: 'Google аркылуу кириңиз же катталып алыңыз.',
    profileWelcomeText: 'Бул жерде аккаунтуңузду башкарсаңыз болот жана чыгууга болот.',
    loginOrRegister: 'Кириңиз / Катталыңыз',
    descriptionLabel: 'Сүрөттөө *',
    categoryLabel: 'Категория *',
    imageLabel: 'Товардын сүрөтү',
    imageHint: 'Жарнаманы жакшыраак көрсөтүү үчүн сүрөт жүктөп коюңуз.',
    addButton: 'Жарнама кошуу',
    savingButton: 'Сакталууда...',
    formHint: 'Жарнама берүү үчүн кириңиз.',
    searchLabel: 'Аталыш боюнча издөө:',
    searchPlaceholder: 'Аталышты киргизиңиз...',
    sortLabel: 'Тандоо:',
    sortNewest: 'Жаңысы биринчи',
    sortOldest: 'Эскиси биринчи',
    sortAsc: 'Арзан → Кымбат',
    sortDesc: 'Кымбат → Арзан',
    showMine: 'Менин жарнамаларым гана',
    allCategories: 'Бардык категориялар',
    loadingAds: '⏳ Жарнамалар жүктөлүүдө...',
    errorLoadingAds: '❌ Ката: ',
    noAdsFound: '📭 Жарнамалар табылган жок',
    adsHeading: 'Жарнамалар',
    dateUnknown: 'Дата белгисиз',
    postedBy: 'Жарыялады',
    noPhoto: 'Сүрөт жок',
    confirmDelete: 'Бул жарнаманы өчүргүңүз келеби?',
    themeDark: 'Кара тема',
    themeLight: 'Жарык тема',
    themeLabel: 'Тема',
    selectLanguage: 'Тил',
    highlightLabel: 'Жарык',
    highlightStyleLabel: 'Жарык стилин тандаңыз',
    customHighlightLabel: 'Радуга',
    highlightOn: 'Жарыкты күйгүзүү',
    highlightOff: 'Жарыкты өчүрүү',
    languageButton: 'РУ',
    categories: ['Электроника', 'Кийим', 'Авто', 'Башка'],
    noCategoriesYet: 'Категориялар жок',
    currencySuffix: 'сом',
    titlePlaceholder: 'Жарнаманын аталышын киргизиңиз',
    pricePlaceholder: 'Баасын киргизиңиз',
    descriptionPlaceholder: 'Товарды сүрөттөп бериңиз',
    uploading: 'Жүктөлүүдө',
    helpTitle: 'Жардам керекпи?',
    helpDescription: 'Көп берилүүчү суроолорго жооп табыңыз жана тез баштаңыз.',
    faqTitle: 'Көп берилүүчү суроолор',
    faq1: 'Жарнаманы кантип жайгаштырсам болот?',
    faq1Answer: 'Google аркылуу кириңиз жана Сатуу бетине өтүп жаңы жарнама түзүңүз.',
    faq2: 'Менин жарнамаларымды кайдан көрсөм болот?',
    faq2Answer: 'Менин жарнамаларым бетинде активдүү жарнамаларыңызды табасыз.',
    aboutTitle: 'Simple Marketplace жөнүндө',
    aboutDescription: 'Simple Marketplace PRO — бул Firebase негизиндеги заманбап сатып алуу-жеткирүү аянты.',
    tracker: 'Чыгым трекери',
    trackerTitle: 'Чыгым трекери',
    trackerDesc: 'Чыгымдарыңызды жазып, бюджетти Firebase аркылуу реалдуу убакытта байкаңыз.',
    trackerAddTitle: 'Чыгым кошуу',
    trackerExpenseName: 'Аталышы',
    trackerExpenseNamePlaceholder: 'Кофе, такси, азык-түлүк...',
    trackerExpenseAmount: 'Суммасы',
    trackerExpenseAmountPlaceholder: 'Сумманы киргизиңиз',
    trackerExpenseCategory: 'Категория',
    trackerExpenseDate: 'Дата',
    trackerAddBtn: 'Кошуу',
    trackerSavingBtn: 'Сакталууда...',
    trackerTotal: 'Жалпы чыгым',
    trackerNoExpenses: 'Азырынча чыгымдар жок. Биринчини кошуңуз!',
    trackerLoginRequired: 'Чыгым трекерин колдонуу үчүн кириңиз.',
    trackerDeleteConfirm: 'Бул чыгымды өчүрөсүзбү?',
    trackerCategories: ['Тамак', 'Транспорт', 'Сатып алуу', 'Эглентки', 'Ден соолук', 'Башка'],
    trackerFilterAll: 'Бардык категориялар',
    trackerLoadingMsg: 'Чыгымдар жүктөлүүдө...',
    trackerThisMonth: 'Бул ай',
    trackerAllTime: 'Бардык убакыт',
    locale: 'ky'
  }
};

function AppContent() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('marketplace-theme') || 'light');
  const [locale, setLocale] = useState(() => localStorage.getItem('marketplace-locale') || 'ru');
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [showMine, setShowMine] = useState(false);
  const [highlightEnabled, setHighlightEnabled] = useState(false);
  const [highlightStyle, setHighlightStyle] = useState(
    () => localStorage.getItem('marketplace-highlight-style') || 'blue'
  );
  const [highlightColor, setHighlightColor] = useState(
    () => localStorage.getItem('marketplace-highlight-color') || '#3b82f6'
  );
  const [highlightColors, setHighlightColors] = useState(() => {
    const saved = localStorage.getItem('marketplace-highlight-colors');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [localStorage.getItem('marketplace-highlight-color') || '#3b82f6'];
  });
  const [logoZoom, setLogoZoom] = useState(false);

  const t = translations[locale] || translations.ru;
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false;
  const usingDemoAds = ads.length === 0;
  const adsToShow = usingDemoAds ? DEMO_ADS : ads;
  const effectiveLoading = loading && !usingDemoAds;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('marketplace-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('marketplace-locale', locale);
  }, [locale]);

  useEffect(() => {
    localStorage.setItem('marketplace-highlight-style', highlightStyle);
  }, [highlightStyle]);

  useEffect(() => {
    localStorage.setItem('marketplace-highlight-color', highlightColor);
    document.documentElement.style.setProperty('--highlight-color', highlightColor);
  }, [highlightColor]);

  useEffect(() => {
    document.documentElement.dataset.highlightStyle = highlightStyle;
  }, [highlightStyle]);

  useEffect(() => {
    localStorage.setItem('marketplace-highlight-colors', JSON.stringify(highlightColors));
    if (highlightColors.length >= 2) {
      // Build a looping gradient: colors + first color again to close the loop
      const stops = [...highlightColors, highlightColors[0]].join(', ');
      document.documentElement.style.setProperty(
        '--highlight-gradient-full',
        `linear-gradient(270deg, ${stops})`
      );
    } else {
      const c = highlightColors[0] || highlightColor;
      document.documentElement.style.setProperty(
        '--highlight-gradient-full',
        `linear-gradient(270deg, ${c}, ${c})`
      );
    }
  }, [highlightColors, highlightColor]);

  useEffect(() => {
    if (!isFirebaseReady) {
      setAuthLoading(false);
      setAuthError(t.firebaseUnavailable);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          setAuthLoading(false);
          setAuthError('');
        } else {
          // Continue in guest mode when there is no authenticated user.
          // This avoids Identity Toolkit errors if anonymous auth is disabled.
          setUser(null);
          setAuthLoading(false);
          setAuthError('');
        }
      },
      (err) => {
        setAuthError(err.message || t.authRequired);
        setAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, [t.authRequired]);

  useEffect(() => {
    if (!isFirebaseReady) {
      setLoading(false);
      setError('');
      return;
    }

    const adsQuery = query(collection(db, 'ads'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      adsQuery,
      (snapshot) => {
        const adsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        setAds(adsData);
        setLoading(false);
      },
      (err) => {
        console.error('Ошибка при загрузке объявлений:', err);
        setError(t.errorLoadingAds + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [t.errorLoadingAds]);

  const normalizeTimestamp = (value) => {
    if (!value) return 0;
    if (typeof value.toDate === 'function') return value.toDate().getTime();
    if (value instanceof Date) return value.getTime();
    return new Date(value).getTime();
  };

  const getFilteredAndSortedAds = useMemo(() => {
    let filtered = [...adsToShow];

    if (showMine && user) {
      filtered = filtered.filter((ad) => ad.createdBy === user.uid);
    }

    if (searchValue.trim()) {
      filtered = filtered.filter((ad) =>
        ad.title.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((ad) => ad.category === selectedCategory);
    }

    if (sortOrder) {
      filtered = filtered.sort((a, b) => {
        const priceA = Number(a.price) || 0;
        const priceB = Number(b.price) || 0;
        const dateA = normalizeTimestamp(a.createdAt);
        const dateB = normalizeTimestamp(b.createdAt);

        if (sortOrder === 'asc') return priceA - priceB;
        if (sortOrder === 'desc') return priceB - priceA;
        if (sortOrder === 'oldest') return dateA - dateB;
        return dateB - dateA;
      });
    }

    return filtered;
  }, [adsToShow, showMine, user, searchValue, selectedCategory, sortOrder]);

  const myAds = adsToShow.filter((ad) => ad.createdBy === user?.uid);

  const filteredAds = getFilteredAndSortedAds;

  const syncUserProfileToFirestore = async (firebaseUser, preferredName = '') => {
    if (!isFirebaseReady || !firebaseUser?.uid) {
      return;
    }

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnapshot = await getDoc(userRef);

      const profileData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || null,
        displayName: preferredName || firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || null,
        providerId: firebaseUser.providerData?.[0]?.providerId || 'unknown',
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (!userSnapshot.exists()) {
        profileData.createdAt = serverTimestamp();
      }

      await setDoc(userRef, profileData, { merge: true });
    } catch (profileError) {
      // Keep auth flow successful even if profile sync rules are stricter.
      console.warn('Не удалось синхронизировать профиль в Firestore:', profileError);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError('');
    setAuthMessage('');
    if (!isFirebaseReady) {
      setAuthError(t.firebaseUnavailable);
      setAuthLoading(false);
      return;
    }

    try {
      const popupResult = await signInWithPopup(auth, provider);
      await syncUserProfileToFirestore(popupResult.user);
      setAuthMessage(t.authLoginSuccess);
    } catch (err) {
      setAuthError(err.message || t.loginGoogle);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailAuth = async ({ mode, name, email, password }) => {
    const normalizedEmail = email.trim();
    const normalizedName = name.trim();

    if (!normalizedEmail) {
      setAuthError(t.authEmailRequired);
      return false;
    }

    if (!password) {
      setAuthError(t.authPasswordRequired);
      return false;
    }

    if (password.length < 6) {
      setAuthError(t.authPasswordShort);
      return false;
    }

    if (mode === 'register' && !normalizedName) {
      setAuthError(t.authNameRequired);
      return false;
    }

    if (!isFirebaseReady) {
      setAuthError(t.firebaseUnavailable);
      return false;
    }

    setAuthLoading(true);
    setAuthError('');
    setAuthMessage('');

    try {
      if (mode === 'register') {
        if (user?.isAnonymous) {
          const credential = EmailAuthProvider.credential(normalizedEmail, password);
          const linkedResult = await linkWithCredential(user, credential);
          await updateProfile(linkedResult.user, { displayName: normalizedName });
          await syncUserProfileToFirestore(linkedResult.user, normalizedName);
        } else {
          const createdUser = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
          await updateProfile(createdUser.user, { displayName: normalizedName });
          await syncUserProfileToFirestore(createdUser.user, normalizedName);
        }
        setAuthMessage(t.authRegisterSuccess);
      } else {
        const loginResult = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        await syncUserProfileToFirestore(loginResult.user);
        setAuthMessage(t.authLoginSuccess);
      }
      return true;
    } catch (err) {
      setAuthError(err.message || (mode === 'register' ? t.registerEmail : t.loginEmail));
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    setAuthError('');
    setAuthMessage('');
    if (!isFirebaseReady) {
      setAuthError(t.firebaseUnavailable);
      setAuthLoading(false);
      return;
    }

    try {
      await signOut(auth);
    } catch (err) {
      setAuthError(err.message || t.signOut);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDelete = async (adId) => {
    if (!isFirebaseReady) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'ads', adId));
    } catch (err) {
      console.error('Ошибка при удалении объявления:', err);
      setError(err.message || t.delete);
    }
  };

  const handleAdAdded = () => {
    // Ad added successfully, real-time update will handle the UI
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const handleLocaleChange = (newLocale) => {
    if (SUPPORTED_LOCALES.includes(newLocale)) {
      setLocale(newLocale);
    }
  };

  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleHeroAction = (action) => {
    switch (action) {
      case 'browse':
        navigate('/browse');
        break;
      case 'sell':
        navigate('/sell');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'google':
        if (!user || user.isAnonymous) {
          handleGoogleSignIn();
        } else {
          navigate('/');
        }
        break;
      default:
        break;
    }
  };

  const toggleHighlight = () => {
    if (!highlightEnabled && highlightStyle === 'off') {
      setHighlightStyle('blue');
    }
    setHighlightEnabled((value) => !value);
  };

  const handleSelectHighlightColor = (color) => {
    setHighlightColor(color);
    setHighlightColors([color]);
    setHighlightStyle('custom');
    setHighlightEnabled(true);
  };

  const handleSetHighlightColors = (colors) => {
    if (!colors || colors.length === 0) return;
    setHighlightColors(colors);
    if (colors.length >= 2) {
      setHighlightStyle('gradient');
      setHighlightEnabled(true);
    } else {
      setHighlightColor(colors[0]);
      setHighlightStyle('custom');
      setHighlightEnabled(true);
    }
  };

  const handleSetHighlightStyle = (style) => {
    setHighlightStyle(style);
    setHighlightEnabled(style !== 'off');
  };

  const toggleLogoZoom = () => setLogoZoom((value) => !value);

  const runAssistantAction = ({ type, value }) => {
    if (type === 'theme') {
      setTheme(value === 'dark' ? 'dark' : 'light');
      return value === 'dark' ? 'Theme switched to dark' : 'Theme switched to light';
    }

    if (type === 'locale') {
      if (SUPPORTED_LOCALES.includes(value)) {
        setLocale(value);
        return `Language changed: ${LANGUAGE_NAMES[value]}`;
      }
      return 'Language is not supported';
    }

    if (type === 'highlight') {
      if (value === 'off') {
        setHighlightEnabled(false);
        setHighlightStyle('off');
        return 'Highlight is off';
      }
      setHighlightEnabled(true);
      if (highlightStyle === 'off') {
        setHighlightStyle('blue');
      }
      return 'Highlight is on';
    }

    if (type === 'highlightStyle') {
      if (value === 'gradient') {
        const current = highlightColors[0] || highlightColor || '#3b82f6';
        if (highlightColors.length < 2) {
          setHighlightColors([current, '#8b5cf6']);
        }
      }
      setHighlightStyle(value);
      setHighlightEnabled(true);
      return `Highlight style: ${value}`;
    }

    if (type === 'navigate') {
      navigate(value || '/');
      return `Opened ${value || '/'}`;
    }

    return 'Command applied';
  };

  useEffect(() => {
    document.documentElement.dataset.highlight = highlightEnabled ? 'true' : 'false';
  }, [highlightEnabled]);

  useEffect(() => {
    document.documentElement.dataset.highlightStyle = highlightStyle;
  }, [highlightStyle]);

  return (
    <div className="app">
      {isHomePage && (
        <header className="app-header">
          <div className="app-header-content">
            <div className="app-header-top">
              <button
                type="button"
                className={`app-logo ${logoZoom ? 'zoomed' : ''}`}
                onClick={toggleLogoZoom}
                aria-label="Toggle logo zoom"
              >
                PB
              </button>
              <div>
                <p className="eyebrow">{t.eyebrow}</p>
                <h1 className="app-title">{t.homeHeadline}</h1>
                <p className="lead-text">{t.tagline}</p>
                <p className="project-note">{t.homeAbout}</p>
                {usingDemoAds && <span className="demo-pill">{t.demoModeBadge}</span>}
              </div>
            </div>
            <div className="hero-cta-row">
              <button
                type="button"
                className="hero-primary-btn"
                onClick={() => handleHeroAction('browse')}
              >
                {t.homeCtaStart}
              </button>
              <button
                type="button"
                className="hero-secondary-btn"
                onClick={() => handleHeroAction('sell')}
              >
                {t.homeCtaPublish}
              </button>
            </div>
            <div className="hero-tag-list">
              {HERO_ACTION_KEYS.map((actionKey, index) => (
                <button
                  key={actionKey}
                  type="button"
                  className="hero-tag-button"
                  onClick={() => handleHeroAction(actionKey)}
                >
                  {t.heroTags[index]}
                </button>
              ))}
            </div>
          </div>
        </header>
      )}

      <div className="app-layout">
        <Sidebar t={t} isAdmin={isAdmin} />
        <main className="app-main">
          {isHomePage && (
            <AuthBar
              t={t}
              theme={theme}
              locale={locale}
              onToggleTheme={toggleTheme}
              onToggleHighlight={toggleHighlight}
              highlightEnabled={highlightEnabled}
              highlightStyle={highlightStyle}
              highlightColor={highlightColor}
              highlightColors={highlightColors}
              onSetHighlightStyle={handleSetHighlightStyle}
              onSelectHighlightColor={handleSelectHighlightColor}
              onSetHighlightColors={handleSetHighlightColors}
              onLocaleChange={handleLocaleChange}
              languageNames={LANGUAGE_NAMES}
            />
          )}
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  allAds={adsToShow}
                  user={user}
                  authLoading={authLoading}
                  usingDemoAds={usingDemoAds}
                  t={t}
                />
              }
            />
            <Route
              path="/profile"
              element={
                <ProfilePage
                  user={user}
                  authLoading={authLoading}
                  error={authError}
                  message={authMessage}
                  t={t}
                  onEmailAuth={handleEmailAuth}
                  onGoogleSignIn={handleGoogleSignIn}
                  onSignOut={handleSignOut}
                  isAdmin={isAdmin}
                  firebaseReady={isFirebaseReady}
                />
              }
            />
            <Route
              path="/browse"
              element={
                <BrowsePage
                  allAds={adsToShow}
                  filteredAds={filteredAds}
                  searchValue={searchValue}
                  onSearchChange={setSearchValue}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  sortOrder={sortOrder}
                  onSortChange={setSortOrder}
                  showMine={showMine}
                  onShowMineChange={setShowMine}
                  user={user}
                  loading={effectiveLoading}
                  error={error}
                  usingDemoAds={usingDemoAds}
                  onDelete={handleDelete}
                  t={t}
                />
              }
            />
            <Route
              path="/sell"
              element={
                <SellPage
                  user={user}
                  authLoading={authLoading}
                  onAdAdded={handleAdAdded}
                  t={t}
                />
              }
            />
            <Route
              path="/my-ads"
              element={
                <MyAdsPage
                  ads={myAds}
                  loading={effectiveLoading}
                  error={error}
                  user={user}
                  onDelete={handleDelete}
                  t={t}
                />
              }
            />
            <Route
              path="/stats"
              element={
                <StatsPage
                  allAds={adsToShow}
                  user={user}
                  t={t}
                />
              }
            />
            <Route
              path="/help"
              element={
                <HelpPage
                  t={t}
                />
              }
            />
            <Route
              path="/about"
              element={
                <AboutPage
                  t={t}
                />
              }
            />
            <Route
              path="/tracker"
              element={
                <TrackerPage
                  user={user}
                  authLoading={authLoading}
                  t={t}
                />
              }
            />
            {isAdmin && (
              <Route
                path="/admin"
                element={
                  <AdminPage
                    ads={ads}
                    onDelete={handleDelete}
                    t={t}
                  />
                }
              />
            )}
          </Routes>
        </main>
      </div>

      <footer className="app-footer">
        <p>{t.footer}</p>
      </footer>

      <AIControlWidget locale={locale} onRunAction={runAssistantAction} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
