export interface WriterType {
  write: (message: string) => void;
}

export interface RoarrGlobalStateType extends WriterType {
  sequence: number;
  versions: ReadonlyArray<string>;
}

export type SprintfArgumentType = string | number | boolean | null;

export type MessageContextType = any;

export type MessageType = {
  readonly context: MessageContextType,
  readonly message: string,
  readonly sequence: number,
  readonly time: number,
  readonly version: string,
};

export type TranslateMessageFunctionType = (message: MessageType) => MessageType;

export type LogMethod = {
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
    j?: SprintfArgumentType
  ): void;
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
    j?: SprintfArgumentType,
  ): void;
}

export interface Logger extends LogMethod {
  adopt: <T>(routine: () => Promise<T>, context: MessageContextType) => Promise<T>,
  child: (context: TranslateMessageFunctionType | MessageContextType) => Logger,
  debug: LogMethod,
  error: LogMethod,
  fatal: LogMethod,
  getContext: () => MessageContextType,
  info: LogMethod,
  trace: LogMethod,
  warn: LogMethod,
}

export type MessageEventHandlerType = (message: MessageType) => void;
