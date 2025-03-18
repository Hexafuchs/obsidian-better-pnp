export type Translations = Record<string, string>;

export const GERMAN_TRANSLATIONS: Translations = {
  height: 'Größe',
  weight: 'Gewicht',
  hair: 'Haar',
  skin: 'Haut',
  species: 'Spezies',
  job: 'Beruf',
  purpose: 'Zweck',
  goal: 'Ziel',
  characteristics: 'Charakteristiken',
  notes: 'Notizen',
};

export const ENGLISH_TRANSLATIONS: Translations = {
  height: 'Height',
  weight: 'Weight',
  hair: 'Hair',
  skin: 'Skin',
  species: 'Species',
  job: 'Job',
  purpose: 'Purpose',
  goal: 'Goal',
  characteristics: 'Characteristics',
  notes: 'Notes',
};

export function t(language: string, identifier: string): string | null {
  if (language === 'de') {
    return GERMAN_TRANSLATIONS[identifier] ?? ENGLISH_TRANSLATIONS[identifier];
  }
  return ENGLISH_TRANSLATIONS[identifier];
}
