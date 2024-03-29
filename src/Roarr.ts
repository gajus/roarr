import { createLogger } from './factories/createLogger';
import { createRoarrInitialGlobalState } from './factories/createRoarrInitialGlobalState';
import { type MessageSerializer, type RoarrGlobalState } from './types';
import { stringify } from './utilities/stringify';

const ROARR = createRoarrInitialGlobalState(
  (globalThis.ROARR as RoarrGlobalState) || {},
);

globalThis.ROARR = ROARR;

const serializeMessage: MessageSerializer = (message) => {
  return stringify(message);
};

const Roarr = createLogger((message) => {
  if (ROARR.write) {
    // Stringify message as soon as it is received to prevent
    // properties of the context from being modified by reference.
    ROARR.write((ROARR.serializeMessage ?? serializeMessage)(message));
  }
});

export type {
  Logger,
  LogLevelName,
  LogWriter,
  Message,
  MessageContext,
  MessageEventHandler,
  MessageSerializer,
  RoarrGlobalState,
  TransformMessageFunction,
} from './types';

export { ROARR, Roarr };

export { logLevels } from './constants';
export { getLogLevelName } from './getLogLevelName';
