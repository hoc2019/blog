## 什么是Node

Node.js® is a JavaScript runtime built on Chrome's V8 JavaScript engine.   

浏览器是javascript的运行平台，脱离了浏览器就无法运行javascript代码，Node也是一个javascript运行平台，基于chrome v8 引擎构建。

## 什么是v8引擎

v8引擎是google出品的js引擎。
编译型语言：在执行时已经完成编译。
解释型语言：一边解析一边执行。

js引擎就是用来解析执行的，所以也叫js解释器。

- IE Edge Chakra 
- Safari JavaScript Core 
- Firefox SpiderMonkey
- chrome V8

## 渲染引擎

将网页代码渲染为用户视觉可以感知的平面文档，内核一般指的是渲染引擎。

- Firefox:Gecko 引擎   
- Safari:WebKit 引擎   
- Chrome:Blink 引擎   
- IE:Trident 引擎  
- Edge:EdgeHTML 引擎  

## node 版本

目前LTS（长期支持版）是10，Current（当前发布版）是12。

- 每6个月发布一个主要版本(即Major号变更)，作为Current版本
- 发布月份: 4月发布偶数版本，10月发布奇数版本
- 每12个月将一个版本转入LTS版本。对，只有偶数版本（一般是在其后续奇数版本发布时）
- LTS版本要经历两个阶段：活跃期（Active）与维护期（Maintenance)
活跃期(Active)共18个月，主要在不改变兼容性的情况下，周期性修改自身Bug与合并其他版本的重要修改
- 维护期（Maintenance)共12个月，只负责修改本版本的Bug以及特别紧急的如安全性问题

## node实例

### 用node搭建一个web服务器
