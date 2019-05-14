[Visual Studio Code](https://code.visualstudio.com/)（以下简称vscode）是现在非常流行的一款编辑器，相信很多人都在用或者用过，至少也是听说过。不同于[WebStorm](https://www.jetbrains.com/webstorm/)这样的IDE大而全但稍显笨重，vscode算是比较小巧快速的了，虽然还比不上[Sublime Text](http://www.sublimetext.com/)，但是毕竟自带了调试，GIT管理，简单的代码提示等功能，体积大一点也是可以理解的，反正前端开发是比较推荐使用vscode作为首选编辑器的。   
vscode的大部分功能都是通过扩展插件来实现的，安装这些扩展可以给我们提供丰富的功能，但是要注意插件装的越多越吃性能，这点需要大家按照自己的需求和电脑配置去取舍，不是装得越多就越好。   
大部分使用vscode的人都或多或少的使用过如[eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)（代码检查），[Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)（格式化代码），[GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)（git增强）等必备扩展，讲究一点的人还会选择安装一些代码主题和图标主题。但是我相信很多人只是安装使用，并没有自己开发过扩展插件，今天我就跟大家一起动手开发一个vscode扩展。 
## 需求说明
这里例子不是一个简单hello world展示页，而是一个工作中真实的需求，由于公司的一个项目中会大量的复制粘贴一些文案，在一些英文句子中如果出现了中文标点，写文案的人就会扯皮，说是前端自己写错了（明明都是复制粘贴的），即使找出证据是写文案的错，也会说我们为什么开发的时候没检查出来改掉。秉着前端永不背锅的态度，我决定开发一个扩展来处理这个问题，功能大概就是，检测文件中'' "" ``之间的字符串，如果是纯英文字符串（不出现中文字符）但是出现了中文标点就标记出来，成品效果如下。
![演示](./image/vscode.gif)
## 源代码
git地址[https://github.com/hoc2019/vscode-sneak-mark](https://github.com/hoc2019/vscode-sneak-mark)   
vscode商店中搜[sneak mark](https://marketplace.visualstudio.com/items?itemName=wangzy.sneak-mark)也可以找到。
![演示](./image/sneak-mark.png)

## 准备工作
node环境，如果要发布的话要有一个git仓库和微软账号，编辑器肯定是用vscode,方便调试。因为vscode是基于[Electron](https://electronjs.org/)开发，所以插件也是用Javascript来写（官方更推荐用Typescript），对前端非常友好。   
有人可能会担心太难，其实大可不必，本来我也觉得开发一个扩展很难，但是前段时间vscode出现的[杨超越鼓励师](https://marketplace.visualstudio.com/items?itemName=formulahendry.ycy)和[坤坤鼓励师](https://marketplace.visualstudio.com/items?itemName=sakura1357.cxk)这样的粉丝向扩展，让我觉得扩展开发应该是一个挺随意的事（顺便一提，坤坤鼓励师说明配的那是个什么图和文字，而且搜索关键词竟然有鸡你太美，作者怕是个黑粉）。
