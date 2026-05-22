import { useState, useCallback } from 'react';
import fr from '../locales/fr';
import en from '../locales/en';

type Language     = 'fr' | 'en';
type Translations = typeof fr;

const translations: Record<Language, Translations> = { fr, en };

let currentLang: Language = 'fr';
const listeners = new Set<(lang: Language) => void>();

export const useTranslation = () => {
    const [lang, setLang] = useState<Language>(currentLang);

    const changeLanguage = useCallback((newLang: Language) => {
        currentLang = newLang;
        setLang(newLang);
        listeners.forEach(l => l(newLang));
    }, []);

    const t = useCallback((key: keyof Translations) => {
        return translations[lang][key] || key;
    }, [lang]);

    return { t, changeLanguage, currentLanguage: lang };
};
