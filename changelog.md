# Configula

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
