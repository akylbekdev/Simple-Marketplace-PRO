import { useRef, useEffect, useState, useCallback } from 'react';
import '../styles/ColorWheelPicker.css';

const WHEEL_SIZE = 180;

function hsvToHex(h, s, v) {
  const f = (n) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  const r = Math.round(f(5) * 255);
  const g = Math.round(f(3) * 255);
  const b = Math.round(f(1) * 255);
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function hexToHsv(hex) {
  if (!hex || hex.length < 7) return { h: 220, s: 0.45, v: 0.9 };
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max;
  const s = max === 0 ? 0 : (max - min) / max;
  let h = 0;
  if (max !== min) {
    const d = max - min;
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s, v };
}

function getColorName(h, s, v) {
  if (v < 0.12) return 'Black';
  if (s < 0.1) {
    if (v > 0.92) return 'White';
    if (v > 0.72) return 'Light Gray';
    if (v > 0.42) return 'Gray';
    return 'Dark Gray';
  }
  // Pastel / soft colors
  if (s < 0.35 && v > 0.72) {
    if (h >= 255 && h < 295) return 'Lavender';
    if (h >= 295 && h < 345) return 'Pink';
    if (h >= 195 && h < 255) return 'Periwinkle';
    if (h >= 140 && h < 195) return 'Mint';
    if (h >= 40 && h < 80) return 'Cream';
    if (h >= 0 && h < 20) return 'Blush';
  }
  let name = '';
  if (h < 15 || h >= 345) name = 'Red';
  else if (h < 45) name = 'Orange';
  else if (h < 75) name = 'Yellow';
  else if (h < 150) name = 'Green';
  else if (h < 195) name = 'Teal';
  else if (h < 255) name = 'Blue';
  else if (h < 295) name = 'Violet';
  else if (h < 335) name = 'Magenta';
  else name = 'Rose';

  if (v < 0.38) return 'Dark ' + name;
  if (s < 0.5 && v > 0.7) return 'Light ' + name;
  return name;
}

export default function ColorWheelPicker({ color, onChange }) {
  const wheelRef = useRef(null);
  const sliderRef = useRef(null);
  const [hsv, setHsv] = useState(() => hexToHsv(color || '#3b82f6'));
  const isDraggingWheel = useRef(false);
  const isDraggingSlider = useRef(false);

  // Sync external color → internal HSV when color prop changes
  useEffect(() => {
    if (color) setHsv(hexToHsv(color));
  }, [color]);

  // Draw the HSV colour wheel
  useEffect(() => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = WHEEL_SIZE;
    const cx = size / 2;
    const cy = size / 2;
    const radius = cx - 4;

    const imageData = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= radius) {
          const hue = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
          const sat = dist / radius;
          const bri = hsv.v;
          const f = (n) => {
            const k = (n + hue / 60) % 6;
            return bri - bri * sat * Math.max(0, Math.min(k, 4 - k, 1));
          };
          const idx = (y * size + x) * 4;
          imageData.data[idx] = Math.round(f(5) * 255);
          imageData.data[idx + 1] = Math.round(f(3) * 255);
          imageData.data[idx + 2] = Math.round(f(1) * 255);
          imageData.data[idx + 3] = 255;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // Selector ring
    const angle = (hsv.h * Math.PI) / 180;
    const sx = cx + hsv.s * radius * Math.cos(angle);
    const sy = cy + hsv.s * radius * Math.sin(angle);

    ctx.beginPath();
    ctx.arc(sx, sy, 10, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(sx, sy, 9, 0, Math.PI * 2);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }, [hsv]);

  // Draw the brightness slider
  useEffect(() => {
    const canvas = sliderRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const r = h / 2;

    // Rounded rect clip
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, r);
    ctx.clip();

    const pureColor = hsvToHex(hsv.h, hsv.s, 1);
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#000');
    grad.addColorStop(1, pureColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // Position indicator
    const x = Math.max(r, Math.min(w - r, hsv.v * w));
    ctx.beginPath();
    ctx.arc(x, h / 2, r - 2, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [hsv]);

  const pickFromWheel = useCallback(
    (clientX, clientY) => {
      const canvas = wheelRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = WHEEL_SIZE / rect.width;
      const scaleY = WHEEL_SIZE / rect.height;
      const px = (clientX - rect.left) * scaleX;
      const py = (clientY - rect.top) * scaleY;
      const cx = WHEEL_SIZE / 2;
      const cy = WHEEL_SIZE / 2;
      const radius = cx - 4;
      const dx = px - cx;
      const dy = py - cy;
      const dist = Math.min(Math.sqrt(dx * dx + dy * dy), radius);
      const h = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
      const s = dist / radius;
      const newHsv = { h, s, v: hsv.v };
      setHsv(newHsv);
      onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
    },
    [hsv.v, onChange]
  );

  const pickFromSlider = useCallback(
    (clientX) => {
      const canvas = sliderRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const v = x / rect.width;
      const newHsv = { ...hsv, v };
      setHsv(newHsv);
      onChange(hsvToHex(newHsv.h, newHsv.s, newHsv.v));
    },
    [hsv, onChange]
  );

  useEffect(() => {
    const onMove = (e) => {
      const touch = e.touches ? e.touches[0] : null;
      const cx = touch ? touch.clientX : e.clientX;
      const cy = touch ? touch.clientY : e.clientY;
      if (isDraggingWheel.current) pickFromWheel(cx, cy);
      if (isDraggingSlider.current) pickFromSlider(cx);
    };
    const onUp = () => {
      isDraggingWheel.current = false;
      isDraggingSlider.current = false;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [pickFromWheel, pickFromSlider]);

  const colorName = getColorName(hsv.h, hsv.s, hsv.v);
  const currentHex = hsvToHex(hsv.h, hsv.s, hsv.v);

  return (
    <div className="cwp-wrap">
      <div className="cwp-name-bubble">{colorName}</div>
      <canvas
        ref={wheelRef}
        width={WHEEL_SIZE}
        height={WHEEL_SIZE}
        className="cwp-wheel"
        onMouseDown={(e) => {
          isDraggingWheel.current = true;
          pickFromWheel(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          isDraggingWheel.current = true;
          pickFromWheel(e.touches[0].clientX, e.touches[0].clientY);
        }}
      />
      <canvas
        ref={sliderRef}
        width={WHEEL_SIZE}
        height={24}
        className="cwp-slider"
        onMouseDown={(e) => {
          isDraggingSlider.current = true;
          pickFromSlider(e.clientX);
        }}
        onTouchStart={(e) => {
          isDraggingSlider.current = true;
          pickFromSlider(e.touches[0].clientX);
        }}
      />
      <div className="cwp-preview" style={{ background: currentHex }}>
        <span>{currentHex.toUpperCase()}</span>
      </div>
    </div>
  );
}
