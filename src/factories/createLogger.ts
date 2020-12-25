import environmentIsNode from 'detect-node';
import createGlobalThis from 'globalthis';
import isCircular from 'is-circular';
import stringify from 'json-stringify-safe';
import {
  sprintf,
} from 'sprintfit';
import {
  logLevels,
} from '../constants';
import type {
  Logger,
  MessageContextType,
  MessageEventHandlerType,
  TranslateMessageFunctionType,
} from '../types';

const globalThis = createGlobalThis();

let domain: any;

if (environmentIsNode) {
  // eslint-disable-next-line node/global-require
  domain = require('domain');
}

const getParentDomainContext = () => {
  if (!domain) {
    return {};
  }

  const parentRoarrContexts: MessageContextType[] = [];

  let currentDomain: any = process.domain;

  if (!currentDomain || !currentDomain.parentDomain) {
    return {};
  }

  while (currentDomain && currentDomain.parentDomain) {
    currentDomain = currentDomain.parentDomain;

    if (currentDomain.roarr && currentDomain.roarr.context) {
      parentRoarrContexts.push(currentDomain.roarr.context);
    }
  }

  let domainContext = {};

  for (const parentRoarrContext of parentRoarrContexts) {
    domainContext = {
      ...domainContext,
      ...parentRoarrContext,
    };
  }

  return domainContext;
};

const getFirstParentDomainContext = () => {
  if (!domain) {
    return {};
  }

  let currentDomain: any = process.domain;

  if (currentDomain && currentDomain.roarr && currentDomain.roarr.context) {
    return currentDomain.roarr.context;
  }

  if (!currentDomain || !currentDomain.parentDomain) {
    return {};
  }

  while (currentDomain && currentDomain.parentDomain) {
    currentDomain = currentDomain.parentDomain;

    if (currentDomain.roarr && currentDomain.roarr.context) {
      return currentDomain.roarr.context;
    }
  }

  return {};
};

const defaultContext = {};

const createLogger = (onMessage: MessageEventHandlerType, parentContext?: MessageContextType): Logger => {
  const log = (
    a: any,
    b: any,
    c: any,
    d: any,
    e: any,
    f: any,
    g: any,
    h: any,
    i: any,
    j: any,
  ) => {
    const time = Date.now();
    const sequence = globalThis.ROARR.sequence++;

    let context;
    let message;

    if (typeof a === 'string') {
      if (!domain || process.domain === null) {
        context = parentContext || defaultContext;
      } else {
        context = {
          ...getFirstParentDomainContext(),
          ...parentContext,
        };
      }
    } else {
      context = {
        ...getFirstParentDomainContext(),
        ...parentContext,
        ...a,
      };
    }

    if (context !== defaultContext && isCircular(context)) {
      context = JSON.parse(stringify(context));
    }

    if (typeof a === 'string' && b === undefined) {
      message = a;
    } else if (typeof a === 'string') {
      message = sprintf(
        a,
        b,
        c,
        d,
        e,
        f,
        g,
        h,
        i,
        j,
      );
    } else {
      if (typeof b !== 'string') {
        throw new TypeError('Message must be a string.');
      }

      message = sprintf(
        b,
        c,
        d,
        e,
        f,
        g,
        h,
        i,
        j,
      );
    }

    onMessage({
      context,
      message,
      sequence,
      time,
      version: '1.0.0',
    });
  };

  log.child = (context: TranslateMessageFunctionType | MessageContextType) => {
    if (typeof context === 'function') {
      return createLogger((message) => {
        if (typeof context !== 'function') {
          throw new TypeError('Unexpected state.');
        }
        onMessage(context(message));
      }, parentContext);
    }

    return createLogger(onMessage, {
      ...getFirstParentDomainContext(),
      ...parentContext,
      ...context,
    });
  };

  log.getContext = (): MessageContextType => {
    return {
      ...getFirstParentDomainContext(),
      ...parentContext || defaultContext,
    };
  };

  log.adopt = async (routine, context) => {
    if (!domain) {
      return routine();
    }

    const adoptedDomain = domain.create();

    return adoptedDomain
      .run(() => {
        adoptedDomain.roarr = {
          context: {
            ...getParentDomainContext(),
            ...context,
          },
        };

        return routine();
      });
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

export default createLogger;
