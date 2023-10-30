import { createLogger } from './factories/createLogger';
import { createRoarrInitialGlobalState } from './factories/createRoarrInitialGlobalState';
import { type MessageSerializer, type RoarrGlobalState } from './types';
import fastJson from 'fast-json-stringify';
import safeStringify from 'safe-stable-stringify';

const fastStringify = fastJson({
  properties: {
    message: {
      type: 'string',
    },
    sequence: {
      type: 'string',
    },
    time: {
      type: 'integer',
    },
    version: {
      type: 'string',
    },
  },
  type: 'object',
});

const ROARR = createRoarrInitialGlobalState(
  (globalThis.ROARR as RoarrGlobalState) || {},
);

globalThis.ROARR = ROARR;

const serializeMessage: MessageSerializer = (message) => {
  return (
    '{"context":' +
    safeStringify(message.context) +
    ',' +
    fastStringify(message).slice(1)
  );
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
