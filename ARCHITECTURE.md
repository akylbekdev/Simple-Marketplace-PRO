# 🎯 Архитектура Проекта

## Компонентная структура

```
App (Главный компонент)
├── AdForm (Форма добавления)
├── AdFilter (Фильтры и поиск)
└── AdList (Список объявлений)
    └── AdCard (Карточка объявления)
        └── Delete кнопка
```

## 📝 Компоненты

### 1. **AdForm.jsx**
Отвечает за добавление новых объявлений.

**Props:**
- `onAdAdded` - function: вызывается после успешного добавления

**Функции:**
- Валидация данных формы
- Загрузка на Firestore
- Чистка формы после успеха
- Обработка ошибок

**Использует:**
- `addDoc()` - для добавления в Firestore
- `serverTimestamp()` - для автоматической даты

---

### 2. **AdFilter.jsx**
Компонент фильтрации и поиска.

**Props:**
- `searchValue` - string: текущее значение поиска
- `onSearchChange` - function: при изменении поиска
- `selectedCategory` - string: выбранная категория
- `onCategoryChange` - function: при смене категории
- `sortOrder` - string: порядок сортировки ('asc', 'desc', '')
- `onSortChange` - function: при смене сортировки

**Категории:**
- Электроника
- Кийим
- Авто
- Башка

---

### 3. **AdList.jsx**
Отображает список объявлений.

**Props:**
- `ads` - array: массив объявлений для отображения
- `loading` - boolean: состояние загрузки
- `error` - string: текст ошибки
- `onAdsChange` - function: при удалении объявления

**Состояния:**
- Loading: "⏳ Загрузка объявлений..."
- Error: "❌ Ошибка: [сообщение]"
- Empty: "📭 Объявления не найдены"
- Success: Grid из AdCard компонентов

---

### 4. **AdCard.jsx**
Одно объявление в виде карточки.

**Props:**
- `ad` - object: данные объявления
  - `id` - string: уникальный ID
  - `title` - string: название
  - `price` - number: цена
  - `category` - string: категория
  - `description` - string: описание
  - `createdAt` - Timestamp: дата создания
- `onDelete` - function: при удалении
- `loading` - boolean: состояние удаления

---

## 🔄 Поток данных

```
App.jsx (State Manager)
│
├─ fetchAds() ─────────────────┐
│                              │
├─ getDocs(collection(db, 'ads'))
│  Получает все объявления
│                              │
├─ Фильтрация               ──┤ AdList
│  - searchValue.includes()   │
│  - category ===             │ AdCard
│  - sort by price            │
│                              │
└─ State: ads, loading, error ─┘
```

## 🔥 Firebase операции

### CREATE
```javascript
// AdForm.jsx
const docRef = await addDoc(collection(db, 'ads'), {
  title,
  price,
  description,
  category,
  createdAt: serverTimestamp()
});
```

### READ
```javascript
// App.jsx
const querySnapshot = await getDocs(collection(db, 'ads'));
const adsData = querySnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

### DELETE
```javascript
// AdList.jsx
await deleteDoc(doc(db, 'ads', adId));
```

## 🎨 CSS структура

```
App.css          - Главные стили (layout, header, footer)
AdForm.css       - Форма и ошибки
AdCard.css       - Карточка объявления
AdList.css       - Сетка объявлений
AdFilter.css     - Фильтры и поиск
```

## 🔍 Логика фильтрации

**Search:**
```javascript
ad.title.toLowerCase().includes(searchValue.toLowerCase())
```

**Filter:**
```javascript
!selectedCategory || ad.category === selectedCategory
```

**Sort:**
```javascript
sortOrder === 'asc' 
  ? a.price - b.price 
  : b.price - a.price
```

## ⚠️ Обработка ошибок

1. **Form Validation**
   - Пустые поля
   - Неверная цена
   - Максимальная длина текста

2. **Firebase Errors**
   - Network errors
   - Auth errors
   - Firestore errors

3. **UI Feedback**
   - Error message banner
   - Loading spinner
   - Success toast (опционально)

## 📦 Зависимости

- **react** (^18.0.0) - UI library
- **react-dom** (^18.0.0) - React rendering
- **firebase** (^10.0.0+) - Backend services
- **vite** (^5.0.0) - Build tool

## 🚀 Performance Оптимизации

- Grid layout для responsive дизайна
- Lazy loading при необходимости
- Memoization для компонентов (опционально)
- Debounce для поиска (можно добавить)
- Pagination (опционально)

## 📱 Adaptivity

- Desktop: 3+ колонны
- Tablet: 2 колонны
- Mobile: 1 колонна

---

**Версия:** 1.0.0  
**Последнее обновление:** 2024
