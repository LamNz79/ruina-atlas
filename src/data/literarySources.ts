import literarySourcesJson from './literarySources.json';
import type { LiterarySource } from '../types/index';

/**
 * JSON imports infer all arrays as `string[]`.
 * Casting through `unknown` bypasses the intermediate type and tells TS
 * to treat this as the fully-typed LiterarySource[] at the boundary.
 */
export const literarySources = literarySourcesJson.literarySources as unknown as LiterarySource[];
