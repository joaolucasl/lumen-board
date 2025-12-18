import { ElementType } from '../types';
import {
  DEFAULT_CUSTOM_HEIGHT,
  DEFAULT_CUSTOM_WIDTH,
  DEFAULT_ELEMENT_HEIGHT,
  DEFAULT_ELEMENT_WIDTH,
  DEFAULT_TEXT_HEIGHT,
  DEFAULT_TEXT_WIDTH,
} from '../constants';

export function getDefaultElementSize(type: ElementType): { width: number; height: number } {
  if (type === 'text') {
    return { width: DEFAULT_TEXT_WIDTH, height: DEFAULT_TEXT_HEIGHT };
  }

  if (type === 'custom') {
    return { width: DEFAULT_CUSTOM_WIDTH, height: DEFAULT_CUSTOM_HEIGHT };
  }

  return { width: DEFAULT_ELEMENT_WIDTH, height: DEFAULT_ELEMENT_HEIGHT };
}
