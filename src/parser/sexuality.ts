import {
  AROMANTIC_FLAG_ICON,
  ASEXUAL_FLAG_ICON,
  BISEXUAL_FLAG_ICON,
  GAY_FLAG_ICON,
  LESBIAN_FLAG_ICON,
  PANSEXUAL_FLAG_ICON,
  STRAIGHT_FLAG_ICON,
} from 'src/icons/sexuality';
import { ABBR_MAPPING, TERM_MAPPING } from './base';
import { BPSettings } from '../settings';

const LESBIAN_ABBR = ['l'];
const LESBIAN_TERMS = ['lesbian'];
const GAY_ABBR = ['g'];
const GAY_TERMS = ['gay'];
const BI_ABBR = ['b'];
const BI_TERMS = ['bi', 'poly'];
const PAN_ABBR = ['p'];
const PAN_TERMS = ['pan'];
const ACE_ABBR = ['a'];
const ACE_TERMS = ['ace', 'asexual'];
const ARO_ABBR = ['a']; // effective only as "aa" for aroace
const ARO_TERMS = ['aro'];
const STRAIGHT_ABBR = ['s'];
const STRAIGHT_TERMS = ['straight', 'hetero'];

export function sexualityTermMappings(settings: BPSettings): Array<TERM_MAPPING> {
  if (!settings.useFlags) {
    return [];
  }

  return [
    [ACE_TERMS, ASEXUAL_FLAG_ICON],
    [ARO_TERMS, AROMANTIC_FLAG_ICON],
    [LESBIAN_TERMS, LESBIAN_FLAG_ICON],
    [GAY_TERMS, GAY_FLAG_ICON],
    [BI_TERMS, BISEXUAL_FLAG_ICON],
    [PAN_TERMS, PANSEXUAL_FLAG_ICON],
    [STRAIGHT_TERMS, STRAIGHT_FLAG_ICON],
  ];
}

export function sexualityAbbrMappings(settings: BPSettings): Array<ABBR_MAPPING> {
  if (!settings.useFlags) {
    return [];
  }

  return [
    [ACE_ABBR, ASEXUAL_FLAG_ICON],
    [ARO_ABBR, AROMANTIC_FLAG_ICON],
    [LESBIAN_ABBR, LESBIAN_FLAG_ICON],
    [GAY_ABBR, GAY_FLAG_ICON],
    [BI_ABBR, BISEXUAL_FLAG_ICON],
    [PAN_ABBR, PANSEXUAL_FLAG_ICON],
    [STRAIGHT_ABBR, STRAIGHT_FLAG_ICON],
  ];
}
