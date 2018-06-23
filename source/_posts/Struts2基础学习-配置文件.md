---
title: Struts 2基础学习 - 配置文件
author: rovo98
date: '2018.4.11 14:01:01'
categories:
  - Java框架学习
  - Struts 2
tags: 
  - Struts 2基础学习
  - 学习笔记
  - Java框架基础
abbrlink: 3fe084cc
---

主要了解Struts 2应用的基本配置。看看使用Struts 2的一些重要的配置文件，如：**web.xml, struts.xml,struts-config.xml和struts.properties**，可以对Struts 2应用做哪些配置。


<!-- more -->

其实，我们只要使用web.xml和struts.xml问价就可以使用Struts 2应用。但是我们还是有必要了解一下其他配置文件。

### web.xml 配置文件

** web.xml**  配置文件是 ** J2EE**  配置文件，它决定了Servlet容器如何处理HTTP请求中的元素。严格上来说，它并不是 ** Struts 2**  的配置文件，但是我们需要通过配置它来使  Struts 2工作。毕竟Struts 2 是基于一个Filter做Controller实现的)

这个文件为任何一个Web应用提供一个入口点(entry point),而 ** Struts 2 **  应用的入口点是定义在 ** web.xml**  文件中的一个过滤器(filter)。因此我们会在** web.xml** 中顶一个** FilterDispatcher** 类的入口。

一个简单的**web.xml**文件配置例子：

```xml
<?xml version = "1.0" Encoding = "UTF-8"?>
<web-app xmlns:xsi = "http://www.w3.org/2001/XMLSchema-instance"
   xmlns = "http://java.sun.com/xml/ns/javaee" 
   xmlns:web = "http://java.sun.com/xml/ns/javaee/web-app_2_5.xsd"
   xsi:schemaLocation = "http://java.sun.com/xml/ns/javaee 
   http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd"
   id = "WebApp_ID" version = "3.0">
   
   <display-name>Struts 2</display-name>
   <welcome-file-list>
      <welcome-file>index.jsp</welcome-file>
   </welcome-file-list>
   
   <filter>
      <filter-name>struts2</filter-name>
      <filter-class>
         org.apache.struts2.dispatcher.FilterDispatcher
      </filter-class>
   </filter>

   <filter-mapping>
      <filter-name>struts2</filter-name>
      <url-pattern>/*</url-pattern>
   </filter-mapping>

</web-app>
```

【notice】: 这里将Struts 2 Filter映射到 **/* **，而不是**/*.action**, 这意味着所有的url都会被Struts 2的过滤器解析。

### struts.xml 配置文件

**struts.xml** 文件包含**actions**开发时需要修改的配置信息。这个文件可以覆盖应用的默认配置，例如：**struts.devMode = false**，该文件可以放置在**WEB-INF/classes**目录下。

一个**hellowordWorld**例子的**struts.xml**配置文件：

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
      </action>
      
      <!-- more actions can be listed here -->

   </package>
   <!-- more packages can be listed here -->

</struts>
```

一点需要注意的是 **DOCTYPE**，所有struts 配置文件都需要有正确的doctype信息，例如上面所展示的。**<struts>**标签是配置文件中的根标签元素，我们可以在里面定义不同的包(**package**)，使用**<package>**标签可以使用配置信息模块化，当我们需要把一个大型的项目拆分成不同的模块的时候，它将非常有用。

**package** 标签拥有以下的属性：

|Attribute|Description|
|:----:|:----------:|
|name(required)|包的唯一标识符|
|extends|说明包继承于哪个包，默认的，我们使用**struts-default**作为基包(base package)|
|abstract|如果属性值为true,终端用户将无法使用该包|
|namespace|**action**类的唯一名称空间|

**constant**标签拥有**name**和**value**属性，可以重写覆盖定义在**default.properites**文件中的属性配置，例如我们上面提到的**struts.devMode**,通过设置**struts.devMode**属性，我们在日志文件中查看debug信息。

我们通过定义一个**action**标签来映射我们需要访问的链接URL并定义一个实现**execute()**方法的类，任何时刻，当我们访问对应的链接时，该类的**execute()**方法都会被执行。

**result**决定了执行**action**之后，返回浏览器的内容。**action**返回的String应该是和某个**result**的**name**属性值是一致的。**result拥有两个可选的属性**name**和**type**，name属性的值默认为"success",type默认为"dispatcher"**。

**struts.xml**配置文件在开发中可能会变得非常大，我们可以使用**package**将它们模块化，当然**Struts**还提供了另一种方式，我们可以把配置文件分割成多个xml文件，然后通过下面这种方式来将它们导入：


```xml
<?xml version = "1.0" Encoding = "UTF-8"?>
<!DOCTYPE struts PUBLIC
   "-//Apache Software Foundation//DTD Struts Configuration 2.0//EN"
   "http://struts.apache.org/dtds/struts-2.0.dtd">

<struts>
   <include file="my-struts1.xml"/>
   <include file="my-struts2.xml"/>
</struts>
```

【notice】: 这里有一个配置文件我们过多的提及，是**struts-default.xml**，该文件包含了Struts 的所有标准配置设置，在我们的开发项目中，我们可能并不会触碰到它。感兴趣的话，可以查看**struts2-core-x.x.x.jar**包中的**default.properties**文件。


### struts-config.xml 配置文件

**struts-config.xml**配置文件是Web客户端中View和Model组件之间的链接，但在我们99%的开发项目中，我们并不会接触到它。

配置文件主要包含以下这些主要的元素:

|Interceptor|Description|
|:-----:|:-------------:|
|struts-config|配置文件的根节点|
|form-bean|可以将ActionForm的子类映射到一个名称(name),并在整个**struts-config.xml**文件的其余部分中，甚至在JSP页面上，都可使用这个name作为ActionForm的别名|
|global forwards|可以将一个页面映射到一个名称(name),并使用该名称来引用实际页面。这可以避免使用网页上的硬编码(hardcoding)网址|
|action-mapping|用来声明表单处理程序，也被成为action映射|
|controller|配置Struts的内部结构，很少在实际情况中使用|
|plug-in|告诉Struts如何查看你的属性文件(properties files)，其中包含提示和错误信息|

**struts-config.xml**配置文件简单实例：

```xml
<?xml version = "1.0" Encoding = "ISO-8859-1" ?>
<!DOCTYPE struts-config PUBLIC
   "-//Apache Software Foundation//DTD Struts Configuration 1.0//EN"
   "http://jakarta.apache.org/struts/dtds/struts-config_1_0.dtd">

<struts-config>

   <!-- ========== Form Bean Definitions ============ -->
   <form-beans>
      <form-bean name = "login" type = "test.struts.LoginForm" />
   </form-beans>

   <!-- ========== Global Forward Definitions ========= -->
   <global-forwards>
   </global-forwards>

   <!-- ========== Action Mapping Definitions ======== -->
   <action-mappings>
      <action
         path = "/login"
         type = "test.struts.LoginAction" >

         <forward name = "valid" path = "/jsp/MainMenu.jsp" />
         <forward name = "invalid" path = "/jsp/LoginView.jsp" />
      </action>
   </action-mappings>

   <!-- ========== Controller Definitions ======== -->
   <controller contentType = "text/html;charset = UTF-8"
      debug = "3" maxFileSize = "1.618M" locale = "true" nocache = "true"/>

</struts-config>
```

### struts.properties 配置文件

该配置文件提供了一种可以改变框架默认行为的机制。实际上，所有包含在struts.properties**配置文集中的属性都可以在**web.xml**中使用**init-param**标签来配置。也可以在**struts.xml**配置文件中使用**constant**标签来进行配置。但是，如果你想将不同的配置信息分开，那么你可以使用**struts.properties**，它可以放置在**WEB-INF/classes**目录下。

在该文件中配置的属性值将会覆盖**struts2-core.x.y.z.jar**包中**default.properties**文件中配置的默认属性值。

下面是我们开发中可能会使用到的属性值：

```
### When set to true, Struts will act much more friendly for developers
struts.devMode = true

### Enables reloading of internationalization files
struts.i18n.reload = true

### Enables reloading of XML configuration files
struts.configuration.xml.reload = true

### Sets the port that the server is run on
struts.url.http.port = 8080
```
