import environmentIsNode from 'detect-node';
import cmp from 'semver-compare';
import {
  version,
} from '../../package.json';
import type {
  RoarrGlobalStateType,
} from '../types';
import createNodeWriter from './createNodeWriter';

export default (currentState: any): RoarrGlobalStateType => {
  const versions = (currentState.versions || []).concat();

  versions.sort(cmp);

  const currentIsLatestVersion = !versions.length || cmp(version, versions[versions.length - 1]) === 1;

  if (!versions.includes(version)) {
    versions.push(version);
  }

  versions.sort(cmp);

  let newState = {
    sequence: 0,
    ...currentState,
    versions,
  };

  if (environmentIsNode) {
    if (currentIsLatestVersion || !newState.write) {
      newState = {
        ...newState,
        ...createNodeWriter(),
      };
    }
  }

  return newState;
};
