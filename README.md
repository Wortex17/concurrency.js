# concurrency.js

![Test suite](https://github.com/Wortex17/concurrency.js/workflows/Test%20suite/badge.svg)
[![Build Status](https://travis-ci.org/jWortex17/concurrency.js.svg?branch=master)](https://travis-ci.org/jankapunkt/npm-package-template)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Project Status: Concept – Minimal or no implementation has been done yet, or the repository is only intended to be a limited example, demo, or proof-of-concept.](https://www.repostatus.org/badges/latest/concept.svg)](https://www.repostatus.org/#concept)
![GitHub](https://img.shields.io/github/license/Wortex17/concurrency.js)

Classes and Functions for concurrent programming in ES6+ Javascript.

## Getting started

//TODO

## Development

### Which tools are used?

All tools are only defined as **`dev-dependencies`**:

* [Babel](https://babeljs.io/) for transpiling ES6+ to ES5 plus minification, sourcemaps etc.
* [Mocha](https://mochajs.org/) and [Chai](https://www.chaijs.com) for testing
* [Istanbul](https://istanbul.js.org/) for code coverage
* [Standard](https://standardjs.com/) for linting
* [JSDoc](https://jsdoc.app/) for documentation and [jsdoc-to-markdown](https://www.npmjs.com/package/jsdoc-to-markdown) to create docs as markdown files
* [Travis-CI](https://travis-ci.org/) for continuous integration
* [GitHub actions](https://github.com/features/actions) for continuous integration


### Code Quality

We use `standard` as opinionated but zero-config linter.
You can run lint in two modes:

##### lint 
 
```bash
$ npm run lint
``` 

##### lint with auto fixing

```bash
$ npm run lint:fix
``` 

## Run the tests

We use mocha and chai with a mostly (but not strict) behavioural style for testing.
You can run the tests in three different contexts:

##### Single run

```bash
$ npm run test
``` 

##### Watch mode

```bash
$ npm run test:watch
``` 

##### Coverage

```bash
$ npm run test:coverage
``` 

## Documentation

Documentation is using jsDoc and is available as [html](docs/index.html) or [markdown](api.md) version.

To build the documentation in development, you need to run 

```bash
$ npm run docs
``` 

## License

MIT, see [license file](LICENSE)
