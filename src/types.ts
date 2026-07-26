import { type AsyncLocalStorage } from 'node:async_hooks';

export type AsyncLocalContext =
  NestedAsyncLocalContext | TopLevelAsyncLocalContext;

/**
 * @see https://stackoverflow.com/a/77390832/368691
 * @public
 */
export type JsonObject = {
  [k: string]: JsonValue;
};

export type Logger<Z = MessageContext> = LogMethod<Z> & {
  adopt: <T>(
    routine: () => T,
    context?: MessageContext | TransformMessageFunction<MessageContext>,
  ) => Promise<T>;
  child: Child<Z>;
  debug: LogMethod<Z>;
  debugOnce: LogMethod<Z>;
  error: LogMethod<Z>;
  errorOnce: LogMethod<Z>;
  fatal: LogMethod<Z>;
  fatalOnce: LogMethod<Z>;
  getContext: () => MessageContext;
  info: LogMethod<Z>;
  infoOnce: LogMethod<Z>;
  trace: LogMethod<Z>;
  traceOnce: LogMethod<Z>;
  warn: LogMethod<Z>;
  warnOnce: LogMethod<Z>;
};

export type LogLevelName =
  'debug' | 'error' | 'fatal' | 'info' | 'trace' | 'warn';

export type LogWriter = (message: string) => void;

export type Message<T = MessageContext> = {
  readonly context: T;
  readonly message: string;
  readonly sequence: string;
  readonly time: number;
  readonly version: string;
};

export type MessageContext<T = {}> = JsonObject & T;

export type MessageEventHandler = (message: Message<MessageContext>) => void;

export type MessageSerializer = (message: Message<MessageContext>) => string;

export type RoarrGlobalState = {
  asyncLocalStorage?: AsyncLocalStorage<AsyncLocalContext>;
  onceLog: Set<string>;
  sequence: number;
  serializeMessage?: MessageSerializer;
  teardown?: () => void;
  versions: readonly string[];
  write: LogWriter;
};

export type TopLevelAsyncLocalContext = {
  messageContext: MessageContext;
  transforms: ReadonlyArray<TransformMessageFunction<MessageContext>>;
};

export type TransformMessageFunction<T> = (
  message: Message<T>,
) => Message<MessageContext>;

type Child<Z> = {
  <T = Z>(context: TransformMessageFunction<MessageContext<T>>): Logger<T | Z>;
  (context: MessageContext): Logger<Z>;
};

type JsonValue =
  | boolean
  | JsonObject
  | JsonValue[]
  | null
  | number
  | readonly JsonValue[]
  | string
  | undefined;

type LogMethod<Z> = {
  <T extends string = string>(
    context: Z,
    message: T,
    c?: T extends `${string}%${string}` ? SprintfArgument : never,
    d?: SprintfArgument,
    e?: SprintfArgument,
    f?: SprintfArgument,
    g?: SprintfArgument,
    h?: SprintfArgument,
    index?: SprintfArgument,
    index_?: SprintfArgument,
  ): void;
  <T extends string = string>(
    message: T,
    b?: T extends `${string}%${string}` ? SprintfArgument : never,
    c?: SprintfArgument,
    d?: SprintfArgument,
    e?: SprintfArgument,
    f?: SprintfArgument,
    g?: SprintfArgument,
    h?: SprintfArgument,
    index?: SprintfArgument,
    index_?: SprintfArgument,
  ): void;
};

type NestedAsyncLocalContext = TopLevelAsyncLocalContext & {
  sequence: number;
  sequenceRoot: string;
};

type SprintfArgument = boolean | null | number | string;
