import {
  AGENDER_FLAG_ICON,
  FEMALE_ICON,
  INTERSEX_ICON,
  MALE_ICON,
  NON_BINARY_FLAG_ICON,
  TRANSGENDER_FLAG_ICON,
} from 'src/icons/gender';
import { ABBR_MAPPING, TERM_MAPPING } from './base';

const TRANS_ABBR = ['t'];
const TRANS_TERMS = ['trans', 'transgender'];
const FEMALE_ABBR = ['f', 'w', 'g'];
const FEMALE_TERMS = ['fem', 'femme', 'female', 'girl', 'woman'];
const MALE_ABBR = ['m', 'b'];
const MALE_TERMS = ['masc', 'masculine', 'male', 'boy', 'man'];
const ENBY_ABBR = ['e', 'n'];
const ENBY_TERMS = ['enby', 'nonbinary'];
const INTERSEX_ABBR = ['i'];
const INTERSEX_TERMS = ['intersex', 'inter'];
const AGENDER_ABBR = ['a'];
const AGENDER_TERMS = ['androgynous', 'andro', 'agender'];

export const GENDER_TERMS_MAPPING: Array<TERM_MAPPING> = [
  [TRANS_TERMS, TRANSGENDER_FLAG_ICON],
  [ENBY_TERMS, NON_BINARY_FLAG_ICON],
  [AGENDER_TERMS, AGENDER_FLAG_ICON],
  [FEMALE_TERMS, FEMALE_ICON],
  [MALE_TERMS, MALE_ICON],
  [INTERSEX_TERMS, INTERSEX_ICON],
];

export const GENDER_ABBR_MAPPING: Array<ABBR_MAPPING> = [
  [TRANS_ABBR, TRANSGENDER_FLAG_ICON],
  [ENBY_ABBR, NON_BINARY_FLAG_ICON],
  [AGENDER_ABBR, AGENDER_FLAG_ICON],
  [FEMALE_ABBR, FEMALE_ICON],
  [MALE_ABBR, MALE_ICON],
  [INTERSEX_ABBR, INTERSEX_ICON],
];
