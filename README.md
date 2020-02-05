# versionly

[![Current Version](https://img.shields.io/npm/v/versionly.svg)](https://www.npmjs.org/package/versionly)
[![Build Status via Travis CI](https://travis-ci.org/cjihrig/versionly.svg?branch=master)](https://travis-ci.org/cjihrig/versionly)
![Dependencies](http://img.shields.io/david/cjihrig/versionly.svg)
[![belly-button-style](https://img.shields.io/badge/eslint-bellybutton-4B32C3.svg)](https://github.com/cjihrig/belly-button)

Easily generate version information for Node.js applications. `versionly`
generates a JSON string or JavaScript object containing version information,
which is useful for analyzing production deployments. `versionly` outputs
information such as `package.json` version, git commit hash, select environment
variables, and more.

## Usage

`versionly` can be used within a larger Node.js application, or standalone as
a command line utility, as shown below.

```bash
npx versionly -p version -g gitcommit -e user:USER -d date:now -a foo:bar
```

If run in a directory containing a `package.json` file and git history, the
command will output JSON similar to the following:

```json
{
  "version": "0.1.15",
  "gitcommit": "8e13cc2f0afa61b1bb0101de048dea407834adfa",
  "user": "cjihrig",
  "date": "1580910189983",
  "foo": "bar"
}
```

The same information can be generated programmatically:

```js
'use strict';
const { generate } = require('versionly');

console.log(JSON.stringify(generate(
  [
    '-p', 'version',
    '-g', 'gitcommit',
    '-e', 'user:USER',
    '-d', 'date:now',
    '-a', 'foo:bar'
  ]
)));
```

## API

Both the CLI and JavaScript API operate on an array of argument pairs. The first
entry in each pair denotes the type of information to generate (git hash, date,
environment variable, etc.). The second entry in each pair denotes the key name
in the object/JSON output, followed by any necessary parameters:

### `-a key:value`

The `-a` option indicates a user-supplied annotation. For example, `-a foo:bar`
adds a `foo` key to the output whose value is `'bar'`.

### `-d key[:format]`

The `-d` option adds the current date to the output. If `format` is specified,
it denotes the string representation of the date. Supported formats are:

- `now` - Outputs the date's `valueOf()` as a string. This is the default.
- `iso` - Outputs the date's `toISOString()` string.
- `locale` - Outputs the date's `toLocaleString()` string.
- `localedate` - Outputs the date's `toLocaleDateString()` string.
- `localetime` - Outputs the date's `toLocaleTimeString()` string.
- `time` - Outputs the date's `toTimeString()` string.
- `utc` - Outputs the date's `toUTCString()` string.

If an unrecognized date format is provided, an exception is thrown.

For example, `-d date:utc` adds a `date` key to the output whose value is the
UTC representation of the current date.

### `-e key:envvar`

The `-e` option includes the environment variable `envvar` in the output. If the
specified environment variable does not exist, an exception is thrown.

For example, `-e user:USER` adds a `user` key to the output whose value is the
content of the `USER` environment variable.

### `-g key`

The `-g` option includes the hash of the most recent git commit. The hash is
computed by running `git rev-parse HEAD`. If the git commit cannot be obtained,
an exception is thrown. For example, `-g gitcommit` adds a `gitcommit` key to
the output whose value is the most recent git commit hash.

### `-p key[:package]`

The `-p` option includes the `version` field from the specified `package` file.
If present, `package` must be the path to a valid `package.json` file. If
`package` is not provided, it defaults to searching for a `package.json` file in
the current working directory. If a package cannot be loaded, an exception is
thrown. For example, `-p version` adds a `version` key to the output whose value
comes from the `package.json` file in the current directory.
