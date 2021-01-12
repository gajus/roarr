export interface Writer {
  write: (message: string) => void;
}

export interface RoarrGlobalState extends Writer {
  sequence: number;
  versions: ReadonlyArray<string>;
}

export type SprintfArgument = string | number | boolean | null;

export type MessageContext = any;

export type Message = {
  readonly context: MessageContext,
  readonly message: string,
  readonly sequence: number,
  readonly time: number,
  readonly version: string,
};

export type TranslateMessageFunction = (message: Message) => Message;

export type LogMethod = {
  (
    context: MessageContext,
    message: string,
    c?: SprintfArgument,
    d?: SprintfArgument,
    e?: SprintfArgument,
    f?: SprintfArgument,
    g?: SprintfArgument,
    h?: SprintfArgument,
    i?: SprintfArgument,
    j?: SprintfArgument
  ): void;
  (
    message: string,
    b?: SprintfArgument,
    c?: SprintfArgument,
    d?: SprintfArgument,
    e?: SprintfArgument,
    f?: SprintfArgument,
    g?: SprintfArgument,
    h?: SprintfArgument,
    i?: SprintfArgument,
    j?: SprintfArgument,
  ): void;
}

export interface Logger extends LogMethod {
  adopt: <T>(routine: () => Promise<T>, context: MessageContext) => Promise<T>,
  child: (context: TranslateMessageFunction | MessageContext) => Logger,
  debug: LogMethod,
  error: LogMethod,
  fatal: LogMethod,
  getContext: () => MessageContext,
  info: LogMethod,
  trace: LogMethod,
  warn: LogMethod,
}

export type MessageEventHandler = (message: Message) => void;
