import environmentIsNode from 'detect-node';
import cmp from 'semver-compare';
import pkg from '../../package.json';
import type {
  RoarrGlobalState,
} from '../types';
import createNodeWriter from './createNodeWriter';

export default (currentState: any): RoarrGlobalState => {
  const versions = (currentState.versions || []).concat();

  if (versions.length > 1) {
    versions.sort(cmp);
  }

  const currentIsLatestVersion = versions.length === 1 || cmp(pkg.version, versions[versions.length - 1]) === 1;

  if (pkg.version && !versions.includes(pkg.version)) {
    versions.push(pkg.version);
    
    if (versions.length > 1) {
      versions.sort(cmp);
    }
  }

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
