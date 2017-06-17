'use babel';

export default class InvalidLcovInfoFormatError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.name = 'InvalidLcovInfoFormatError';
  }
}
