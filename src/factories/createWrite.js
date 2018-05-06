// @flow

type WriteConfigurationType = {|
  +stream: 'STDOUT' | 'STDERR'
|};

export default (configuration: WriteConfigurationType) => {
  return (message: string) => {
    // @todo Add browser support.
    if (configuration.stream === 'STDOUT') {
      process.stdout.write(message + '\n');
    } else {
      process.stderr.write(message + '\n');
    }
  };
};
