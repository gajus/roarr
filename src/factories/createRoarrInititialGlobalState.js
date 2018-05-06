// @flow

import {
  cmp
} from 'semver-compare';
import type {
  RoarrGlobalStateType
} from '../types';
import {
  version
} from '../../package.json';

// eslint-disable-next-line flowtype/no-weak-types
export default (currentState: Object): RoarrGlobalStateType => {
  const versions = (currentState.versions || []).concat();

  if (!versions.includes(version)) {
    versions.push(version);
  }

  versions.sort(cmp);

  return {
    prepend: {},
    sequence: 0,
    versions,
    ...currentState
  };
};
