import type {
  AsyncLocalStorage,
} from 'async_hooks';

export type JsonObject<T = {}> = T & { [Key in string]?: JsonValue<T> };
export type JsonValue<T> = Array<JsonValue<T>> | JsonObject<T> | boolean | number | string | null;

export type LogWriter = (message: string) => void;

export type MessageContext<T = {}> = JsonObject<T>;

export type RoarrGlobalState = {
  asyncLocalStorage?: AsyncLocalStorage<MessageContext>,
  sequence: number,
  versions: readonly string[],
  write: LogWriter,
};

export type SprintfArgument = boolean | number | string | null;

export type Message<T = MessageContext> = {
  readonly context: T,
  readonly message: string,
  readonly sequence: string,
  readonly time: number,
  readonly version: string,
};

export type TranslateMessageFunction<T> = (message: Message<T>) => Message<MessageContext>;

export type LogMethod<Z> = {
  (
    context: Z,
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

type Child<Z> = {
  <T = Z>(context: TranslateMessageFunction<MessageContext<T>>): Logger<T | Z>,
  (context: MessageContext): Logger<Z>,
};

export type Logger<Z = MessageContext> = LogMethod<Z> & {
  adopt: <T>(routine: () => T, context?: MessageContext) => Promise<T>,
  child: Child<Z>,
  debug: LogMethod<Z>,
  error: LogMethod<Z>,
  fatal: LogMethod<Z>,
  getContext: () => MessageContext,
  info: LogMethod<Z>,
  trace: LogMethod<Z>,
  warn: LogMethod<Z>,
};

export type MessageEventHandler = (message: Message<MessageContext>) => void;

// eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
export type LogLevelName = 'trace' | 'debug' | 'info' | 'error' | 'fatal' | 'warn';
