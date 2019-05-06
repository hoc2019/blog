不知从什么时候开始，网上非常流行面试类的技术文章，讲述某次失败或者成功的面试过程以及面试中被问到的题目，这些文章中的题目大部分都是松散零碎，毫无关联的。可能这些文章会帮助你了解到你不曾掌握的点，但仅仅就是了解，真的掌握仅仅只靠面试题是不够，就好比平时学习不努力，靠考前做几套名校试卷，或者模拟套题是不够的。  
虽然自己也未能免俗，收藏了一堆面试文章，但是还是更愿意看一些更有技术针对性的文章，甚至能自己写一篇。这是第一次写文，缘由是工作中的一个需求，多个项目需要共用一些组件，那么比较方便的做法就是将这些组件封成一个包，发布到 NPM 上。但是由于这些组件是公司自用，和公司业务紧密关联，不便于发布成公共包，虽然 NPM 现在也提供了私有包服务，但是由于某些不可抗拒的网络因素，即使付费可能也享受不到好的服务，所以考虑内部搭建一个 NPM 私有仓库。  
这篇文章就是这次搭建私有仓库涉及到的相关知识，总结之后发现是一个比较完整知识链，所以分享给大家，水平不高，能力有限希望大家多担待，本文参考了一些内容，也尽量保证都是自己亲自验证过的，如果有错误或疏漏欢迎大家指正。

## 1.从前端模块化说起

当我们现在用 JavaScript 大型单页应用以及服务端程序时，谁又能想到 JavaScript 这门语言在诞生之初目的只是为了替服务端完成一些输入验证操作。功能的复杂意味着代码量的提升，而模块化正是为了解决因此带来的维护困难，结构混乱，代码重复冗余等问题。很不幸的是在 ES6 之前，JavaScript 并不天然支持模块化编程。  
不过虽然 JavaScript 不支持模块化编程，但是我们可以通过对象，命名空间，立即执行函数等方法实现"模块"的效果，具体的一些方法可以参考阮一峰的：[Javascript 模块化编程（一）：模块的写法](http://www.ruanyifeng.com/blog/2012/10/javascript_module.html)。

### CommonJs 规范

这种情况直到 nodejs 出现，并参照 CommonJS 实现了模块功能才得到改善。  
在 nodejs 中我们可以很方便的导出和引入模块：

```javascript
// module.js
const name = 'wang';
const age = 18;
function showName() {
    console.log(wang);
}
function showAge() {
    console.log(age);
}

module.exports = {
    showName,
    showAge
};

// page.js
const module = require('./module.js');
module.showName(); // wang
module.showAge(); //18
```

### AMD 和 CMD 规范

但是 CommonJS 规范不适用于浏览器环境，不说浏览器没有 require 方法，服务端文件 require 一个包只是读取本地的一个文件，而客户端则是网络加载，网络加载速度和硬盘读写速度差距可不是一星半点，这种写法总不能让客户端 require 时假死在那里，前端处理这种问题的方法首先想到应该就是通过异步加载回调来处理。  
为了让浏览器支持模块化开发，于是出现了基于**AMD**规范的**RequireJS**和基于**CMD**规范的**SeaJS**  
它们的区别主要是（参考[知乎上 SeaJs 开发者玉伯的回答](https://www.zhihu.com/question/20351507/answer/14859415)）：

> 1.  对于依赖的模块，AMD 是提前执行，CMD 是延迟执行。不过 RequireJS 从 2.0 开始，也改成可以延迟执行（根据写法不同，处理方式不同）。CMD 推崇 as lazy as possible。
> 2.  CMD 推崇依赖就近，AMD 推崇依赖前置

写法如下：

```javascript
// CMD
define(function(require, exports, module) {
    var a = require('./a');
    a.doSomething();
    var b = require('./b'); // 依赖可以就近书写
    b.doSomething();
});

// AMD 默认推荐的是
define(['./a', './b'], function(a, b) {
    // 依赖必须一开始就写好
    a.doSomething();
    b.doSomething();
});
```

### ES6 的 modules 规范

JavaScript 多年以后终于在 ES6 时提出了自己的 modules 规范，写法如下

```javascript
//module.js
function showName() {
    console.log('wang');
}
function showAge() {
    console.log(18);
}

export { showName, showAge };

//page.js
import { showName, showAge } from 'module.js';

showName(); //wang
showAge(); //18
```

在 chrome61 之后可以通过给 script 标签加 type = 'module' 来使用此功能,代码如下：

```html
<script type="module" src="./module.js"></script>
<script type="module">
    import { showName } from './module.js';
    showName(); //wang
</script>
```

其中有一些要注意的点是，不论是被引入方还是被引入方都要设置 type='module',而且对路径也有一些要求，具体可以参考这篇文章[浏览器中的 ES6 module 实现](https://www.zcfy.cc/article/ecmascript-modules-in-browsers-2744.html)。

而在 node 中要使用 es module 要配合命令行参数--experimental-modules 和 mjs 文件后缀名。这个具体可以参考 nodejs 官方的[相关文档](https://nodejs.org/dist/latest-v10.x/docs/api/esm.html) 。  
由于是官方规范，所以普及的非常快，除了直接在 node 中使用不太方便，现在前端开发基本都参照此写法风格，事实说明一个道理，官方发力，碾压一切。

### webpack

有人会问 webpack 和它们是什么关系，这里总结一下。
CommonJS，AMD，CMD，ES Modules 都是规范，RequireJs，SeaJS 是分别基于 AMD 和 CMD 的前端模块化具体实现，是一种在线模块编译方案，引入这两个库后，就可以按照规范进行模块化开发。而 webpack 是一个打包工具，它是一种预编译模块方案，不管是上面哪种规范它都能够识别，并编译打包成浏览器认识的 js 文件，以实现模块化开。可能还有人听过 UMD，UMD 是 AMD 和 CommonJS 的糅合，解决跨平台的问题，具体就是它会判断是否支持 Node.js 的模块（exports 是否存在），存在则使用 Node.js 模块模式。
再判断是否支持 AMD（define 是否存在），存在则使用 AMD 方式加载模块，这种规范 webpack 也是能够识别的。

## 2.NPM

以前我们想要引入一个第三方包，一般是要将包文件下载下来放入到我们的项目中，然后在 html 中通过 script 标签引入，或者这个包有 CDN 服务，那么可以直接在 script 中引入这个包的 CDN 网络地址。这个过程是繁琐且低效的，那么有没有什么工具能够让我们方便的引入第三方包，那就是 npm。  
npm 可以理解为一个包的仓库，市场，人们可以将自己的代码在 npm 上发布，让别人可以下载分享，npm 本来是作为 nodejs 的包管理工具随同 nodejs 一起安装的，现在基本已经成为了整个前端标配的包管理工具，通过 npm 我们可以很方便的引入第三方包。因为很常用，就不多说了。

### npm cnpm yarn

[npm](https://www.npmjs.com/) 是我们最常用的包管理工具，但是在早期版本中存在一些缺陷：

1. 安装策略不是扁平化的，node_modules 中各自的依赖放到各自的文件夹下，导致目录嵌套层级过深，且会出现重复安装依赖。
2. 模块实例无法共享（跟第一条有关）
3. 安装速度慢（跟第一条也有关）
4. 依赖版本不明确（早期 npm 中是没有 package-lock 文件的）

目录结构大概是这个样子：

```
├── node_modules
│ └── moduleA
│  └── node_modules
│    └──moduleC
│ └── moduleB
│  └── node_modules
│    └──moduleC
└── package.json
```

[cnpm](https://npm.taobao.org/)  
是淘宝 NPM 镜像，官方的说法是

> 这是一个完整 npmjs.org 镜像，你可以用此代替官方版本(只读)，同步频率目前为 10 分钟 一次以保证尽量与官方服务同步。

它的出现解决了前三条问题，将所有的依赖置于 node_modules 下层，并添加软链接（快捷方式）。这也就是为什么通过 cnpm 安装你会在 node_modules 下发现很多文件夹快捷方式。而且由于 cnpm 的服务器是在国内，所以安装速度非常快，但是依然没有解决第四条问题。
目录结构大概是这个样子：

```
├── node_modules
│ ├── _moduleA@1.0.0
│ │ └── node_modules
│ │   └──moduleC
│ ├── _moduleB@1.0.0
│ │ └── node_modules
│ │   └──moduleC
│ │── _moduleC@1.0.0
│ │── moduleA  //软链接（快捷方式）moduleA@1.0.0
│ │── moduleB  //软链接（快捷方式）moduleB@1.0.0
│ └── moduleC  //软连接（快捷方式）moduleC@1.0.0
└── package.json
```

yarn 是一个非常牛逼的项目，曾经有一段时间它将 npm 按在地上摩擦，作为一个可替代 npm 的包管理器，它解决了 npm 的大部分痛点，又加入了一些自己的功能。

1. 扁平化安装策略，将所有依赖安装在 node_modules 下层
2. 并行下载，支持离线（这是速度快的重要原因）
3. yarn run 可以查找 node_modules/.bin 下的可执行命令
4. 通过 yarn.lock 文件明确依赖
5. 命令简单，输出简洁

这些优点让许多人纷纷投向 yarn 的怀抱（包括我），但是还是那句话官方发力，碾压一切。  
npm3 之后：

-   采用扁平化安装策略

npm5 之后：

-   加入 package-lock 文件
-   优化命令（npm i 安装一个包时不再需要--save 或者-S）
-   加入临时安装命令 npx
-   加入离线和缓存
-   安装速度也大幅提升

总之现在没有什么太多的理由让我们还能舍弃官方的包管理器而选择第三方。  
（此节参考了文章[为什么我从 npm 到 yarn 再到 npm?](https://segmentfault.com/a/1190000014716713)）

### package.json 及版本号

现代前端项目的根目录下面一般都会有一个 package.json 文件，它是在初始化项目的时候，通过 npm init 命令自动生成的，包含了这个项目所需的依赖和配置信息。

```json
//package.json
{
    "name": "demo",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "author": "",
    "license": "ISC",
    "dependencies": {
        "npmv-test": "^2.1.0"
    }
}
```

如上面文件展示，项目名称，作者，描述等不细说，主要来说一下 dependencies，dependencies 是项目依赖（还有 devDependencies 等，不展开细说），可以看到这个项目依赖了一个名为 npmv-test 的包，后面的^2.1.0,是描述版本范围，下面是关于这个版本号的相关的总结。

-   版本号一般格式为 x.y.z，解释为主版本.次要版本.补丁版本，一般更新原则为：
    1. 如果只是修复 bug，需要更新 z 位。
    2. 如果是新增了功能，但是向下兼容，需要更新 y 位。
    3. 如果有大变动，向下不兼容，需要更新 x 位。
-   如果省略 y 和 z 则相当于补 0，如 2 相当于 2.0.0，2.1 相当于 2.1.0。
-   版本号前没有描述符号表示按照指定版本安装，意味着写死了版本号，例如 2.0.0，可安装版本为 2.0.0。
-   版本号为一个\*表示可安装任意版本，一般为最新版本。
-   版本号前面有~：
    -   当有次要版本号时，固定次要版号进行升级。例如~2.1.3,可装版本为 2.1.z（z>=3）。
    -   如果没有次要版本号，则固定主版本号进行升级。例如~1，可安装版本为 1.y.z(y>0,z>0),和^1 行为一致。
-   版本号前面有^:
    -   固定第一个非 0 版本号升级，例如^2.1.3,则可装版本为 2.y.z(y.z>=1.3)。^0.1.3，则可装版本为 0.1.z(z>=3)。^0.0.3，则可装版本为 0.0.3。
-   在用 npm i 安装一个包时,package.json 中版本的描述符号默认设置为^（即使你指定版本号安装，此处依然会设置为^,而并非有些人认为的前面会不加描述符写死版本，除非是接下来说道这种情况）,但如果包的主版本和次要版本都为 0，如 0.0.3，这表示这个包处在不稳定开发阶段，会省略掉^，避免更新。

### package-lock.json

因为 package.json 中描述依赖包的版本都是范围，这就造成了一些不确定性，无法确保每次安装依赖的版本都一致，也无法在出问题时确定依赖包的版本，而 package-lock.json 就是的出现就是为了解决这个问题。这个文件详细的描述了依赖关系和依赖版本，可以说是 node_modules 文件夹结构和信息的一个快照，每次 node_modules 的变动都会导致 package-lock.json 的更新。  
这是上面 package.json 对应的 package-lock.json 文件，我们可以看下区别：

```json
{
    "name": "demo",
    "version": "1.0.0",
    "lockfileVersion": 1,
    "requires": true,
    "dependencies": {
        "ms": {
            "version": "2.1.1",
            "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.1.tgz",
            "integrity": "sha512-tgp+dl5cGk28utYktBsrFqA7HKgrhgPsg6Z/EfhWI4gl1Hwq8B/GmY/0oXZ6nF8hDVesS/FpnYaD/kOWhYQvyg=="
        },
        "npmv-test": {
            "version": "2.1.0",
            "resolved": "https://registry.npmjs.org/npmv-test/-/npmv-test-2.1.0.tgz",
            "integrity": "sha512-tNUwr+sdUek+lyJFmGT2H6Jox50NwA5EmNKAZTL3N5fYU1W7Aucfw+rNVsDinnQnhOF1hNvdU5RCUOvgcRWzng==",
            "requires": {
                "ms": "^2.1.1"
            }
        }
    }
}
```

这里有个问题就是，由于 package-lock.json 频繁变动，有些人会将 package-lock.json 文件排除在源码仓库的追踪之外。根据[官方文档](https://www.npmjs.cn/files/package-lock.json/)说法，是建议将该文件提交到源码仓库的，一个是为了项目每次安装的依赖版本一致，二是由于我们一般将 node_modules 排除在仓库之外，所以我们需要在出了问题时能够还原当时的 node_modules 情况。

### npm i 和 npm update

众所周知 npm i 加包名是安装一个包并添加到 package.json 的依赖中，如果 npm i 不加包名，则是安装 package.json 依赖中的所有包，而 npm update 对应的则是更新。但是有的时候可能会有一些疑惑，在执行 npm i 命令时好像也更新了包，有的时候 package.json 中的版本明明偏低但是执行 npm update 却没有更新，这些问题希望通过下面两张图可以帮助大家找打答案，这个两张图是只是为了帮助加理解，真实的执行过程顺序并不一定一致，有兴趣的朋友可以去看一下源码的实现。  
**npm i**

![](https://user-gold-cdn.xitu.io/2019/3/17/1698a66403b23538?w=966&h=808&f=png&s=72893)

**npm update**  

![](https://user-gold-cdn.xitu.io/2019/3/17/1698a66a7203fa7e?w=827&h=817&f=png&s=62189)

## 3.私有仓库的搭建

多个项目中重复使用的相同代码封装打包成为一个通用组件库，既避免了重复造轮子，也利于后期维护和管理，那么这个东西要怎么实现有这么一些方法。
首先既然是库，肯定是要将这些组件单独拎出来放到一个源码仓库里维护，如果你将这些组件直接打包发布到 npm 上，那么这就是一个 npm 公共包，谁都可以下载使用。但是如果不想这样，那么有下面这些方法（源码仓库为 git）：

1. 通过 git 子模块实现，直接将这个源码仓库作为子模块引入到你的项目，缺点很明显，子模块也是一个 git 项目，要手动更新，可修改上传，相当于在一个 git 项目里面又维护了一个 git 项目。
2. 通过 npm + git 实现，npm 是支持直接安装 git 资源的，优点是简单方便，缺点是要用 tag 来控制版本，而且如果是私有 git 仓库，要确保有访问权限，方法就是配置公钥或者直接使用带用户名和密码的仓库地址。
3. 通过搭建私有仓库实现。

这次我们选择的方案就是通过搭建私有仓库来实现，NPM 私有仓库的工作原理，大概就是将 NPM 命令注册地址指向我们的私有仓库，当我们通过 npm 命令进行安装时，如果在私有仓库中存在则从私有仓库中获取，如果私有仓库中没有则去配置的 CNPM 或者 NPM 官方仓库中获取。  
目前市面上比较常见的私有仓库搭建方法为：

-   通过 Sinopia 或 [verdaccio](https://github.com/verdaccio/verdaccio) 搭建（Sinopia 已经停止维护，verdaccio 是 Fork 自 Sinopia，基本上大同小异），其优点是搭建简单，不需要其他服务。
-   通过 [cnpm](https://github.com/cnpm/cnpmjs.org) 搭建，需要数据库服务，后期也支持了 redis 缓存（当 redis 设置了密码，访问好像有些问题），目前用的人最多,cnpm 推荐的是用 docker 作为容器。
-   通过 [cpm](https://cevio.github.io/cpm/) 搭建，应该是参考了 cnpm 的一些东西，和 cnpm 一样需要数据库服务和支持 Redis，页面比较清新，配置更简单一些，通过 PM2 进程守护。

它们具体的搭建方法都有相应的文档，上面的链接就指向文档地址，这里就不细说了,这三种方法我都跑过都是可行的，最后选择了 cpm，而且由于目前 cpm 用到人还不多，可以和开发者快速交流及时反馈问题，这里就打个广告，推荐一下[项目地址](https://github.com/cevio/cpm)。

## 最后

这篇文章的目的不是教大家怎么搭建一个私有仓库（这个是文档干的事），而是通过搭建一个私有仓库引出相关的内容并串联起来帮助整体理解，能展开的尽量展开，该点到为止的就点到为止。第一次写文章，发现比想象中的要累，但却很有成就感，欢迎大家多多批评指正。也感谢各个社区分享知识的作者，希望能向他们学习，分享更多的东西和大家讨论学习。   
（没有公众号二维码，也没有github要大家点赞，都散了吧）。
