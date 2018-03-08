import { TSType } from './../src/ts_type';
import { Configula } from '../src/index';
import test from 'ava';

export class ConfigulaTest extends Configula {
  getPath(root: any, steps: string[]) {
    return this._getPath(root, steps);
  }
  createPath(root: any, steps: string[]) {
    return this._createPath(root, steps);
  }
  get type() {
    return this._type;
  }
  get conf() {
    return this._conf;
  }
}

test('Create Path', function (t: any) {
  const c = new ConfigulaTest();

  t.plan(6);

  c.clear();
  const r1 = {} as any;
  const t1 = c.createPath(r1, [`a`, `b`, `c`]);
  t.is(r1.a.b.c, t1, `b is an object`);

  c.clear();
  const r2 = {} as any;
  const t2 = c.createPath(r2, [`a`]);
  t.is(r2.a, t2, `a is an object`);

  c.clear();
  const r3 = {} as any;
  const t3 = c.createPath(r3, []);
  t.is(r3, t3, `no paths returns the object`);

  c.clear();
  const r4 = {} as any;
  const t4 = c.createPath(r4, ['a', 'e!', '2']);
  t.is(r4.a.e.length, 3, `index 2 of an array created undefined for 0 and 1`);
  t.is(r4.a.e[1], undefined, `index 1 is undefined`);
  t.is(r4.a.e[2], t4, `index 2 was set to {} from the path`);

});

test('Get Path', function (t: any) {
  const c = new ConfigulaTest();

  t.plan(8);

  c.clear();
  const r1 = {} as any;
  const t1 = c.createPath(r1, [`a`, `b`, `c`]);
  const _t1 = c.getPath(r1, [`a`, `b`, `c`]);
  t.is(r1.a.b.c, t1, `t1; create path returns the child object`);
  t.is(r1.a.b.c, _t1, `_t1; get path matches the child object`);

  c.clear();
  const r2 = {} as any;
  const t2 = c.createPath(r2, [`a`, `b`, `c`]);
  const _t2 = c.getPath(r2, [`a`, `b`]);
  t.is(r2.a.b.c, t2, `t2; create path returns the child object`);
  t.is(r2.a.b, _t2, `_t2; get path matches the b intermediate object`);

  c.clear();
  const r3 = {} as any;
  const t3 = c.createPath(r3, [`a`, `b`]);
  const _t3 = c.getPath(r3, [`a`, `b`, `c`]);
  t.is(r3.a.b, t3, `t3; create path returns the child object`);
  t.is(undefined, _t3, `_t3; does not return a path because it does not exist`);

  c.clear();
  const r4 = {} as any;
  const t4 = c.createPath(r4, [`a`, `b!`, `1`]);
  const _t4 = c.getPath(r4, [`a`, `b!`, `1`]);
  t.is(r4.a.b[1], t4, `t4; matches an object at index 1`);
  t.is(r4.a.b[1], _t4, `_t4; matches an object at index 1`);

});

test('Define Path & Type', function (t: any) {
  const c = new ConfigulaTest();

  t.plan(3);

  c.clear();
  c.define(`a.b.c.d`, 'number');
  t.is(c.type.a.b.c.d, 'number', `number type assigned`);

  c.clear();
  c.define(`a.b.c[2].d`, 'number');
  t.is(c.type.a.b.c[0].d, 'number', `number at an index`);

  c.clear();
  c.define(`a.b.c[*].d`, 'number');
  t.is(c.type.a.b.c[0].d, 'number', `number at an index`);

});

test('Write Single Path Value', function (t: any) {
  const c = new ConfigulaTest();

  t.plan(5);

  c.clear();
  c.define(`a.b.c.d`, 'number');
  c.write(`a.b.c.d`, 2);
  t.is(c.conf.a.b.c.d, 2, `assign a number in embedded objects`);

  c.clear();
  c.define(`a`, 'number');
  c.write(`a`, 2);
  t.is(c.conf.a, 2, `assign a number to one key`);

  c.clear();
  c.define(``, 'number');
  c.write(``, 2);
  t.is(c.conf[''], 2, `assign a number to the base object`);

  c.clear();
  c.define(`a.b.c[*].d`, 'number');
  c.write(`a.b.c[1].d`, 2);
  c.write(`a.b.c[4].d`, 2);
  t.is(c.conf.a.b.c[1].d, 2, `assign a number in an array index(1)`);
  t.is(c.conf.a.b.c[4].d, 2, `assign a number in an array index(4)`);

});

test.cb('Read Single Path Value', function (t: any) {
  const c = new ConfigulaTest();

  t.plan(5);

  c.clear();
  c.define(`a.b.c.d`, 'number');
  c.write(`a.b.c.d`, 2);
  t.is(c.read(`a.b.c.d`), 2, `read a number in embedded objects`);

  c.clear();
  c.define(`a`, 'number');
  c.write(`a`, 2);
  t.is(c.read('a'), 2, `read a number to one key`);

  c.clear();
  c.define(``, 'number');
  c.write(``, 2);
  t.is(c.read(''), 2, `read a number to the base object`);

  c.clear();
  c.define(`a.b.c[*].d`, 'number');
  c.write(`a.b.c[1].d`, 2);
  c.write(`a.b.c[4].d`, 2);
  t.is(c.read('a.b.c[1].d'), 2, `read a number in an array index(1)`);
  t.is(c.read('a.b.c[4].d'), 2, `read a number in an array index(4)`);

  t.end();
});

test('Read All', function (t: any) {
  const c = new ConfigulaTest();
  const o = new Date();

  t.plan(11);

  c.clear();
  c.define(`a.b.c.d`, 'number');
  c.define(`a.e`, 'date');

  c.write(`a.b.c.d`, 2);
  c.write(`a.e`, o);

  t.is(c.isOk(), true, 'both writes succeeded');

  t.is(c.read('a.b.c.d'), 2, `Read to a value`);
  t.is(c.read(`a.b`).c.d, 2, `Read to an internal node`);
  t.is(c.read().a.b.c.d, 2, `Read the entire object`);

  t.is(c.clone('a.b.c.d'), 2, `Read to a value`);
  t.is(c.clone(`a.b`).c.d, 2, `Read to an internal node`);
  t.is(c.clone().a.b.c.d, 2, `Read the entire object`);


  t.is(c.read('a.e'), o, `1`);
  t.deepEqual(c.read('a.e'), o, `2`);
  t.not(c.clone(`a.e`), o, `3`);
  t.deepEqual(c.clone('a.e'), JSON.parse(JSON.stringify(o)), `4`);

});

test.cb('Define Type Objects', function (t: any) {
  const c = new ConfigulaTest();

  t.plan(8);

  c.clear();
  c.define(`a`, {
    b: {
      c: {
        d: 'number'
      }
    }
  });
  t.is(c.type.a.b.c.d, 'number', `object traversal for define`);

  c.clear();
  c.define(`a`, {
    b: {
      c: [{
        d: 'number'
      }]
    }
  });
  t.is(c.type.a.b.c[0].d, 'number', `array traversal for define`);

  c.clear();
  c.define(`a`, {
    b: {
      c: {
        d: 'number'
      },
      e: {
        q: {
          a: 'string',
          b: 'string'
        }
      }
    }
  });
  t.is(c.type.a.b.c.d, 'number', `nested define to d`);
  t.is(c.type.a.b.e.q.a, 'string', `nested define to q.a`);
  t.is(c.type.a.b.e.q.b, 'string', `nested define to q.b`);

  c.clear();
  c.define('', {
    username: 'string',
    author: {
      firstname: 'string',
      lastname: 'string'
    }
  });
  t.is(c.type.username, 'string', `an empty path is the root`);
  t.is(c.type.author.firstname, 'string', `author defines nesting (firstname)`);
  t.is(c.type.author.lastname, 'string', `author defines nesting (lastname)`);

  t.end();
});

test.cb('Write Type Objects', function (t: any) {
  const c = new ConfigulaTest();

  t.plan(7);

  c.clear();
  c.define(`a`, {
    b: {
      c: {
        d: 'number'
      }
    }
  });
  c.write(`a`, {
    b: {
      c: {
        d: 1
      }
    }
  });
  t.is(c.conf.a.b.c.d, 1, `object traversal for write`);

  c.clear();
  c.define(`a`, {
    b: {
      c: [{
        d: 'number'
      }]
    }
  });
  c.write(`a`, {
    b: {
      c: [{
        d: 1
      }, {
        d: 2
      }, {
        d: 3
      }]
    }
  });
  t.is(c.conf.a.b.c[0].d, 1, `array traversal on array 0 for write`);
  t.is(c.conf.a.b.c[1].d, 2, `array traversal on array 1 for write`);
  t.is(c.conf.a.b.c[2].d, 3, `array traversal on array 2 for write`);

  c.clear();
  c.define(`a`, {
    b: {
      c: {
        d: 'number'
      },
      e: {
        q: {
          a: 'string',
          b: 'string'
        }
      }
    }
  });
  c.write(`a`, {
    b: {
      c: {
        d: 1
      },
      e: {
        q: {
          a: 'A',
          b: 'B'
        }
      }
    }
  });
  t.is(c.conf.a.b.c.d, 1, `nested write to d of 1`);
  t.is(c.conf.a.b.e.q.a, 'A', `nested write to q.a of A`);
  t.is(c.conf.a.b.e.q.b, 'B', `nested write to q.b of B`);

  t.end();
});

test.cb('Write/Read Report Errors (1)', function (t: any) {
  const c = new ConfigulaTest();

  t.plan(1);

  c.clear();
  c.define('a.b.c', 'number');

  c.write('a.b.c', 1);
  t.is(c.conf.a.b.c, 1, `...`);

  t.end();

});

test('Write/Read Report Errors (2)', function (t: any) {
  const c = new ConfigulaTest();

  t.plan(1);

  c.clear();
  c.define('a.b.c', 'number');

  return new Promise((resolve) => {
    c.write('a.b', 1).issues().catch((issues) => {
      t.is(issues[0], 'a.b matches an invalid type at {"c":"number"}.', 'error because too short');
      resolve();
    });
  });

});


test('Write/Read Report Errors (3)', function (t: any) {
  const c = new ConfigulaTest();

  t.plan(1);

  c.clear();
  c.define('a.b.c', 'number');

  return new Promise((resolve) => {
    return c.write('a.b.c.d', 1).issues().catch((issues) => {
      t.is(issues[0], 'a.b.c.d is invalid at "d".', 'error because too long');
      resolve();
    });
  });

});

test('Custom Type', function (t: any) {
  const c = new ConfigulaTest();

  t.plan(2);

  c.clear();
  c.define(`a.b`, (v: number, tst: TSType, _c: ConfigulaTest) => {
    return tst.number(v) && v > 8;
  });

  return new Promise((resolve) => {
    c.write(`a.b`, 2).issues().catch(() => {
      t.is(c.conf.a, undefined, `assignment does not meet custom requirements`);

      c.write(`a.b`, 12).issues().then(() => {
        t.is(c.conf.a.b, 12, `assignment meets requirements: number and > 8`)
        resolve();
      });
    });
  });

});
