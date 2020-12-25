import {
  logLevels,
} from '../constants';
import type {
  Logger,
  MessageContextType,
  MessageEventHandlerType,
  TranslateMessageFunctionType,
} from '../types';

const createMockLogger = (
  onMessage: MessageEventHandlerType,
  parentContext?: MessageContextType,
): Logger => {
  const log: Logger = () => {
    return undefined;
  };

  log.adopt = async (routine) => {
    return routine();
  };

  log.child = (context: TranslateMessageFunctionType | MessageContextType): Logger => {
    return createMockLogger(onMessage, parentContext);
  };

  log.getContext = () => {
    return {};
  };

  log.trace = (a, b, c, d, e, f, g, h, i, j) => {
    return log.child({
      logLevel: logLevels.trace,
    })(a, b, c, d, e, f, g, h, i, j);
  };

  log.debug = (a, b, c, d, e, f, g, h, i, j) => {
    return log.child({
      logLevel: logLevels.debug,
    })(a, b, c, d, e, f, g, h, i, j);
  };

  log.info = (a, b, c, d, e, f, g, h, i, j) => {
    return log.child({
      logLevel: logLevels.info,
    })(a, b, c, d, e, f, g, h, i, j);
  };

  log.warn = (a, b, c, d, e, f, g, h, i, j) => {
    return log.child({
      logLevel: logLevels.warn,
    })(a, b, c, d, e, f, g, h, i, j);
  };

  log.error = (a, b, c, d, e, f, g, h, i, j) => {
    return log.child({
      logLevel: logLevels.error,
    })(a, b, c, d, e, f, g, h, i, j);
  };

  log.fatal = (a, b, c, d, e, f, g, h, i, j) => {
    return log.child({
      logLevel: logLevels.fatal,
    })(a, b, c, d, e, f, g, h, i, j);
  };

  return log;
};

export default createMockLogger;
