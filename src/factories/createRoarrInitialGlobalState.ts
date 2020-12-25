import fs from 'fs';
import path from 'path';
import environmentIsNode from 'detect-node';
import cmp from 'semver-compare';
import type {
  RoarrGlobalStateType,
} from '../types';
import createNodeWriter from './createNodeWriter';

const version = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8')).version;

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
