// @flow

export default (text: string): boolean => {
  return text.includes('"message"') && text.includes('"sequence"');
};
