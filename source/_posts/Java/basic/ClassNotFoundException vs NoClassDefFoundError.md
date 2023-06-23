---
title: ClassNotFoundException vs. NoClassDefFoundError
author: rovo98
date: '2021-11-27 17:08'
categories:
  - Java
abbrlink: dc53e26b
---

``ClassNotFoundException`` 和 ``NoClassDefFoundError`` 是我们运行 Java 程序时常面对的异常，那么导致它们出现的原因一般是什么呢？本文旨在介绍这两种异常，了解导致它们发生的原因，以及它们之间的区别，以便更好地了解该如何排查和解决相应问题。

<!-- more -->

了解过 Java 类加载机制的朋友，应该知道在 Java 中类定义了一种类型，需经过 classloader 加载后，jvm 运行时才可以使用，其中主要涉及 loading、linking (verification, preparation, resolution)、initialization。

虽然 ``ClassNotFoundException`` 和 ``NoClassDefFoundError`` 都表示在运行时找不到特定的类，但它们发生的场景不同，``ClassNotFoundException`` 主要发生在 loading 阶段，而后者主要发生在 linking 以及 initialization 阶段。

<!-- more -->

## ClassNotFoundException

据 JDK 文档说明, ``ClassNotFoundException`` 是一个检查型异常（checked Exception），在运行时尝试用 ``Class.forName()`` 或 ``ClassLoader.loadClass()`` 或 ``ClassLoader.findSystemClass()`` 按全称限定名加载特定类，而该类不在类路径时，抛出该异常，即在显式类加载过程中可能发生该异常。

例如，在不添加相关依赖的情况下尝试加载 JDBC 驱动：

```java
@Test(expected = ClassNotFoundException.class)
public void givenNoDrivers_whenLoadDriverClass_thenClassNotFoundException() 
 throws ClassNotFoundException {
    Class.forName("oracle.jdbc.driver.OracleDriver");
}
```

## NoClassDefFoundError

``NoClassDefFoundError`` 是一个错误（Error），特定类在编译阶段存在，而运行时丢失时，会导致该错误发生，例如类文件丢失或篡改等。一般在执行以下操作时发生：

- 使用 ``new`` 关键字初始化一个类实例；
- 一个方法调用触发的类加载（隐式类加载过程）；

通常发生在执行静态代码块或初始化静态字段（Initialization）失败的时候。要触发该错误的发生，我们可以考虑这些场景，如定义两个类 A 和 B，其中 B 依赖于 A，在编译完成后，删除 A 的字节码文件；或者在类初始化静态代码块中引入未检查异常（Unchecked Exception），使类初始化失败，从而导致 ``NoClassDefFoundError`` 错误发生。

```java
public class ClassWithInitErrors {
    static int data = 1 / 0;
}
public class NoClassDefFoundErrorExample {
    public ClassWithInitErrors getClassWithInitErrors() {
        return new ClassWithInitErrors();
    }
}
...
@Test(expected = NoClassDefFoundError.class)
public void givneInitErrorInClass_whenLoadingClass_thenNoClassDefFoundError() {
    NoClassDefFoundErrorExample example = new NoClassDefFoundErrorExample();
    example.getClassWithInitErrors();
}
```

## Summary

因为导致 ``ClassNotFoundException`` 以及 ``NoClassDefFoundError`` 的主要原因发生在运行时阶段，因此排查这些问题可能会消耗很多时间。在实践中可尝试以下方法：

- 确保 classpath 包含所需的类或类所在的 jar 包；
- 若 classpath 中存在该类，则很大可能它被覆盖了，需要找出应用真正使用的 classpath；
- 若应用使用了多个类加载器，则可能因双亲委派机制的可见性（子类加载器加载的类对其父类加载器不可见），而导致找不到类；

对 ``ClassNotFoundException`` 以及 ``NoClassDefFoundError`` 的对比总结：

| ClassNotFoundException                                       | NoClassDefFoundError                         |
| ------------------------------------------------------------ | -------------------------------------------- |
| 是一个检查型异常，``Exception`` 的子类                       | 是一个 ``Error``                             |
| 当应用程序显式地尝试在运行时加载类，而类未在 classpath 时抛出该异常 | 类编译阶段存在，而运行时阶段缺失会导致该错误 |
| 由应用程序本身抛出异常，可被以下方法：``Class.forName()``、``ClassLoader.loadClass()`` 和 ``ClassLoader.findSystemClass()`` 抛出 | 由 Java 运行时系统抛出错误                   |

## Refs

1、https://dzone.com/articles/java-classnotfoundexception-vs-noclassdeffounderro

2、https://www.baeldung.com/java-classnotfoundexception-and-noclassdeffounderror

3、https://www.geeksforgeeks.org/classnotfoundexception-vs-noclassdeffounderror-java/

