import { nanoid } from 'nanoid';

export const createId = (prefix?: string): string =>
  prefix ? `${prefix}_${nanoid(10)}` : nanoid(12);
