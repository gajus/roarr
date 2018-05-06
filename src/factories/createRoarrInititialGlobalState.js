// @flow

import type {
  RoarrGlobalStateType
} from '../types';
// eslint-disable-next-line flowtype/no-weak-types
export default (currentState: Object): RoarrGlobalStateType => {

  return {
    prepend: {},
    sequence: 0,
    ...currentState
  };
};
