import React, { useEffect, useState, useRef } from 'react';
import './App.css';

type Card = {
  type: string;
  title: string;
  position: number;
};

const App: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const hasChanges = useRef<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/data');
      const data = await response.json();
      if (!data.length) {
        const initialData = await (await fetch('/data.json')).json();
        localStorage.setItem('cards', JSON.stringify(initialData));
        setCards(initialData);
      } else {
        setCards(data);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const saveInterval = setInterval(async () => {
      if (hasChanges.current) {
        setIsSaving(true);
        try {
          await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cards),
          });
          hasChanges.current = false;
          setLastSaveTime(Date.now());
        } catch (error) {
          console.error('Failed to save data', error);
        } finally {
          setIsSaving(false);
        }
      }
    }, 5000); // 5 seconds

    return () => clearInterval(saveInterval);
  }, [cards]);

  const handleOnDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleOnDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault(); // Required to allow a drop
    if (draggingIndex !== null && draggingIndex !== index) {
      const reorderedCards = [...cards];
      const [movedCard] = reorderedCards.splice(draggingIndex, 1);
      reorderedCards.splice(index, 0, movedCard);
      setCards(reorderedCards);
      setDraggingIndex(index);
      hasChanges.current = true; // Mark as changed
    }
  };

  const handleOnDrop = () => {
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cards),
    });
    setDraggingIndex(null);
    hasChanges.current = false; // No changes after dropping
  };

  const handleClick = (img: string) => setSelectedImage(img);
  const handleClose = () => setSelectedImage(null);

  const handleImageLoad = (type: string) => {
    setLoadingImages((prev) => ({ ...prev, [type]: false }));
  };

  const images: { [key: string]: string } = {
    'bank-draft': '/images/bank-draft.png',
    'bill-of-lading': '/images/bill-of-lading.png',
    invoice: '/images/invoice.png',
    'bank-draft-2': '/images/bank-draft-2.png',
    'bill-of-lading-2': '/images/bill-of-lading-2.png',
  };

  const timeSinceLastSave = lastSaveTime ? Math.floor((Date.now() - lastSaveTime) / 1000) : 0;

  return (
    <div className="App">
      {selectedImage && (
        <div className="overlay" onClick={handleClose}>
          <img src={selectedImage} alt="Selected" className="overlay-image" />
        </div>
      )}

      {isSaving && (
        <div className="saving-info">
          <div className="spinner">Saving...</div>
          <div>Time since last save: {timeSinceLastSave} seconds</div>
        </div>
      )}

      <div className="grid">
        {cards.map(({ type, title }, index) => (
          <div
            key={type}
            className="card"
            draggable
            onDragStart={() => handleOnDragStart(index)}
            onDragOver={(e) => handleOnDragOver(e, index)}
            onDrop={handleOnDrop}
            onClick={() => handleClick(images[type])}
          >
            {loadingImages[type] ? (
              <div className="spinner">Loading...</div>
            ) : (
              <img
                src={images[type]}
                alt={title}
                onLoad={() => handleImageLoad(type)}
              />
            )}
            <h3>{title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
