在刚开始使用babel的时候，相信很多同学应该和我一样，对于babel的使用配置一知半解，babel相关的包@babel/core，@babel/cli，babel-loader，@babel/polyfill，@babel/plugin-transform-runtime，@babel/runtime何时引入又有什么作用和区别会感到疑惑。这篇文章的目的就是帮助还没使用或刚刚使用babel的同学快速了解这些内容，游刃有余的使用babel这个强大的工具。  
对于想要更深入了解babel的推荐官方的文档：[中文](https://www.babeljs.cn)，[英文](https://babeljs.io/)。  

**说明：本文使用babel版本为7，webpack版本为4，不同版本安装和配置存在差异。**
## 什么是babel
babel是一个Javascript编译器，是目前前端开发最常用的工具之一，主要用于将 ECMAScript 2015+ 版本的代码转换为向后兼容的 JavaScript 语法，以便能够运行在当前和旧版本的浏览器或其他环境。比如在代码中使用了ES6的箭头函数，这种写法在IE里面是会报错的，为了让代码能在IE中运行，就需要将代码编译成IE支持的写法，这就是babel的工作。
```javascript
const fn = arg => {
    console.log(arg);
};

//babel转换后

"use strict";

var fn = function fn(arg) {
  console.log(arg);
};

```
## 使用方式
1. 命令行工具中使用  
```shell
// 在项目中执行
npm i @babel/core @babel-cli -D
```
安装之后，就可以在package.json的scripts中执行babel的脚本命令了。当然也可以全局安装，这样可以在命令行工具中直接使用babel命令，但是并不推荐。
```json
{
  "scripts": {
    "build": "babel src -d dist"
  }, 
}
```
接着命令行执行npm run build，babel就会将src文件夹中的文件编译好，并输出到lib文件夹。


2. webpack中使用   

比起直接用命令行命令，现在我们的项目通常都使用了打包工具，如果可以将babel和打包工具结合，在打包时自动调用babel编译代码那就更加方便。这里以webpack为例，在webpack中如果想使用babel的编译功能，需要安装babel-loader。
```shell
npm i @babel/core babel-loader -D
```
然后在webpack的配置文件中，配置用babel-loader来加载处理js文件。
```javascript
// webpack.config.js
const path = require('path');
module.exports = {
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
        ]
    }
};
```
3. 更多使用方式

babel还提供了很多其他使用方式，比如直接配合编辑器使用，或者别的打包工具比如Gulp，Grunt之类的，更多方法可以去[官网](https://www.babeljs.cn/setup#webpack)查到。  

**说明：@babel/core是babel7版本的基础包，是必须引入的。**

## 配置 
使用方法很简单，但只是这样还不够，现在执行babel编译，会发现编译是成功的，但是编译后的内容和编译前没有任何区别，那是因为我们没有告诉babel要怎么去编译，编译哪些内容，我们需要一个配置文件来告诉babel如何工作。   
配置文件的方式有以下几种：
1. 在package.json中设置babel字段。
2. .babelrc文件或.babelrc.js
3. babel.config.js文件  
   
第1种方式不用创建文件，package.json加入babel的配置信息就行。

```javascript
//package.json
{
   "name":"babel-test",
   "version":"1.0.0",
   "devDependencies": {
       "@babel/core":"^7.4.5",
       "@babel/cli":"^7.4.4",
       "@babel/preset-env":"^7.4.5"
   }
   "babel": {
       "presets": ["@babel/preset-env"]
   }
}

```

第二种.babelrc和.babelrc.js是同一种配置方式，只是文件格式不同，一个是json文件，一个是js文件。   

.babelrc  
```json
{
    "presets": ["@babel/preset-env"]
}
```
.babelrc.js  
```javascript
//webpack的配置文件也是这种写法
module.exports = {
    presets: ['@babel/preset-env']
};
```
这两个配置文件是针对文件夹的，即该配置文件所在的文件夹包括子文件夹都会应用此配置文件的设置，而且下层配置文件会覆盖上层配置文件，通过此种方式可以给不同的目录设置不同的规则。  
而第3种babel.config.js虽然写法和.babelrc.js一样，但是babel.config.js是针对整个项目，一个项目只有一个放在项目根目录。  

**注意1：.babelrc文件放置在项目根目录和babel.config.js效果一致，如果两种类型的配置文件都存在，.babelrc会覆盖babel.config.js的配置。** 

**注意2：在package.json里面写配置还是创建配置文件都没有什么区别，看个人习惯。react官方脚手架create-react-app创建的react项目babel配置是写在package.json里面的，而vue官方脚手架@vue/cli创建的vue项目，则是通过babel.config.js设置。**

## Plugins和Presets
有了配置文件，接下来就是要通过配置文件告诉babel编译哪些内容，然后还要引入对应的编译插件（Plugins），比如上面讲到的箭头函数的转换需要的是[@babel/plugin-transform-arrow-functions](https://www.babeljs.cn/docs/babel-plugin-transform-arrow-functions)这个插件，我们通过npm安装这个包之后在配置里面进行设置。
```shell
npm i @babel/plugin-transform-arrow-functions -D
```
```js
// babel.config.js
module.exports = {
    plugins: ['@babel/plugin-transform-arrow-functions']
};
```
现在我们代码中的箭头函数就会被编译成普通函数，但是有个问题，我们总不能一个个的引入这些插件，来对应转化我们用到的每个新特性，这是非常麻烦的，于是有了一个东西叫做预设（Presets）。  
 
预设其实就是一个预先设定的插件列表，使用一个预设就是将这个预设规定的全部插件安装并使用，比如预设[@babel/preset-es2015](https://www.npmjs.com/package/@babel/preset-es2015)，这个预设就包含了@babel/plugin-transform-arrow-functions，以及其他es2015新特性的转换插件，像for-of，class，模板字符串等。我们只用通过npm安装这个预设包，并像下面这样设置，就可以在我们的代码中随意使用这些es2015的新特性，编译时babel会将这些代码转换成低版本浏览器也能识别兼容的代码。
```shell
npm i @babel/preset-es2015 -D
```
```js
// babel.config.js
module.exports = {
    presets: ['@babel/preset-es2015']
};
```
**注意：babel不光支持新语法特性的转换，react，vue的语法也是通过babel转换的，比如react项目可以使用preset-react。**
## preset-env
preset虽然已经大大方便了我们的使用，但是如果我们还想使用更新一些的语法，比如es2016的**（相当于pow()）,es2017的async/await等等，我们就要引入@babel/preset-es2016，@babel/preset-es2017之类的，而且随着js语法的更新，这些preset会越来越多。于是babel推出了babel-env预设，这是一个智能预设，只要安装这一个preset，就会根据你设置的目标浏览器，自动将代码中的新特性转换成目标浏览器支持的代码。   

还以转化箭头函数举例，npm安装@babel/preset-env并配置。
```shell
npm i @babel/preset-env -D
```
```js
// babel.config.js
module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    chrome: '58'
                }
            }
        ]
    ]
};
```
编译后我们会发现箭头函数并未被转换成普通函数，那是因为我们设置目标浏览器支持到chrome58，chrome58是原生支持箭头函数的，所以箭头函数就并未被转换，如果我们将目标浏览器设置为支持ie9,由于ie9并不支持箭头，编译后就会发现箭头函数被转换成了普通函数。 

目标浏览器版本设置方式详情可参考[browserslist](https://github.com/browserslist/browserslist#queries),
浏览器特性支持可查询[caniuse](https://caniuse.com/)。   

**注意1：即使不设置targes，也会有一个默认值，规则为 > 0.5%, last 2 versions, Firefox ESR, not dead。**   
**注意2：官方推荐使用preset-env。**

## plugin-transform-runtime和runtime

当我在用babel编译时，有些功能需要一些工具函数来辅助实现，比如class的编译。
```javascript
class People{
}

// babel编译后
'use strict';

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}

var People = function People() {
    _classCallCheck(this, People);
};

```
编译后的代码中，_classCallCheck就是一个辅助功能实现的工具函数。如果多个文件中都用到了class，每一个文件编译后都生成一个工具函数，最后就会产生大量重复代码，平白增加文件体积。而plugin-transform-runtime就是为了解决这个问题，这个插件会将这些工具函数转换成引入的形式。   
```
npm i @babel/plugin-transform-runtime -D
```
```js
module.exports = {
    presets: ['@babel/preset-env'],
    plugins: ['@babel/plugin-transform-runtime']
};
```
安装设置完成之后再用babel编译结如下：
```javascript
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var People = function People() {
  (0, _classCallCheck2["default"])(this, People);
};
```
_classCallCheck2这个工具函数已经变成从一个npm包中引入，不会再产生单独的工具函数代码。但是可以看到工具函数是从@babel/runtime这个包中引入，所以要安装@babel/runtime这个依赖包，在项目打包的时候才不会报错。
```shell
npm i @babel/runtime
```
**注意:babel/runtime并不是开发依赖，而是项目生产依赖。编译时使用了plugin-transform-runtime，你的项目就要依赖于babel/runtime，所以这两个东西是一起使用的。**   

## babel-polyfill
babel可以转化一些新的特性，但是对于新的内置函数（Promise,Set,Map），静态方法（Array.from,Object.assign），实例方法（Array.prototype.includes）这些就需要babel-polyfill来解决，babel-polyfill会完整模拟一个 ES2015+环境。  

比如你的代码中用到了Array.from，但是目标浏览器不支持Array.from，引入babel-polyfill就会给Array添加一个from方法，代码执行的时候使用的Array.from其实是babel-polyfill模拟出来功能，这样虽然污染了Array的静态方法，但是确实实现了兼容。
之前的使用方式是npm安装@babel/polyfill，并在项目入口处引入@babel/polyfill包。
```shell
npm i @babel/polyfill
```
```javascript
// entry.js
import "@babel/polyfill";
```

但是这种方式已经被废弃不推荐使用，因为@babel/polyfill体积比较大，整体引入既增加项目体积，又污染了过多的变量，所以更推荐使用preset-env来按需引入polyfill。
```javascript
// babel.config.js
module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                useBuiltIns: 'usage', // usage-按需引入 entry-入口引入（整体引入） false-不引入polyfill
                corejs: 2  // 2-corejs@2  3-corejs@3
            }
        ]
    ]
};
```
corejs 是一个给低版本的浏览器提供接口的库，也是polyfill功能实现的核心，此处指定的是引入corejs的版本，需要通过npm安装指定版本的corejs库作为生产依赖。 
```shell
npm i core-js@2
```
之后执行babel编译可以看到如下效果：
```javascript
const a = Array.from([1])

//babel编译后
"use strict";

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

var a = Array.from([1]); 

```
可以看到在使用Array.from之前，提前从core-js引入了相应的polyfill，根据文件名，我们大概猜到它们的功能是什么。  

## plugin-transform-runtime和babel-polyfill的讨论
上面说了plugin-transform-runtime主要是负责将工具函数转换成引入的方式，减少重复代码，而babel-polyfill则是引入相关文件模拟兼容环境。babel-polyfill有一个问题就是引入文件会污染变量，其实plugin-transform-runtime也提供了一种runtime的polyfill。   
我们将配置文件修改一下。
```javascript
module.exports = {
    plugins: [['@babel/plugin-transform-runtime', { corejs: 2 }]]
};
```
这里的corejs和presets里设置的corejs是不同的，这个地方的corejs是指定了一个叫runtime-corejs库的版本，使用时也需要用npm安装对应的包。
```
npm i @babel/runtime-corejs2
```
然后执行一下babel编译看一下区别。
```javascript
const a = Array.from([1])

//babel编译后
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _from = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/array/from"));

var a = (0, _from["default"])([1]);

```
可以看到，此方法和使用babel-polyfill的区别是，并没有改变Array.from,而是创建了一个_from来模拟Array.from的功能，调用Array.from会被编译成调用_from，这样做的好处很明显就是不会污染Array上的静态方法from，plugin-transform-runtime提供的runtime形式的polyfill都是这种形式。 

经过我的测试，除了实例上的方法如Array.prototype.includes这种的，其它之前提到的内置函数（Promise,Set,Map），静态方法（Array.from,Object.assign）都可以采用plugin-transform-runtime的这种形式。 

然后我就想，既然这种形式不会污染变量，那当然能用就用这种了，但是群里问了一下后，大佬们给出了一个看法（感谢大佬justjavac和小时哥的说明）。
>runtime 不污染全局变量，但是会导致多个文件出现重复代码。   
>写类库的时候用runtime，系统项目还是用polyfill。   
>写库使用 runtime 最安全，如果我们使用了 includes，但是我们的依赖库 B 也定义了这个函数，这时我们全局引入 polyfill 就会出问题：覆盖掉了依赖库 B 的 includes。如果用 runtime 就安全了，会默认创建一个沙盒,这种情况 Promise 尤其明显，很多库会依赖于 bluebird 或者其他的 Promise 实现,一般写库的时候不应该提供任何的 polyfill 方案，而是在使用手册中说明用到了哪些新特性，让使用者自己去 polyfill。   

话说的已经很明白了，该用哪种形式是看项目类型了，不过通常对于一般业务项目来说，还是plugin-transform-runtime处理工具函数，babel-polyfill处理兼容。

## 最后总结
| 包名                            | 功能                           | 说明                                                                             |
| ------------------------------- | ------------------------------ | -------------------------------------------------------------------------------- |
| @babel/core                     | babel编译核心包                | 必装开发依赖                                                                     |
| @babel/cli                      | 命令行执行babel命令工具        | 非必装开发依赖，packages.json的script中使用了babel命令则需安装                   |
| babel-loader                    | webpack中使用babel加载文件     | 非必装开发依赖，webpack项目中使用                                                |
| @babel/plugin-*                 | babel编译功能实现插件          | 开发依赖，按照需要的功能安装                                                     |
| @babel/preset-*                 | 功能实现插件预设               | 开发依赖，按照需要的功能安装，js语言新特性转换推荐使用preset-env                 |
| @babel/plugin-transform-runtime | 复用工具函数                   | 非必装开发依赖，和@babel/runtime同时存在                                         |
| @babel/runtime                  | 工具函数库                     | 非必装生产依赖，和@babel/plugin-transform-runtime同时存在                        |
| @babel/polyfill                 | 低版本浏览器兼容库             | 非必装生产依赖，已不推荐使用，推荐通过preset-env的useBuiltIns属性按需引入        |
| core-js@*                       | 低版本浏览器兼容库             | 非必装生产依赖，通过preset-env引入polyfill需安装此包，并通过corejs指定版本       |
| @babel/runtime-corejs*          | 不污染变量的低版本浏览器兼容库 | 非必装生产依赖，plugin-transform-runtime设置开启后，可以不污染变量的引入polyfill |

babel使用的相关内容基本就这些了，至于babel编译内部实现原理感兴趣的可以深入研究，也可以自己写一些babel的plugins和preset发布到npm上供大家使用，希望看完此文能对大家理解和使用babel有一点帮助。   

能力一般，水平有限，欢迎大家多多指正讨论。


 