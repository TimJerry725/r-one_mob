import React, { createContext, useContext, useState } from 'react';

export type LanguageOption = {
    code: string;
    label: string;
    flag: string;
    group: 'Default' | 'European' | 'Indian';
};

export const LANGUAGE_OPTIONS: LanguageOption[] = [
    { code: 'en', label: 'English', flag: '🇬🇧', group: 'Default' },
    { code: 'it', label: 'Italian', flag: '🇮🇹', group: 'European' },
    { code: 'de', label: 'German', flag: '🇩🇪', group: 'European' },
    { code: 'es', label: 'Spanish', flag: '🇪🇸', group: 'European' },
    { code: 'fr', label: 'French', flag: '🇫🇷', group: 'European' },
    { code: 'nl', label: 'Dutch', flag: '🇳🇱', group: 'European' },
    { code: 'hi', label: 'Hindi', flag: '🇮🇳', group: 'Indian' },
    { code: 'ta', label: 'Tamil', flag: '🇮🇳', group: 'Indian' },
    { code: 'te', label: 'Telugu', flag: '🇮🇳', group: 'Indian' },
];

type LanguageContextType = {
    language: LanguageOption;
    setLanguage: (code: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const DEFAULT_LANGUAGE = LANGUAGE_OPTIONS[0];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [languageCode, setLanguageCode] = useState(DEFAULT_LANGUAGE.code);

    const language =
        LANGUAGE_OPTIONS.find((item) => item.code === languageCode) ?? DEFAULT_LANGUAGE;

    const setLanguage = (code: string) => {
        setLanguageCode(code);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
