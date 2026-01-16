import {
  type Logger,
  type MessageContext,
  type MessageEventHandler,
} from '../types';

// Mock logger level methods are no-ops - no need for child logger creation
const noopLevelMethod = () => {
  return undefined;
};

export const createMockLogger = (
  onMessage: MessageEventHandler,
  parentContext?: MessageContext,
): Logger => {
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const log: Logger = () => {
    return undefined;
  };

  log.adopt = async (routine) => {
    return routine();
  };

  log.child = () => {
    return createMockLogger(onMessage, parentContext);
  };

  log.getContext = () => {
    return {};
  };

  // All level methods are no-ops for mock logger - no child logger needed
  log.debug = noopLevelMethod;
  log.debugOnce = noopLevelMethod;
  log.error = noopLevelMethod;
  log.errorOnce = noopLevelMethod;
  log.fatal = noopLevelMethod;
  log.fatalOnce = noopLevelMethod;
  log.info = noopLevelMethod;
  log.infoOnce = noopLevelMethod;
  log.trace = noopLevelMethod;
  log.traceOnce = noopLevelMethod;
  log.warn = noopLevelMethod;
  log.warnOnce = noopLevelMethod;

  return log;
};
