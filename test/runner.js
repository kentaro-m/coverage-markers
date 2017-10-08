import { allowUnsafeEval, allowUnsafeNewFunction } from 'loophole';

const { createRunner } = allowUnsafeEval(() => {
  return allowUnsafeNewFunction(() => {
    return require('atom-mocha-test-runner');
  });
});

const chai = allowUnsafeEval(() => {
  return allowUnsafeNewFunction(() => {
    return require('chai');
  });
});

import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

global.assert = chai.assert;

module.exports = createRunner({ testSuffixes: ['test.js'], reporter: 'spec' });
