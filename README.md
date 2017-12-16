# classy-loader [![npm](https://img.shields.io/npm/v/classy-loader.svg?style=flat-square)](https://www.npmjs.com/package/classy-loader)

Classy-loader is a powerful tool for React application to manage your CSS/JS DOM elements class names.<br>
This loader connects JS and CSS class names so you can syncronize and obfuscate them.<br>
It has a smart built-in mechanism to merge your class names within JS code by using string queries.<br>
It has a very flexible organization and perfectly helps to avoid css class name conflicts within complex applications.

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
So <b>"self"</b> is a keyword that means your global or local prefix.<br>
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

If this is not false the loader will try to resolve the local prefix by itself.<br>
Works only if <b>"autoPrefixMode"</b> is set to true.<br>
By default, it has value false.<br>
There are three variants:<br>
<ol>
  <li>
    prefixAutoResolving: <big><b>"content"</b></big><br><br>
    At first the loader will try to find a line with:<br>
    <b>export default (class|function) MySuperClassName</b><br><br>
    Then try with:<br>
    <b>export default connect(...)(MySuperClassName)</b><br><br>
    Then try with:<br>
    <b>class MySuperClassName</b><br><br>
    And at last it will get the first line with:<br>
    <b>function MySuperClassName</b><br><br>
    so "MySuperClassName" will be parsed to "my" + delimiter + "super" + delimiter + "class" + delimiter + "name".  

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

will be

```javascript
export default class MySuperButton extends React.Component {
  render() {
    return (
      <div className="awesome-example-app-my-super-button">
        <span className="awesome-example-app-my-super-button-inner">
          ....
        </span>
      </div>
    )
  }
}
```
This variant only works for js files, so in your css files you still need to define local prefixes with special directives.<br>
More about js/css directives see below.


  </li>

  <li>
    prefixAutoResolving: <big><b>"file"</b></big><br>
    The loader will try to form local prefixes from js/css file names:<br>
    "SuperItem.js" or "super-item.js" or "super_item.js"
    to prefix "super" + delimiter + "item"
  </li>

  <li>
    prefixAutoResolving: <big><b>"folder"</b></big><br>
    The loader will try to form local prefixes from js/css folder names:<br>
    "SuperItem/index.js" or "super-item/some.js" or "super_item/any.js"
    to prefix "super" + delimiter + "item"
  </li>
</ol>

### obfuscation

If true the loader will obfuscate class names in both JS and CSS files.<br>
Be careful, you should check that all class names in JS defined with classy <b>"attributeName"</b> and <b>extraAttributeName</b><br>
or special <b>$classy</b> syntax (see below).<br>
By default, it has value false.<br>

```javascript
render() {
  return (
    <div class=".button small">
      ...
    </div>
  )
}
```
to

```javascript
render() {
  return (
    <div className="w4fq5wq dhet7s5">
      ...
    </div>
  )
}
```

### obfuscatedLength

Length of obfuscated class names.<br>
By default, it has value "7".<br>
So if you have <b>"obfuscatedLength"</b> equal 4

```javascript
render() {
  return (
    <div className="ald8 jd6g">
      ...
    </div>
  )
}
```

### autoPrefixMode

Loader will automatically add prefixes to your class names.<br>
So you should use different format of class name query.<br>
By default, it is false.<br><br>

For example this is a query for non-automatic mode (prefixAutoResolving set to "content")

```javascript
export default class Container extends React.Component {
  render() {
    return (
      <div class=".self wide ..area">
        <div class=".content content">
          ...
        </div>
      </div>
    )
  }
}
```
will be

```javascript
export default class Container extends React.Component {
  render() {
    return (
      <div className="awesome-example-app-container wide awesome-example-app-area">
        <div class="awesome-example-app-container-content content">
          ...
        </div>
      </div>
    )
  }
}
```

Here the local prefix is "awesome-example-app-container" (global prefix plus the local prefix auto resolved from class name "Container").<br>
So in this mode you need to add point(s) for prefixes: one for the local prefix and two points for global prefix.<br><br>

And finally an example of a query for automatic mode (prefixAutoResolving set to "content").<br>
In the end we'll get the same result.

```javascript
export default class Container extends React.Component {
  render() {
    return (
      <div class="self ..wide .area">
        <div class="content ..content">
          ...
        </div>
      </div>
    )
  }
}
```
will be the same

```javascript
export default class Container extends React.Component {
  render() {
    return (
      <div className="awesome-example-app-container wide awesome-example-app-area">
        <div class="awesome-example-app-container-content content">
          ...
        </div>
      </div>
    )
  }
}
```

In this mode you don't need to add a point for local prefix, one point for global one and two for class name without prefix.<br><br>

So in css files this principle works the same (you need to add the same points or not to add):<br><br>
None-automatic mode

```scss
/* directive that defines our local refix (adds additional prefix to global one) */
.with.addedPrefix.container;

..self {
  position: relative;

  &...area {
    background-color: #eee;
    border: 1px solid #aaa;
  }

  &.wide {
    width: 80%;
  }

  ..content {
    padding: 10px;

    &.content {
      padding-top: 0;
    }
  }
}
```

will be

```css
.awesome-example-app-container {
  position: relative;

  &.awesome-example-app-area {
    background-color: #eee;
    border: 1px solid #aaa;
  }

  &.wide {
    width: 80%;
  }

  .awesome-example-app-container-content {
    padding: 10px;

    &.content {
      padding-top: 0;
    }
  }
}
```

And the automatic mode

```scss
/* directive that defines our local refix (adds additional prefix to global one) */
.with.addedPrefix.container;

.self {
  position: relative;

  &..area {
    background-color: #eee;
    border: 1px solid #aaa;
  }

  &...wide {
    width: 80%;
  }

  .content {
    padding: 10px;

    &...content {
      padding-top: 0;
    }
  }
}
```

will give the same result

```css
.awesome-example-app-container {
  position: relative;

  &.awesome-example-app-area {
    background-color: #eee;
    border: 1px solid #aaa;
  }

  &.wide {
    width: 80%;
  }

  .awesome-example-app-container-content {
    padding: 10px;

    &.content {
      padding-top: 0;
    }
  }
}
```

## Directives

### JS directives

<ul>
  <li>
    <h3>with prefix 'some-prefix';</h3>
    Creates a local version of the global prefix that overrides defined in config.<br>
    Two points still give common global prefix.
  </li>
</ul>

  ```javascript
    // non-automatic mode
    // prefixAutoResolving: "content"
    // ...imports

    with prefix 'crazy-app';
    
    export default class Container extends React.Component {
      render() {
        return (
          <div class=".self">
            <div class=".title ..bigger">
              ...
            </div>
            <div class=".content">
              ...
            </div>
          </div>
        )
      }
    }
  ```

    will be

  ```javascript
    // ...imports
   
    export default class Container extends React.Component {
      render() {
        return (
          <div class="crazy-app-container">
            <div class="crazy-app-container-title awesome-example-app-bigger">
              ...
            </div>
            <div class="crazy-app-container-title">
              ...
            </div>
          </div>
        )
      }
    }
  ```

  the result when <b>"prefixAutoResolving"</b> set to false, so we don't have additional local prefix,<br>just overrided global

  ```javascript
    // ...imports
   
    export default class Container extends React.Component {
      render() {
        return (
          <div class="crazy-app">
            <div class="crazy-app-title awesome-example-app-bigger">
              ...
            </div>
            <div class="crazy-app-title">
              ...
            </div>
          </div>
        )
      }
    }
  ```
<ul>
  <li>
    <h3>with auto prefix 'some-prefix';</h3>
    Evertrhing the same as in the case above plus gives automatic mode within this file.
  </li>
</ul>

<ul>
  <li>
    <h3>with addedPrefix 'some-additional-prefix';</h3>
    Sets an additional prefix for local use.<br>
    This directive do the same thing like param <b>"prefixAutoResolving"</b> so it will cancel auto detecting.
  </li>
</ul>

  ```javascript
    // non-automatic mode
    // ...imports

    with addedPrefix 'dialog';
    
    export default class Dialog extends React.Component {
      render() {
        return (
          <div class=".self">
            <div class=".title ..bigger">
              ...
            </div>
            <div class=".content">
              ...
            </div>
          </div>
        )
      }
    }
  ```

    will be

  ```javascript
    // ...imports
   
    export default class Dialog extends React.Component {
      render() {
        return (
          <div class="awesome-example-app-dialog">
            <div class="awesome-example-app-dialog-title awesome-example-app-bigger">
              ...
            </div>
            <div class="awesome-example-app-dialog-content">
              ...
            </div>
          </div>
        )
      }
    }
  ```

<ul>
  <li>
    <h3>with auto addedPrefix 'some-additional-prefix';</h3>
    Evertrhing the same as in the case above plus gives automatic mode within this file.
  </li>
</ul>

<ul>
  <li>
    <h3>with auto prefix;</h3>
    Gives the automatic mode within this file.
  </li>
</ul>


### CSS directives

CSS directives do absolutly the same and look pretty much like JS versions

<ul>
  <li>
    <h3>.with.prefix.some-prefix;</h3>
  </li>
  <li>
    <h3>.with.auto.prefix.some-prefix;</h3>
  </li>
  <li>
    <h3>.with.addedPrefix.additional-prefix;</h3>
  </li>
  <li>
    <h3>.with.auto.addedPrefix.additional-prefix;</h3>
  </li>
  <li>
    <h3>.with.auto.prefix;</h3>
  </li>
</ul>
<br>

## String queries syntax

```javascript
render() {
  return (
    <div class="name .name ..name $name .$name ..$name">
      ...
    </div>
  )
}
```
### name
Gives class name without a prefixes in non-automatic mode.<br>
Gives class name with a local prefix in automatic mode.
```javascript
render() {
  return (
    <div className="name">
      ...
    </div>

    //and

    <div className="local-prefix-name">
      ...
    </div>
  )
}
```
### .name
Gives class name with a local prefix in non-automatic mode.<br>
Gives class name with a global prefix in automatic mode.
```javascript
render() {
  return (
    <div className="local-prefix-name">
      ...
    </div>

    //and

    <div className="global-prefix-name">
      ...
    </div>
  )
}
```

## License

MIT
