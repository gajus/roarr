// @flow

/* eslint-disable import/exports-last, flowtype/require-types-at-top */

export type SerializableObjectType = {
  +[key: string]: string | number | null | SerializableObjectType
};

export type RoarrGlobalStateType = {|
  buffer: string,
  flush: (message: string) => void,
  prepend: SerializableObjectType,
  registeredFlush: boolean,
  sequence: number,
  versions: $ReadOnlyArray<string>,
  write: (message: string) => void
|};

export type SprintfArgumentType = string | number | boolean | null;

export type MessageContextType = SerializableObjectType;

export type MessageType = {|
  +context: MessageContextType,
  +message: string,
  +sequence: number,
  +time: number,
  +version: string
|};

export type TranslatorType = (message: MessageType) => MessageType;

declare function Logger (
  context: MessageContextType,
  message: string,
  c?: SprintfArgumentType,
  d?: SprintfArgumentType,
  e?: SprintfArgumentType,
  f?: SprintfArgumentType,
  g?: SprintfArgumentType,
  h?: SprintfArgumentType,
  i?: SprintfArgumentType,
  k?: SprintfArgumentType
): void;

// eslint-disable-next-line no-redeclare
declare function Logger (
  message: string,
  b?: SprintfArgumentType,
  c?: SprintfArgumentType,
  d?: SprintfArgumentType,
  e?: SprintfArgumentType,
  f?: SprintfArgumentType,
  g?: SprintfArgumentType,
  h?: SprintfArgumentType,
  i?: SprintfArgumentType,
  k?: SprintfArgumentType
): void;

/**
 * see https://twitter.com/kuizinas/status/914139352908943360
 */
export type LoggerType = typeof Logger;
