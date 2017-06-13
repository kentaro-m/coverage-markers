'use babel';

export function InvalidLcovInfoFormatException() {
  this.message = 'does not conform to the expected format for a lcov info';
  this.toString = function () {
    return this.message;
  };
}

export function NotFoundLcovFileException() {
  this.message = 'lcov file could not be found.';
  this.toString = function () {
    return this.message;
  };
}
