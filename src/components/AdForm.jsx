import { useEffect, useState } from 'react';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
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

  const loadImageElement = (file) => new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image decode failed'));
    };
    img.src = objectUrl;
  });

  const renderImageToCanvas = (img, maxSide) => {
    const ratio = Math.min(maxSide / img.width, maxSide / img.height, 1);
    const targetWidth = Math.max(1, Math.round(img.width * ratio));
    const targetHeight = Math.max(1, Math.round(img.height * ratio));
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    return canvas;
  };

  const canvasToBlob = (canvas, quality) => new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', quality);
  });

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });

  const uploadImage = async (fileToUpload, ownerId) => {
    if (!fileToUpload) {
      return null;
    }

    const fileRef = ref(
      storage,
      `ads/${ownerId}-${Date.now()}-${fileToUpload.name}`
    );

    const uploadTask = uploadBytesResumable(fileRef, fileToUpload);

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

  const optimizeImageFile = async (file) => {
    // Small images do not need re-encoding.
    if (!file || file.size <= 350 * 1024) {
      return file;
    }

    try {
      const img = await loadImageElement(file);
      const canvas = renderImageToCanvas(img, 1600);
      if (!canvas) {
        return file;
      }

      const blob = await canvasToBlob(canvas, 0.78);

      if (!blob || blob.size >= file.size) {
        return file;
      }

      return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
    } catch {
      return file;
    }
  };

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setDescription('');
    setCategory(categories[0]);
    setImageFile(null);
    setImagePreview('');
    setUploadProgress(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUploadWarning('');
    setUploadProgress(0);
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

      const ownerId = user?.uid || 'guest';
      const selectedImageFile = imageFile;

      const adRef = await addDoc(collection(db, 'ads'), {
        title: title.trim(),
        price: Number(price),
        description: description.trim(),
        category,
        createdAt: serverTimestamp(),
        createdBy: ownerId,
        userName: user?.displayName || t.anonymousUser,
        imageUrl: null
      });

      const createdAd = {
        id: adRef.id,
        title: title.trim(),
        price: Number(price),
        description: description.trim(),
        category,
        createdAt: new Date().toISOString(),
        createdBy: ownerId,
        userName: user?.displayName || t.anonymousUser,
        imageUrl: null
      };

      if (selectedImageFile) {
        void (async () => {
          try {
            const previewUrl = await fileToDataUrl(selectedImageFile);
            if (previewUrl && onAdAdded) {
              onAdAdded({ ...createdAd, imageUrl: previewUrl });
            }
          } catch {
            // Ignore preview generation issues.
          }
        })();
      }

      resetForm();

      if (onAdAdded) {
        onAdAdded(createdAd);
      }

      if (selectedImageFile) {
        setUploadWarning('Объявление добавлено. Фото загружается в фоне...');
        const adDocRef = doc(db, 'ads', adRef.id);

        void (async () => {
          try {
            const optimizedFile = await optimizeImageFile(selectedImageFile);
            const imageUrl = await uploadImage(optimizedFile, ownerId);
            if (!imageUrl) {
              return;
            }
            await updateDoc(adDocRef, {
              imageUrl
            });
            if (onAdAdded) {
              onAdAdded({ ...createdAd, imageUrl });
            }
            setUploadWarning('');
          } catch (uploadErr) {
            console.warn('Не удалось загрузить фото в фоне:', uploadErr);
            setUploadWarning('Объявление добавлено, но фото не загрузилось.');
          } finally {
            setUploadProgress(0);
          }
        })();
      }
    } catch (err) {
      console.error('Ошибка при добавлении объявления:', err);
      const errorCode = String(err?.code || '');
      const activeProjectId = db?.app?.options?.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || 'unknown';

      if (errorCode.includes('permission-denied')) {
        try {
          const selectedImageFile = imageFile;
          let imagePreviewUrl = null;

          if (selectedImageFile) {
            const optimizedFile = await optimizeImageFile(selectedImageFile);
            imagePreviewUrl = await fileToDataUrl(optimizedFile);
          }

          const localAd = {
            id: `local-${Date.now()}`,
            title: title.trim(),
            price: Number(price),
            description: description.trim(),
            category,
            createdAt: new Date().toISOString(),
            createdBy: user?.uid || 'guest',
            userName: user?.displayName || t.anonymousUser,
            imageUrl: imagePreviewUrl || null,
            localOnly: true
          };

          resetForm();
          setError('');
          setUploadWarning('Объявление сохранено локально на этом устройстве.');
          if (onAdAdded) {
            onAdAdded(localAd);
          }
          return;
        } catch (fallbackError) {
          console.error('Ошибка локального сохранения объявления:', fallbackError);
        }
      }

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
