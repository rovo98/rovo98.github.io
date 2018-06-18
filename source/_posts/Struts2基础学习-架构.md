---
title: Struts 2基础学习 - 架构
author: rovo98
date: '2018.4.11 14:00:01'
categories:
  - Java框架学习
  - Struts 2
tags:
  - 学习笔记
  - struts 2
abbrlink: 4fe73428
---

> 从高层面来看， Struts 2 是一个纯粹的 MVC (或MVC2)框架，Struts 2使用以下的五个核心部分来实现 Model-View-Controller(MVC) 模式：
> - Actions
> - Interceptors
> - Value Stack / OGNL
> - Results / Result types
> - View technologies

<!-- more -->

### 概述

相比于传统的 ```MVC``` 框架， ```Struts 2``` 略有不同， 这是因为```Struts 2```中的 ```action```更多的是扮演```model```的角色， 而不是 ```controller```,虽然这其中有一些重叠的地方。

![](struts_2_architecture.gif)

上面的图描述了```Struts 2```架构中的```Model```, ```View```和```Controller```。```controller```由```Struts 2```的```dispatch servlet filter```(Servlet分发过滤器) 和 ```interceptors```(拦截器)，```actions```实现```Model```, 视图```view```由```result types 和 results``` 实现。值栈(```Value Stack```)和 ```OGNL``` 提供通用线程，链接和启用其他组件之间的集成。

除了上述的组件外， 还有大量的关于配置的消息(**information**)， 对Web 应用程序的配置， 对```actions```的配置，以及```interceptors,results```等等的配置。

### Request 生命周期

基于上面的图，我们可以了解到在Struts 2工作流中的用户请求的生命周期是这样的：

1. 用户向服务器发送一个资源(例如: 页面)请求；
2. Struts 2 的 Dispatcher Filter 拦截请求，并选择合适Action；
3. 执行已配置的```interceptors```(拦截器)的功能， 例如： 表单验证，文件上传等；
4. 基于请求操作，调用并执行已选择的```action```；
5. 同样，如果需要，配置的拦截器可用于进行任意的后期处理；
6. 最后，将由```view```准备的结果(result)返回给用户。

