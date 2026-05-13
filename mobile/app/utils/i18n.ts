import { useState, useCallback } from 'react';
import fr from '../locales/fr';
import en from '../locales/en';

type Language = 'fr' | 'en';
type Translations = typeof fr;

const translations: Record<Language, Translations> = { fr, en };

// Ceci est une implémentation simple d'i18n pour la démonstration.
// Dans une application en production, utilisez react-i18next.
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
