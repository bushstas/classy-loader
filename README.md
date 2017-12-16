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

in a parent using <b>extraAttributeName: "classes"</b><br><br>
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

It's impossible to obfuscate dynamical class names so there are special fake <b>$classy</b> functions to make roadmaps for obfuscation.<br>
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
Also there is the third way to use <b>$classy</b>:
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
<b>"Self"</b> is a keywords that means local prefix itself or global if local one not defined

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
<ul>

<li><b>l</b> = left: 0;</li>
<li><b>l10</b> = left: 10px;</li>
<li><b>l-10</b> = left: -10px;</li>
<li><b>l50p</b> = left: 50%;</li>
<li><b>l-50p</b> = left: -50%;</li>

<li><b>r</b> = right: 0;</li>
<li><b>r10</b> = right: 10px;</li>
<li><b>r-10</b> = right: -10px;</li>
<li><b>r50p</b> = right: 50%;</li>
<li><b>r-50p</b> = right: -50%;</li>


<li><b>t</b> = top: 0;</li>
<li><b>t10</b> = top: 10px;</li>
<li><b>t-10</b> = top: -10px;</li>
<li><b>t50p</b> = top: 50%;</li>
<li><b>t-50p</b> = top: -50%;</li>

<li><b>b</b> = botton: 0;</li>
<li><b>b10</b> = botton: 10px;</li>
<li><b>b-10</b> = botton: -10px;</li>
<li><b>b50p</b> = botton: 50%;</li>
<li><b>b-50p</b> = botton: -50%;</li>

<li><b>z10</b> = z-index: 10px;</li>

<li><b>w</b> = width: 100%;</li>
<li><b>w100</b> = width: 100px;</li>
<li><b>w50p</b> = width: 50%;</li>
<li><b>h</b> = height: 100%;</li>
<li><b>h150</b> = height: 150px;</li>
<li><b>h50p</b> = height: 20%;</li>
<li><b>wh20</b> = width: 20px; height: 20px;</li>
<li><b>wh20p</b> = width: 20%; height: 20%;</li>

<li><b>flex</b> = display: flex;</li>
<li><b>flcen</b> = align-item: center; justify-content: center;</li>
<li><b>bl</b> = display: block;</li>
<li><b>inb</b> = display: inline-block;</li>
<li><b>fix</b> = position: fixed;</li>
<li><b>abs</b> = position: absolute;</li>
<li><b>rel</b> = position: relative;</li>
<li><b>box</b> = box-sizing: border-box;</li>
<li><b>ova</b> = overflow: auto;</li>
<li><b>ovh</b> = overflow: hidden;</li>


<li><b>lt</b> = text-align: left;</li>
<li><b>rt</b> = text-align: right;</li>
<li><b>cen</b> = text-align: center;</li>
<li><b>just</b> = text-align: justify;</li>
<li><b>vtop</b> = vertical-align: top;</li>
<li><b>vmid</b> = vertical-align: middle;</li>
<li><b>vbot</b> = vertical-align: bottom;</li>
<li><b>cur</b> = cursor: default;</li>
<li><b>cur-name</b> = cursor: name;</li>
<li><b>pntr</b> = cursor: pointer;</li>
<li><b>cnt</b> = content: "";</li>
<li><b>nor</b> = resize: none;</li>
<li><b>fl</b> = float: left;</li>
<li><b>fr</b> = float: right;</li>
<li><b>clr</b> = clear: both;</li>



<li><b>bold</b> = font-weight: bold;</li>
<li><b>it</b> = font-style: italic;</li>
<li><b>un</b> = text-decoration: underline;</li>



<li><b>lh</b> = line-height: 0;</li>
<li><b>lh20</b> = line-height: 20px;</li>
<li><b>fs</b> = font-size: 0;</li>
<li><b>fs15</b> = font-size: 15px;</li>
<li><b>ff-name</b> = font-family: name;</li>
  




<li><b>bsp</b> = border-spacing: 0;</li>
<li><b>bsp2</b> = border-spacing: 2px;</li>

</ul>


  


## License

Enjoy my dear friends, all for you
