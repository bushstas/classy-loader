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
So **"self"** is a keyword that means your global or local prefix.<br>
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
Works only if **"autoPrefixMode"** is set to true.<br>
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
    so "MySuperClassName" will be parsed to "my" + delimiter + "super" + delimiter + "class" + delimiter + "name".<br><br>
    For CSS files the loder will search for JS index file (js, jsx, ts) in the same directory<br> and then get local prefix from the file,
    so JS and CSS will be syncronized

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
    to prefix "super" + delimiter + "item"<br>
    so you'll have to syncronize JS and CSS file names
  </li>

  <li>
    prefixAutoResolving: <big><b>"folder"</b></big><br>
    The loader will try to form local prefixes from js/css folder names:<br>
    "SuperItem/index.js" or "super-item/some.js" or "super_item/any.js"
    to prefix "super" + delimiter + "item"<br>
    so JS and CSS will be syncronized as they are both located in the same directory (aren't they?)
  </li>
</ol>

### obfuscation

If true the loader will obfuscate class names in both JS and CSS files.<br>
Be careful, you should check that all class names in JS defined with classy **"attributeName"** and **extraAttributeName**<br>
or special **$classy** syntax (see below).<br>
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
So if you have **"obfuscatedLength"** equal 4

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
/* directive that defines our local prefix (adds additional prefix to global one) */
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
/* directive that defines our local prefix (adds additional prefix to global one) */
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

  the result when **"prefixAutoResolving"** set to false, so we don't have additional local prefix,<br>just overrided global

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
    <div class="name .name ..name $name prefix::name .$name ..$name">
      ...
    </div>
  )
}
```
### name
Gives class name without prefixes in non-automatic mode.<br>
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
### ..name
Gives class name with a global prefix in non-automatic mode.<br>
Gives class name without prefixes in automatic mode.
```javascript
render() {
  return (
    <div className="global-prefix-name">
      ...
    </div>

    //and

    <div className="name">
      ...
    </div>
  )
}
```

### $name
Merge a class name or an array of class names from a variable.<br>
The loader automatically adds import of required module for class merging.<br>
The variable should already contain classes with prefixes or be already obfuscated.
```javascript
render() {
  return (
    <div className={classy(name)}>
      ...
    </div>
  )
}
```
an example how to make it work:<br>

in a parent using **extraAttributeName: "classes"**<br><br>
```javascript
render() {
  return (
    <Icon classes="..large green">
      resize
    </Icon>
  )
}
```
in the Icon
```javascript
with addedPrefix 'icon';

export default function Icon({classes, children}) {
  return (
    <i class=".self $classes material-icons">
      {children}
    </i>
  )
}
```

so we will have 

in a parent
```javascript
render() {
  return (
    <Icon classes="awesome-example-app-large green">
      resize
    </Icon>
  )
}
```
in the Icon "import" will be automatically added
```javascript
import classy from 'classy-loader/classy';

export default function Icon({classes, children}) {
  return (
    <i className={classy("awesome-example-app-icon", classes, "material-icons")}>
      {children}
    </i>
  )
}
```

so this is how the code will look like in a bundle
```javascript
return _react2.default.createElement(
  'i',
  _extends({
    className: (0, _classy2.default)("awesome-example-app-icon", classes, "material-icons")
  }),
  children
);
```

### prefix::name
Adds needed addiotinal prefix to class name.<br>
See the example with the Icon above.<br>
Let's modify this a little bit.<br>
Added prefix is a local prefix in relation to the Icon.
```javascript
render() {
  return (
    <Icon classes="..large green">
      <span class="icon::thing">
        resize
      </span>
    </Icon>
  )
}
```
also you can use just code like this for the same purpose, but first variant adds delimiter by itself
```javascript
render() {
  return (
    <Icon classes="..large green">
      <span class="..icon-thing">
        resize
      </span>
    </Icon>
  )
}
```
so we will have this html
```html
<i className="awesome-example-app-icon awesome-example-app-large green material-icons">
  <span class="awesome-example-app-icon-thing">
    resize
  </span>
</i>
```

### .$name
Dynamical class name, local prefix plus value of a given variable.<br>
It's always local prefix regardless whether the mode automatic or not.
```javascript
with addedPrefix 'tab';

export default function Tab({classes, children, isActive}) {
  render() {
    let className = isActive ? 'active' : 'inactive';
    return (
      <div class=".self .$className $classes">
          {children}
      </div>
    )
  }
}
```
will be
```javascript
import classy from 'classy-loader/classy';

export default function Tab({classes, children, isActive}) {
  render() {
    let className = isActive ? 'active' : 'inactive';
    return (
      <div className={classy("awesome-example-app-tab", "awesome-example-app-tab-" + className,  classes)}>
          {children}
      </div>
    )
  }
}
```

### ..$name
Dynamical class name, global prefix plus value of a given variable.<br>
It's always global prefix regardless whether the mode automatic or not.
```javascript
with addedPrefix 'button';

export default class Button extends React.Component {
  render() {
    let className = 'active';
    return (
      <div classes=".self ..$className">
          ...
      </div>
    )
  }
}
```
will be
```javascript
import classy from 'classy-loader/classy';

export default class Button extends React.Component {
  render() {
    let className = 'active';
    return (
      <div className={classy("awesome-example-app-button", "awesome-example-app-" + className)}>
          ...
      </div>
    )
  }
}
```

It's impossible to obfuscate dynamical class names so there are special fake **$classy** functions to make roadmaps for obfuscation.<br>
Here is the an example.
```javascript
let className = $classy(colorValue, '..color', ['red', 'green', 'blue', 'yellow', 'orange' ...]);
```
It produces this code:
```javascript
let className = {
  red: 'awesome-example-app-color-red',
  green: 'awesome-example-app-color-green',
  blue: 'awesome-example-app-color-blue',
  yellow: 'awesome-example-app-color-yellow',
  orange: 'awesome-example-app-color-orange',
  ...
}[colorValue];
```
So variable "className" will have a real class name value and it can be obfuscated:
```javascript
let className = {
  red: 'hby457r',
  green: 'fhelf76',
  blue: 'dh409gl',
  yellow: 'sl58sgf',
  orange: 'dl50gak',
  ...
}[colorValue];
```
Another way to make a roadmap with different class name patterns.
```javascript
let className = $classy(colorValue, {
  red: "..red item::reddish",
  green: "..green ..greenish",
  ...
});
```
It produces this code:
```javascript
let className = {
  red: 'awesome-example-app-red awesome-example-app-item-reddish',
  green: 'awesome-example-app-green awesome-example-app-greenish',
  ...
}[colorValue];
```
Also there is the third way to use **$classy**:
```javascript
with addedPrefix 'catalog';
// ....
let className = $classy(".item item ..some-item $classes");
```
It produces this code:
```javascript
import classy from 'classy-loader/classy';
// ....
let className = classy("awesome-example-app-catalog-item", "item", "awesome-example-app-some-item", classes);
```
## Conditional queries

### Simple at first
```javascript
// all with globalPrefix = 'app'
// all with autoPrefixMode = false
// all with addedPrefix = 'item'

render() {
  let active = true;
  let className = $classy('.thing');
  return (
    <div class="name $active?active">
      ...
    </div>
    <div class=".name $active?.active">
      ...
    </div>
    <div class="$active?..active:..inactive">
      ...
    </div>
    <div class="$active?$className:disabled">
      ...
    </div>
    <div class="!$active?disabled $!active?inactive">
      ...
    </div>
  )
}

render() {
  let active = true;
  return (
    <div className={classy("name", active ? "active" : "")}>
      ...
    </div>
    <div className={classy("app-item-name", active ? "app-item-active" : "")}>
      ...
    </div>
    <div className={classy(active ? "app-active" : "app-inactive")}>
      ...
    </div>
     <div className={classy(active ? className : "disabled")}>
      ...
    </div>
    <div className={classy(!active ? "disabled" : "", !active ? "inactive" : "")} >
      ...
    </div>
  )
}
```
You can have spaces next to symbols "?" and ":" like
```javascript
render() {
  return (
    <div class="$active ? active : inactive">
      ...
    </div>
  )
}
```
But not in conditional parts
```javascript
render() {
  return (
    <div class="$active === true ? active : inactive">
      ...
    </div>
  )
}
```
This query will produce incorrect class name something like
```javascript
render() {
  return (
    <div className="1 === true active inactive">
      ...
    </div>
  )
}
```
If you want to have spaces in conditions use parentheses
```javascript
render() {
  return (
    <div class="$(active == 'something') ? active : inactive">
      ...
    </div>
  )
}
```
You can have only one variable sign "$" in your condition, it should be first of course
```javascript
render() {
  return (
    <div class="$index==count-1 ? active : inactive">
      ...
    </div>
    
    // or

    <div class="$( index == count - 1 ) ? active : inactive">
      ...
    </div>
  )
}
```

## And finally super short cherry on the cake querries
```javascript
render() {
  return (
    <div class="$?active">
      ...
    </div>

    // or

    <div class="?$active">
      ...
    </div>
  )
}
```
will be
```javascript
render() {
  return (
    <div className={classy(active ? "active" : "")}>
      ...
    </div>
  )
}
```

## CSS syntax

### Non-automatic prefix mode
One point for real class name without prefix.<br>
Two points for class names with local prefix.<br>
Three points for class names with global prefix.<br>
**"Self"** is a keywords that means local prefix itself or global if local one not defined

```scss
..self {
  ..title {

  }
  ..content {

  }
  ...active {

  }
  .item {

  }
}
```

### Automatic prefix mode
One point for class names with local prefix.<br>
Two points for class names with global prefix.<br>
Three points for real class name without prefix.<br>

```scss
.self {
  .title {

  }
  .content {

  }
  ..active {

  }
  ...item {

  }
}
```

If a local prefix not defined global one will be added instead

## CSS shorcutty special syntax

Here's an example
```scss
.container {
  var .abs.w100.h200.bc-000.c-fff.fs15;
}
```
will be
```scss
.container {
  position: absolute;
  width: 100px;
  height: 200px;
  background-color: #000;
  color: #fff;
  font-size: 15px;
}
```
can be also with spaces, should end with a semicolon or a new line
```scss
.container {
  var .fix .l .r .t .b .z999 .o3;
}
```
will be
can be also with spaces, should end with a semicolon or a new line
```scss
.container {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 999;
  opacity: 0.3;
}
```
### Full list of shorcuts

**l** = left: 0;<br>
**l10** = left: 10px;<br>
**l-10** = left: -10px;<br>
**l50p** = left: 50%;<br>
**l-50p** = left: -50%;<br>

**r** = right: 0;<br>
**r10** = right: 10px;<br>
**r-10** = right: -10px;<br>
**r50p** = right: 50%;<br>
**r-50p** = right: -50%;<br>

**t** = top: 0;<br>
**t10** = top: 10px;<br>
**t-10** = top: -10px;<br>
**t50p** = top: 50%;<br>
**t-50p** = top: -50%;<br>

**b** = botton: 0;<br>
**b10** = botton: 10px;<br>
**b-10** = botton: -10px;<br>
**b50p** = botton: 50%;<br>
**b-50p** = botton: -50%;<br>

**z10** = z-index: 10;<br>

**w** = width: 100%;<br>
**w100** = width: 100px;<br>
**w50p** = width: 50%;<br>

**h** = height: 100%;<br>
**h150** = height: 150px;<br>
**h20p** = height: 20%;<br>

**wh20** = width: 20px; height: 20px;<br>
**wh20p** = width: 20%; height: 20%;<br>

**mnw** = min-width: 0;<br>
**mnw100** = min-width: 100px;<br>
**mnh** = min-height: 0;<br>
**mnh100** = min-height: 100px;<br>
**mxw** = max-width: none;<br>
**mxw100** = max-width: 100px;<br>
**mxh** = max-height: none;<br>
**mxh100** = max-height: 100px;<br>

**auto** = margin: auto;<br>
**m** = margin: 0;<br>
**m5** = margin: 5px;<br>
**m10-5** = margin: 10px 5px;<br>
**m10-5-10-5** = margin: 10px 5px 10px 5px;<br>

**ml** = margin-left: 0;<br>
**ml5** = margin-left: 5px;<br>
**ml-5** = margin-left: -5px;<br>
**ml5p** = margin-left: 5%;<br>
**ml-5p** = margin-left: -5%;<br>

**mr** = margin-right: 0;<br>
**mr5** = margin-right: 5px;<br>
**mr-5** = margin-right: -5px;<br>
**mr5p** = margin-right: 5%;<br>
**mr-5p** = margin-right: -5%;<br>

**mt** = margin-top: 0;<br>
**mt5** = margin-top: 5px;<br>
**mt-5** = margin-top: -5px;<br>
**mt5p** = margin-top: 5%;<br>
**mt-5p** = margin-top: -5%;<br>

**mb** = margin-bottom: 0;<br>
**mb5** = margin-bottom: 5px;<br>
**mb-5** = margin-bottom: -5px;<br>
**mb5p** = margin-bottom: 5%;<br>
**mb-5p** = margin-bottom: -5%;<br>

**p** = padding: 0;<br>
**p5** = padding: 5px;<br>
**p10-5** = padding: 10px 5px;<br>
**p10-5-10-5** = padding: 10px 5px 10px 5px;<br>  

**pl** = padding-left: 0;<br>
**pl5** = padding-left: 5px;<br>
**pl-5** = padding-left: -5px;<br>
**pl5p** = padding-left: 5%;<br>
**pl-5p** = padding-left: -5%;<br>

**pr** = padding-right: 0;<br>
**pr5** = padding-right: 5px;<br>
**pr-5** = padding-right: -5px;<br>
**pr5p** = padding-right: 5%;<br>
**pr-5p** = padding-right: -5%;<br>

**pt** = padding-top: 0;<br>
**pt5** = padding-top: 5px;<br>
**pt-5** = padding-top: -5px;<br>
**pt5p** = padding-top: 5%;<br>
**pt-5p** = padding-top: -5%;<br>

**pb** = padding-bottom: 0;<br>
**pb5** = padding-bottom: 5px;<br>
**pb-5** = padding-bottom: -5px;<br>
**pb5p** = padding-bottom: 5%;<br>
**pb-5p** = padding-bottom: -5%;<br>

**flex** = display: flex;<br>
**flcen** = align-item: center; justify-content: center;<br>
**bl** = display: block;<br>
**inb** = display: inline-block;<br>

**fix** = position: fixed;<br>
**abs** = position: absolute;<br>
**rel** = position: relative;<br>
**box** = box-sizing: border-box;<br>

**ova** = overflow: auto;<br>
**ovh** = overflow: hidden;<br>

**lt** = text-align: left;<br>
**rt** = text-align: right;<br>
**cen** = text-align: center;<br>
**just** = text-align: justify;<br>

**vtop** = vertical-align: top;<br>
**vmid** = vertical-align: middle;<br>
**vbot** = vertical-align: bottom;<br>

**cur** = cursor: default;<br>
**cur-name** = cursor: name;<br>
**pntr** = cursor: pointer;<br>
**cnt** = content: "";<br>
**nor** = resize: none;<br>

**fl** = float: left;<br>
**fr** = float: right;<br>
**clr** = clear: both;<br>

**bold** = font-weight: bold;<br>
**it** = font-style: italic;<br>
**un** = text-decoration: underline;<br>

**lh** = line-height: 0;<br>
**lh20** = line-height: 20px;<br>
**fs** = font-size: 0;<br>
**fs15** = font-size: 15px;<br>
**ff-name** = font-family: name;<br>  

**o** = opacity: 0;<br>
**o5** = opacity: 0.5;<br>
**o10** = opacity: 1;<br>

**ol** = outline: 0;<br>
**ol-000** = outline: 1px solid #000;<br>
**ol-EEE-2** = outline: 2px solid #EEE;<br>
**ol-EEE-2-dashed** = outline: 2px dashed #EEE;<br>

**bo** = border: 0;<br>
**bo-000** = border: 1px solid #000;<br>
**bo-EEE-2** = border: 2px solid #EEE;<br>
**bo-EEE-2-dashed** = border: 2px dashed #EEE;<br>

**bol** = border-left: 0;<br>
**bol-000** = border-left: 1px solid #000;<br>
**bol-EEE-2** = border-left: 2px solid #EEE;<br>
**bol-EEE-2-dashed** = border-left: 2px dashed #EEE;<br>

**bor** = border-right: 0;<br>
**bor-000** = border-right: 1px solid #000;<br>
**bor-EEE-2** = border-right: 2px solid #EEE;<br>
**bor-EEE-2-dashed** = border-right: 2px dashed #EEE;<br>

**bot** = border-top: 0;<br>
**bot-000** = border-top: 1px solid #000;<br>
**bot-EEE-2** = border-top: 2px solid #EEE;<br>
**bot-EEE-2-dashed** = border-top: 2px dashed #EEE;<br>

**bob** = border-bottom: 0;<br>
**bob-000** = border-bottom: 1px solid #000;<br>
**bob-EEE-2** = border-bottom: 2px solid #EEE;<br>
**bob-EEE-2-dashed** = border-bottom: 2px dashed #EEE;<br>

**br** = border-radius: 0;<br>
**br5** = border-radius: 5px;<br>
**br50p** = border-radius: 50%;<br>
**br5-10-10-0** = border-radius: 5px 10px 10px 0;<br>

**bsp** = border-spacing: 0;<br>
**bsp2** = border-spacing: 2px;

**c-fff** = color: #fff;<br>
**bc-fff** = background-color: #fff;<br>
**boc-fff** = border-color: #fff;<br>

**shad** = box-shadow: none;<br>
**shad-000-10** = box-shadow: 0 0 10px #000;<br>
**shad-000-10-1-1** = box-shadow: 1px 1px 10px #000;<br>

**tshad** = text-shadow: none;<br>
**tshad-000-2** = text-shadow: 0 0 2px #000;<br>
**tshad-000-2-1-1** = text-shadow: 1px 1px 2px #000;<br>

**tra-c-3-bc-3-o-3** = transition: color 0.3s, background-color 0.3s, opacity 0.3s;<br>
<br>