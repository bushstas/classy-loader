# classy-loader [![npm](https://img.shields.io/npm/v/classy-loader.svg?style=flat-square)](https://www.npmjs.com/package/classy-loader)

Classy-loader эффективный инструмент для React приложений, чтобы управлять CSS/JS именами классов DOM элементов.  
Он связывает JS и CSS имена классов, так что они будут синхронизированы, и можно будет их обфусцировать.  
Загрузчик имеет свой встроенный механизм для "мерджинга" имен классов внутри атрибутов элементов в JS файлах.  
Имеет очень гибкую организацию и отлично помогает избегать конфликтов в пространстве имён CSS классов, когда ваше приложение очень сложное.

## Установка

### NPM

```sh
npm install --save classy-loader
```

### Пример поиграться
[Ссылка на Github репозиторий](https://github.com/bushstas/classy-loader-example.git)

## Добавление в конфиг Вебпака

### Для начала зададим нужные настройки.

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
Как видно из примера, лоадер следует добавить после бабеля и стандартных лоадеров стилей.

### attributeName

Название атрибута DOM элементов, которое будет парситься лоадером.  
Оно может быть каким угодно и будет преобразовано в стандартный атрибут "className".  
По умолчанию данный параметр равен "class".

```javascript
render() {
  return (
    <div class=".self">
      ...
    </div>
  )
}
```

или так

```javascript
render() {
  return (
    <div whateverName=".self">
      ...
    </div>
  )
}
```
Так что "class" и "whateverName" наши названия attributeName.  
После обработки лоадером код будет выглядеть так:

```javascript
render() {
  return (
    <div className="awesome-example-app">
      ...
    </div>
  )
}
```
Для лоадера **"self"** - ключевое слово, которое означает наш глобальный или локальный префикс имени класса.  
Конкретно в этом случае у нас нет локального префикса, так что **"self"** будет равен значению глобального.  

### extraAttributeName

Название атрибута для React элементов, которое будет парситься таким же образом, но не менять своего названия.  
Оно также может использоваться для названий переменных и ключей объектов, которые нужно распарсить.  
По умолчанию оно равно "classes".

```javascript
render() {
  return (
    <Button classes=".action-button awesome-button">
      Нажми меня!
    </Button>
  )
}

let classes = ".some-class";

let object = {
  classes: ".some-other-class"
};
```
На выходе мы получим всё тот же атрибут "classes": 

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

Префикс, который будет добавляться к именам классов DOM элементов.  
Специальный синтаксис скажет лоадеру нужно ли добавлять какой-то из префиксов или нет.  
По умолчанию он пуст, так что это означает, что никакого префикса добавлено не будет, если не задан локальный префикс.

```javascript
render() {
  return (
    <div class=".thing">
      ...
    </div>
  )
}
```

станет 

```javascript
render() {
  return (
    <div className="awesome-example-app-thing">
      ...
    </div>
  )
}
```
Точка значит, что имя класса должно иметь префикс.  
Подробнее о синтаксисе парсера представлено ниже.

### delimiter

Символ или слово, которыми префиксы и имена классов будут объединяться.  
По умолчанию равен "-".

```javascript
render() {
  return (
    <div class=".some-item">
      ...
    </div>
  )
}
```

Так что, если наш **"delimiter"** равен "\_", код будет таким:

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

Если данный параметр задан, лоадер попытается определить локальный префикс самостоятельно.  
По умолчанию он не задан.  
Есть три варианта значений:  

#### `prefixAutoResolving: "content"`
Для начала лоадер попытается найти строку, которая содержит:  
**export default (class|function) MySuperClassName**    
  
Затем будет искать:  
**export default connect(...)(MySuperClassName)**  
  
Если не найдет:  
**class MySuperClassName**    
  
Ну и в конце концов возьмет первую попавшуюся строку с таким кодом:  
**function MySuperClassName**    
  
Итак "MySuperClassName" будет преобразовано в локальный префикс "my" + delimiter + "super" + delimiter + "class" + delimiter + "name".  

Для CSS файлов лоадер будет искать данные в кэше, который заполняется при обработке JS файлов.  
Если в кэше найдется информация о префиксах для индексного файла в той же директории,  
они будут использованы, таким образом JS и CSS будут синхронизированы.  
Вам следует располагать JS лоадеры перед CSS лоадерами, чтобы парсер имел нужный кэш.

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

станет

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
Также вы можете задавать JS/CSS локальные префиксы с помощью специальных директив.  
Больше о них написано ниже.
  
#### `prefixAutoResolving: "file"`
Лоадер будет формировать локальный префикс из имён JS/CSS файлов:  
"SuperItem.js" или "super-item.js" или "super_item.js"  
превратится в префикс "super" + delimiter + "item".  
Для данного способа файлы должны называться одинаково, чтобы они были синхронизированы.

#### `prefixAutoResolving: "folder"`
Лоадер будет формировать локальный префикс из имён директорий:  
"SuperItem/index.js" или "super-item/some.js" или "super_item/any.js"  
станут префиксом "super" + delimiter + "item".  
Самый простой способ синхронизировать JS/CSS, также ваша структура будет более понятна.

### obfuscation

Если установлен в true, лоадер будет обфусцировать имена классов в JS и CSS файлах.  
Будьте внимательны, все CSS классы будут изменены в любом случае, а JS только внутри атрибутов **"attributeName"** and **extraAttributeName**.  
По умолчанию эта опция не активна.

```javascript
render() {
  return (
    <div class=".button small">
      ...
    </div>
  )
}
```
станет

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

Длина в символах, до которой имена классов будут обфусцированы.  
По умолчанию значение равно "7".  
  
Так что, если у нас **"obfuscatedLength"** равно 4

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

Лоадер будет автоматически добавлять префиксы к нашим именам классов.  
Вам нужно будет использовать немного другой строковый формат имен классов.  
По умолчанию этот параметр выключен.  
  
Например, вот это запись CSS классов для неавтопрефиксного режима:  
(**"prefixAutoResolving"** имеет значение "content")

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
будет преобразовано в

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

Здесь локальный префикс является "awesome-example-app-container" (глобальный префикс плюс добавленный автоматически от имени класса "Container").  
Так что в этом режиме вам нужно добавлять точки для префиксов: одна для локального и две для глобального.  
  
И наконец пример описания CSS классов для автопрефиксного режима  
(**"prefixAutoResolving"** имеет значение "content")  
В результате мы получим то же самое, что и в первом случае.

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
будет также

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
В этом режиме не нужно добавлять точку для локального префикса, одну нужно добавить для глобального и две для имен классов без префикса.  
  
В CSS файлах все работает по тем же принципам (нужно добавлять такое же число точек, так что получится максимум три точки)  
  
Неавтопрефиксный режим:

```scss
/* Директива, которая задает наш локальный префикс (добавляет дополнительный префикс к глобальному) */
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

будет

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

И то же самое для автопрефиксного режима:

```scss
/* Директива, которая задает наш локальный префикс (добавляет дополнительный префикс к глобальному) */
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

даст тот же самый результат

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

## Директивы

### JS директивы

<ul>
<li>
<h3>with prefix 'some-prefix';</h3>
Создает локальную версию глобального префикса, которая переопределяет его в рамках одого файла.  
Две точки всё так же будут добавлять стандартный глобальный префикс определенный в конфиге.
</li>
</ul>

```javascript
// неавтопрефиксный режим
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

станет

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

А теперь результат для случая, когда **"prefixAutoResolving"** установлен в false,  
так что у нас нет добавленного локального префикса,  
только переопределенный глобальный

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
Всё то же самое, как и с директивой выше, плюс устанавливает автопрефиксный режим в пределах данного файла.
</li>
</ul>

<ul>
<li>
<h3>with addedPrefix 'some-additional-prefix';</h3>
Задает добавленный префикс для локального использования.  
Эта директива делает что-то вроде параметра **"prefixAutoResolving"**, так что найдя ее лоадер  
не будет определять префикс автоматически.
</li>
</ul>

```javascript
// неавтопрефиксный режим
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

будет

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
Всё то же самое, как для директивы выше, плюс устанавливает автопрефиксный режим в пределах данного файла.
</li>
</ul>

<ul>
<li>
<h3>with auto prefix;</h3>
Устанавливает автопрефиксный режим в пределах данного файла.
</li>
</ul>


### CSS директивы

CSS директивы делают абсолютно то же самое и выглядят весьма схоже с JS версиями,  
отличие только в последней директиве, которой нет для JS файлов

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
Предписывает лоадеру не добавлять ни каких префиксов, даже если есть ".." / "..."  
Две или три точки будут восприниматься как одна.
</li>
</ul>
  

## Синтаксис строковых обозначений CSS классов

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
Обозначает имя класса без префиксов в неавтопрефиксном режиме.  
Обозначает имя класса с локальным префиксом в автопрефиксном режиме.
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
Обозначает имя класса с локальным префиксом в неавтопрефиксном режиме.  
Обозначает имя класса с глобальным префиксом в автопрефиксном режиме.
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
Обозначает имя класса с глобальным префиксом в неавтопрефиксном режиме.  
Обозначает имя класса без префиксов в автопрефиксном режиме.
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
"Мерджит" имя класса или массив имен из переменной.  
Лоадер автоматически добавит "импорт" нужного для "мерджинга" модуля.  
Переменная уже должна содержать имя/имена классов с префиксами или быть обфусцирована.
```javascript
render() {
  return (
    <div className={classy(name)}>
      ...
    </div>
  )
}
```
Пример того, как это в принципе работает:  
  
В родительском компоненте используем **extraAttributeName: "classes"**
```javascript
render() {
  return (
    <Icon classes="..large green">
      resize
    </Icon>
  )
}
```
в дочернем (с именем Icon)
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
так что в итоге получим  
  
в родителе:
```javascript
render() {
  return (
    <Icon classes="awesome-example-app-large green">
      resize
    </Icon>
  )
}
```
в компоненте Icon "import" автоматически добавлен
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
А так код будет выглядеть в собранном "бандле":
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
То же самое, что и с переменной выше, но говорит лоадеру, что переменная является строкой, а не массивом или "undefined",  
чтобы лоадер не использовал функцию мерджинга, однако если есть другие переменные вида $name, функция все равно будет использована
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
станет
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
Добавляет локальный (по отношению к дочернему компоненту) префикс к имени класса.  
Возьмем пример с Icon выше и немного изменим его.
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
В принципе можно просто использовать запись вида ".icon-thing",  
но первый вариант соединит их нужным разделителем.
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
Так что у нас будет такой HTML
```html
<i className="awesome-example-app-icon awesome-example-app-large green material-icons">
  <span class="awesome-example-app-icon-thing">
    resize
  </span>
</i>
```

### .$name
Динамическое имя класса, локальный префикс плюс значение переменной.  
Это всегда локальный префикс независимо от режима.
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
будет
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
Динамическое имя класса, глобальный префикс плюс значение переменной.  
Это всегда глобальный префикс независимо от режима.
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
будет
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

Невозможно (или просто х.з. как) обфусцировать такой динамический класс,  
но для таких целей внедрена специальная "фейковая" функция **$classy**.  
Она создают "карту" имен классов для обфускатора.  
  
Вот пример:
```javascript
let className = $classy(color, '..color-', ['red', 'green']);
className = $classy(number, '.color-', ['blue', 'yellow']);
className = $classy(number, '..', ['one', 'two']);
className = $classy(quality, '.', ['good', 'bad']);
className = $classy(name, '', ['John', 'Rick']);
```
В неавтопрефиксном режиме будет преобразовано в:
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
И в автопрефиксном режиме будет:
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
Так что переменная "className" будет реальным именем класса, которое можно обфусцировать и иметь вид:
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
Другой способ для этих нужд, но уже c различными "паттернами":
```javascript
let className = $classy(colorValue, {
  red: "..red item::reddish",
  green: "..green ..greenish",
  ...
});
```
Даст код:
```javascript
let className = {
  red: 'awesome-example-app-red awesome-example-app-item-reddish',
  green: 'awesome-example-app-green awesome-example-app-greenish',
  ...
}[colorValue];
```
Ну и последнее как можно использовать **$classy**:
```javascript
with addedPrefix 'catalog';
// ....
let className = $classy(".item item ..some-item $classes");
```
станет
```javascript
import classy from 'classy-loader/classy';
// ....
let className = classy("awesome-example-app-catalog-item", "item", "awesome-example-app-some-item", classes);
```
## Условные (тернарные) записи CSS классов

### Для начала простые
```javascript
// все примеры с globalPrefix = 'app'
// все примеры с autoPrefixMode = false
// все примеры когда addedPrefix = 'item'

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
станет
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
Можно добавлять пробелы между символами "?" и ":" 
```javascript
render() {
  return (
    <div class="$active ? active : inactive">
      ...
    </div>
  )
}
```
Но вот в условии пробелы недопустимы:
```javascript
render() {
  return (
    <div class="$active === true ? active : inactive">
      ...
    </div>
  )
}
```
Такая запись будет преобразована в некорректное имя класса вида
```javascript
render() {
  return (
    <div className="1 === true active inactive">
      ...
    </div>
  )
}
```
Если так хочется добавить пробелы, оберните условие в круглые скобки
```javascript
render() {
  return (
    <div class="$(active == 'something') ? active : inactive">
      ...
    </div>
  )
}
```
Возможно указывать только один знак "$" в начале условия, для остальных переменных условия можно не добавлять:
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

## И наконец вишенка на торте
```javascript
render() {
  return (
    <div class="$?active $?.active $?..active">
      ...
    </div>
  )
}
```
будет
```javascript
render() {
  return (
    <div className={classy(active ? "active" : "", active ? "local-prefix-active" : "", active ? "global-prefix-active" : "")}>
      ...
    </div>
  )
}
```
Точки работают по таким же принципам, как и всегда, в зависимости от режима.

## CSS синтаксис

### Для неавтопрефиксного режима
Одна точка для реальных имён классов без префиксов.  
Две точки для имён с локальным префиксом.  
Три точки для имён с глобальным префиксом.  
**"Self"** - ключевое слово обозначающее локальный или глобальный префикс, если таковые определены, иначе имя класса будет просто self

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

### Для автопрефиксного режима
Одна точка для имён классов с локальным префиксом.  
Две точки для имён с глобальным префиксом.  
Три точки для реальных имён классов без префиксов.

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

Если локальный префикс не определен, будет использован глобальный.

## А теперь немного CSS сахара

Пример сахарного синтаксиса:
```scss
.container {
  var .abs.w100.h200.bc-000.c-fff.fs15;
}
```
будет преобразовано в:
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
Можно также с пробелами:
```scss
.container {
  var .fix .l .r .t .b .z999 .o3;
}
```
станет
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
Выражение должно начинаться с ключегово слова **"var"** и заканчиваться точкой с запятой или переносом строки.

### Полный список доступных сокращений

<details>
<summary>Кликни меня</summary>  
  
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

### Сокращения для фоновых изображений

Тут все посложнее, и для начала нужно определить источник(и) файлов.  
Для этих нужд имеются директивы, их может быть несколько, если файлы располагаются в разных директориях.  
Путь конечно же к директория:

```scss
.with.image.source '../../assets/images/';
.with.image.source './bg-images';
.with.image.source './images/gifs';
.with.image.source '../svgs';
```
А сокращения выглядяь так:
```scss
.item {
  var .png-arrow.jpg-bg.jpeg-line.png2-some-image;
  var .gif3-preloader.svg4-icon;
}
```
Итак сокращение состоит из:  
1. Расширение  
2. Номер источника начиная с единицы (если это первый источник, цифру можно опустить)  
3. Имя файла  
    
Так что на выходе вы получите такую запись:

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
Дальше уже дело за лоадерами картинок, пути указаны для них.  
  
Итак список сокращений:  

<details>
<summary>Меня кликни</summary>  

**png-png-filename** = background-image: url(../some/path/png-filename.png);  
**jpg-jpg_filename** = background-image: url(../some/path/jpg_filename.jpg);  
**jpeg-oneMoreJpgFilename** = background-image: url(../some/path/oneMoreJpgFilename.jpeg);  
**gif-giffy** = background-image: url(../some/path/giffy.gif);  
**svg-blabla** = background-image: url(../some/path/blabla.svg);  
  
Конечно же можно добавить номер источника:  
  
**png2-a** = background-image: url(../path/to/second/source/a.png);  
**gif33-d** = background-image: url(../path/to/33-th/source/d.gif);  
  
Эти две строки идентичны:  
  
**jpg-e** = background-image: url(../path/to/first/source/e.jpg);  
**jpg1-e** = background-image: url(../path/to/first/source/e.jpg);  
</details>