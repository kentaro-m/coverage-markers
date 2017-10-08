# Coverage Markers

[![CircleCI](https://img.shields.io/circleci/project/github/kentaro-m/coverage-markers.svg)]()
[![apm](https://img.shields.io/apm/v/coverage-markers.svg)](https://atom.io/packages/coverage-markers)
[![apm](https://img.shields.io/apm/dm/coverage-markers.svg)](https://atom.io/packages/coverage-markers)
[![Join the chat at https://gitter.im/coverage-markers/Lobby](https://badges.gitter.im/coverage-markers/Lobby.svg)](https://gitter.im/coverage-markers/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Coverage Markers is Atom package which displays JavaScript test coverage in gutter of editor.

## Features
![](./images/demo.png)

* Mark covered line numbers in green, uncovered line numbers in red
* Search for lcov file on project directory
* Monitor lcov file and reflect the latest test coverage in the editor
* Support for test coverage measurement tool such as istanbul and nyc

## Installation
```
$ apm install coverage-markers
```

## Usage
![](./images/usage.gif)

This package monitors lcov file (`coverage/lcov.info`) and reflects the coverage in the editor every time the file is changed. The green marker covers the test, the red one does not cover the test.

You can select the `coverage-markers:toggle` command from the atom command palette and use it, or use the application menu `Packages > Coverage Markers > Toggle Coverage`.

**Note: You need to rebuild the package before using it, since this package uses a native module.**

```
$ apm rebuild
```
or rebuild package from Incompatible Packages in the editor.

## License
MIT
