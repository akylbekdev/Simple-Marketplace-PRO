# 🛍️ Simple Marketplace

Жөнөкөй жарыя (объявление) платформасы React + Vite + Firebase колдонуу менен.

## 🎯 Функциялар

✅ **Create (Кошуу)** - жарыя кошуу
✅ **Read (Окуу)** - жарыялар тизмесин выведение
✅ **Delete (Өчүрүү)** - жарыяны өчүрүү
🔍 **Search (Издөө)** - аталышы боюнча издөө (реалдуу убакытта)
🏷️ **Filter (Фильтр)** - категория боюнча фильтр
📊 **Sort (Сорттоо)** - баа боюнча сорттоо (арзан/кымбат)
⏳ **Loading** - загрузка статусу
⚠️ **Error Handling** - ката иштетүү

## 📋 Техникалык талаптар

- React 18 + Vite
- Firebase Firestore Database
- async/await асинхрон логика
- Компоненттик архитектура (App, AdForm, AdFilter, AdList, AdCard)

## 🗂️ Долмо структура

```
src/
├── components/
│   ├── AdForm.jsx       - Форма кошуу
│   ├── AdCard.jsx       - Жарыя карточкасы
│   ├── AdFilter.jsx     - Издөө жана фильтр
│   └── AdList.jsx       - Жарыялар тизмеси
├── styles/
│   ├── AdForm.css
│   ├── AdCard.css
│   ├── AdFilter.css
│   └── AdList.css
├── config/
│   └── firebase.js      - Firebase конфигурация
├── App.jsx              - Асоскы компонент
├── App.css              - Асоскы стилдер
├── index.css            - Жалпы стилдер
└── main.jsx
```

## 🚀 Баштоо

### 1. Firebase серверин орнотуу

Firebase Console'ге өтөң: https://console.firebase.google.com

1. Жаңы пројект түзүңүз
2. Firestore Database қосуңуз (Test режимде башталыңыз)
3. Web апп түзүңүз жана конфигурация алыңыз

### 2. Firebase конфигурациясын орнотуу

[src/config/firebase.js](src/config/firebase.js) файлында өзүнүң конфигурацияңызды орнотуңуз:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Firestore коллекциясын түзүү

Firebase Console'де:
1. Firestore Database менюсүндө "+ Коллекция түзүү" басыңыз
2. Коллекция аталышы: `ads`
3. Биринчи документту кошуу (опциялык):

```json
{
  "title": "iPhone 13",
  "price": 45000,
  "description": "Абалы жакшы, чызык жок",
  "category": "Электроника",
  "createdAt": "timestamp"
}
```

### 4. Жөнөкөй орнотуу жана баштоо

```bash
# Зависимостиները орнотуу
npm install

# Dev серверди баштоо
npm run dev

# Prod үчүн build кылуу
npm run build
```

## 📱 Интерфейс

### 1. Жарыя кошуу формасы
- Аталышы
- Баа (сом)
- Сүрөттөмө
- Категория (Электроника, Кийим, Авто, Башка)

### 2. Издөө жана Фильтр
- Аталышы боюнча реалдуу издөө
- Категория боюнча фильтр
- Баа боюнча сорттоо (арзан → кымбат же кымбат → арзан)

### 3. Жарыялар тизмеси
- Карточкада: аталышы, баа, категория, дата
- Өчүрүү кнопкасы

## 🛠️ API операциялары

### Create
```javascript
await addDoc(collection(db, 'ads'), {
  title, price, description, category,
  createdAt: serverTimestamp()
})
```

### Read
```javascript
const querySnapshot = await getDocs(collection(db, 'ads'));
```

### Delete
```javascript
await deleteDoc(doc(db, 'ads', adId));
```

### Search & Filter
```javascript
// Клиент жагында фильтрелөө:
ads.filter(ad => ad.title.toLowerCase().includes(search))
ads.filter(ad => ad.category === category)
```

### Sort
```javascript
ads.sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price)
```

## 🎨 Стил

- Gradient фон (фиолетово-сиреневый)
- Адаптивдүү дизайн (мобиль, планшет, ПК)
- Smooth анимациялар
- Responsive grid макет

## 🔒 Firestore Rules

Test режиминде баштоо болот, андан кийин нормалдуу rules орнотуңуз:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /ads/{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 📚 Файлдарды түшүнүү

- **AdForm.jsx** - Жарыя кошуу формасы, validation жана Firebase'ке кошуу
- **AdList.jsx** - Жарыялар тизмесин көрсөтүү, delete функция
- **AdCard.jsx** - Бир жарыя карточкасы, өчүрүү кнопкасы
- **AdFilter.jsx** - Издөө input'ы, категория filter, sort select
- **App.jsx** - Негизги логика, state management, фильтрелөө жана сорттоо

## 🐛 Өчүндөтүү

Консолго мураска байланыш өчүндөтүү:
```javascript
console.log('Объявления загружены:', adsData.length);
```

## 📝 Лицензия

MIT

---

**Автор:** Student  
**Жыл:** 2024
