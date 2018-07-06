---
title: jsp基础学习笔记
date: '2017.10.12 11:40:34'
categories:
  - jsp基础学习
tags: [jsp,学习笔记]
abbrlink: 67d7cfb7
---

Java 服务器页面(jsp) 是用来开发动态页面的一项技术。

![](/images/jsp基础学习/JSP.png)

<!-- more -->

## 概述

JSP 允许开发人员使用指定的 JSP 标签来向html页面中插入java源代码，标签通常是**以 ``<%`` 开头并以 ``%>``** 结束。

### 为什么使用 JSP？

使用Java服务器页面(jsp)与使用实现 Common Gateway Interface([CGI](https://baike.baidu.com/item/CGI/607810))的程序目的是大致相同的。但对比CGI，jsp有以下优点：

1. 性能较好。因为JSP允许直接在html页面中嵌入动态元素，而不需要独立持有CGI文件；
2. JSP在服务器处理前都会进行预编译，不像 CGI/[Perl](https://baike.baidu.com/item/perl), 每次页面被请求时，服务器都需要加在一个解释器(interperter) 以及目标脚本(target script);
3. JSP是基于 Java Servlets API 构建的，因此，和Servlets一样，JSP也可以使用这些强大的Enterprise Java API, ：``JDBC``, ``JNDI``, ``EJB``, ``JAXP``, 等等**；
4. **JSP 页面可以和处理业务逻辑的servlets结合使用**，该模型由``java servlet`` 模板引擎提供支持。

最后，JSP是JavaEE(企业级应用程序的完整平台)的一个组成部分。这意味着JSP可以在最简单的应用程序中扮演最复杂和最苛刻的角色。

### 使用JSP的优势

下面通过对比不同的技术来体现使用JSP的优点：

#### vs. Active Server Pages (ASP)

对比[ASP](https://baike.baidu.com/item/asp/128906), JSP有两大优点：第一是页面的动态部分是用java写的，而不是Visual Basic或其他MS特定的语言编写，所以它更强有力且易于使用；第二是它可以移植到其他的操作系统和非Microsoft的Web 服务器上，这使它更加健壮。

#### vs. Pure Servets（纯Servlets)

使用JSP可以更容易编写和修改常规的html代码，而不是使用大量的 **println**语句来生成HTML。

#### vs. Server-Side Includes ([SSI](https://baike.baidu.com/item/SSI))

SSI 实际上只适用于处理简单内容的程序，而不适用于使用表单数据，进行数据库连接等的程序。

#### vs. Javascript

JavaScript 可以在客户端生成HTML，但很难和Web 服务器实现复杂任务的交互，例如：数据库访问以及图像处理等。

#### vs. 静态HTML

常规的HTML不能包含动态的内容，无法动态地改变页面展示的数据。

## 架构

Web服务器需要``JSP``引擎（容器）才能处理``JSP``页面。``JSP``容器负责拦截``JSP``页面的请求。``JSP``容器和Web服务器一起可以为``JSP``提供运行环境和其他服务。使服务器可以识别``JSP``中的特殊元素。

下面展示的是``JSP``容器和``JSP``文件在Web应用程序中的位置：

![](jsp-arch.jpg)

### JSP处理过程

下面的步骤是Web服务器处理``JSP``生成Web页面的过程：

- 和普通的页面一样，客户端的浏览器会向Web服务器发起一个``HTTP``请求。
- Web服务器识别出该``HTTP``请求是``JSP``请求，然后将请求转发给``JSP``引擎处理。即请求链接是以``.jsp``结尾的URL。
- ``JSP``引擎从硬盘中加载``JSP``页面并将它转换为``Servlet``文件。该转换过程非常简单，将所有的模板内容都转换为``println()``语句，所有的``JSP``元素都转换为Java代码。这些Java代码实现了页面中的动态行为。
- ``JSP``引擎将``Servlet``文件编译成可执行``class``文件，并将原始请求转发给``servlet``引擎。
- ``Servlet``引擎加载``Servlet``class文件并执行。执行期间，生成``HTML``文件并放在``HTTP response``中，随后通过``servlet``引擎移交给Web服务器。
- Web服务器将包含静态``HTML``内容的``HTTP``响应转发到客户端浏览器。
- 最后，客户端浏览器``HTTP``响应中由服务器动态生成的静态``HTML``内容。

以上的步骤的流程图示：

![](jsp-processing.jpg)

通常，``JSP``引擎会检查``JSP``文件对应的``Servlet``文件是否已经存在，若是，如果``JSP``文件的修改日期旧于对应的``Servlet``文件，``JSP``引擎则认为``JSP``没有改变且已经的生成的``Servlet``文件仍然匹配``JSP``文件的内容。这中处理使得``JSP``的处理和运行速度比其他的脚本语言(如：``PHP``）更高效、更快。

其实，``JSP``页面是编写``servlet``的另外一种方式，不需要Java编程。除了上述的``JSP``处理过程中的翻译转换过程，``JSP``和一般的``servlet``处理方式一样。

## 生命周期

理解``JSP``低级功能的关键就是简单了解``JSP``的生命周期。``JSP``的生命周期就是``jsp``从创建到销毁的过程。该过程与``servlet``的生命周期类似，不过多了一个将``JSP``编译转换为``servlet``文件的步骤。

### JSP遵循的过程

- 编译 (Compilation)
- 初始化 (Initialization)
- 执行 (Execution)
- 销毁 (Cleanup)

``JSP``生命周期的四个主要阶段：

![](jsp_life_cycle.jpg)

### JSP编译阶段

当浏览器请求``JSP``页面时，``JSP``引擎首先检查是否需要编译该``JSP``页面。如果页面还为编译过，或者``JSP``文件被修改，``JSP``引擎就编译该页面。

编译阶段包含下面三个步骤：

- 解析JSP页面
- 将``JSP``转换为``servlet``
- 编译``servlet``为``class``文件

### JSP初始化阶段

当``JSP``容器加载``JSP``时，它会在处理任何请求之前调用``jspInit()``方法。如果需要执行特定的``JSP``初始化，直接覆盖``jspInit()``方法就行：

```java
public void jspInit() {
	// Initialization code...
}
```

通常，和``servlet``的``init()``方法一样，该初始化方法只执行一次，一般是初始化数据库连接，打开文件和创建查找表格(look-up table)。

### JSP执行阶段

这一阶段表示在销毁``JSP``之前与请求的所有交互。每当浏览器请求``JSP``并且页面已加载以及初始化时，``JSP``引擎就会调用``JSP``的``_jspService()``方法。

``_jspService()``方法拥有两个参数``HttpServletRequest``和``HttpServletResponse``:

```java
public void _jspService(HttpServletRequest request, HttpServletResponse response) {
	// Service handling code...
}
```

``_jspService()``方法在``request``的基础上调用。主要负责生成请求的响应，同时也可以生成所有的七种HTTP请求方式对应的响应，**GET, POST, DELETE** 等。

### JSP销毁阶段

``JSP``生命周期的销毁阶段表示从容器中移除``JSP``。``JSP``中的``jspDestroy()``方法等价于``servlet``中的``destroy()``方法。通过覆盖``jspDestroy()``方法可以实现特定的销毁需求，例如：释放数据库连接， 关闭文件等。

```java
public void jspDestroy() {
	// cleanup code goes here.
}
```

## 语法

简单了解``JSP``开发中涉及到的语法(JSP元素的使用)。


### 小脚本(Scriptlet)元素

小脚本可以包含任意多行Java语句，变量， 方法申明，以及表达式。

使用``Scriptlet``的语法：

```html
<% code fragment %>
```

``XML``方式语法的等价表达方式:

```xml
<jsp:scriptlet>
	code fragment
</jsp:scriptlet>
```

其他编写的任何文本，HTML标签或JSP元素都必须为与``Scriptlet``之外。下面是``JSP``使用``Scriptlet``的简单示例:

```html
<html>
	<head><title>Hello World</title></head>
    
    <body>
    	Hello World!<br />
        <%
        	out.println("Your IP address is " + request.getRemoteAddr());
        %>
    </body>
</html>
```

### 申明(Declarations)元素

一个申明(declaration)可以的申明一个或多个变量，方法，以便在后续的Java代码中使用。在我们是使用``Scriptlet``编写Java代码之前，应该申明变量或方法。

``JSP``申明语法：

```html
<%! declaration; [declaration; ] + ... %>
```

``XML``等价于语法：

```xml
<jsp:declaration>
	declarations define here.
</jsp:declaration>
```

简单例子：

```html
<%! int i = 0; %>
<%! int a, b, c; %>
<%! Circle a = new Circle(2.0); %>
```

### JSP表达式元素

一个``JSP``表达式元素可以包含一个脚本语言表达式，该表达式可以通过计算，转换为``String``，并插入表达式出现在``JSP``文件中的位置。

因为表达式中的值最终是转换为``String``，所以我们可以在``JSP``文件中使用一行文本编写表达式，无论是否使用``HTML``标签都可以。表达式可以包含Java语言规范有效的任何表达式，但不能使用分号来结束表达式。

使用``JSP``表达式的语法:

```html
<%= expression %>
```

``XML``语法等价表达方式:

```xml
<jsp:expression>
	expression
</jsp:expression>
```

使用``JSP``表达式例子:

```html
<html>
<head><title>A Comment Test</title></head>
<body>
<p>Today's date: <%= (new java.util.Date()).toLocaleString()%></p>
</body>
</html>
```

上面例子的运行结果可能是:

```txt
Today's date: 11-Sep-2017 21:24:11
```

### JSP注释元素

``JSP``容器会忽略使用``JSP``注释标记的文本和语句。

使用语法:

```html
<%-- This is JSP comment --%>
```

简单使用例子：

```html
<html>
<head><title>A Comment Test! </title></head>
<body>
<h2>A Test of Comments</h2>
<%-- This comment will not be visible in the page source --%>
</body>
</html>
```

我们可以在各种情况下使用少量的特殊结构来插入注释和字符，否则这些注释或字符将被特殊处理.

|Syntax|Purpose|
|:----:|:----:|
|``<%-- comment --%>``|JSP注释，文本内容被JSP引擎忽略|
|``<!-- comment -->``|HTML注释，文本内容被浏览器忽略|
|``<\%``|表示静态的字符``<%``|
|``%\>``|表示静态的字符``%>``|
|``\'``|在属性中使用单引号|
|``\"``|在属性中使用双引号|

### JSP指令(Directives)元素

``JSP``指令元素会影响``Servlet``class文件的整体结构。使用方式:

```html
<%@ directive attribute="value" %>
```

``JSP``中的三种指令元素：

|Directive|Description|
|:-----:|:------:|
|``<%@ page ... %>``|定义页面相关属性，例如使用脚本语言，错误页面和缓冲请求等|
|``<%@ include ... %>``|在翻译转换阶段导入文件|
|``<%@taglib ... %>``|申明包含页面中使用的自定义标签的标签库|

#### page 指令元素

``page``指令用于向容器提供指令。这些指令适用于当前的``JSP``页面。我们可以在``JSP``页面中的任何位置编写``page``指令，但是按照惯例，该指令一般写在``JSP``的顶部。

使用``page``指令的基本语法:

```html
<%@ page attribute = "value" %>
```

``XML``语法等价表达方式:

```html
<jsp:directive.page attribute = "value" />
```

##### page 指令属性

下面的表格列出的是跟``page``指令相关的属性:

|Attribute|Purpose|
|:----:|:----:|
|``buffer``|指定输出流的缓冲模式|
|``autoFlush``|控制``servlet``输出缓冲区的行为|
|``contentType``|定义字符编码模式|
|``errorPage``|定义报告Java未检查的运行时异常的另一个JSP的``URL``|
|``isErrorPage``|指示此``JSP``页面是否由另一个``JSP``页面的``errorPage``属性指定|
|``extends``|指定生成的``servlet``需要继承的超类|
|``import``|指定``JSP``中是使用的包或类的列表，如Java``import``语句那样|
|``info``|定义一个能被``servlet``的``getServletInfo()``方法访问的字符串|
|``isThreadSafe``|定义生成的``servlet``的线程模式|
|``language``|定义``JSP``页面中使用的编程语言，默认java|
|``session``|指定``JSP``页面是否使用HTTP``session``|
|``isELIgnored``|指定``JSP``页面内的``EL``表达式是否忽略|
|``isScriptingEnabled``|确定是否允许使用脚本元素|

#### include 指令元素

``include``指令用于告诉容器在翻译阶段将其他的外部文件与当前``JSP``文件合并。我们可能在``JSP``页面中任何位置使用该指令元素。

普通的语法:

```html
<%@ include file = "relative url" >
```

``XML``语法等价表达方式：

```html
<jsp:directive.include file = "relative url" />
```

``include``指令中的文件名实际上是一个相对``URL``。如果文件名没有指定关联路径的话，``JSP``编译器会认为文件与当前``JSP``页面在同一目录下。

#### taglib 指令元素

``JSP``API允许我们定义像HTML或XML标签那样的自定义标签，标签库就是实现用户行为的自定义标签的集合。

常规使用语法:

```html
<%@ taglib uri = "uri" prefix = "prefixOfTag" >
```

这里的``uri``属性值解析为容器能够理解的位置，``prefix``属性告诉容器哪些标记是自定义的。

同样它也是可以使用``XML``语法的形式的：

```html
<jsp:directive.taglib uri = "uri" prefix = "prefixOfTag" />
```

### JSP动作(Actions)元素

``JSP``动作元素使用``XML``语法结构，可以控制``servlet``引擎的行为。通过它，我们可以动态插入一个文件，服用``JavaBeans``，跳转到另一个页面，或者为Java插件生成HTML。

使用``JSP``动作元素只用一种语法，符合``XML``标准:

```html
<jsp:action_name attribute="value" />
```

动作元素其实预定义的基础函数，下面的表格展示了我们可以使用的``JSP``动作元素:

|Syntax|Purpose|
|:----:|:----:|
|``jsp:include``|在页面被请求时，动态导入一个文件|
|``jsp:useBean``|查找或实例化一个``JavaBean``|
|``jsp:setproperty``|为一个``JavaBean``设置属性|
|``jsp:getProperty``|将``JavaBean``的属性插入到输出中|
|``jsp:forward``|将用户转发到一个新的页面|
|``jsp:plugin``|用于生成特定的浏览器代码，为Java插件生成``OBJECT``或``EMBED``标记|
|``jsp:element``|动态定义一个``XML``元素|
|``jsp:attribute``|定义动态定义的``XML``元素的属性|
|``jsp:body``|定义动态定义的``XML``元素的主体(body)|
|``jsp:text``|用于在JSP页面和文档中写模板文本|

### JSP隐式(Implicit)对象

``JSP``支持九个自动定义的变量，它们被称为隐式对象。

|Object|Description|
|:----:|:-----:|
|``request``|与请求关联的``HttpServletRequest``对象|
|``response``|与客户端响应关联的``HttpServletResponse``对象|
|``out``|``PrintWriter``对象，用于输出文本到客户端|
|``session``|与请求关联的``HttpSession``对象|
|``application``|与应用程序上下文(application context)关联的``ServletContext``对象|
|``config``|与页面关联的``ServletConfig``对象|
|``pageContext``|封装了特定的服务器功能，如性能更高的``JspWriters``|
|``page``|与Java中的``this``一样，主要用于调用已转换为``servlet``类中定义的方法|
|``Exception``|``Exception``对象允许指定的``JSP``访问异常数据|

### 控制流语句 (Control-Flow Statements)

我们可以在``JSP``编程中使用Java的所有API，例如：流程控制语句等。

### 决策语句 (Decision-Making Statements)

``if ... else``块像普通的``Scriptlet``一样开始，但``Scriptlet``在每一行都关闭，``Scriptlet``标签之间包含有HTML文本。

```html
<%! int day = 3; %>

<html>
<head><title>IF ... ELSE Example</title></head>

<body>
	<% if (day == 1 || day == 7) { %>
    <p>Today is weekend</p>
    <% } else { %>
    <p>Today is not weekend</p>
    <% } %>
</body>
</html>
```

上面的程序代码输出结果为：

```txt
Today is not weekend
```

下面看一下如何使用``switch ... case``块并使用``out.println()``：

```html
<%! int day = 3; %>

<html>
<head><title>SWITCH .. CASE Example</title></head>
<body>
	<%
    	switch(day) {
        case 0:
        	out.println("It\'s Sunday.");
            break;
        case 1:
        	out.println("it\'s Mondya.");
            break;
        case 2:
        	out.println("It\'s Tuesday.");
            break;
        case 3:
        	out.println("it\'s WEdnesday.");
            break;
        case 4:
        	out.println("It\' Thursday.");
            break;
        case 5:
        	out.println("It\'s Friday.");
            break;
        default:
        	out.println("it\'s Saturday.");
    }
    %>
</body>
</html>
```

运行结果为：

```txt
It's Wednesday.
```

### 循环语句

同样在``JSP``中使用循环语句块也是可以的，例如：``for``, ``while``,以及``do ... while``。

简单的使用``for``循环语句的例子：

```html
<%! int fontSize; %>

<html>
<head><title>FOR LOOP Example</title></head>

<body>
	<% for (fontSize = 1; fontSize < - 3; fontSize++) { %>
    <font color = "green" size = <%= fontSize %>">
    	JSP Test
        </font><br />
	<% } %>
</body>
</html>
```

### JSP数据类型 (Literals)

``JSP``表达式定义了下面的数据类型:

- ``Boolean`` -- true 或者 false
- ``Integer`` -- 与Java中一样
- ``Floating point`` -- 与Java中一样
- ``String`` -- 以单引号或双引号包围起来的字符串
- ``Null`` -- null
