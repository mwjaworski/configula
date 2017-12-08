# Configula

## 0.3.0

- ADDED `Of` for type-checking to replace is_js
- ADDED `Configula(type_checker?)` ability to replace default `Of` type-checking
- ADDED support for constant-literal or regular expression in type check
- REMOVED is_js as a dependency

## 0.2.4

- FIXED the import of is.js so that we know the type as `'is_js'`. The type requirements are local now, but will be included in TypeDefinitions soon

> Do not use bin/ because a commonjs build tool is needed to get the require out

## 0.2.3

- ADDED `IConfigula` so projects can interact with Configula but not include the source

## 0.2.2

- FIXED build status icon

## 0.2.1

- FIXED npm configuration, this does not `preferGlobal` it is for a project

## 0.2.0

- ADDED `read()` to read the entire configuration
- ADDED `clone()` like read but returns a clone and not the internal configuration object
- ADDED an error for storing objects directly
- FIXED `isOk()` :| yes, it needed fixing
- FIXED `write()` storing complex data types

## 0.1.2

- FIXED excluding configuration files from npm deploys

## 0.1.1

- FIXED include bin/ folder in npm package

## 0.1.0

- Initial Release
