import {
  AGENDER_FLAG_ICON,
  FEMALE_ICON,
  INTERSEX_ICON,
  MALE_ICON,
  NON_BINARY_FLAG_ICON,
  TRANSGENDER_FLAG_ICON,
  TRANSGENDER_ICON,
} from 'src/icons/gender';
import { ABBR_MAPPING, TERM_MAPPING } from './base';
import { BPSettings } from '../settings';

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

export function genderTermMappings(settings: BPSettings): Array<TERM_MAPPING> {
  const output: Array<TERM_MAPPING> = [];

  if (settings.useFlags && settings.preferFlags) output.push([TRANS_TERMS, TRANSGENDER_FLAG_ICON]);
  else if (settings.useIcons) output.push([TRANS_TERMS, TRANSGENDER_ICON]);

  if (settings.useFlags && settings.preferFlags) output.push([ENBY_TERMS, NON_BINARY_FLAG_ICON]);
  else if (settings.useIcons) output.push([ENBY_TERMS, NON_BINARY_FLAG_ICON]);

  if (settings.useFlags) output.push([AGENDER_TERMS, AGENDER_FLAG_ICON]);
  if (settings.useIcons) output.push([FEMALE_TERMS, FEMALE_ICON]);
  if (settings.useIcons) output.push([MALE_TERMS, MALE_ICON]);
  if (settings.useIcons) output.push([INTERSEX_TERMS, INTERSEX_ICON]);

  return output;
}

export function genderAbbrMappings(settings: BPSettings): Array<ABBR_MAPPING> {
  const output: Array<ABBR_MAPPING> = [];

  if (settings.useFlags && settings.preferFlags) output.push([TRANS_ABBR, TRANSGENDER_FLAG_ICON]);
  else if (settings.useIcons) output.push([TRANS_ABBR, TRANSGENDER_ICON]);

  if (settings.useFlags && settings.preferFlags) output.push([ENBY_ABBR, NON_BINARY_FLAG_ICON]);
  else if (settings.useIcons) output.push([ENBY_ABBR, NON_BINARY_FLAG_ICON]);

  if (settings.useFlags) output.push([AGENDER_ABBR, AGENDER_FLAG_ICON]);
  if (settings.useIcons) output.push([FEMALE_ABBR, FEMALE_ICON]);
  if (settings.useIcons) output.push([MALE_ABBR, MALE_ICON]);
  if (settings.useIcons) output.push([INTERSEX_ABBR, INTERSEX_ICON]);

  return output;
}
