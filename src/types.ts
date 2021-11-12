import type {
  AsyncLocalStorage,
} from 'async_hooks';

export type JsonObject = { [key: string]: JsonValue, };

export type JsonValue = JsonObject | JsonValue[] | boolean | number | string | null;

export type LogWriter = (message: string) => void;

export type MessageContext = JsonObject;

export type RoarrGlobalState = {
  asyncLocalStorage?: AsyncLocalStorage<MessageContext>,
  sequence: number,
  versions: readonly string[],
  write: LogWriter,
};

export type SprintfArgument = boolean | number | string | null;

export type Message = {
  readonly context: MessageContext,
  readonly message: string,
  readonly sequence: string,
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
  ): void,
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
  ): void,
};

export type Logger = LogMethod & {
  adopt: <T>(routine: () => T, context?: MessageContext) => Promise<T>,
  child: (context: MessageContext | TranslateMessageFunction) => Logger,
  debug: LogMethod,
  error: LogMethod,
  fatal: LogMethod,
  getContext: () => MessageContext,
  info: LogMethod,
  trace: LogMethod,
  warn: LogMethod,
};

export type MessageEventHandler = (message: Message) => void;

// eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
export type LogLevelName = 'trace' | 'debug' | 'info' | 'error' | 'fatal' | 'warn';
