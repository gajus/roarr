# Roarr

[![Travis build status](http://img.shields.io/travis/gajus/roarr/master.svg?style=flat-square)](https://travis-ci.org/gajus/roarr)
[![Coveralls](https://img.shields.io/coveralls/gajus/roarr.svg?style=flat-square)](https://coveralls.io/github/gajus/roarr)
[![NPM version](http://img.shields.io/npm/v/roarr.svg?style=flat-square)](https://www.npmjs.org/package/roarr)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

JSON logger for Node.js.

* [Usage](#usage)
  * [Prepending context using the global state](#prepending-context-using-the-global-state)
  * [Filtering logs](#filtering-logs)
    * [jq primer](#jq-primer)
* [Transports](#transports)
* [Environment variables](#environment-variables)
* [Conventions](#conventions)
  * [Using Roarr in an application](#using-roarr-in-an-application)

## Usage

Roarr logging is disabled by default. To enable logging, you must start program with an environment variable `ROARR_LOG` set to `true`, e.g.

```bash
ROARR_LOG=true node ./index.js

```

`roarr` package exports a function that accepts the following API:

```js
export type LoggerType =
  (
    context: MessageContextType,
    message: string,
    c?: SprintfArgumentType,
    d?: SprintfArgumentType,
    e?: SprintfArgumentType,
    f?: SprintfArgumentType,
    g?: SprintfArgumentType,
    h?: SprintfArgumentType,
    i?: SprintfArgumentType,
    k?: SprintfArgumentType
  ) => void |
  (
    message: string,
    b?: SprintfArgumentType,
    c?: SprintfArgumentType,
    d?: SprintfArgumentType,
    e?: SprintfArgumentType,
    f?: SprintfArgumentType,
    g?: SprintfArgumentType,
    h?: SprintfArgumentType,
    i?: SprintfArgumentType,
    k?: SprintfArgumentType
  ) => void;

```

Put it into words:

1. First parameter can be either a string (message) or an object.
  * If first parameter is an object (context), the second parameter must be a string (message).
1. Arguments after the message parameter are used to enable [printf message formatting](https://en.wikipedia.org/wiki/Printf_format_string).
  * Printf arguments must be of a primitive type (`string | number | boolean | null`).
  * There can be up to 9 printf arguments (or 8 if the first parameter is the context object).

<!-- -->

```js
import log from 'roarr';

log('foo');

log('bar %s', 'baz');

// Creates a child logger appending the provided `context` object
// to the previous logger context.
const debug = log.child({
  level: 'debug'
});

debug('qux');

debug({
  quuz: 'corge'
}, 'quux');

```

Produces output:

```
{"context":{},"message":"foo","sequence":0,"time":1506776210001,"version":"1.0.0"}
{"context":{},"message":"bar baz","sequence":1,"time":1506776210002,"version":"1.0.0"}
{"context":{"level":"debug"},"message":"qux","sequence":2,"time":1506776210003,"version":"1.0.0"}
{"context":{"level":"debug","quuz":"corge"},"sequence":3,"message":"quux","time":1506776210004,"version":"1.0.0"}

```

### Prepending context using the global state

Prepending context using the global state will affect all `roarr` logs.

```js
import log from 'roarr';

log('foo');

global.ROARR.prepend = {
  taskId: 1
};

log('bar');

global.ROARR.prepend = {};

log('baz');

```

Produces output:

```
{"context":{},"message":"foo","sequence":0,"time":1506776210001,"version":"1.0.0"}
{"context":{"taskId":1},"message":"bar","sequence":1,"time":1506776210002,"version":"1.0.0"}
{"context":{},"message":"baz","sequence":2,"time":1506776210003,"version":"1.0.0"}

```

Prepending context using the global state is useful when the desired result is to associate all logs with a specific context for a duration of an operation, e.g. to correlate the main process logs with the dependency logs.

```js
import log from 'roarr';
import foo from 'foo';

const taskIds = [
  1,
  2,
  3
];

for (const taskId of taskIds) {
  global.ROARR = global.ROARR || {};
  global.ROARR.prepend = {
    taskId
  };

  log('starting task ID %d', taskId);

  // In this example, `foo` is an arbitrary third-party dependency that is using
  // roarr logger.
  foo(taskId);

  log('successfully completed task ID %d', taskId);

  global.ROARR.prepend = {};
}

```

Produces output:

```
{"context":{"taskId":1},"message":"starting task ID 1","sequence":0,"time":1506776210001,"version":"1.0.0"}
{"context":{"taskId":1},"message":"foo","sequence":1,"time":1506776210002,"version":"1.0.0"}
{"context":{"taskId":1},"message":"successfully completed task ID 1","sequence":2,"time":1506776210003,"version":"1.0.0"}
[...]

```

### Filtering logs

Roarr is designed to print all or none logs (refer to the [`ROARR_LOG` environment variable](#environment-variables) documentation).

To filter logs you need to use a JSON processor, e.g. [jq](https://stedolan.github.io/jq/).

### jq primer

`jq` allows you to filter JSON messages using [`select(boolean_expression)`](https://stedolan.github.io/jq/manual/#select(boolean_expression)), e.g.

```
ROARR_LOG=true node ./index.js | jq 'select(.context.level == "warning" or .context.level == "error")'

```

## Transports

A transport in most logging libraries is something that runs in-process to perform some operation with the finalised log line. For example, a transport might send the log line to a standard syslog server after processing the log line and reformatting it.

Roarr does not support in-process transports.

Roarr does not support in-process transports because Node processes are single threaded processes (ignoring some technical details). Given this restriction, Roarr purposefully offloads handling of the logs to external processes so that the threading capabilities of the OS can be used (or other CPUs).

Depending on your configuration, consider one of the following log transports:

* [Beats](https://www.elastic.co/products/beats) for aggregating at a process level (written in Go).
* [logagent](https://github.com/sematext/logagent-js) for aggregating at a process level (written in JavaScript).
* [Fluentd](https://www.fluentd.org/) for aggregating logs at a container orchestration level (e.g. Kubernetes) (written in Ruby).

## Environment variables

When running the script in a Node.js environment, use environment variables to control `roarr` behaviour.

|Name|Type|Function|Default|
|---|---|---|---|
|`ROARR_LOG`|Boolean|Enables/ disables logging.|`false`|

## Conventions

### Using Roarr in an application

I recommend to create a file `Logger.js` in the project directory. Use this file to create an child instance of Roarr with context parameters describing the project and the initialisation instance, e.g.

```js
/**
 * @file Example contents of a Logger.js file.
 */

import log from 'roarr';
import ulid from 'ulid';

// Instance ID is useful for correlating logs in high concurrency environment.
const instanceId = ulid();

// The reason we are using `global.ROARR.prepend` as opposed to `roarr#child`
// is because we want this information to be prepended to all logs, including
// those of the "my-application" dependencies.
global.ROARR.prepend = {
  ...global.ROARR.prepend,
  application: 'my-application',
  instanceId
};

const Logger = log.child({
  // .foo property is going to appear only in the logs that are created using
  // the current instance of a Roarr logger.
  foo: 'bar'
});

export default Logger;

```
