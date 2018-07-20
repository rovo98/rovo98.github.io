---
author: rovo98
title: Hibernate基础学习
date: '2018.4.13 19:41:44'
categories:
  - Java框架学习
  - Hibernate
tags:
  - Java框架基础
  - hibernate
  - 学习笔记
abbrlink: b19895ed
password: writting
---

![](/images/Hibernate基础学习/hibernate_logo.png)

**Hibernate**是一个对象关系映射(Object-Relational Mapping, ``ORM``)的JAVA解决方案。是在2001年由 *Gavin King*创建的开源持久化框架。适用于任何使用Java应用程序的功能强大的高性能**对象关系持久化和查询服务**。

<!-- more -->

## 概述

**Hibernate**将Java类映射到数据表并将Java数据类型映射到SQL数据类型，使开发人员从95%的常见数据持久化相关编程任务中解脱出来。

**Hibernate**位于传统的Java对象和数据库服务器之间，以适应基于适当$O/R$机制和模式的持久化对象的保存工作。

![](hibernate_position.jpg)

### 一、Hibernate 优势

1. Hibernate使用XML文件来将Java类映射到数据表，不需要写任何代码。
2. 提供简单的APIs直接将java对象保存到数据库中，或从数据库中检索出来。
3. 数据库或数据表发生改变时，只需要修改XML文件。
4. 不采用不熟悉的SQL类型，而提供一中方法来解决熟悉的Java对象。
5. Hibernate不需要应用服务器来操作。
6. 可以操纵数据库对象的复杂关联。
7. 使用智能检索策略来最小化数据库的访问。
8. 提供简单的数据查询。

### 二、支持的数据库

**Hibernate**支持所有主流的关系型数据库(RDBMS)。下面简单地列出Hibernate支持的数据库:

- HSQL Database Engine
- DB2/NT
- MySQL
- PostgreSQL
- FrontBase
- Oracle
- Microsoft SQL Server Database
- Sybase SQL Server
- Infomix Dynamic Server

### 三、支持的技术

**Hibernate**支持很多其他的技术，包括

- XDoclet Spring
- J2EE
- Eclipse plug-ins
- Maven

## 架构

**Hibernate**拥有一个分层的架构，可以使用户在不了解底层APIs的情况下使用它。Hibernate使用数据库和配置数据来向应用提供持久化服务。

下面是从宏观角度看Hibernate的视图：

![](hibernate_high_level.jpg)

从细节视角看Hibernate以及它的核心类：

![](hibernate_architecture.jpg)

**Hibernate**使用很多现有的Java API, 例如： ``JDBC``, Java Transaction API(``JTA``)以及 Java Naming and Directory Interface(``JNDI``)。``JDBC``提供了关系数据库通用功能的基本抽象级别，使**Hibernate**支持几乎所有具有``JDBC``驱动程序的数据库。``JNDI``和``JTA``使``J2EE``可以集成**Hibernate**。

下面是针对上面架构图中出现的核心类给出的简单解释。

### 一、Configuration Object

``Configuration``(配置对象)是在Hibernate应用中第一个被创建的对象，且在Hibernate应用初始化时，只创建一次。它通常代表着Hibernate所需的配置信息或属性。

``Configuartion``包含一下两个关键的组件:

- ``Database Connection``(数据库连接) - 通过hibernate支持的一个或多个配置文件来处理的，例如： ``hibernate.properties``和``hibernate.cfg.xml``。
- ``Class Mapping Setup``(类映射设置) - 该组件负责创建Java类和数据表之间的连接。

### 二、SessionFactory Object

``SessionFactory``对象是通过使用``Configuration``对象创建生成的，该对象可以使用提供的配置文件为应用程序配置Hibernate，并能够实例化``Session``对象。``SessionFactory``是一个线程安全对象，并被应用程序的所有线程使用。

``Sessionfactory``是一个重量级对象，通常在应用程序启动时创建并保留以备后续使用。每个数据库使用单独的配置文件都需要一个``SessionFactory``对象。因此，如果使用多个数据库，我们可能需要创建多个``SessionFactory``对象。

### 三、Session Object

``Session``对象主要用来从数据库中获取物理连接。``Session``是轻量级对象，当每次需要与数据库交互时都可以实例化该对象。持久化对象(persistent Objects)就是通过它来实现保存和检索的。

``Session``对象一般不会保留很长一段时间，因为它并不是线程安全对象，只能在需要使用的时候创建和销毁。

### 四、Transaction Object

``Transaction``对象代表了数据库的一个工作单元，大多数RDBMS都支持事务功能。Hibernate中的事务由``underlying transaction manager``(基础事务管理器)以及``transaction``(事务，来自``JDBC``或者``JTA``)。

这是一个**可选**对象，Hibernate应用程序可以选择不使用此接口，而是使用自己的应用程序的代码来管理事务。

### 五、Query Object

``Query``对象使用``SQL``或者Hibernate查询语言（``HQL``)字符串来从数据库中检索数据以及创建对象。一个``Query``实例一般是用来绑定查询参数，限制返回结果行数，并执行查询操作的。

### 七、Criteria Object

``Criteria``对象用于创建和执行面向对象的条件查询来检索对象。


## Hibernate 配置

**Hibernate需要事先知道在哪里可以找到定义Java类和数据表的关系的映射信息。**Hibernate还需哟啊一组与数据库和其他相关参数相关的配置设置。所有这些信息通常由标准Java属性文件(``hibernate.properties``)或XML文件(``hibernate.cfg.xml``)提供。

这里我们只需要考虑``hibernate.cfg.xml``配置文件的配置。大多数的属性一般都采用默认值，并且不需要在属性文件(``hibernate.properties``)中制定它们，除非真的需要。配置文件只能保存在应用程序的类路径的根目录中。

### 一、Hibernate 属性

下面列出的使一些重要的属性，当我们在配置数据库时可能会用到：

|Properties|Description|
|:----:|:-----:|
|hibernate.dialect|数据库方言，该属性能够是Hibernate为选择的数据库生成合适的SQL|
|hibernate.connection.driver_class|JDBC 驱动类|
|hibernate.connection.url|数据库实例的JDBC URL|
|hibernate.connection.username|数据库用户名|
|hibernate.connection.password|数据库密码|
|hibernate.connection.pool_size|限制Hibernate数据库连接池中等待的连接数|
|hibernate.connection.autocommit|允许JDBC连接自动提交|

如果使用应用程序服务器和``JNDI``,则必须配置以下属性：

|Properties|Description|
|:------:|:------:|
|hibernate.connection.datasource|在应用服务器上下文中定义``JNDI``名称|
|hibernate.jndi.class|``JNDI``的``InitialContext``类|
|hibernate.jndi.< JNDIpropertyname >|向``JNDI InitialContext``传递的属性|
|hibernate.jndi.url|``JNDI`` URL|
|hibernate.connection.username|数据库用户名|
|hibernate.connection.password|数据库密码|


### 二、在Hibernate中配置 MySQL 数据库

``MySQL``是目前最受欢的开源数据库系统之一。下面通过配置``hibernate.cfg.xml``文件来配置``MySQL``数据库，在此之前，确保在``MySQL``中创建一个``testdb``数据库，以及``test``用户。

[notice] : XML配置文件必须符合Hibernate 2 配置 DTD标准。

**hibernate.cfg.xml**:

```xml
<?xml version = "1.0" encoding = "utf-8"?>
<!DOCTYPE hibernate-configuration SYSTEM 
"http://www.hibernate.org/dtd/hibernate-configuration-3.0.dtd">
<hibernate-configuration>
   <session-factory>
   
      <property name = "hibernate.dialect">
         org.hibernate.dialect.MySQL5Dialect
      </property>
      
      <property name = "hibernate.connection.driver_class">
         com.mysql.jdbc.Driver
      </property>
      
      <!-- Assume test is the database name -->
      
      <property name = "hibernate.connection.url">
         jdbc:mysql://localhost/test
      </property>
      
      <property name = "hibernate.connection.username">
         root
      </property>
      
      <property name = "hibernate.connection.password">
         root
      </property>
      
      <!-- List of XML mapping files -->
      <mapping resource = "Employee.hbm.xml"/>
      
   </session-factory>
</hibernate-configuration>
```

上面配置文件中``<mapping>``标签与``hibernate mapping``(映射文件)相关。

以下是一些重要的数据库方言属性类型：

|Database|Dialect Property|
|:-----:|:-----:|
|DB 2| org.hibernate.dialect.DB2Dialect|
|HSQLDB| org.hibernate.dialect.HSQLDialect|
|HypersonicSQL| org.hibernate.dialect.HSQLDialect|
|Informix| org.hibernate.dialect.InformixDialect|
|Ingres| org.hibernate.dialect.IngresDialect|
|Interbase| org.hibernate.dialect.InterbaseDialect|
|Microsoft SQL Server 2000| org.hibernate.dialect.SQLServerDialect|
|Microsoft SQL Server 2005| org.hibernate.dialect.SQLServer2005Dialect|
|Microsoft SQL Server 2008| org.hibernate.dialect.SQLServer2008Dialect|
|MySQL| org.hibernate.dialect.MySQLDialect|
|Oracle(any version| org.hibernate.dialect.OracleDialect|
|Oracle 11g| org.hibernate.dialect.Oracle10gDialect|
|Oracle 10g| org.hibernate.dialect.Oracle10gDialect|
|Oracle 9i| org.hibernate.dialect.Oracle9iDialect|
|PostgreSQL| org.hibernate.dialect.PostgreSQLDialect|
|Progress| org.hibernate.dialect.ProgressDialect|
|SAP DB| org.hibernate.dialect.SAPDBDialect|
|Sybase|org.hibernate.dialect.SybaseDialect|
|Sybase anywhere| org.hibernate.dialect.SybaseAnywhereDialect|

## Sessions

前面我们已经提到``Session``使用来获取数据库物理连接的，为轻量级对象，只有需要和数据库发生交互时才进行对象实例化。持久化对象的保存和检索就是通过它来完成的。

``Session``不能维持太长时间，毕竟它们不是线程安全对象， 只能在需要的时候创建和销毁。``Session``的主要功能是为映射实体类提供创建、读取和删除操作。


在给定的时间点中，实例可能有下面的这些状态：

- ``transient``(暂时的) - 一个持久类的新实例，与``Session``没有关联，并且在数据库中没有表示以及没有标识符值，被Hibernate认为是暂时的。
- ``persistent``(持久的) -  我们可以通过将暂时的实例(transient)与``Session``关联来将它进行持久化。
- ``detached``(独立的) - 一旦关闭Hibernate ``Session``对象，持久化对象将转化为独立的对象(detached instance)。

当``Session``对象中的持久类(persistent classes)是可序列化时，``Session``也是可序列化的。下面是典型的事务处理代码：

```java
Session session = factory.openSession();
Transaction tx = null;

try {
	tx = session.beginTransaction();
    // do some work
    ...
    tx.commit();
} catch (Exception e) {
	if (tx != null) tx.rollback();
    e.printStackTrace();
} finally {
	session.close();
}
```

**[notice]** : 如果``Session``抛出异常，事务必须回滚(rollback)并且``Session``需要丢弃。

### 一、Session 接口方法

``Session``接口提供了很多方法，下面列出的是其中一些中重要的方法。更多的信息可以查看Hibernate文档中与``Session``以及``SessionFactory``相关的完整方法信息。

|Session Method|Description|
|:-------:|:-----:|
|``Transaction beginTransaction()``|开启一个工作单元并返回已经关联的事务对象。|
|``void cancelQuery()``|取消执行当前查询操作|
|``void clear()``|完全清除回话(session)|
|``Connection close()``|结束回话并释放``JDBC``连接资源|
|``Criteria createCriteria(Class persistentClass)``|为指定的实体类或者实体类的超类创建一个条件查询(``Criteria``)对象|
|``Criteria createCriteria(String entityName)``|根据实体类的名称创建``Criteria``对象|
|``Serializable getIdentifier(Object Object)``|返回与此回话关联的给定实体的标识符值|
|``Query createFilter(Object collection, String queryString)``|根据给定的集合(``collection``)以及过滤字符串创建一个新的``Query``实例|
|``SQLQuery createSQLQuery(String queryString)``|根据给定的SQL查询语句创建一个``SQLQuery``对象|
|``void delete(Object object)``|从数据存储(datastore)中移除持久实例|
|``void delete(String entityName, Object object)``|从数据存储中移除持久实例|
|``Session get(String entityName, Serializable id)``|根据给定的标识符(identifier)以及实体名返回持久化实例；如果没有该实例，则返回``null``|
|``SessionFactory getSessionFactory()``|获取创建该``Session``实例的``SessionFactory``对象|
|``void refresh(Object object)``|从底层数据库重新读取给定实例的状态|
|``Transaction getTransaction()``|获取与该``Session``关联的``Transaction``实例|
|``boolean isConnected()``|返回当前``Session``的连接状态|
|``boolean isDirty()``|判断``Session``中是否存在未同步到数据库的脏数据(已经修改过的数据)|
|``boolean isOpen()``|判断``Session``是否打开|
|``Serializable save(Object object)``|持久化给定的暂时实例，分配一个生成的标识符|
|``void saveOrUpdate(Object object)``|对给定的实例执行``save(Object)``或者``update(Object)``操作|
|``void update(Object object)``|根据给定的独立实例的标识符更新持久化实例|
|``void update(String entityName, Object object)``|根据给定的独立实例的标识符更新持久化实例|

## Hibernate 持久化类

**Hibernate**的整体理念是从Java类属性中取值并将它们保存到数据表中。Hibernate使用给定的映射文件来获取Java类中的属性值，并将它们映射到数据表和相关字段。

**在Hibernate中，我们把那些对象或实例将被保存到数据表中的Java类成为持久化类，持久类。**一般这些遵循这样的一些简单的规则，即符合**Plain Ordinary Java Object**(``POJO``)编程模型。

下面给出的就是持久化类需要遵循的规则，但这并不是硬性要求：

- 所有的持久化类都需要有一个默认的构造方法；
- 所有类都需要包含一个ID属性，以便在Hibernate和数据库中轻松识别对象，该属性一般映射到数据表中的主键；
- 所有需要持久化的属性都应该声明为``private``并定义``getXXX``和``setXXX``方法；
- Hibernate的一个中心特性是代理，因此依赖的持久化类不能是``final``类或者实现声明所有公共方法的接口；
- 所有类不继承或实现``EJB``框架所需的特定类和接口。

``POJO``是用来强调给定的对象是一个原始的Java对象，而不是一个特殊的类，也不是一个``Enterprise JavaBean``。

### 一、简单POJO例子

基于上面提到的规则，定义了下面的一个简单``POJO``类：

```java
public class Employee {
   private int id;
   private String firstName; 
   private String lastName;   
   private int salary;  

   public Employee() {}
   public Employee(String fname, String lname, int salary) {
      this.firstName = fname;
      this.lastName = lname;
      this.salary = salary;
   }
   
   public int getId() {
      return id;
   }
   
   public void setId( int id ) {
      this.id = id;
   }
   
   public String getFirstName() {
      return firstName;
   }
   
   public void setFirstName( String first_name ) {
      this.firstName = first_name;
   }
   
   public String getLastName() {
      return lastName;
   }
   
   public void setLastName( String last_name ) {
      this.lastName = last_name;
   }
   
   public int getSalary() {
      return salary;
   }
   
   public void setSalary( int salary ) {
      this.salary = salary;
   }
}
```

## Hibernate 映射文件

对象关系映射通常都是定义在一个XML文档中。该映射文件告诉Hibernate如果将定义的Java类映射到数据库中的数据表。

尽管很多Hibernate用户都选择使用人工方式来写XML文档。但是现在有很多现有的工具可以用来生成映射文档，其中包含供Hibernate高级用户使用的``XDoclet``, ``Middlegen``以及``AndroMDA``。

对于之前给出的简单的``POJO``类，假设它需要保存到下面的RDBMS数据表中，以及从中检索数据:

```sql
create table EMPLOYEE (
	id int not null auto_increment,
    first_name varchar(20) default null,
    last_name varchar(20) default null,
    salaary int default null,
    primary key (id)
);
```

定义映射文件:

```xml
<?xml version = "1.0" encoding = "utf-8"?>
<!DOCTYPE hibernate-mapping PUBLIC 
"-//Hibernate/Hibernate Mapping DTD//EN"
"http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd"> 

<hibernate-mapping>
   <class name = "Employee" table = "EMPLOYEE">
      
      <meta attribute = "class-description">
         This class contains the employee detail. 
      </meta>
      
      <id name = "id" type = "int" column = "id">
         <generator class="native"/>
      </id>
      
      <property name = "firstName" column = "first_name" type = "string"/>
      <property name = "lastName" column = "last_name" type = "string"/>
      <property name = "salary" column = "salary" type = "int"/>
      
   </class>
</hibernate-mapping>
```

一般映射文件的文件名格式为: ``<classname>.hbm.xml``。例如上面的映射文件我们可以命名为: ``Employee.hbm.xml``。

下面是针对映射文件中涉及到的标签元素给出的具体解释:

- 映射文件使用``<hibernate-mapping>``标签作为根标签元素，它包含所有的``<class>``标签元素；
- ``<class>``标签是用来定义java类到数据表的映射关系的。Java类名和数据表名称分别由标签的``name``和``table``属性指定；
- ``<meta>``标签用于创建类的描述信息，是可选标签；
- ``<id>``标签映射Java类的唯一id属性到数据表的主键。该标签的``name``属性指定类的属性名，``column``则指定数据表的字段名。``type``属性为hibernate映射类型，将Java数据类型转化为SQL数据类型。
- ``<generator>``标签元素是``<id>``标签的子元素，用来自动生成主键值。其中``class``属性设置为``native``，以使Hibernate根据底层数据库的功能选择``identity``,``sequence``或``hilo``算法来生成主键；
- ``<property>``标签则用来将java类中的属性映射到数据表中的字段。``name``属性指定java类的属性名，相应的，``column``指定数据表对应的字段名称。``type``为hibernate映射类型。

除了上面提到的这些标签元素和属性外，其实还有其他的标签元素和属性。这里只不过是简单地给出了常用的标签元素及其属性的解释。

## Hibernate 映射类型

当我们配置**Hibernate映射文件**时，我们需要将Java数据类型映射转化为RDBMS数据类型。在映射文件中生命的**类型(types)**既不是java数据类型，也不是SQL 数据据数据类型。我们一般称其为**Hibernate mapping types(hibernate映射类型)**,它们能够将java数据类型转化为SQL数据类型，反之亦然。

下面给出了所有基本的，日期和时间，大对象以及其他各种内置映射类型。

### 一、原始类型(Primitive Types)


|Mapping type| Java type|ANSI  SQL Type|
|:-------:|:----:|:----:|
|integer|int or java.lang.Integer| INTEGER|
|long| long or java.lang.Long|BIGINT|
|short| short or java.lang.Short|SMALLINT|
|float|float or java.lang.Float|FLOAT|
|double|double or java.lang.Double|DOUBLE|
|big_decimal|java.math.BigDecimal|NUMERIC|
|character|java.lang.String|CHAR(1)|
|string|java.lang.String|VARCHAR|
|byte|byte or java.lang.Byte|TINYINT|
|boolean|boolean or java.lang.Boolean|BIT|
|yes/no|boolean or java.lang.Boolean|CHAR(1)('Y' or 'N')|
|true/false|boolean or java.lang.Boolean|CHAR(1)('Y' or 'N')|

### 二、日期和时间类型

|Mapping Type|Java Type | ANSI SQL Type|
|:--:|:---:|:---:|
|date|java..util.Date or java.sql.Date|DATE|
|time|java.util.Date or java.sql.Date|TIME|
|timestamp|java.util.Date or java.sql.Timestamp|TIMESTAMP|
|calendar|java.util.Calendar|TIMESTAMP|
|calendar_date|java.util.Calendar|DATE|

### 三、二进制和大对象类型

|Mapping Type|Java Type|ANSI SQL Type|
|:-----:|:----:|:----:|
|binary|byte[]|VARBINARY(or BLOB)|
|text|java.lang.String|CLOB|
|serializable|任何实现java.io.Serializable接口的类|VARBIANRY(or BLOB|
|clob|java.sql.Clob|CLOB|
|blob|java.sql.Blob|BLOB|

### 四、JDK相关类型

|Mapping Type|Java Type|ANSI SQL Type|
|:----:|:----:|:-----:|
|class|java.lang.Class|VARCHAR|
|locale|java.util.Locale|VARCHAR|
|timezone|java.util.TimeZone|VARCHAR|
|currency|java.util.Currency|VARCHAR|

## Hibernate 使用实例

接下来我们将通过一个简单的例子来了解**Hiberate**是如何为独立应用程序提供持久化服务的。下面使用Hibernate技术分几个不同的步骤来创建一个Java应用程序。


### 一、创建POJO类

创建应用程序的第一步就是创建Java POJO类，这取决与应用程序中需要保留到数据库的类。这里我们创建一个拥有``getter``和``setter``方法的``Employee``类，并让它成为``JavaBean``兼容类。

```java
public class Employee {
   private int id;
   private String firstName; 
   private String lastName;   
   private int salary;  

   public Employee() {}
   public Employee(String fname, String lname, int salary) {
      this.firstName = fname;
      this.lastName = lname;
      this.salary = salary;
   }
   
   public int getId() {
      return id;
   }
   
   public void setId( int id ) {
      this.id = id;
   }
   
   public String getFirstName() {
      return firstName;
   }
   
   public void setFirstName( String first_name ) {
      this.firstName = first_name;
   }
   
   public String getLastName() {
      return lastName;
   }
   
   public void setLastName( String last_name ) {
      this.lastName = last_name;
   }
   
   public int getSalary() {
      return salary;
   }
   
   public void setSalary( int salary ) {
      this.salary = salary;
   }
}
```

### 二、创建数据表

第二步，就是要在数据库中创建数据表。一张数据表对应一个持久化类。定义``EMPLOYEE``表来对应``Employee``持久化类。

```sql
create table EMPLOYEE (
   id INT NOT NULL auto_increment,
   first_name VARCHAR(20) default NULL,
   last_name  VARCHAR(20) default NULL,
   salary     INT  default NULL,
   PRIMARY KEY (id)
);
```

### 三、创建映射文件

创建一个映射文件来告诉Hibernate如何将持久化类映射到数据表。

**``Employee.hbm.xml``**:

```xml
<?xml version = "1.0" encoding = "utf-8"?>
<!DOCTYPE hibernate-mapping PUBLIC 
"-//Hibernate/Hibernate Mapping DTD//EN"
"http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd"> 

<hibernate-mapping>
   <class name = "Employee" table = "EMPLOYEE">
      
      <meta attribute = "class-description">
         This class contains the employee detail. 
      </meta>
      
      <id name = "id" type = "int" column = "id">
         <generator class="native"/>
      </id>
      
      <property name = "firstName" column = "first_name" type = "string"/>
      <property name = "lastName" column = "last_name" type = "string"/>
      <property name = "salary" column = "salary" type = "int"/>
      
   </class>
</hibernate-mapping>
```

### 四、创建应用程序类

最后，我们创建一个应用程序类来做简单的测试。例如：保存一些``Employee``数据，执行``CRUD``操作等。

**``ManageEmployee.java``**:

```java
import java.util.List; 
import java.util.Date;
import java.util.Iterator; 
 
import org.hibernate.HibernateException; 
import org.hibernate.Session; 
import org.hibernate.Transaction;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

public class ManageEmployee {
   private static SessionFactory factory; 
   public static void main(String[] args) {
      
      try {
         factory = new Configuration().configure().buildSessionFactory();
      } catch (Throwable ex) { 
         System.err.println("Failed to create sessionFactory object." + ex);
         throw new ExceptionInInitializerError(ex); 
      }
      
      ManageEmployee ME = new ManageEmployee();

      /* Add few employee records in database */
      Integer empID1 = ME.addEmployee("Zara", "Ali", 1000);
      Integer empID2 = ME.addEmployee("Daisy", "Das", 5000);
      Integer empID3 = ME.addEmployee("John", "Paul", 10000);

      /* List down all the employees */
      ME.listEmployees();

      /* Update employee's records */
      ME.updateEmployee(empID1, 5000);

      /* Delete an employee from the database */
      ME.deleteEmployee(empID2);

      /* List down new list of the employees */
      ME.listEmployees();
   }
   
   /* Method to CREATE an employee in the database */
   public Integer addEmployee(String fname, String lname, int salary){
      Session session = factory.openSession();
      Transaction tx = null;
      Integer employeeID = null;
      
      try {
         tx = session.beginTransaction();
         Employee employee = new Employee(fname, lname, salary);
         employeeID = (Integer) session.save(employee); 
         tx.commit();
      } catch (HibernateException e) {
         if (tx!=null) tx.rollback();
         e.printStackTrace(); 
      } finally {
         session.close(); 
      }
      return employeeID;
   }
   
   /* Method to  READ all the employees */
   public void listEmployees( ){
      Session session = factory.openSession();
      Transaction tx = null;
      
      try {
         tx = session.beginTransaction();
         List employees = session.createQuery("FROM Employee").list(); 
         for (Iterator iterator = employees.iterator(); iterator.hasNext();){
            Employee employee = (Employee) iterator.next(); 
            System.out.print("First Name: " + employee.getFirstName()); 
            System.out.print("  Last Name: " + employee.getLastName()); 
            System.out.println("  Salary: " + employee.getSalary()); 
         }
         tx.commit();
      } catch (HibernateException e) {
         if (tx!=null) tx.rollback();
         e.printStackTrace(); 
      } finally {
         session.close(); 
      }
   }
   
   /* Method to UPDATE salary for an employee */
   public void updateEmployee(Integer EmployeeID, int salary ){
      Session session = factory.openSession();
      Transaction tx = null;
      
      try {
         tx = session.beginTransaction();
         Employee employee = (Employee)session.get(Employee.class, EmployeeID); 
         employee.setSalary( salary );
		 session.update(employee); 
         tx.commit();
      } catch (HibernateException e) {
         if (tx!=null) tx.rollback();
         e.printStackTrace(); 
      } finally {
         session.close(); 
      }
   }
   
   /* Method to DELETE an employee from the records */
   public void deleteEmployee(Integer EmployeeID){
      Session session = factory.openSession();
      Transaction tx = null;
      
      try {
         tx = session.beginTransaction();
         Employee employee = (Employee)session.get(Employee.class, EmployeeID); 
         session.delete(employee); 
         tx.commit();
      } catch (HibernateException e) {
         if (tx!=null) tx.rollback();
         e.printStackTrace(); 
      } finally {
         session.close(); 
      }
   }
}
```

### 五、编译执行

通过编译执行，我们可以得到下面的测试结果：

```sh
$java ManageEmployee
.......VARIOUS LOG MESSAGES WILL DISPLAY HERE........

First Name: Zara  Last Name: Ali  Salary: 1000
First Name: Daisy  Last Name: Das  Salary: 5000
First Name: John  Last Name: Paul  Salary: 10000
First Name: Zara  Last Name: Ali  Salary: 5000
First Name: John  Last Name: Paul  Salary: 10000
```

``EMPLOYEE``表中的数据：

```sh
mysql> select * from EMPLOYEE;
+----+------------+-----------+--------+
| id | first_name | last_name | salary |
+----+------------+-----------+--------+
| 29 | Zara       | Ali       |   5000 |
| 31 | John       | Paul      |  10000 |
+----+------------+-----------+--------+
2 rows in set (0.00 sec

mysql>
```

## Hibernate O/R 映射

之前，我们已经熟悉了Hibernate的基本``O/R``映射的使用，但是还有很多映射我们还需要进一步的了解。如：

- 集合的映射
- 实体类之间的关联映射
- 组件映射

### 一、集合映射

如果持久化类中包含某个属性为集合类型，我们也需要将集合类型值映射到数据表中。**Hibernate**能够持久化的集合实例有``java.util.Map``、``java.util.Set``、``java.util.SortedMap``、``java.util.SortedSet``、``java.util.List``以及持久化实例中的数组(``array``)。

|Collection Type|Mapping Description|
|:----:|:----:|
|[java.util.Set](#Set-Mapping)|使用``<set>``标签元素进行映射并使用``java.util.HashSet``进行初始化|
|[java.util.SortedSet](#SortedSet-Mapping)|使用``<set>``标签进行映射并用``java.util.TreeSet``初始化，属性``sort``可以设置为``comparator``或者``natural ordering``|
|[java.util.List](#List-Mapping)|使用``<list>``标签进行映射，并用``java.util.ArrayList``初始化|
|[java.util.Collection](#Collection-Mapping)|使用``<bag>``或``<ibag>``标签进行映射配置并使用``java.util.ArrayList``初始化|
|[java.util.Map](#Map-Mapping)|使用``<map``标签进行映射并使用``java.util.HashMap``初始化|
|[java.util.SortedMap](#SortedMap-Mapping)|使用``<map``标签进行映射并用``java.util.TreeMap``初始化。属性``sort``可以设置为``comparator``或``natural ordering``|

对于数组类型的映射，针对Java原始值类型使用``<primitive-array>``标签，其他的数组类型则使用``<array>``。但是一般很少使用到。

**[notice]**:如果需要映射用户自定义的集合接口，切该集合接口不是**Hiberate**直接支持的，就需要告诉Hibernate定义集合的语义，通常是很难实现的，一般不推荐使用。

#### Set-Mapping

#### SortedSet-Mapping

#### List-Mapping

#### Collection-Mapping

#### Map-Mapping

#### SortedMap-Mapping

### 二、关联映射

实体类和数据表之间的映射是``ORM``的灵魂。以下是可以表示对象之间关系的四种方式。关联映射可以是单向的，也可以是双向的。

|Mapping Type|Description|
|:----:|:----:|
|[Many-to-One](#Many-to-One)|多对一关系的映射|
|[One-to-One](#One-to-One)|一对一关系的映射|
|[One-to-Many](#One-to-Many)|一对多关系的映射|
|[Many-to-Many](#Many-to-Many)|多对多关系的映射|

#### Many-to-One

#### One-to-One

#### One-to-Many

#### Many-to-Many

### 三、组件映射

在应用程序中，有很大的可能性一个实体类会持有另一个实体的引用最为成员变量。如果别引用的类没有自己的申明周期并且完全依赖与拥有的实体类的生命周期，那么所引用的类称为**组件类**。

组件的映射可以以类似集合映射的方式进行，但有点不同与常规的集合映射：

|Mapping Type|Description|
|:----:|:----:|
|[Component Mappings]()|对持有另一个类作为成员变量的实体类进行映射|

