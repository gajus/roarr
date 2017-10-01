# Roarr

[![Travis build status](http://img.shields.io/travis/gajus/roarr/master.svg?style=flat-square)](https://travis-ci.org/gajus/roarr)
[![Coveralls](https://img.shields.io/coveralls/gajus/roarr.svg?style=flat-square)](https://coveralls.io/github/gajus/roarr)
[![NPM version](http://img.shields.io/npm/v/roarr.svg?style=flat-square)](https://www.npmjs.org/package/roarr)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

JSON logger for Node.js.

* [Motivation](#motivation)
* [Usage](#usage)
  * [Prepending context using the global state](#prepending-context-using-the-global-state)
  * [Filtering logs](#filtering-logs)
    * [jq primer](#jq-primer)
* [Log message format](#log-message-format)
* [API](#api)
  * [`child`](#child)
  * [`trace`](#trace)
  * [`debug`](#debug)
  * [`info`](#info)
  * [`warn`](#warn)
  * [`error`](#error)
  * [`fatal`](#fatal)
* [CLI tool](#cli-tool)
* [Transports](#transports)
* [Environment variables](#environment-variables)
* [Conventions](#conventions)
  * [Context property names](#context-property-names)
  * [Using Roarr in an application](#using-roarr-in-an-application)

## Motivation

For a long time I have been a big fan of using [`debug`](https://github.com/visionmedia/debug). `debug` is simple to use, works in Node.js and browser, does not require configuration and it is fast. However, problems arise when you need to parse logs. Anything but one-line text messages cannot be parsed in a safe way.

To log structured data, I have been using [Winston](https://github.com/winstonjs/winston) and [Bunyan](https://github.com/trentm/node-bunyan). These packages are great for application-level logging. I have preferred Bunyan because of the [Bunyan CLI program](https://github.com/trentm/node-bunyan#cli-usage) used to pretty-print logs. However, these packages require program-level configuration – when constructing an instance of a logger, you need to define the transport and the log-level. This makes them unsuitable for use in code designed to be consumed by other applications.

Then there is [pino](https://github.com/pinojs/pino). pino is fast JSON logger, it has CLI program equivalent to Bunyan, it decouples transports, and it has sane default configuration. Unfortunately, you still need to instantiate logger instance at the application-level. This makes it more suitable for application-level logging just like Winston and Bunyan.

I needed a logger that:

* Does not require initialisation.
* Produces structured data.
* [Decouples transports](#transports).
* Has a [CLI program](#cli-tool).
* Works in Node.js and browser.
* Configurable using environment variables and [`global`](https://nodejs.org/api/globals.html) namespace.

In other words,

* a logger that I can use in an application code and in dependencies.
* a logger that allows to correlate logs between the main application code and the dependency code.
* a logger that works well with transports in external processes.

Roarr is this logger.

## Usage

Roarr logging is disabled by default. To enable logging, you must start program with an environment variable `ROARR_LOG` set to `true`, e.g.

```bash
ROARR_LOG=true node ./index.js

```

```js
import log from 'roarr';

log('foo');

log('bar %s', 'baz');

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
{"context":{},"message":"foo","sequence":0,"time":1506776210000,"version":"1.0.0"}
{"context":{},"message":"bar baz","sequence":1,"time":1506776210000,"version":"1.0.0"}
{"context":{"level":"debug"},"message":"qux","sequence":2,"time":1506776210000,"version":"1.0.0"}
{"context":{"level":"debug","quuz":"corge"},"sequence":3,"message":"quux","time":1506776210000,"version":"1.0.0"}

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
{"context":{},"message":"foo","sequence":0,"time":1506776210000,"version":"1.0.0"}
{"context":{"taskId":1},"message":"bar","sequence":1,"time":1506776210000,"version":"1.0.0"}
{"context":{},"message":"baz","sequence":2,"time":1506776210000,"version":"1.0.0"}

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
{"context":{"taskId":1},"message":"starting task ID 1","sequence":0,"time":1506776210000,"version":"1.0.0"}
{"context":{"taskId":1},"message":"foo","sequence":1,"time":1506776210000,"version":"1.0.0"}
{"context":{"taskId":1},"message":"successfully completed task ID 1","sequence":2,"time":1506776210000,"version":"1.0.0"}
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

## Log message format

|Property name|Contents|
|---|---|
|`context`|Arbitrary, user-provided structured data. See [context property names](#context-property-names).|
|`message`|User-provided message formatted using [printf](https://en.wikipedia.org/wiki/Printf_format_string).|
|`sequence`|An incremental ID.|
|`time`|Unix timestamp in milliseconds.|
|`version`|Roarr log message format version.|

Example:

```js
{
  "context":{
    "application": "task-runner",
    "hostname": "curiosity.local",
    "instanceId": "01BVBK4ZJQ182ZWF6FK4EC8FEY",
    "taskId": 1
  },
  "message":"starting task ID 1",
  "sequence":0,
  "time":1506776210000,
  "version":"1.0.0"
}
```

## API

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

To put it into words:

* First parameter can be either a string (message) or an object.
  * If first parameter is an object (context), the second parameter must be a string (message).
* Arguments after the message parameter are used to enable [printf message formatting](https://en.wikipedia.org/wiki/Printf_format_string).
  * Printf arguments must be of a primitive type (`string | number | boolean | null`).
  * There can be up to 9 printf arguments (or 8 if the first parameter is the context object).

Refer to the [Usage documentation](#usage) for common usage examples.

### `child`

Creates a child logger appending the provided `context` object to the previous logger context.

```js
type ChildType = (context: MessageContextType) => LoggerType;

```

### `trace`
### `debug`
### `info`
### `warn`
### `error`
### `fatal`

Convenience methods for logging a message with `logLevel` context property value set to the name of the convenience method, e.g.

```js
import log from 'roarr';

log.trace('foo');
log.debug('foo');
log.info('foo');
log.warn('foo');
log.error('foo');
log.fatal('foo');

```

Produces output:

```
{"context":{"logLevel":"trace"},"message":"foo","sequence":0,"time":1506776210000,"version":"1.0.0"}
{"context":{"logLevel":"debug"},"message":"foo","sequence":1,"time":1506776210000,"version":"1.0.0"}
{"context":{"logLevel":"info"},"message":"foo","sequence":2,"time":1506776210000,"version":"1.0.0"}
{"context":{"logLevel":"warn"},"message":"foo","sequence":3,"time":1506776210000,"version":"1.0.0"}
{"context":{"logLevel":"error"},"message":"foo","sequence":4,"time":1506776210000,"version":"1.0.0"}
{"context":{"logLevel":"fatal"},"message":"foo","sequence":5,"time":1506776210000,"version":"1.0.0"}

```

## CLI tool

Roarr comes with a CLI tool used to pretty-print logs for development purposes.

To format the logs, pipe the program output to `roarr pretty-print` program, e.g.

```bash
$ npm install roarr -g
$ ROARR_LOG=true node index.js | roarr pretty-print

```

Provided that the `index.js` program produced an output such as:

```
{"context":{"package":"forward-proxy","namespace":"createHttpProxyServer","logLevel":"info"},"message":"Internal SSL Server running on localhost:62597","sequence":0,"time":1506803138704,"version":"1.0.0"}
{"context":{"package":"forward-proxy","namespace":"createRequestProcessor","logLevel":"info"},"message":"request start -> http://localhost:62595/","sequence":1,"time":1506803138741,"version":"1.0.0"}
{"context":{"package":"forward-proxy","namespace":"createLogInterceptor","logLevel":"debug","headers":{"host":"localhost:62595","connection":"close"}},"message":"received request","sequence":2,"time":1506803138741,"version":"1.0.0"}
{"context":{"package":"forward-proxy","namespace":"createRequestProcessor","logLevel":"info"},"message":"request finished <- http://localhost:62595/","sequence":3,"time":1506803138749,"version":"1.0.0"}
{"context":{"package":"forward-proxy","namespace":"createLogInterceptor","logLevel":"info","method":"GET","requestHeaders":{"host":"localhost:62595","connection":"close"},"responseHeaders":{"date":"Sat, 30 Sep 2017 20:25:38 GMT","connection":"close","content-length":"7","x-forward-proxy-request-id":"2b746d92-1a8b-4f36-b3cc-5bff57dad94d","x-forward-proxy-cache-hit":"false"},"statusCode":200,"url":"http://localhost:62595/"},"message":"response","sequence":4,"time":1506803138755,"version":"1.0.0"}
{"context":{"package":"forward-proxy","namespace":"createLogInterceptor","logLevel":"info","method":"GET","requestHeaders":{"host":"localhost:62595","connection":"close"},"responseHeaders":{"date":"Sat, 30 Sep 2017 20:25:38 GMT","content-length":"7","x-forward-proxy-request-id":"2b746d92-1a8b-4f36-b3cc-5bff57dad94d","x-forward-proxy-cache-hit":"true"},"statusCode":200,"url":"http://localhost:62595/"},"message":"response","sequence":5,"time":1506803138762,"version":"1.0.0"}

```

`roarr` CLI program will format the output to look like this:

![CLI output demo](./.README/cli-output-demo.png)

* `@` prefixed value denotes the name of the package.
* `#` prefixed value denotes the namespace.

Explore other CLI options using `roar --help`.

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

### Context property names

Roarr does not have reserved context property names. However, I encourage use of the following conventions:

|Context property name|Use case|
|---|---|
|`application`|Name of the application (do not use in code intended for distribution; see `package` property instead).|
|`hostname`|Machine hostname. See `roarr augment --append-hostname` option.|
|`instanceId`|Unique instance ID. Used to distinguish log source in high-concurrency environments. See `roarr augment --append-instance-id` option.|
|`logLevel`|Human-readable name of the log-level, e.g. "error". See [API](#api) for build-in loggers with a pre-set log-level.|
|`namespace`|Namespace within a package, e.g. function name. Treat the same way that you would construct namespaces when using the [`debug`](https://github.com/visionmedia/debug) package.|
|`package`|Name of the package.|

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
//
// Note: If you are adding logger to a package intended to be consumed by other
// packages, you must not set `global.ROARR.prepend`. Instead, use `roarr#child`.
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
