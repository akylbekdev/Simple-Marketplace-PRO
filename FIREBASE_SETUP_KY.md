# 🔧 Firebase Орнотуу Боюнча Толук Гайд

## Кадам 1: Firebase Пректисинаване Өтүңүз

1. https://console.firebase.google.com аикабаштыңыз
2. "Пророект түзүү" же "Пректиси кошуу" басыңыз
3. Пректтин аталышын берүүңүз (мисалы: "SimpleMarketplace")

## Кадам 2: Веб Апп Түзүңүз

1. Пректті түзүп болгондон кийин, "Веб" иконасын (<>) басыңыз
2. Апп аталышын греңүз (мисалы: "Marketplace Web")
3. "Firebase Хостингиді да орнотуу" опциясын байдасыма салсаңыз болот
4. "Апп түзүңүз" басыңыз

## Кадам 3: Firebase конфигурациясын Алыңыз

Апп түзүгөндөн кийин, орун ала турган код көрсөтүлөт:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef1234567890"
};
```

**Маанилүү:** Бул конфигурацияны копи кылыңыз!

## Кадам 4: Конфигурацияны Долбоого Киргизиңіз

**src/config/firebase.js** файлын ачыңыз жана алган конфигурацияны орнотуңуз:

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "ВАШ_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef1234567890"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

## Кадам 5: Firestore Database Түзүңүз

1. Firebase Console'дө "Firestore Database" табын басыңыз
2. "DATABASE ТҮЗҮҢҮЗ" басыңыз
3. "Test режимде баштоо" тандаңыз (базарга чыгуу мөмкүн болсо, өзүнүзүчүн rules орнотуңүз)
4. Аймак тандаңыз (мисалы: "us-central1")
5. "Включить" басыңыз

## Кадам 6: Коллекция Түзүңүз

1. Firestore Database ачылгандан кийин "Коллекция өтүңүз" басыңыз
2. **Коллекция ID**: `ads` (так мындай сөз жазыңыз!)
3. "Коллекция түзүңүз" басыңыз
4. Автоматтык ID менен биринчи документ түзүнөт (ОК басыңыз)

## Кадам 7: Биринчи Объявлениени Кошуңуз (Опциялык)

Firebase Console'де документка төмөнкүдөй мааниялар кошуңуз (мүмкүнчүлүк болсо):

| Талаа | Тип | Мааниф |
|-------|------|--------|
| title | String | "iPhone 13" |
| price | Number | 45000 |
| description | String | "Абалы жакшы, чызык жок" |
| category | String | "Электроника" |
| createdAt | Timestamp | Азыркы дата |

## Кадам 8: Firestore Security Rules Орнотуу (Маанилүү!)

1. Firestore Database'де "Чыгуу" табын басыңыз
2. **RULES** турса, төмөнкүдөй коддорду киргизиңиз:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Баарыга окуу жана жазуу чыгуу (тестирование үчүн)
    match /ads/{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. **PUBLISH** басыңыз

## ⚠️ Production үчүн Коопсузтук

Production'га чыгуу учур:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /ads/{document=**} {
      // Баарыга окуу уруш берүү
      allow read: if true;
      // Жазууну өзүлүнө гана уруш берүү (аутентификация керек)
      allow create, delete: if request.auth != null;
    }
  }
}
```

## ✅ Тектелүү!

Эми:

1. `npm run dev` колдонуп сервер баштаңыз
2. http://localhost:5173 ачыңыз
3. Жарыя кошуп көрүңүз!

## 🐛 Этишинде Калса

Консолга ката кетсе:
1. Браузердин F12 => Console табындай каталарды карап көрүңүз
2. Firebase конфигурациясын текшериңиз
3. Firestore коллекция аталышы "ads" ооккулоокубурбосун
4. API key жана Project ID'си зоелүү солуосуббосун

## 📚 Ссылкалар

- Firebase Console: https://console.firebase.google.com
- Firestore Docs: https://firebase.google.com/docs/firestore
- React + Firebase: https://firebase.google.com/docs/database/usage/next

---

🎉 Баарысы орнотулду! Happy coding!
