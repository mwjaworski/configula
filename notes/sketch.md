```typescript
Configula.write(`t.g.e[0].c`, {
  d: 'q',
  f: {
    c: 2
  }
})
Configula.write(`t.g.e[0].c.d`, 'q')

Configula.define(`t.g.e[0].*`, {
  is: 'number'
})
Configula.define(`t.g.e[0].*`, {
  f: 'number',
  w: 'string',
  r: {
    g: 'date'
  }
})
Configula.define(`t.g.e[0].f`, 'number')
Configula.define(`t.g.e[0].w`, 'number')
Configula.define(`t.g.e[0].r.g`, 'date')

Configula.read(`t.g.e.0.c`)
```

```typescript
const a = {
  property: "",
  t: {
    g: {
      e: {
        c: 1
      },
      q: [
        1,
        2,
        3
      ]
    }
  }
}
```


READ
'a[1]' get we look for a[1] and then a['__']
'a[*]'

DEFINE
a.b[*].d
a.b[1].d

WRITE
a.b[1].d = 'a'

READ
a.b[4].d = 'a'
