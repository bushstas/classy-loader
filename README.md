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
    delimiter: '-',
    obfuscation: false,
    obfuscatedLength: 4,
    addSuffixToAllNames: false,
    addSuffixToSimpleNames: false,
    autoPrefixMode: false,
    prefixAutoResolving: false
});


//...
module: {
  rules: [
    {
      test: /\.js$/, 
      loaders: [
        {
            loader: 'babel-loader',
            options: {
               //....
            }
        },
        {
            loader: 'classy-loader?parser=js'
        }
      ]
    },
    {
      test: /\.s?css$/,
      loader: ExtractTextPlugin.extract(
          {
              fallback: 'style-loader',
              use: [
                  'css-loader?root=...',
                  'sass-loader',
                  'classy-loader?parser=css'
              ]
          }
      )
    }
  ]
}
//...
```
So it should be added after babel and standart css loaders to be processed first.

### attributeName

An attribute name of DOM elements, that will be parsed by loader.<br>
It can be whatever word you like and will be changed to className attribute.<br>
By default, it has value "class".

```javascript
render() {
  return (
    <div class=".self">
      ...
    </div>
  )
}
```

or

```javascript
render() {
  return (
    <div whateverName=".self">
      ...
    </div>
  )
}
```
So "class" and "whateverName" are our attributeNames.<br>
And after processing we'll get parsed value:

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

### extraAttributeName

An attribute name of React elements, that will be parsed by loader.<br>
This also can be used like variable names or object keys.<br>
And be whatever word you like but not will be changed.<br>
By default, it has value "classes".

```javascript
render() {
  return (
    <Button classes=".action-button awesome-button">
      Do it!
    </Button>
  )
}

let classes = ".some-class";

let object = {
  classes: ".some-other-class"
};
```

And after processing we'll get the same attribute "classes" but parsed:

```javascript
render() {
  return (
    <Button classes="awesome-example-app-action-button awesome-button">
      Do it!
    </Button>
  )
}

let classes = "awesome-example-app-some-class";

let object = {
  classes: "awesome-example-app-some-other-class"
};

```
### globalPrefix

A prefix that will be added to your element class names.<br>
Special syntax will tell the loader whether add prefixes or not.<br>
By default, it has an empty value, so it means no prefix will be added if a local prefix not specified.

```javascript
render() {
  return (
    <div class=".thing">
      ...
    </div>
  )
}
```

will be

```javascript
render() {
  return (
    <div className="awesome-example-app-thing">
      ...
    </div>
  )
}
```
The point means class name should have a prefix.<br>
More about parser syntax is written below.

### delimiter

A symbol or word that class names and prefixes will be joined with.<br>
By default, it has value "-".

```javascript
render() {
  return (
    <div class=".some-item">
      ...
    </div>
  )
}
```

So if we have our delimiter like "\_", we will have

```javascript
render() {
  return (
    <div className="awesome-example-app_some-item">
      ...
    </div>
  )
}
```

### prefixAutoResolving

If this is not false the parser will try to resolve the local prefix by itself.<br>
There are three variants:<br>
<ol>
  <li>
    <b>content</b><br>

  </li>
<ol>
By default, it has value false.

```javascript
export default class MySuperButton extends React.Component {
  render() {
    return (
      <div class=".self">
        <span class=".inner">
          ....
        </span>
      </div>
    )
  }
}
```

So if we have our delimiter like "\__", we will have

```javascript
export default class MySuperButton extends React.Component {
  render() {
    return (
      <div className="awesome-example-app-my__super__button">
        <span className="awesome-example-app-my-super-button-inner">
          ....
        </span>
      </div>
    )
  }
}
```

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
