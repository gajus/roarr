import { logLevels } from '../constants';
import {
  type Logger,
  type MessageContext,
  type MessageEventHandler,
} from '../types';

const noopLevelMethod = () => {
  return undefined;
};

const mockLoggerPrototype: any = Object.create(Function.prototype);

mockLoggerPrototype.adopt = async function (_routine: any) {
  return _routine();
};

mockLoggerPrototype.child = function (this: any) {
  return createMockLogger(this._onMessage, this._parentMessageContext);
};

mockLoggerPrototype.getContext = function () {
  return {};
};

for (const logLevelName of Object.keys(logLevels) as Array<
  keyof typeof logLevels
>) {
  mockLoggerPrototype[logLevelName] = noopLevelMethod;
  mockLoggerPrototype[logLevelName + 'Once'] = noopLevelMethod;
}

export const createMockLogger = (
  onMessage: MessageEventHandler,
  parentContext?: MessageContext,
): Logger => {
  const log: any = () => {
    return undefined;
  };

  log._onMessage = onMessage;
  log._parentMessageContext = parentContext;

  Object.setPrototypeOf(log, mockLoggerPrototype);

  return log as Logger;
};
