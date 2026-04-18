import { useEffect, useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, isFirebaseReady } from '../config/firebase';
import '../styles/AdForm.css';

export default function AdForm({ onAdAdded, user, authLoading, t }) {
  const categories = t.categories || ['Electronics', 'Clothing', 'Auto', 'Other'];
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadWarning, setUploadWarning] = useState('');

  useEffect(() => {
    if (categories.length && !categories.includes(category)) {
      setCategory(categories[0]);
    }
  }, [categories]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageFile(null);
      setImagePreview('');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!imageFile) {
      return null;
    }

    const fileRef = ref(
      storage,
      `ads/${user?.uid || 'guest'}-${Date.now()}-${imageFile.name}`
    );

    const uploadTask = uploadBytesResumable(fileRef, imageFile);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (uploadError) => reject(uploadError),
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        }
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUploadWarning('');
    setLoading(true);

    try {


      if (!title.trim() || !price || !description.trim() || !category) {
        throw new Error(t.fillAllFields);
      }

      if (isNaN(price) || Number(price) <= 0) {
        throw new Error(t.invalidPrice);
      }

      if (!isFirebaseReady) {
        throw new Error(
          'Firebase не настроен. Скопируйте .env.example в .env.local и заполните VITE_FIREBASE_* значения.'
        );
      }

      let imageUrl = null;
      try {
        imageUrl = await uploadImage();
      } catch (uploadErr) {
        console.warn('Не удалось загрузить фото, объявление будет сохранено без изображения:', uploadErr);
        setUploadWarning('Фото не загружено. Объявление сохранено без изображения.');
        imageUrl = null;
      }

      await addDoc(collection(db, 'ads'), {
        title: title.trim(),
        price: Number(price),
        description: description.trim(),
        category,
        createdAt: serverTimestamp(),
        createdBy: user?.uid || 'guest',
        userName: user?.displayName || t.anonymousUser,
        imageUrl: imageUrl || null
      });

      setTitle('');
      setPrice('');
      setDescription('');
      setCategory(categories[0]);
      setImageFile(null);
      setImagePreview('');
      setUploadProgress(0);

      if (onAdAdded) {
        onAdAdded();
      }
    } catch (err) {
      console.error('Ошибка при добавлении объявления:', err);
      const errorCode = String(err?.code || '');
      const activeProjectId = db?.app?.options?.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || 'unknown';
      if (errorCode.includes('permission-denied')) {
        setError(
          `Нет прав на запись в Firestore. Проект: ${activeProjectId}. Код: ${errorCode || 'unknown'}. Откройте Firebase Console -> Firestore Database -> Rules и опубликуйте правила именно в этом проекте.`
        );
      } else if (errorCode.includes('storage/unauthorized')) {
        setError(
          `Нет прав на загрузку в Storage. Проект: ${activeProjectId}. Код: ${errorCode || 'unknown'}. Откройте Firebase Console -> Storage -> Rules и опубликуйте правила именно в этом проекте.`
        );
      } else {
        setError(err.message || t.addButton);
      }
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading;

  return (
    <form className="ad-form" onSubmit={handleSubmit}>
      <h2>{t.addAdHeading}</h2>

      {error && <div className="error-message">{error}</div>}
      {uploadWarning && <div className="form-hint">{uploadWarning}</div>}
      {authLoading && (
        <div className="form-hint">{t.userLoading}</div>
      )}
      {!authLoading && !user && (
        <div className="form-hint">{t.formHint}</div>
      )}

      <div className="form-group">
        <label htmlFor="title">{t.titleLabel}</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.titlePlaceholder}
          disabled={loading}
        />
      </div>

      <div className="form-group double-column">
        <div>
          <label htmlFor="price">{t.priceLabel}</label>
          <input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={t.pricePlaceholder}
            disabled={loading}
            step="0.01"
            min="0"
          />
        </div>

        <div>
          <label htmlFor="category">{t.categoryLabel}</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">{t.descriptionLabel}</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.descriptionPlaceholder}
          disabled={loading}
          rows="4"
        />
      </div>

      <div className="form-group">
        <label htmlFor="image">{t.imageLabel}</label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={loading}
        />
        <small className="form-note">{t.imageHint}</small>
      </div>

      {imagePreview && (
        <div className="image-preview">
          <img src={imagePreview} alt="Preview" />
          <span>{uploadProgress > 0 ? `${t.uploading}: ${uploadProgress}%` : t.imageHint}</span>
        </div>
      )}

      <button type="submit" disabled={isSubmitDisabled} className="submit-btn">
        {loading ? t.savingButton : t.addButton}
      </button>
    </form>
  );
}
