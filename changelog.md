# configula

## 0.2.0

- ADDED documentation in readme.md
- ADDED `isOk` to detect if there were errors during `write`
- REFACTORED `write` and `defined` return `this` for chaining; use `issues` to get a `Promise` of errors or success
- FIXED badges
- FIXED shadowed-variable in tests
- FIXED prepublish in npm so we collect all four bin/ files
- FIXED do not allow `write` to accept `undefined` as a value; that is the value to `read` as _no-value_

## 0.1.0

- Initial Release
