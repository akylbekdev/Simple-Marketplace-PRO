import { useMemo, useState } from 'react';
import '../styles/AIControlWidget.css';

function buildTexts(locale) {
  if (locale === 'en') {
    return {
      title: 'Quick Assistant',
      subtitle: 'Type a command to change the interface',
      placeholder: 'Try: dark theme, language en, open browse, rainbow',
      send: 'Apply',
      clear: 'Clear',
      toggleOpen: 'Open assistant',
      toggleClose: 'Close assistant',
      examplesLabel: 'Quick actions',
      examples: [
        { label: 'Dark', command: 'dark theme' },
        { label: 'Light', command: 'light theme' },
        { label: 'Browse', command: 'open browse' },
        { label: 'Russian', command: 'language ru' },
        { label: 'Rainbow', command: 'rainbow' }
      ],
      unknown: 'I could not understand. Try: dark theme, language en, open browse, rainbow, highlight off.',
      ok: 'Done',
      logTitle: 'Recent actions'
    };
  }

  if (locale === 'ky') {
    return {
      title: 'Ыкчам Ассистент',
      subtitle: 'Интерфейсти өзгөртүү үчүн буйрук жазыңыз',
      placeholder: 'Мисалы: dark theme, language ky, open browse, rainbow',
      send: 'Колдонуу',
      clear: 'Тазалоо',
      toggleOpen: 'Ассистентти ачуу',
      toggleClose: 'Ассистентти жабуу',
      examplesLabel: 'Тез аракеттер',
      examples: [
        { label: 'Dark', command: 'dark theme' },
        { label: 'Light', command: 'light theme' },
        { label: 'Browse', command: 'open browse' },
        { label: 'Кыргызча', command: 'language ky' },
        { label: 'Rainbow', command: 'rainbow' }
      ],
      unknown: 'Түшүнүксүз буйрук. Колдонуңуз: dark theme, language ky, open browse, rainbow, highlight off.',
      ok: 'Даяр',
      logTitle: 'Акыркы аракеттер'
    };
  }

  return {
    title: 'Быстрый ассистент',
    subtitle: 'Введите команду, чтобы изменить интерфейс',
    placeholder: 'Например: dark theme, language ru, open browse, rainbow',
    send: 'Применить',
    clear: 'Очистить',
    toggleOpen: 'Открыть ассистент',
    toggleClose: 'Закрыть ассистент',
    examplesLabel: 'Быстрые действия',
    examples: [
      { label: 'Dark', command: 'dark theme' },
      { label: 'Light', command: 'light theme' },
      { label: 'Каталог', command: 'open browse' },
      { label: 'Русский', command: 'language ru' },
      { label: 'Rainbow', command: 'rainbow' }
    ],
    unknown: 'Не понял команду. Примеры: dark theme, language ru, open browse, rainbow, highlight off.',
    ok: 'Готово',
    logTitle: 'Последние действия'
  };
}

function parseCommand(raw) {
  const text = raw.trim().toLowerCase();
  if (!text) return { type: 'none' };

  if (/dark|темн|кара/.test(text)) return { type: 'theme', value: 'dark' };
  if (/light|свет|жарык/.test(text)) return { type: 'theme', value: 'light' };

  if (/language\s*ru|lang\s*ru|рус|орус/.test(text)) return { type: 'locale', value: 'ru' };
  if (/language\s*en|lang\s*en|англ|english/.test(text)) return { type: 'locale', value: 'en' };
  if (/language\s*ky|lang\s*ky|кырг|кыргыз/.test(text)) return { type: 'locale', value: 'ky' };

  if (/highlight\s*off|подсвет.*выкл|off/.test(text)) return { type: 'highlight', value: 'off' };
  if (/highlight\s*on|подсвет.*вкл/.test(text)) return { type: 'highlight', value: 'on' };
  if (/rainbow|радуж/.test(text)) return { type: 'highlightStyle', value: 'rainbow' };
  if (/gradient|градиент/.test(text)) return { type: 'highlightStyle', value: 'gradient' };

  if (/open\s*home|на\s*глав|home/.test(text)) return { type: 'navigate', value: '/' };
  if (/open\s*browse|catalog|каталог|browse/.test(text)) return { type: 'navigate', value: '/browse' };
  if (/open\s*sell|sell|продат/.test(text)) return { type: 'navigate', value: '/sell' };
  if (/open\s*profile|profile|профил/.test(text)) return { type: 'navigate', value: '/profile' };
  if (/open\s*help|help|помощ/.test(text)) return { type: 'navigate', value: '/help' };

  return { type: 'unknown' };
}

export default function AIControlWidget({ locale, onRunAction }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const texts = useMemo(() => buildTexts(locale), [locale]);

  const pushHistory = (line) => {
    setHistory((prev) => [line, ...prev].slice(0, 5));
  };

  const runCommand = (commandText) => {
    const parsed = parseCommand(commandText);
    if (parsed.type === 'none') return;

    if (parsed.type === 'unknown') {
      pushHistory(texts.unknown);
      return;
    }

    const summary = onRunAction(parsed);
    pushHistory(summary || texts.ok);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    runCommand(input);
    setInput('');
  };

  return (
    <div className={`ai-widget ${isOpen ? 'open' : ''}`}>
      <button
        type="button"
        className="ai-widget-toggle"
        aria-label={isOpen ? texts.toggleClose : texts.toggleOpen}
        onClick={() => setIsOpen((v) => !v)}
      >
        {isOpen ? '×' : 'AI'}
      </button>

      {isOpen && (
        <div className="ai-widget-panel" role="dialog" aria-label="Assistant widget">
          <div className="ai-widget-head">
            <h3>{texts.title}</h3>
            <p>{texts.subtitle}</p>
          </div>

          <form className="ai-widget-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={texts.placeholder}
              className="ai-widget-input"
            />
            <button type="submit" className="ai-widget-submit">{texts.send}</button>
            <button type="button" className="ai-widget-clear" onClick={() => setInput('')}>{texts.clear}</button>
          </form>

          <div className="ai-widget-examples">
            <span>{texts.examplesLabel}</span>
            <div className="ai-widget-chip-row">
              {texts.examples.map((item) => (
                <button
                  key={item.command}
                  type="button"
                  className="ai-widget-chip"
                  onClick={() => runCommand(item.command)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ai-widget-log">
            <p>{texts.logTitle}</p>
            {history.length === 0 ? <span>...</span> : history.map((line, index) => <span key={`${line}-${index}`}>{line}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}
