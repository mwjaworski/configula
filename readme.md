# rule-conf

[![Build Status](https://img.shields.io/badge/rule--conf-available-green.svg)](https://www.npmjs.com/package/rule-conf)
[![Build Status](https://travis-ci.org/mwjaworski/rule-conf.svg?branch=docs-and-testing)](https://travis-ci.org/mwjaworski/rule-conf)
[![Coverage Status](https://coveralls.io/repos/github/mwjaworski/rule-conf/badge.svg?branch=master)](https://coveralls.io/github/mwjaworski/rule-conf?branch=master)
[![npm version](https://badge.fury.io/js/rule-conf.svg)](https://badge.fury.io/js/rule-conf)
[![Changelog Status](https://changelogs.md/img/changelog-check-green.svg)](https://changelogs.md/github/mwjaworski/rule-conf/)

> A rule-typed configuration object

An application's configuration should be closely monitored for defective values or improper keys. The rule-typed configuration allows for the definition of the configuration shape with keys and types or validation functions, after which storing values in the configuration is protected against those rules.

A configuration will define it's shape and type with `define`.

```typescript
const conf = new Configuration();

// define configuration paths by key
conf
  .define('username', 'string')
  .define('author.firstname', 'string')
  .define('author.lastname', 'string');

// define configuration paths by object
conf.define('', {
  username: 'string',
  author: {
    firstname: 'string',
    lastname: 'string'
  }
});
```

Once the configuration shape-type is defined we can star to store values and check success.

```typescript
// ...continues from code above; we have defined username and author

// write configuration with paths
conf
  .write('username', 'mwjaworski')
  .write('author.firstname', 'Michael');

// write configuration with an object
conf.write('', {
  username: 'mwjaworski',
  author: {
    firstname: 'Michael'
  }
});
```

Writes may fail if the path does not match a pre-defined path/type. There are two ways to detect failure.

```typescript
const conf = new Configuration();

// === false
const didSucceed = conf
  .write('does_not_exist', 'value')
  .isOk();

// === Promise<string[]>
conf
  .write('does_not_exist', 'value')
  .issues()
    .then(() => {
      // if there are no issues
    })
    .catch((issues: string[]) => {
      // a list of every issue since the last call to `issues`
    });
```

You can read information from the configuration. The value `undefined` always means that there is no value, or you can use `has`. The `write` method will not accept `undefined` as a value and will result in an issue being registered.

```typescript
const conf = new Configuration();

// `read` returns the value because it is not `undefined` and matches the type
conf
  .define('A', 'string')
  .write('A', 'V1')
  .read('A') === 'V1';

// the `write` fails because `undefined` is not accepted
conf
  .define('B', 'string')
  .write('B', undefined)
  .read('B') === undefined;

// the type does not match, so the `write` fails
conf
  .define('C', 'string')
  .write('C', 123)
  .read('C') === undefined;
```

It may be necessary to define more complex rules than type matching. You can deliver custom type matching functions in the `define` call.

```typescript
import { Configuration } from 'rule-conf';

const isType: Is = require('is_js');
const conf = new Configuration();

// `read` returns the value because it is not `undefined` and matches the type
conf.define('pill', (pill: any, isType: Is, configuration: Configuration) => {
  return isType.string(pill) && (pill === 'red' || pill === 'blue');
});

// `green` is not a permissible pill color, so not assignment takes place
conf
  .write('pill', 'green')
  .read('pill') === undefined;

// `red` is a permissible pill color, so an assignment takes place
conf
  .write('pill', 'red')
  .read('pill') === 'red';
```

## License

MIT. Copyright (c) 2017-10-11 [Michael Jaworski](https://github.com/mwjaworski).
rule-conf is an [OPEN Open Source Project](http://openopensource.org/).
