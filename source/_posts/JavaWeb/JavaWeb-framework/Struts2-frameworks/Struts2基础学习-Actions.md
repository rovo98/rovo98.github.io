---
author: rovo98
title: Struts 2基础学习 - Actions
date: '2018.4.11 14:01:19'
categories:
  - Java框架学习
  - Struts 2
tags:
  - Struts 2基础学习
  - 学习笔记
  - Java框架基础
abbrlink: 338c78b5
---

``action``是**Struts 2** 框架的核心，它们适用于任何MVC框架。每个URL都映射到一个具体的``action``，``action``提供了业务逻辑处理来响应用户发起的请求。

<!-- more -->

但是，``action``拥有另外两个重要的职能。第一，	``action``在数据(data)从``request``中传递到视图(view,无论是jsp还是其他的result)的过程扮演着一个重要的角色。第二，``action``帮助**Struts 2** 来确定哪个result对应的视图(view)将被返回去响应用户的请求。

### 创建Action

创建和使用``action``类的唯一要求就是**必须要有一个无参方法(noargument method)返回``String``或``Result``对象，并且必须是``POJO``(Plain Ordinary Java Object).如果该方法没有给出，默认的，``execute()``方法将会被执行。**

另外，我们可以通过继承实现了六个接口(其中包含``Action`` interface)的``ActionSupport``类来创建我们的``action``类。 ``Action``接口的定义如下：

```java
public interface Action {
	public static final String SUCCESS = "success";
    public static final String NONE = "none";
    public static final String ERROR = "error";
    public static final String INPUT = "input";
    public static final String LOGIN = "login";
    public String execute() throws Exception;
}
```

下面是一个简单的普通的	``action``：

```java
package com.rovo98.struts2;

public class HelloWorldAction {
	private String name;
    
    public String execute() throws Exception {
    	return "success";
    }
    
    public  String getNane() {
    	return name;
    }
    
    public void setName(String name) {
    	this.name = name;
    }
}
```

我们说过``action``可以控制视图，为了验证这一点，我们对上面的``action``的``execute()``方法做简单的修改，以及继承``ActionSupport``类：

```java
package com.rovo98.struts2;
import com.opensymphony.xwork2.ActionSupport;

public class HelloWorldAction extends ActionSupport {
	private String name;
    
    public String execute() throws Exception {
    	if ("SECRET".equals(name)) {
        	return SUCCESS;
        } else {
        	return ERROR;
        }
    }
    
    public String getName() {
    	return name;
    }
    
    public void setName(String name) {
    	this.name = name;
    }
}
```

### 使用Action

#### 在struts.xml 配置文件中配置action

在上面的``action``中，我们执行``execute()``方法的业务逻辑是从``request``对象中获取的``name``的值如果是``"SECRET"``的话，返回``SUCCESS``,否则返回``ERROR``。``struts.xml``配置文件如下：

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
         <result name = "success">/HelloWorld.jsp</result>
         <result name = "error">/AccessDenied.jsp</result>
      </action>
   </package>
</struts>
```

从上面的配置文件看，当用户请求``hello``action映射的URL时，``HelloworldAction``的``execute()``方法将会被执行，返回``SUCCESS``时，将以``HelloWorld.jsp``去响应用户的请求，否则以``AccessDenied.jsp``来响应用户的请求。
