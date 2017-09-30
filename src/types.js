// @flow

export type SerializableObjectType = {
  +[key: string]: string | number | null | SerializableObjectType
};

export type RoarrGlobalStateType = {
  prepend: SerializableObjectType,
  sequence: number
};

export type SprintfArgumentType = string | number | boolean | null;

export type MessageContextType = SerializableObjectType;

export type MessageType = {|
  +context: MessageContextType,
  +message: string,
  +sequence: number,
  +time: number,
  +version: string
|};

export type LoggerType =
  (
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
  ) => void |
  (
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
  ) => void;
