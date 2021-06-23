import type {
  AsyncLocalStorage,
} from 'async_hooks';

export type Writer = {
  write: (message: string) => void,
};

export type MessageContext = any;

export type RoarrGlobalState = Writer & {
  asyncLocalStorage?: AsyncLocalStorage<MessageContext>,
  sequence: number,
  versions: readonly string[],
};

export type SprintfArgument = boolean | number | string | null;

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
  adopt: <T>(routine: () => Promise<T>, context: MessageContext) => Promise<T>,
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
