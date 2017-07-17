# Coverage Markers

[![CircleCI](https://img.shields.io/circleci/project/github/kentaro-m/coverage-markers.svg)]()
[![apm](https://img.shields.io/apm/v/coverage-markers.svg)](https://atom.io/packages/coverage-markers)
[![apm](https://img.shields.io/apm/dm/coverage-markers.svg)](https://atom.io/packages/coverage-markers)
[![Join the chat at https://gitter.im/coverage-markers/Lobby](https://badges.gitter.im/coverage-markers/Lobby.svg)](https://gitter.im/coverage-markers/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Coverage Markers is Atom package which displays JavaScript code coverage in gutter of editor.

## Features
![](./screenshots/coverage_markers001.png)

* Mark covered lines in green, uncovered lines in red.
* Search for lcov file on project directory
* Monitor lcov file and reflect the latest coverage in the editor
* Supports combination of Mocha and Istanbul

## Usage
![](./screenshots/coverage_markers002.gif)

This package monitors lcov file and reflects the coverage in the editor every time the file is changed. The green line covers the test, the red one does not cover the test.

To display the coverage in the editor, use the application menu `Packages > Coverage Markers > Show Coverage`. Also, to hide the coverage in the editor, use the application menu `Packages > Coverage Markers > Hide Coverage`

## Todo
* Switch coverage display style with line number highlight and line highlight
* Cache lcov file
