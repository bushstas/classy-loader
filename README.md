# classy-loader [![npm](https://img.shields.io/npm/v/classy-loader.svg?style=flat-square)](https://www.npmjs.com/package/classy-loader)

Classy-loader is a powerful tool to manage your CSS/JS DOM elements class names


## Installation

### NPM

```sh
npm install --save classy-loader
```

## Adding to Webpack config

### At first you need to set required config.

```javascript
const classy = require('classy-loader');
classy.init({
    attributeName: 'class',
    extraAttributeName: 'classes',
    globalPrefix: 'awesome-example-app',
    obfuscation: false,
    obfuscatedLength: 4,
    addSuffixToAllNames: false,
    addSuffixToSimpleNames: false,
    autoPrefixMode: false,
    prefixAutoResolving: false
});
```
### attributeName

An attribute of DOM elements, that will be parsed by loader.<br>
It can be whatever word you like and will be changed to className attribute.

```javascript
render() {
  return (
    <div class="self">
      ...
    </div>
  )
}
```

or

```javascript
render() {
  return (
    <div whateverName="self">
      ...
    </div>
  )
}
```

after parsing

```javascript
render() {
  return (
    <div className="awesome-example-app">
      ...
    </div>
  )
}
```
So "self" is a keyword that means your global or local prefix.<br>
In this case we don't have a local prefix, so it will be our globalPrefix from the config we set up above.

## Usage

A simple example of usage

```javascript
import React from 'react'

export default class App extends React.Component {
  render() {
    return (
      <div class="self">
        <h1 class="title">
          Classy Loader is awesome
        </h1>
      </div>
    )
  }
}
```


## License

MIT
