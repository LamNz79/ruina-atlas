import data from './cantos.json';
import type { Canto } from '../types';

export const cantos = data.cantos as unknown as Canto[];