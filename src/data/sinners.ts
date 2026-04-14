import sinnersJson from './sinners.json';
import type { Sinner } from '../types/index';

/**
 * JSON imports infer all arrays as `string[]`.
 * Casting through `unknown` at the boundary tells TS to treat the JSON
 * payload as the fully-typed array — no field-level assertion needed.
 */
export const sinners = sinnersJson.sinners as unknown as Sinner[];