export const isTruthy = (value: string) => {
  return ['1', 'on', 't', 'true', 'y', 'yes'].includes(
    value.trim().toLowerCase(),
  );
};
