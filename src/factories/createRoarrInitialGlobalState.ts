import environmentIsNode from 'detect-node';
import pkg from '../../package.json';
import compareSemver from 'semver-compare';
import type {
  RoarrGlobalState,
} from '../types';
import createNodeWriter from './createNodeWriter';

export default (currentState: any): RoarrGlobalState => {
  const versions = (currentState.versions || []).concat();

  if (versions.length > 1) {
    versions.sort(compareSemver);
  }

  const currentIsLatestVersion = !versions.length || compareSemver(pkg.version, versions[versions.length - 1]) === 1;

  if (!versions.includes(pkg.version)) {
    versions.push(pkg.version);
  }

  versions.sort(compareSemver);

  let newState = {
    sequence: 0,
    ...currentState,
    versions,
  };

  if (environmentIsNode && (currentIsLatestVersion || !newState.write)) {
    newState = {
      ...newState,
      ...createNodeWriter(),
    };
  }

  return newState;
};
