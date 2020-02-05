'use strict';
const Assert = require('assert');
const ChildProcess = require('child_process');
const Path = require('path');
const Lab = require('@hapi/lab');
const { generate } = require('../lib');
const { describe, it } = exports.lab = Lab.script();
const fixturesDir = Path.join(__dirname, 'fixtures');

describe('Versionly', () => {
  it('adds annotations with -a', () => {
    const result = generate(['-a', 'foo:bar']);

    Assert.deepStrictEqual(result, { foo: 'bar' });
  });

  it('adds environment variables with -e', () => {
    process.env.TEST_FOO = process.env.TEST_FOO || 'test_foo';
    const result = generate(['-e', 'foo:TEST_FOO']);

    Assert.deepStrictEqual(result, { foo: 'test_foo' });
  });

  it('tries to parse git history with -g', () => {
    let result;

    // The environment running this test may not have git installed.
    try {
      result = generate(['-g', 'gitcommit']);
    } catch (err) {
      return;
    }

    Assert.strictEqual(typeof result.gitcommit, 'string');
    Assert(result.gitcommit.length > 1);
  });

  it('adds dates in various formats with -d', () => {
    const result = generate([
      '-d', 'a',
      '-d', 'b:',
      '-d', 'c:now',
      '-d', 'd:iso',
      '-d', 'e:locale',
      '-d', 'f:localedate',
      '-d', 'g:localetime',
      '-d', 'h:time',
      '-d', 'i:utc'
    ]);

    Assert.strictEqual(result.a, String(new Date().setTime(result.a).valueOf()));
    Assert.strictEqual(result.b, String(new Date().setTime(result.b).valueOf()));
    Assert.strictEqual(result.c, String(new Date().setTime(result.c).valueOf()));
    // Skip verifying the locale and time formats for now.
    Assert.strictEqual(result.d, new Date(result.d).toISOString());
    Assert.strictEqual(result.i, new Date(result.i).toUTCString());
  });

  it('adds package version number with -p', () => {
    const result = generate([
      '-p', `good:${Path.join(fixturesDir, 'package-good.json')}`,
      '-p', `noversion:${Path.join(fixturesDir, 'package-no-version.json')}`,
      '-p', 'default'
    ]);

    Assert.deepStrictEqual(result, {
      good: '1.2.3',
      noversion: null,
      default: require(Path.resolve('package.json')).version
    });
  });

  it('throws if provided date format is not supported', () => {
    Assert.throws(() => {
      generate(['-d', 'foo:foo']);
    }, /^Error: Unexpected date format: 'foo'$/);
  });

  it('throws if provided environment variable does not exist', () => {
    let envVar = 'zzz_THIS_SHOULD_NOT_EXIST_zzz';

    while (process.env[envVar]) {
      envVar += 'xyz';
    }

    Assert.throws(() => {
      generate(['-e', `foo:${envVar}`]);
    }, /^Error: Unknown environment variable: '.+'$/);
  });

  it('throws if git history cannot be parsed', () => {
    const originalExecSync = ChildProcess.execSync;
    let correctCmd = false;

    ChildProcess.execSync = function mock (command) {
      ChildProcess.execSync = originalExecSync;
      correctCmd = command === 'git rev-parse HEAD';
    };

    Assert.throws(() => {
      generate(['-g', 'gitcommit']);
    }, /^Error: Cannot parse git history$/);
    Assert.strictEqual(correctCmd, true);
  });

  it('throws if entry has no key part', () => {
    Assert.throws(() => {
      generate(['-p', ':foo']);
    }, /^Error: Invalid entry: ':foo'$/);
  });

  it('throws if duplicate keys are provided', () => {
    Assert.throws(() => {
      generate(['-a', 'foo:bar', '-a', 'foo:baz']);
    }, /^Error: Duplicate entry: 'foo'$/);
  });

  it('throws if a package cannot be loaded', () => {
    Assert.throws(() => {
      generate(['-p', 'foo:blah']);
    }, /^Error: Cannot load package from: '.+blah'$/);
  });

  it('throws if an unexpected input type is provided', () => {
    Assert.throws(() => {
      generate(['-9', 'version']);
    }, /^Error: Unexpected input: '-9 version'$/);
  });

  it('throws if input is not an array', () => {
    [undefined, null, 5, NaN, '', 'foo', Symbol('a'), {}].forEach((value) => {
      Assert.throws(() => {
        generate(value);
      }, /^TypeError: options must be an array$/);
    });
  });
});
