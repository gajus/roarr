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
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return createMockLogger(this.onMessage, this.parentMessageContext);
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
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const log: any = () => {
    return undefined;
  };

  log.onMessage = onMessage;
  log.parentMessageContext = parentContext;

  Object.setPrototypeOf(log, mockLoggerPrototype);

  return log as Logger;
};
