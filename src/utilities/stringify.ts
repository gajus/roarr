import { configure } from 'safe-stable-stringify';

const safeStringify = configure({
  circularValue: 'Magic circle!',
  deterministic: false,
  strict: false,
});

export const stringify = (value: unknown): string => {
  try {
    return safeStringify(value) ?? '';
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('could not serialize value', value);

    throw error;
  }
};
