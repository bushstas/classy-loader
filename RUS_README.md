# classy-loader [![npm](https://img.shields.io/npm/v/classy-loader.svg?style=flat-square)](https://www.npmjs.com/package/classy-loader)

Classy-loader ����������� ���������� ��� React ����������, ����� ��������� CSS/JS ������� ������� DOM ���������.  
�� ��������� JS � CSS ����� �������, ��� ��� ��� ����� ����������������, � ����� ����� �� �������������.  
��������� ����� ���� ���������� �������� ��� "���������" ���� ������� ������ ��������� ��������� � JS ������.  
����� ����� ������ ����������� � ������� �������� �������� ���������� � ������������ ��� CSS �������, ����� ���� ���������� ����� �������.

## ���������

### NPM

```sh
npm install --save classy-loader
```

### ������ ����������
[������ �� Github �����������](https://github.com/bushstas/classy-loader-example.git)

## ���������� � ������ �������

### ��� ������ ������� ������ ���������.

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
��� ����� �� �������, ������ ������� �������� ����� ������ � ����������� �������� ������.

### attributeName

�������� �������� DOM ���������, ������� ����� ��������� ��������.  
��� ����� ���� ����� ������ � ����� ������������� � ����������� ������� "className".  
�� ��������� ������ �������� ����� "class".

```javascript
render() {
  return (
    <div class=".self">
      ...
    </div>
  )
}
```

��� ���

```javascript
render() {
  return (
    <div whateverName=".self">
      ...
    </div>
  )
}
```
��� ��� "class" � "whateverName" ���� �������� attributeName.  
����� ��������� �������� ��� ����� ��������� ���:

```javascript
render() {
  return (
    <div className="awesome-example-app">
      ...
    </div>
  )
}
```
��� ������� **"self"** - �������� �����, ������� �������� ��� ���������� ��� ��������� ������� ����� ������.  
��������� � ���� ������ � ��� ��� ���������� ��������, ��� ��� **"self"** ����� ����� �������� �����������.  

### extraAttributeName

�������� �������� ��� React ���������, ������� ����� ��������� ����� �� �������, �� �� ������ ������ ��������.  
��� ����� ����� �������������� ��� �������� ���������� � ������ ��������, ������� ����� ����������.  
�� ��������� ��� ����� "classes".

```javascript
render() {
  return (
    <Button classes=".action-button awesome-button">
      ����� ����!
    </Button>
  )
}

let classes = ".some-class";

let object = {
  classes: ".some-other-class"
};
```
�� ������ �� ������� �� ��� �� ������� "classes": 

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

�������, ������� ����� ����������� � ������ ������� DOM ���������.  
����������� ��������� ������ ������� ����� �� ��������� �����-�� �� ��������� ��� ���.  
�� ��������� �� ����, ��� ��� ��� ��������, ��� �������� �������� ��������� �� �����, ���� �� ����� ��������� �������.

```javascript
render() {
  return (
    <div class=".thing">
      ...
    </div>
  )
}
```

������ 

```javascript
render() {
  return (
    <div className="awesome-example-app-thing">
      ...
    </div>
  )
}
```
����� ������, ��� ��� ������ ������ ����� �������.  
��������� � ���������� ������� ������������ ����.

### delimiter

������ ��� �����, �������� �������� � ����� ������� ����� ������������.  
�� ��������� ����� "-".

```javascript
render() {
  return (
    <div class=".some-item">
      ...
    </div>
  )
}
```

��� ���, ���� ��� **"delimiter"** ����� "\_", ��� ����� �����:

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

���� ������ �������� �����, ������ ���������� ���������� ��������� ������� ��������������.  
�� ��������� �� �� �����.  
���� ��� �������� ��������:  

#### `prefixAutoResolving: "content"`
��� ������ ������ ���������� ����� ������, ������� ��������:  
**export default (class|function) MySuperClassName**    
  
����� ����� ������:  
**export default connect(...)(MySuperClassName)**  
  
���� �� ������:  
**class MySuperClassName**    
  
�� � � ����� ������ ������� ������ ���������� ������ � ����� �����:  
**function MySuperClassName**    
  
���� "MySuperClassName" ����� ������������� � ��������� ������� "my" + delimiter + "super" + delimiter + "class" + delimiter + "name".  

��� CSS ������ ������ ����� ������ ������ � ����, ������� ����������� ��� ��������� JS ������.  
���� � ���� �������� ���������� � ��������� ��� ���������� ����� � ��� �� ����������,  
��� ����� ������������, ����� ������� JS � CSS ����� ����������������.  
��� ������� ����������� JS ������� ����� CSS ���������, ����� ������ ���� ������ ���.

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

������

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
����� �� ������ �������� JS/CSS ��������� �������� � ������� ����������� ��������.  
������ � ��� �������� ����.
  
#### `prefixAutoResolving: "file"`
������ ����� ����������� ��������� ������� �� ��� JS/CSS ������:  
"SuperItem.js" ��� "super-item.js" ��� "super_item.js"  
����������� � ������� "super" + delimiter + "item".  
��� ������� ������� ����� ������ ���������� ���������, ����� ��� ���� ����������������.

#### `prefixAutoResolving: "folder"`
������ ����� ����������� ��������� ������� �� ��� ����������:  
"SuperItem/index.js" ��� "super-item/some.js" ��� "super_item/any.js"  
������ ��������� "super" + delimiter + "item".  
����� ������� ������ ���������������� JS/CSS, ����� ���� ��������� ����� ����� �������.

### obfuscation

���� ���������� � true, ������ ����� ������������� ����� ������� � JS � CSS ������.  
������ �����������, ��� CSS ������ ����� �������� � ����� ������, � JS ������ ������ ��������� **"attributeName"** and **extraAttributeName**.  
�� ��������� ��� ����� �� �������.

```javascript
render() {
  return (
    <div class=".button small">
      ...
    </div>
  )
}
```
������

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

����� � ��������, �� ������� ����� ������� ����� �������������.  
�� ��������� �������� ����� "7".  
  
��� ���, ���� � ��� **"obfuscatedLength"** ����� 4

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

������ ����� ������������� ��������� �������� � ����� ������ �������.  
��� ����� ����� ������������ ������� ������ ��������� ������ ���� �������.  
�� ��������� ���� �������� ��������.  
  
��������, ��� ��� ������ CSS ������� ��� ����������������� ������:  
(**"prefixAutoResolving"** ����� �������� "content")

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
����� ������������� �

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

����� ��������� ������� �������� "awesome-example-app-container" (���������� ������� ���� ����������� ������������� �� ����� ������ "Container").  
��� ��� � ���� ������ ��� ����� ��������� ����� ��� ���������: ���� ��� ���������� � ��� ��� �����������.  
  
� ������� ������ �������� CSS ������� ��� ��������������� ������  
(**"prefixAutoResolving"** ����� �������� "content")  
� ���������� �� ������� �� �� �����, ��� � � ������ ������.

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
����� �����

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
� ���� ������ �� ����� ��������� ����� ��� ���������� ��������, ���� ����� �������� ��� ����������� � ��� ��� ���� ������� ��� ��������.  
  
� CSS ������ ��� �������� �� ��� �� ��������� (����� ��������� ����� �� ����� �����, ��� ��� ��������� �������� ��� �����)  
  
���������������� �����:

```scss
/* ���������, ������� ������ ��� ��������� ������� (��������� �������������� ������� � �����������) */
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

�����

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

� �� �� ����� ��� ��������������� ������:

```scss
/* ���������, ������� ������ ��� ��������� ������� (��������� �������������� ������� � �����������) */
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

���� ��� �� ����� ���������

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

## ���������

### JS ���������

<ul>
<li>
<h3>with prefix 'some-prefix';</h3>
������� ��������� ������ ����������� ��������, ������� �������������� ��� � ������ ����� �����.  
��� ����� �� ��� �� ����� ��������� ����������� ���������� ������� ������������ � �������.
</li>
</ul>

```javascript
// ���������������� �����
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

������

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

� ������ ��������� ��� ������, ����� **"prefixAutoResolving"** ���������� � false,  
��� ��� � ��� ��� ������������ ���������� ��������,  
������ ���������������� ����������

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
�� �� �� �����, ��� � � ���������� ����, ���� ������������� �������������� ����� � �������� ������� �����.
</li>
</ul>

<ul>
<li>
<h3>with addedPrefix 'some-additional-prefix';</h3>
������ ����������� ������� ��� ���������� �������������.  
��� ��������� ������ ���-�� ����� ��������� **"prefixAutoResolving"**, ��� ��� ����� �� ������  
�� ����� ���������� ������� �������������.
</li>
</ul>

```javascript
// ���������������� �����
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

�����

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
�� �� �� �����, ��� ��� ��������� ����, ���� ������������� �������������� ����� � �������� ������� �����.
</li>
</ul>

<ul>
<li>
<h3>with auto prefix;</h3>
������������� �������������� ����� � �������� ������� �����.
</li>
</ul>


### CSS ���������

CSS ��������� ������ ��������� �� �� ����� � �������� ������ ����� � JS ��������,  
������� ������ � ��������� ���������, ������� ��� ��� JS ������

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
<li>
<h3>.with.no.prefix;</h3>
������������ ������� �� ��������� �� ����� ���������, ���� ���� ���� ".." / "..."  
��� ��� ��� ����� ����� �������������� ��� ����.
</li>
</ul>
  

## ��������� ��������� ����������� CSS �������

```javascript
render() {
  return (
    <div class="name .name ..name $name $$name prefix::name .$name ..$name">
      ...
    </div>
  )
}
```
### name
���������� ��� ������ ��� ��������� � ���������������� ������.  
���������� ��� ������ � ��������� ��������� � �������������� ������.
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
���������� ��� ������ � ��������� ��������� � ���������������� ������.  
���������� ��� ������ � ���������� ��������� � �������������� ������.
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
���������� ��� ������ � ���������� ��������� � ���������������� ������.  
���������� ��� ������ ��� ��������� � �������������� ������.
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
"�������" ��� ������ ��� ������ ���� �� ����������.  
������ ������������� ������� "������" ������� ��� "���������" ������.  
���������� ��� ������ ��������� ���/����� ������� � ���������� ��� ���� �������������.
```javascript
render() {
  return (
    <div className={classy(name)}>
      ...
    </div>
  )
}
```
������ ����, ��� ��� � �������� ��������:  
  
� ������������ ���������� ���������� **extraAttributeName: "classes"**
```javascript
render() {
  return (
    <Icon classes="..large green">
      resize
    </Icon>
  )
}
```
� �������� (� ������ Icon)
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
��� ��� � ����� �������  
  
� ��������:
```javascript
render() {
  return (
    <Icon classes="awesome-example-app-large green">
      resize
    </Icon>
  )
}
```
� ���������� Icon "import" ������������� ��������
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
� ��� ��� ����� ��������� � ��������� "������":
```javascript
return _react2.default.createElement(
  'i',
  _extends({
    className: (0, _classy2.default)("awesome-example-app-icon", classes, "material-icons")
  }),
  children
);
```
### $$name
�� �� �����, ��� � � ���������� ����, �� ������� �������, ��� ���������� �������� �������, � �� �������� ��� "undefined",  
����� ������ �� ����������� ������� ���������, ������ ���� ���� ������ ���������� ���� $name, ������� ��� ����� ����� ������������
```javascript
render() {
  return (
    <div class="$classes">
        <div class="$$className">
           ...
        </div>
    </div>
  )
}
```
������
```javascript
render() {
  return (
    <div className={classy(classes)}>
      <div className={className}>
        ...
      </div>
    </div>
  )
}
```

### prefix::name
��������� ��������� (�� ��������� � ��������� ����������) ������� � ����� ������.  
������� ������ � Icon ���� � ������� ������� ���.
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
� �������� ����� ������ ������������ ������ ���� ".icon-thing",  
�� ������ ������� �������� �� ������ ������������.
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
��� ��� � ��� ����� ����� HTML
```html
<i className="awesome-example-app-icon awesome-example-app-large green material-icons">
  <span class="awesome-example-app-icon-thing">
    resize
  </span>
</i>
```

### .$name
������������ ��� ������, ��������� ������� ���� �������� ����������.  
��� ������ ��������� ������� ���������� �� ������.
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
�����
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
������������ ��� ������, ���������� ������� ���� �������� ����������.  
��� ������ ���������� ������� ���������� �� ������.
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
�����
```javascript
export default class Button extends React.Component {
  render() {
    let className = 'active';
    return (
      <div className={"awesome-example-app-button awesome-example-app-" + className}>
          ...
      </div>
    )
  }
}
```

���������� (��� ������ �.�. ���) ������������� ����� ������������ �����,  
�� ��� ����� ����� �������� ����������� "��������" ������� **$classy**.  
��� ������� "�����" ���� ������� ��� �����������.  
  
��� ������:
```javascript
let className = $classy(color, '..color-', ['red', 'green']);
className = $classy(number, '.color-', ['blue', 'yellow']);
className = $classy(number, '..', ['one', 'two']);
className = $classy(quality, '.', ['good', 'bad']);
className = $classy(name, '', ['John', 'Rick']);
```
� ���������������� ������ ����� ������������� �:
```javascript
let className = {
  red: 'awesome-example-app-color-red',
  green: 'awesome-example-app-color-green'
}[color];

className = {
  blue: 'awesome-example-app-button-color-blue',
  yellow: 'awesome-example-app-button-color-yellow'
}[color];

className = {
  one: 'awesome-example-app-one',
  two: 'awesome-example-app-two'
}[number];

className = {
  good: 'awesome-example-app-button-good',
  bad: 'awesome-example-app-button-bad'
}[quality];

className = {
  John: 'John',
  Rick: 'Rick'
}[name];
```
� � �������������� ������ �����:
```javascript
let className = {
  red: 'color-red',
  green: 'color-green'
}[color];

className = {
  blue: 'awesome-example-app-color-blue',
  yellow: 'awesome-example-app-color-yellow'
}[color];

className = {
  one: 'one',
  two: 'two'
}[number];

className = {
  good: 'awesome-example-app-good',
  bad: 'awesome-example-app-bad'
}[quality];

className = {
  John: 'awesome-example-app-button-John',
  Rick: 'awesome-example-app-button-Rick'
}[name];
```
��� ��� ���������� "className" ����� �������� ������ ������, ������� ����� ������������� � ����� ���:
```javascript
let className = {
  red: 'hby457r',
  green: 'fhelf76',
  blue: 'dh409gl',
  yellow: 'sl58sgf',
  orange: 'dl50gak',
  ...
}[color];
```
������ ������ ��� ���� ����, �� ��� c ���������� "����������":
```javascript
let className = $classy(colorValue, {
  red: "..red item::reddish",
  green: "..green ..greenish",
  ...
});
```
���� ���:
```javascript
let className = {
  red: 'awesome-example-app-red awesome-example-app-item-reddish',
  green: 'awesome-example-app-green awesome-example-app-greenish',
  ...
}[colorValue];
```
�� � ��������� ��� ����� ������������ **$classy**:
```javascript
with addedPrefix 'catalog';
// ....
let className = $classy(".item item ..some-item $classes");
```
������
```javascript
import classy from 'classy-loader/classy';
// ....
let className = classy("awesome-example-app-catalog-item", "item", "awesome-example-app-some-item", classes);
```
## �������� (���������) ������ CSS �������

### ��� ������ �������
```javascript
// ��� ������� � globalPrefix = 'app'
// ��� ������� � autoPrefixMode = false
// ��� ������� ����� addedPrefix = 'item'

render() {
  let active = true;
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
    <div class="$!active?inactive">
      ...
    </div>
  )
}
```
������
```javascript
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
    <div className={classy(!active ? "inactive" : "")} >
      ...
    </div>
  )
}
```
����� ��������� ������� ����� ��������� "?" � ":" 
```javascript
render() {
  return (
    <div class="$active ? active : inactive">
      ...
    </div>
  )
}
```
�� ��� � ������� ������� �����������:
```javascript
render() {
  return (
    <div class="$active === true ? active : inactive">
      ...
    </div>
  )
}
```
����� ������ ����� ������������� � ������������ ��� ������ ����
```javascript
render() {
  return (
    <div className="1 === true active inactive">
      ...
    </div>
  )
}
```
���� ��� ������� �������� �������, �������� ������� � ������� ������
```javascript
render() {
  return (
    <div class="$(active == 'something') ? active : inactive">
      ...
    </div>
  )
}
```
�������� ��������� ������ ���� ���� "$" � ������ �������, ��� ��������� ���������� ������� ����� �� ���������:
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

## � ������� ������� �� �����
```javascript
render() {
  return (
    <div class="$?active $?.active $?..active">
      ...
    </div>
  )
}
```
�����
```javascript
render() {
  return (
    <div className={classy(active ? "active" : "", active ? "local-prefix-active" : "", active ? "global-prefix-active" : "")}>
      ...
    </div>
  )
}
```
����� �������� �� ����� �� ���������, ��� � ������, � ����������� �� ������.

## CSS ���������

### ��� ����������������� ������
���� ����� ��� �������� ��� ������� ��� ���������.  
��� ����� ��� ��� � ��������� ���������.  
��� ����� ��� ��� � ���������� ���������.  
**"Self"** - �������� ����� ������������ ��������� ��� ���������� �������, ���� ������� ����������, ����� ��� ������ ����� ������ self

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

### ��� ��������������� ������
���� ����� ��� ��� ������� � ��������� ���������.  
��� ����� ��� ��� � ���������� ���������.  
��� ����� ��� �������� ��� ������� ��� ���������.

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

���� ��������� ������� �� ���������, ����� ����������� ����������.

## � ������ ������� CSS ������

������ ��������� ����������:
```scss
.container {
  var .abs.w100.h200.bc-000.c-fff.fs15;
}
```
����� ������������� �:
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
����� ����� � ���������:
```scss
.container {
  var .fix .l .r .t .b .z999 .o3;
}
```
������
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
��������� ������ ���������� � ��������� ����� **"var"** � ������������� ������ � ������� ��� ��������� ������.

### ������ ������ ��������� ����������

<details>
<summary>������ ����</summary>  
  
**rubb** = left: 0; right: 0; top: 0; bottom: 0;  
**l** = left: 0;  
**l10** = left: 10px;  
**l-10** = left: -10px;  
**l50p** = left: 50%;  
**l-50p** = left: -50%;  

**r** = right: 0;  
**r10** = right: 10px;  
**r-10** = right: -10px;  
**r50p** = right: 50%;  
**r-50p** = right: -50%;  

**t** = top: 0;  
**t10** = top: 10px;  
**t-10** = top: -10px;  
**t50p** = top: 50%;  
**t-50p** = top: -50%;  

**b** = bottom: 0;  
**b10** = bottom: 10px;  
**b-10** = bottom: -10px;  
**b50p** = bottom: 50%;  
**b-50p** = bottom: -50%;  

**z10** = z-index: 10;  

**w** = width: 100%;  
**w100** = width: 100px;  
**w50p** = width: 50%;  

**h** = height: 100%;  
**h150** = height: 150px;  
**h20p** = height: 20%;  

**wh** = width: 100%; height: 100%;  
**wh20** = width: 20px; height: 20px;  
**wh20p** = width: 20%; height: 20%;  

**mnw** = min-width: 0;  
**mnw100** = min-width: 100px;  
**mnh** = min-height: 0;  
**mnh100** = min-height: 100px;  
**mxw** = max-width: none;  
**mxw100** = max-width: 100px;  
**mxh** = max-height: none;  
**mxh100** = max-height: 100px;  

**auto** = margin: auto;  
**m** = margin: 0;  
**m5** = margin: 5px;  
**m10-5** = margin: 10px 5px;  
**m10-5-10-5** = margin: 10px 5px 10px 5px;  

**ml** = margin-left: 0;  
**ml5** = margin-left: 5px;  
**ml-5** = margin-left: -5px;  
**ml5p** = margin-left: 5%;  
**ml-5p** = margin-left: -5%;  

**mr** = margin-right: 0;  
**mr5** = margin-right: 5px;  
**mr-5** = margin-right: -5px;  
**mr5p** = margin-right: 5%;  
**mr-5p** = margin-right: -5%;  

**mt** = margin-top: 0;  
**mt5** = margin-top: 5px;  
**mt-5** = margin-top: -5px;  
**mt5p** = margin-top: 5%;  
**mt-5p** = margin-top: -5%;  

**mb** = margin-bottom: 0;  
**mb5** = margin-bottom: 5px;  
**mb-5** = margin-bottom: -5px;  
**mb5p** = margin-bottom: 5%;  
**mb-5p** = margin-bottom: -5%;  

**p** = padding: 0;  
**p5** = padding: 5px;  
**p10-5** = padding: 10px 5px;  
**p10-5-10-5** = padding: 10px 5px 10px 5px;    

**pl** = padding-left: 0;  
**pl5** = padding-left: 5px;  
**pl-5** = padding-left: -5px;  
**pl5p** = padding-left: 5%;  
**pl-5p** = padding-left: -5%;  

**pr** = padding-right: 0;  
**pr5** = padding-right: 5px;  
**pr-5** = padding-right: -5px;  
**pr5p** = padding-right: 5%;  
**pr-5p** = padding-right: -5%;  

**pt** = padding-top: 0;  
**pt5** = padding-top: 5px;  
**pt-5** = padding-top: -5px;  
**pt5p** = padding-top: 5%;  
**pt-5p** = padding-top: -5%;  

**pb** = padding-bottom: 0;  
**pb5** = padding-bottom: 5px;  
**pb-5** = padding-bottom: -5px;  
**pb5p** = padding-bottom: 5%;  
**pb-5p** = padding-bottom: -5%;  

**flex** = display: flex;  
**flcen** = align-item: center; justify-content: center;  
**bl** = display: block;  
**inb** = display: inline-block;  

**fix** = position: fixed;  
**abs** = position: absolute;  
**rel** = position: relative;  
**box** = box-sizing: border-box;  

**ova** = overflow: auto;  
**ovh** = overflow: hidden;  
**ovs** = overflow: scroll;  

**lt** = text-align: left;  
**rt** = text-align: right;  
**cen** = text-align: center;  
**just** = text-align: justify;  

**vtop** = vertical-align: top;  
**vmid** = vertical-align: middle;  
**vbot** = vertical-align: bottom;  

**cur** = cursor: default;  
**cur-name** = cursor: name;  
**pntr** = cursor: pointer;  
**cnt** = content: "";  
**nor** = resize: none;  

**fl** = float: left;  
**fr** = float: right;  
**clr** = clear: both;  

**bold** = font-weight: bold;  
**it** = font-style: italic;  
**un** = text-decoration: underline;  

**lh** = line-height: 0;  
**lh20** = line-height: 20px;  
**ls** = letter-spacing: 0;  
**ls2** = letter-spacing: 2px;  
**fs** = font-size: 0;  
**fs15** = font-size: 15px;  
**ff-name** = font-family: name;    

**o** = opacity: 0;  
**o5** = opacity: 0.5;  
**o10** = opacity: 1;  

**ol** = outline: 0;  
**ol-000** = outline: 1px solid #000;  
**ol-EEE-2** = outline: 2px solid #EEE;  
**ol-EEE-2-dashed** = outline: 2px dashed #EEE;  

**bo** = border: 0;  
**bo-000** = border: 1px solid #000;  
**bo-EEE-2** = border: 2px solid #EEE;  
**bo-EEE-2-dashed** = border: 2px dashed #EEE;  

**bol** = border-left: 0;  
**bol-000** = border-left: 1px solid #000;  
**bol-EEE-2** = border-left: 2px solid #EEE;  
**bol-EEE-2-dashed** = border-left: 2px dashed #EEE;  

**bor** = border-right: 0;  
**bor-000** = border-right: 1px solid #000;  
**bor-EEE-2** = border-right: 2px solid #EEE;  
**bor-EEE-2-dashed** = border-right: 2px dashed #EEE;  

**bot** = border-top: 0;  
**bot-000** = border-top: 1px solid #000;  
**bot-EEE-2** = border-top: 2px solid #EEE;  
**bot-EEE-2-dashed** = border-top: 2px dashed #EEE;  

**bob** = border-bottom: 0;  
**bob-000** = border-bottom: 1px solid #000;  
**bob-EEE-2** = border-bottom: 2px solid #EEE;  
**bob-EEE-2-dashed** = border-bottom: 2px dashed #EEE;  

**br** = border-radius: 0;  
**br5** = border-radius: 5px;  
**br50p** = border-radius: 50%;  
**br5-10-10-0** = border-radius: 5px 10px 10px 0;  

**bsp** = border-spacing: 0;  
**bsp2** = border-spacing: 2px;

**c-fff** = color: #fff;  
**bc-fff** = background-color: #fff;  
**boc-fff** = border-color: #fff;  

**shad** = box-shadow: none;  
**shad-000-10** = box-shadow: 0 0 10px #000;  
**shad-000-10-1-1** = box-shadow: 1px 1px 10px #000;  

**tshad** = text-shadow: none;  
**tshad-000-2** = text-shadow: 0 0 2px #000;  
**tshad-000-2-1-1** = text-shadow: 1px 1px 2px #000;  

**tra-c-3-bc-3-o-3** = transition: color 0.3s, background-color 0.3s, opacity 0.3s;  
**rot20** = transform: rotate(20deg);  
**rot-45** = transform: rotate(-45deg);  
**ell** = text-overflow: ellipsis; overflow: hidden; white-space: nowrap;  
**nowr** = white-space: nowrap;  
**hid** = visibility: hidden;  

**norep** = background-repeat: no-repeat;  
**repx** = background-repeat: repeat-x;  
**repy** = background-repeat: repeat-y;  
**cvr** = background-size: cover;  

**bpcen** = background-position: 50% 50%;  
**bp-20-20** = background-position: 20px 20px;  
**bp-50p-20p** = background-position: 20% 20%;  
**bp-c-b** = background-position: center bottom;  
**bp-r-t** = background-position: right top;  
**bp-l-10** = background-position: left 10px;  
</details>

### ���������� ��� ������� �����������

��� ��� ���������, � ��� ������ ����� ���������� ��������(�) ������.  
��� ���� ���� ������� ���������, �� ����� ���� ���������, ���� ����� ������������� � ������ �����������.  
���� ������� �� � ����������:

```scss
.with.image.source '../../assets/images/';
.with.image.source './bg-images';
.with.image.source './images/gifs';
.with.image.source '../svgs';
```
� ���������� �������� ���:
```scss
.item {
  var .png-arrow.jpg-bg.jpeg-line.png2-some-image;
  var .gif3-preloader.svg4-icon;
}
```
���� ���������� ������� ��:  
1. ����������  
2. ����� ��������� ������� � ������� (���� ��� ������ ��������, ����� ����� ��������)  
3. ��� �����  
    
��� ��� �� ������ �� �������� ����� ������:

```scss
.item {
  background-image: url(../../assets/images/arrow.png);
  background-image: url(../../assets/images/bg.jpg);
  background-image: url(../../assets/images/line.jpeg);
  background-image: url(./bg-images/some-image.png);
  background-image: url(./images/gifs/preloader.gif);
  background-image: url(../svgs/icon.svg);
}
```
������ ��� ���� �� ��������� ��������, ���� ������� ��� ���.  
  
���� ������ ����������:  

<details>
<summary>���� ������</summary>  

**png-png-filename** = background-image: url(../some/path/png-filename.png);  
**jpg-jpg_filename** = background-image: url(../some/path/jpg_filename.jpg);  
**jpeg-oneMoreJpgFilename** = background-image: url(../some/path/oneMoreJpgFilename.jpeg);  
**gif-giffy** = background-image: url(../some/path/giffy.gif);  
**svg-blabla** = background-image: url(../some/path/blabla.svg);  
  
������� �� ����� �������� ����� ���������:  
  
**png2-a** = background-image: url(../path/to/second/source/a.png);  
**gif33-d** = background-image: url(../path/to/33-th/source/d.gif);  
  
��� ��� ������ ���������:  
  
**jpg-e** = background-image: url(../path/to/first/source/e.jpg);  
**jpg1-e** = background-image: url(../path/to/first/source/e.jpg);  
</details>