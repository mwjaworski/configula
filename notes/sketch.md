```typescript
Configuration.write(`t.g.e[0].c`, {
  d: 'q',
  f: {
    c: 2
  }
})
Configuration.write(`t.g.e[0].c.d`, 'q')

Configuration.define(`t.g.e[0].*`, {
  is: 'number'
})
Configuration.define(`t.g.e[0].*`, {
  f: 'number',
  w: 'string',
  r: {
    g: 'date'
  }
})
Configuration.define(`t.g.e[0].f`, 'number')
Configuration.define(`t.g.e[0].w`, 'number')
Configuration.define(`t.g.e[0].r.g`, 'date')

Configuration.read(`t.g.e.0.c`)
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
