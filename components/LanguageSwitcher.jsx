import React, { useState, useEffect } from 'react';

// Anda bisa custom SUPPORTED_LANGS atau import dari file lain.
const SUPPORTED_LANGS = [
  { code: 'en', label: 'English' },
  { code: 'id', label: 'Indonesian' },
  { code: 'ms', label: 'Malay' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'tet', label: 'Tetun (Timor-Leste)' },
  { code: 'ja', label: 'Japanese' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ru', label: 'Russian' },
  { code: 'it', label: 'Italian' },
  { code: 'nl', label: 'Dutch' },
  { code: 'ko', label: 'Korean' },
];

export default function LanguageSwitcher({ current, onChange }) {
  const [lang, setLang] = useState(current || 'id');
  useEffect(() => {
    if (!current) {
      // Deteksi bahasa browser (jika perlu)
      const detected = (navigator.language || 'id').slice(0,2);
      setLang(detected);
      onChange && onChange(detected);
    }
  }, []);
  return (
    <div>
      <select
        value={lang}
        onChange={e => { setLang(e.target.value); onChange && onChange(e.target.value); }}
        className="rounded-md border px-2 py-1"
      >
        {SUPPORTED_LANGS.map(l => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </div>
  );
}