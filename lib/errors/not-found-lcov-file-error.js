'use babel';

export default class NotFoundLcovFileError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
    this.name = 'NotFoundLcovFileError';
  }
}
