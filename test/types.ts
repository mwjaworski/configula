import { Configuration } from '../src/main';
import test from 'ava';

export class ConfigurationTest extends Configuration {
  getPath(root: any, steps: string[]) {
    return this._getPath(root, steps);
  }
  createPath(root: any, steps: string[]) {
    return this._createPath(root, steps);
  }
  get type() {
    return this._type;
  }
}

test.cb('Create Path', function (t: any): void {
  const c = new ConfigurationTest();

  t.plan(6);

  c.initialize();
  const r1 = {} as any;
  const t1 = c.createPath(r1, [`a`, `b`, `c`]);
  t.is(r1.a.b.c, t1, `b is an object`);

  c.initialize();
  const r2 = {} as any;
  const t2 = c.createPath(r2, [`a`]);
  t.is(r2.a, t2, `a is an object`);

  c.initialize();
  const r3 = {} as any;
  const t3 = c.createPath(r3, []);
  t.is(r3, t3, `no paths returns the object`);

  c.initialize();
  const r4 = {} as any;
  const t4 = c.createPath(r4, ['a', 'e!', '2'])
  t.is(r4.a.e.length, 3, `index 2 of an array created undefined for 0 and 1`);
  t.is(r4.a.e[1], undefined, `index 1 is undefined`);
  t.is(r4.a.e[2], t4, `index 2 was set to {} from the path`);

  t.end();
});

test.cb('Get Path', function (t: any): void {
  const c = new ConfigurationTest();

  t.plan(8);

  c.initialize();
  const r1 = {} as any;
  const t1 = c.createPath(r1, [`a`, `b`, `c`]);
  const _t1 = c.getPath(r1, [`a`, `b`, `c`]);
  t.is(r1.a.b.c, t1, `t1; create path returns the child object`);
  t.is(r1.a.b.c, _t1, `_t1; get path matches the child object`);

  c.initialize();
  const r2 = {} as any;
  const t2 = c.createPath(r2, [`a`, `b`, `c`]);
  const _t2 = c.getPath(r2, [`a`, `b`]);
  t.is(r2.a.b.c, t2, `t2; create path returns the child object`);
  t.is(r2.a.b, _t2, `_t2; get path matches the b intermediate object`);

  c.initialize();
  const r3 = {} as any;
  const t3 = c.createPath(r3, [`a`, `b`]);
  const _t3 = c.getPath(r3, [`a`, `b`, `c`]);
  t.is(r3.a.b, t3, `t3; create path returns the child object`);
  t.is(undefined, _t3, `_t3; does not return a path because it does not exist`);

  c.initialize();
  const r4 = {} as any;
  const t4 = c.createPath(r4, [`a`, `b!`, `1`]);
  const _t4 = c.getPath(r4, [`a`, `b!`, `1`]);
  t.is(r4.a.b[1], t4, `t4; matches an object at index 1`);
  t.is(r4.a.b[1], _t4, `_t4; matches an object at index 1`);

  t.end();
});

test.cb('Define Path & Type', function (t: any): void {
  const c = new ConfigurationTest();

  t.plan(3);

  c.initialize();
  c.define(`a.b.c.d`, 'number');
  t.is(c.type.a.b.c.d, 'number', `number type assigned`);

  c.initialize();
  c.define(`a.b.c[2].d`, 'number');
  t.is(c.type.a.b.c[0].d, 'number', `number at an index`);

  c.initialize();
  c.define(`a.b.c[*].d`, 'number');
  t.is(c.type.a.b.c[0].d, 'number', `number at an index`);

  t.end();
});
