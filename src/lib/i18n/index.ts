import { en } from './en';
import { te } from './te';
import { hi } from './hi';
import type { SupportedLanguage, TranslationDictionary } from './types';

export const dictionaries: Record<SupportedLanguage, TranslationDictionary> = {
  en,
  te,
  hi,
};

export function getTranslation(lang: SupportedLanguage = 'en'): TranslationDictionary {
  return dictionaries[lang] || dictionaries.en;
}

export * from './types';
