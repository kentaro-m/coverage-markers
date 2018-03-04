import { createRunner } from 'atom-mocha-test-runner';

module.exports = createRunner({ testSuffixes: ['test.js'], reporter: 'spec' });
