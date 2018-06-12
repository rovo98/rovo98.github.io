---
title: jsp基础学习笔记 - 概览
date: '2018.6.12 11:40:34'
categories:
  - jsp基础学习
tags:
  - jsp
  - 学习笔记
abbrlink: 67d7cfb7
---

Java 服务器页面(jsp) 是用来开发动态页面的一项技术。

![](/images/jsp基础学习-概览/JSP.png)

<!-- more -->

JSP 允许开发人员使用指定的 JSP 标签来向html页面中插入java源代码，标签通常是**以 <% 开头并以 %>** 结束。


### 为什么使用 JSP？

使用Java服务器页面(jsp)与使用实现 Common Gateway Interface([CGI](https://baike.baidu.com/item/CGI/607810))的程序目的是大致相同的。但对比CGI，jsp有以下优点：

1. 性能较好。因为JSP允许直接在html页面中嵌入动态元素，而不需要独立持有CGI文件；
2. JSP在服务器处理前都会进行预编译，不像 CGI/[Perl](https://baike.baidu.com/item/perl), 每次页面被请求时，服务器都需要加在一个解释器(interperter) 以及目标脚本(target script);
3. JSP是基于 Java Servlets API 构建的，因此，和Servlets一样，JSP也可以使用这些强大的Enterprise Java API, ：**JDBC, JNDI, EJB, JAXP, 等等**；
4. **JSP 页面可以和处理业务逻辑的servlets结合使用**，该模型由[java servlet 模板引擎提供支持。

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



