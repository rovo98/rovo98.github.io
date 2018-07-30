---
author: rovo98
title: Struts 2基础学习 - Interceptors
date: '2018.4.11 14:06:12'
categories:
  - Java框架学习
  - Struts 2
tags:
  - Struts 2基础学习
  - 学习笔记
  - Java框架基础
abbrlink: '5e817364'
---

Interceptors(拦截器)在概念上同**servlet过滤器以及JDK动态代理类**一样。拦截器可以透切(crosscutting)``action``以及框架来实现一些特定的功能。例如：

1. 在action调用执行前，预先执行某些代码；
2. 在action调用和执行后，再次执行你指定的代码；
3. 用来捕捉异常，以便可以执行替代处理(alternate processing)。

<!-- more -->

事实上，**Struts 2**框架的许多特性都是使用拦截器实现的。例如： ``exception handling``, ``file uploading``, ``lifecycle callbacks``等等。因为**Struts 2**在拦截器上强调了它的大部分功能，因此不太可能为单个``action``分配7或8个拦截器。

### Struts 2框架拦截器

**Struts 2**框架提供了许多预先配置并且可以开箱即用的拦截器。下面是一些比较重要的拦截器：

|Interceptor|Description|
|:-----:|:------:|
|alias|允许参数(parameters)跨请求拥有不同的别名|
|checkbox|通过为未选中的复选框(check box)添加参数值false来协助管理复选框|
|conversionError|将字符串转换为参数类型的错误信息放入Action的字段错误中|
|createSession|自动创建一个HTTP session如果它没有存在|
|debugging|为开发人员提供几个不同的调式界面|
|execAndWait|当action在后台执行时，给用户提供一个等待页面|
|exception|将action引发的异常映射到result,并通过重定向自动处理异常|
|fileUpload|便于文件上传|
|i18n|在用户回话期间跟踪所选的语言环境|
|logger|通过输出被执行的action的名字来提供简单的日志信息|
|params|允许在action中设置request的参数|
|prepare|这是一个用来的做预处理工作的典型代表，例如：建立数据库连接|
|profile|允许为action记录简单的分析信息|
|scope|在session或application域中存储和检索action的状态|
|ServletConfig|提供可以访问各种基于servlet信息的action|
|timer|为action需要执行多少时间提供一个简单的分析信息|
|token|检查有效标记的action以防止重复的表单提交|
|validation|为action的提供验证支持|


### 如何使用拦截器？

我们可以直接在``struts.xml``配置文件中配置**Struts 2**已经提供的拦截器，例如使用``timer``拦截器来打印执行``action``所需要的时间，同时还可以使用``params``拦截器来将``request``参数传递给``action``。

```xml
<?xml version = "1.0" Encoding = "UTF-8"?>
<!DOCTYPE struts PUBLIC
   "-//Apache Software Foundation//DTD Struts Configuration 2.0//EN"
   "http://struts.apache.org/dtds/struts-2.0.dtd">
<struts>
   <constant name = "struts.devMode" value = "true" />
   
   <package name = "helloworld" extends = "struts-default">
      <action name = "hello" 
         class = "com.rovo98.struts2.HelloWorldAction"
         method = "execute">
         <interceptor-ref name = "params"/>
         <interceptor-ref name = "timer" />
         <result name = "success">/HelloWorld.jsp</result>
      </action>
   </package>
</struts>
```

### 创建自定义拦截器

在我们的应用程序中使用**拦截器**来透切(crosscutting)应用使用一种优雅的方式。创建自定义的拦截器很容易，只需要实现``Interceptor``接口就行了。

```java
public interface Interceptor extends Serializable {
	void destroy();
    void init();
    String intercept(ActionInvocation invocation) throws Exception;
}
```

其中``init()``方法用来初始化拦截器，``destroy()``方法被用来销毁拦截器。不像``action``，拦截器``request``中被重复使用，所以它需要考虑线程安全问题，特别是``intercept()``方法。

``ActionInvocation``对象提供的运行环境的访问。它允许访问``action``本身和调用``action``的方法并确定``action``是否已经被调用。

如果你不需要实现初始化和销毁拦截器的代码，可以直接继承``AbstractInterceptor``类，它不需要实现``init()``和``destroy()``方法。

```java
package com.rovo98.struts2;

import java.util.*;
import com.opensymphony.xwork2.ActionInvocation;
import com.opensymphony.xwork2.interceptor.AbstractInterceptor;

public class MyInterceptor extends AbstractInterceptor {
	public String intercept(ActionInvocation invocation) throws Exception {
      /* let us do some pre-processing */
      String output = "Pre-Processing"; 
      System.out.println(output);

      /* let us call action or next interceptor */
      String result = invocation.invoke();

      /* let us do some post-processing */
      output = "Post-Processing"; 
      System.out.println(output);

      return result;
    }
}
```

实际的``action``将通过拦截器调用``invocation.invoke()``方法来执行。因此我们``action``执行前或执行后加入我们的处理代码。

框架本身通过对``ActionInvocation``对象的``invoke()``方法的第一次调用来启动该过程。每次调用``invoke()``，``ActionInvocation``都会查询其状态并执行下一个拦截器。当所有的配置的拦截器都执行完了之后，``action``才会被执行。

下面是其工作流程图：

![](actioninvocation.jpg)

### 拦截器栈

不难想象，当我们为单个``action``配置多个拦截器时，它们很快会变得很难管理。所以**Struts 2**引入了拦截器栈的概念来管理。下面是一个在``sturtsdefault.xml``配置文件中的一个拦截器栈：

```xml
<interceptor-stack name = "basicStack">
   <interceptor-ref name = "exception"/>
   <interceptor-ref name = "servlet-config"/>
   <interceptor-ref name = "prepare"/>
   <interceptor-ref name = "checkbox"/>
   <interceptor-ref name = "params"/>
   <interceptor-ref name = "conversionError"/>
</interceptor-stack>
```

上面的拦截器栈拥有唯一标识``basicStack``,当我们使用这个拦截器栈时，实际上和之前配置单个拦截器使用的是同样的语法：

```xml
<action name= "hello" class= "com.rovo98.struts2.MyActoin" >
	<interceptor-ref name = "basicStack" />
    <result>/view.jsp</result>
</action>
```

通过上面的配置，为``hello``action 配置了六个拦截器，且这六个拦截器在``action``被执行前将被按顺序执行。

