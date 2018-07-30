---
title: Java持久化框架基础学习笔记 - ORM
author: rovo98
date: '2018.4.12 19:41:44'
categories:
  - Java框架学习
tags: [Java框架基础, ORM, 学习笔记]
abbrlink: 4e7f2cb9
---

![](/images/Java框架学习基础-ORM/orm.png)

> 对象关系映射(Oject Relational Mapping, ORM)是一种程序技术，用户实现面向对象编程语言中不同类型系统的数据之间的转换。

<!-- more -->

为了更好的了解ORM，我们先要了解一下JDBC。

### 什么是JDBC?

JDBC，即**Java Database Connectivity**(Java数据库连接)。它为Java程序提供了访问关系型数据库(relational database)的Java API集合。**这些API使得Java程序可以执行SQL语句并与任何符合SQL的数据库库进行交互。**

JDBC提供了一种**灵活的**结构来编写能够和数据库进行交互的应用，且在**不做任何修改的情况下**，能够运行于不同的平台。

#### JDBC的优点和缺点

|优点|缺点|
|:---:|:----:|
|清晰简单的SQL处理|在大型的项目中使用时变得异常复杂|
|处理大数据时有良好表现|大量编程开销，没有封装|
|非常适合小应用程序|难以实现MVC模式|
|语法简单易学|查询是DBMS特有的|

### 为什么使用对象关系映射(ORM)?

当我们使用面向对象系统时，对象模型和关系数据库存在不匹配的现象，**RDMSs(关系型数据库) 以表格的形式表示数据，而面向对象编程语言，如java,C# 将数据表示为对象的属性，以及对象之间的关系**。

例如下面的一个简单的实体类：

```java
public class Employee {
	private int id;
    private String firstName;
    private String lastName;
    private int salary;
    
    public Employee() {}
    public Employee(String fname, String lname, int sal) {
		this.firstName = fname;
        this.lastName = lname;
        this.salary = sal;
	}
    
    public int getId() {
    	return id;
    }
    public String getFirstName() {
    	return firstName;
    }
    
    public String getLastName() {
    	return lastName;
    }
    
    public int getSalary() {
    	return salary;
    }
}
```

上面的对象在关系型数据库中可以这样存储和检索的：

```sql
create table EMPLOYEE (
	id int not null auto_increment,
    first_name varchar(20) default null,
    last_name varchar(20) default null,
    salary int default null,
    contraint PK_id primary key (id)
);
```

#### 遇到的问题

1. 可能我们开发了几个页面后，要修改数据库的设计，我们应该怎样处理？
2. 将对象存储到关系型数据库和从数据库中读取存在以下五个**不匹配(mismatch)**的问题：

|不匹配(Mismatch)|描述(Description)|
|:----:|:----:|
|Granularity(粒度)|有时你可能会有一个对象模型，它的类比数据库中的相应的表的数量还要多。|
|Inheritence(继承)|RDBMS不定义任何类似继承的东西，但这确是面向对象编程语言中的的自然范式。|
|Identity(标识)|RDBMS正好定义了一个“相等”的概念：主键。但是Java定义对象标识(a == b) 和对象相等(a.equals(b))。
|Associations(关联)|面向对象编程语言使用对象引用来表示关联，而RDBMS将关联表示为外键。|
|Navigation(检索)|在Java和RDBMS中访问对象的方式根本不同。|

**对象关系映射（ORM）是处理上述所有不匹配问题的解决方案**。

### 什么是ORM?

ORM 是一项在关系型数据库和面向对象编程语言之间转换数据的编程技术。

相比于简单的JDBC，ORM有以下优点：


|No.|Advantages|
|:----:|:-----:|
|1|让业务逻辑代码访问数据对象，而不是数据表|
|2|隐藏了业务逻辑的SQL查询的详细信息|
|3|无需处理数据库实现问题|
|4|基于业务概念而非数据库结构的实体|
|5|基于JDBC“底层”|
|6|事务管理和自动密钥生成|
|7|应用程序快速开发|

一个 ORM 解决方案由以下四个实体组成：

|No.|Solutions|
|:--:|:--:|
|1|对持久化类的对象执行基本CRUD操作的API|
|2|用于指定引用类和类的属性的查询的语言或API|
|3|用于指定映射元数据的可配置工具|
|4|一种与事务对象进行交互以执行脏检查，懒惰关联提取以及其他优化功能的技术。|

### Java ORM 框架

有许多持久化框架ORM解决方案使用java实现的，如：

- Enterprise JavaBeans Entity Beans
- Java Data Ojects
- Castor
- TopLink
- Spring DAO
- Hibernate
- Mybatis
- 等等。
