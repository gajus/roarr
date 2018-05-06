// @flow

export type SerializableObjectType = {
  +[key: string]: string | number | null | SerializableObjectType
};

export type RoarrGlobalStateType = {|
  +prepend: SerializableObjectType,
  +sequence: number,
  +versions: $ReadOnlyArray<string>
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
