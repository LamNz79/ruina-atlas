import identityDetailDataRaw from './identityDetailData.json';
import type { IdentityDetailMap } from '../types';

export const identityDetailData: IdentityDetailMap = identityDetailDataRaw as unknown as IdentityDetailMap;
