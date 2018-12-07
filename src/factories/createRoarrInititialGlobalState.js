// @flow

import cmp from 'semver-compare';
import {
  version
} from '../../package.json';
import type {
  RoarrGlobalStateType
} from '../types';
import {
  ROARR_BUFFER_SIZE,
  ROARR_STREAM
} from '../config';
import createWriter from './createWriter';

// eslint-disable-next-line flowtype/no-weak-types
export default (currentState: Object): RoarrGlobalStateType => {
  const versions = (currentState.versions || []).concat();

  versions.sort(cmp);

  const currentIsLatestVersion = !versions.length || cmp(version, versions[versions.length - 1]) === 1;

  if (!versions.includes(version)) {
    versions.push(version);
  }

  versions.sort(cmp);

  let newState = {
    buffer: '',
    prepend: {},
    sequence: 0,
    ...currentState,
    versions
  };

  if (currentIsLatestVersion || !newState.write) {
    newState = {
      ...newState,
      ...createWriter({
        bufferSize: ROARR_BUFFER_SIZE,
        stream: ROARR_STREAM
      })
    };
  }

  return newState;
};
