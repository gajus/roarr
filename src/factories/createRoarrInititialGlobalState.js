// @flow

import cmp from 'semver-compare';
import {
  version
} from '../../package.json';
import type {
  RoarrGlobalStateType
} from '../types';
import {
  ROARR_STREAM
} from '../config';
import createWrite from './createWrite';

// eslint-disable-next-line flowtype/no-weak-types
export default (currentState: Object): RoarrGlobalStateType => {
  const versions = (currentState.versions || []).concat();

  versions.sort(cmp);

  let write = currentState.write;

  if (!versions.length || cmp(version, versions[versions.length - 1]) === 1) {
    write = createWrite({
      stream: ROARR_STREAM
    });
  }

  if (!versions.includes(version)) {
    versions.push(version);
  }

  versions.sort(cmp);

  return {
    prepend: {},
    sequence: 0,
    ...currentState,
    versions,
    write
  };
};
