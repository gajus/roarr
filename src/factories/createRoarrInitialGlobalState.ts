import environmentIsNode from 'detect-node';
import compareSemver from 'semver-compare';
import {
  ROARR_VERSION,
} from '../config';
import type {
  RoarrGlobalState,
} from '../types';
import createNodeWriter from './createNodeWriter';

export default (currentState: any): RoarrGlobalState => {
  const versions = (currentState.versions || []).concat();

  if (versions.length > 1) {
    versions.sort(compareSemver);
  }

  const currentIsLatestVersion = !versions.length || compareSemver(ROARR_VERSION, versions[versions.length - 1]) === 1;

  if (!versions.includes(ROARR_VERSION)) {
    versions.push(ROARR_VERSION);
  }

  versions.sort(compareSemver);

  let newState = {
    sequence: 0,
    ...currentState,
    versions,
  };

  if (environmentIsNode && (currentIsLatestVersion || !newState.write)) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      const AsyncLocalStorage = require('async_hooks').AsyncLocalStorage;

      const asyncLocalStorage = new AsyncLocalStorage();

      newState = {
        ...newState,
        ...createNodeWriter(),
        asyncLocalStorage,
      };
    // eslint-disable-next-line no-empty
    } catch {}
  }

  return newState;
};
