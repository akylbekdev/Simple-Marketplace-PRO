import { useState } from 'react';
import '../styles/AuthBar.css';
import ColorWheelPicker from './ColorWheelPicker';

export default function AuthBar({
  t,
  theme,
  locale,
  onToggleTheme,
  onToggleHighlight,
  highlightEnabled,
  highlightStyle,
  highlightColor,
  highlightColors,
  onSetHighlightStyle,
  onSelectHighlightColor,
  onSetHighlightColors,
  onLocaleChange,
  languageNames,
}) {
  const [wheelOpen, setWheelOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // Always work from the colors array
  const colors =
    highlightColors && highlightColors.length > 0
      ? highlightColors
      : [highlightColor || '#3b82f6'];

  // Which color the wheel is currently showing
  const wheelColor =
    editingIndex !== null && editingIndex < colors.length
      ? colors[editingIndex]
      : colors[colors.length - 1] || '#3b82f6';

  const openWheelEdit = (idx) => {
    setEditingIndex(idx);
    setWheelOpen(true);
    onSetHighlightStyle(colors.length > 1 ? 'gradient' : 'custom');
  };

  const handleWheelChange = (newColor) => {
    if (editingIndex !== null && editingIndex < colors.length) {
      const next = [...colors];
      next[editingIndex] = newColor;
      onSetHighlightColors(next);
    } else {
      // Updating the one "preview" colour before it joins the gradient
      onSelectHighlightColor(newColor);
    }
  };

  const handleAddColor = () => {
    if (colors.length >= 9) return;
    const next = [...colors, highlightColor || '#8b5cf6'];
    onSetHighlightColors(next);
    setEditingIndex(next.length - 1);
    setWheelOpen(true);
  };

  const handleRemoveColor = (idx) => {
    if (colors.length <= 1) return;
    const next = colors.filter((_, i) => i !== idx);
    onSetHighlightColors(next);
    if (editingIndex === idx) setEditingIndex(Math.max(0, idx - 1));
    else if (editingIndex !== null && editingIndex > idx) setEditingIndex(editingIndex - 1);
  };

  return (
    <div className="auth-bar">
      <div className="toolbar-stack">

        {/* Theme toggle */}
        <div className="toolbar-control">
          <div>
            <div className="toolbar-label">{t.themeLabel}</div>
            <div className="toolbar-hint">{theme === 'dark' ? t.themeDark : t.themeLight}</div>
          </div>
          <button type="button" className="toolbar-pill" onClick={onToggleTheme}>
            <span className={`pill-dot ${theme === 'dark' ? 'dark' : 'light'}`} />
            <span>{theme === 'dark' ? t.themeDark : t.themeLight}</span>
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Highlight */}
        <div className="toolbar-control toolbar-control-highlight">
          <div className="toolbar-control-top">
            <div>
              <div className="toolbar-label">{t.highlightLabel}</div>
              <div className="toolbar-hint">
                {highlightEnabled ? t.highlightOn : t.highlightOff}
              </div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={highlightEnabled}
                onChange={onToggleHighlight}
              />
              <span className="slider" />
            </label>
          </div>

          {/* Quick style row */}
          <div className="hl-quick-row">
            {/* Gradient color swatches */}
            <div className="hl-gradient-strip">
              {colors.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  className={`hl-swatch ${wheelOpen && editingIndex === i ? 'hl-swatch-editing' : ''}`}
                  style={{ background: c }}
                  onClick={() => openWheelEdit(i)}
                  title={`Color ${i + 1}: ${c}`}
                >
                  {colors.length > 1 && (
                    <span
                      className="hl-swatch-remove"
                      role="button"
                      aria-label="Remove"
                      onClick={(e) => { e.stopPropagation(); handleRemoveColor(i); }}
                    >
                      ×
                    </span>
                  )}
                </button>
              ))}
              {colors.length < 9 && (
                <button
                  className="hl-add-btn"
                  type="button"
                  onClick={handleAddColor}
                  title="Add gradient colour"
                >
                  +
                </button>
              )}
            </div>

            <span className="toolbar-hint">
              {colors.length > 1 ? `${colors.length} colours` : t.highlightStyleLabel}
            </span>
          </div>

          {/* Colour wheel shown inline in the toolbar */}
          {wheelOpen && (
            <div className="hl-wheel-inline" role="dialog" aria-label="Color picker">
              <button
                type="button"
                className="hl-wheel-close"
                onClick={() => setWheelOpen(false)}
                aria-label="Close color picker"
                title="Close"
              >
                ×
              </button>
              <ColorWheelPicker color={wheelColor} onChange={handleWheelChange} />
            </div>
          )}
        </div>

        <div className="toolbar-divider" />

        {/* Language */}
        <div className="toolbar-control">
          <label htmlFor="locale-select" className="toolbar-label">
            {t.selectLanguage}
          </label>
          <select
            id="locale-select"
            className="toolbar-select"
            value={locale}
            onChange={(event) => onLocaleChange(event.target.value)}
          >
            {Object.entries(languageNames).map(([localeKey, localeLabel]) => (
              <option key={localeKey} value={localeKey}>
                {localeLabel}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
}
