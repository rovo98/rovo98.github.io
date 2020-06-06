---
title: Singleton Design pattern
author: rovo98
date: '2019.10.11 22:43:00'
categories:
  - Java
tags:
  - design-pattern
abbrlink: a10d2fff
---

最近在看 『Refacting to Patterns』，结合之前看的 Test Driven-Practical TDD and Acceptance TDD for Java Developers 提到的测试驱动开发（TDD）。虽然早些时候，我已经有对一些设计模式有一定了解，但只有对创建型的设计模型有所应用，比如Singleton、Builder、Factory、AbstractFactory。而其他的行为型和结构型的设计模型，只有在阅读一些源代码的时候偶尔才有看到，如 Java 集合框架中使用的 Iterator 模式，然而自己却很少使用。

为了更好地执行 TDD 过程中的重构，以及看懂优秀项目的源代码，我觉得我有必要开始重新更深入地学习设计模式。

单例模式，即 Gof （Gangs of Four）设计模式中创建型（Creational）设计模式之一。用于限制类的实例化，它只允许当前 JVM 执行上下文中只能拥有限制类的一个实例。从定义来看，似乎它的实现应该比较简单，但是在实际实现时，它有许多需要注意的点。在 Java 中，光它实现方式现已有许多种。因此，本文将介绍单例模式的实现方法，简单分析每一种方法的优缺点，最后，再说明应用单例模式时可能遇到的问题以及相应解决办法。

<!-- more -->

## 1. 单例模式实现方式

### 1.1 饿汉式

在饿汉式的实现中，单例类的实例在类加载的时候创建，即类初始化对静态成员变量初始化时，创建该类的实例。这是最简单的实现方式，但却存在明显的缺点，它不管应用程序是否需要该类的实例，就创建相应的实例。

```java
public class EagerSingleton {
    private static final EagerSingleton INSTANCE = new EagerSingleton();

    // this class can not be instanced.
    private EagerSingleton() {}

    public static EagerSingleton getInstance() {
        return INSTANCE;
    }
}
```

如果该类的实例不是一个大对象时，若我们容忍应用程序在运行时，该对象的实例存在但不使用，则该实现方式将是最佳方案。

### 1.2 静态代码块

与饿汉式实现相似，同样地，类加载时，在初始化（initialization）阶段除了对静态成员变量进行初始化外，还会执行静态代码块。

```java
public class StaticBlockSingleton {
    private static StaticBlockSingleton instance;

    private StaticBlockSingleton() {}

    static {
        try {
            instance = new StaticBlockSingleton();
        } catch (Exception e) {
            throw new RuntimeException("Exception occured in creating singleton instance!");
        }
    }

    public static StaticBlockSingleton getInstance() {
        return instance;
    }
}
```

这种方式和饿汉式存在相同的问题，它不管应用程序是否需要该类的实例，在类加载时，相应的实例就会被创建。

### 1.3 懒汉式

不同于饿汉式，懒汉式实现方式将实例的创建延迟到 ``getInstance`` 方法调用时。

```java
public class LazySingleton {
    private static LazySingleton instance = null;

    private LazySingleton() {}

    public static LazySingleton getInstance() {
        if (instance == null) {
            instance = new LazySingleton();
        }
        return instance;
    }
}
```

首先，在实例被真正需要才创建是一种非常好的策略，当创建该类的实例是一个较昂贵的操作时，它比饿汉式表现更好。上面的代码可以在单线程环境下正常执行，但在多线程环境下，单例模式将被破坏，可能会有多个线程同时进入 ``if`` 代码块，导致多个实例被创建出来。为此，我们可能还需要线程安全的实现方式。


### 1.4 线程安全式

#### 1.4.1 synchronized 

实现线程安全的最简单方式是，在懒汉式实现的基础上，对 ``getInstance`` 方法使用 ``synchronized`` 关键字进行修饰即可。这样可以确保某一时间只有一个线程可以执行该方法，其他的线程需要等待该执行线程释放该类的锁对象。

```java
public class SynchronizedSingleton {
    private static volatile SynchronizedSingleton instance;

    private SynchronizedSingleton() {}

    public static synchronized SynchronizedSingleton getInstance() {
        if (instance == null) {
            instance = new SynchronizedSingleton();
        }
        return instance;
    }
}
```

#### 1.4.2 double-checking

```java
public class DoubleCheckingSingleton {
    private static volatile DoubleCheckingSingleton instance;

    private DoubleCheckingSingleton() {}

    public static DoubleCheckingSingleton getInstance() {
        if (instance == null) {
            synchronized (DoubleCheckingSingleton.class) {
                if (instance == null) {
                    instance = new DoubleCheckingSingleton();
                }
            }
        }
        return instance;
    }
}
```

双重检查机制——在使用 ``synchronized`` 关键字同步创建单例的代码块的时候，需要在同步的代码块再次使用 ``if`` 来判断实例是否已经创建。因为可能存在多个线程进入第一个 ``if`` 块，然后阻塞等待，如果没有在 ``synchronized`` 块中多设置一个 ``if`` 来判断实例是否创建，此时将破坏单例模型的原则。

{% note warning %}
注意上面的两个实现都应该使用 ``volatile`` 关键字来修饰单例成员（避免其他线程在实例创建之前引用该变量，而在之后运行时出现 ``NPE`` 异常）。
{% endnote %}

### 1.5 静态内部类——Bill Pugh Singleton

```java
public class BillPughSingleton {
    private static SingletonHolder {
        private static final BillPughSingleton INSTANCE = new BillPughSingleton();
    }

    private BillPughSingleton() {}

    public static BillPughSingleton getInstance() {
        return SingletonHolder.INSTANCE;
    }
}
```

该实现方式主要利用 Java 的加载和初始化过程，loading -> Linking -> Initialization。其中初始化阶段主要是初始化静态成员变量并执行静态代码块。因此，``BillPughSingleton`` 只有在执行 ``getInstance()`` 方法时，才会将 ``SingletonHolder`` 加载到方法区中（method area），再对其静态成员变量进行初始化。

### 1.6 枚举-Enum Singleton

```java
public Enum EnumSingleton {
    INSTANCE;

    public void someMethod(String param) {
        // do something.
    }
}
```

根据 Java 对 ``Enum`` 的实现文档，``Enum`` 隐式地保证了线程安全以及单例。因此，使用枚举来实现单例模式也是一个不错的选择。

## 2. 序列化问题

虽然上面我们已经了解了许多单例模式的实现方式，但在实际使用的时候，我们有可能会遇到一些问题。例如：在序列化和反序列化时就有可能打破单例模式。我们看下面一个例子。

``DemoSingleton.java``
```java
import java.io.Serializable;
public DemoSingleton implements Serializable {
    private static class SingletonHolder {
        private final static DemoSingleton INSTANCE = new DemoSingleton();
    }
    public static DemoSingleton getInstance() {
        return SingletonHolder.INSTANCE;
    }
    // this class will not be instanced
    private DemoSingleton() {}

   // protected Object readResolve() {
   //     return SingletonHolder.INSTANCE;
   // }
   private int id;
   public void setI(int i) {
        this.i = i;
   }
   public int getI() {
        return i;
   }
}
```

``SerialzableProblem.java``
```java
public class SerialzableProblem {
    static DemoSingleton instanceOne = DemoSingleton.getInstance();

    public static void main(String[] args) {
        try {
            // serialized to a file.
            ObjectOutput out = new ObjectOutputStream(new FileOutputStream("filename.ser"));
            out.writeObject(instanceOne);
            out.close();

            instanceOne.setI(20);

            // serialized to a file
            ObjectInput in = new ObjectInputStream(new FileInputStream("filename.ser"));
            DemoSingleton instanceTwo =  (DemoSingleton) in.readObject();
            in.close();

            System.out.println(instanceOne.getI());
            System.out.println(instanceTwo.getI());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    }
}
```

Output:
```txt
20
10
```

这意味着，JVM 环境中出现了 ``DemoSingleton`` 的多个实例。这种情况下，单例模式被打破。我们需要在 ``DemoSingleton`` 类中添加 ``readResolve`` 方法来解决找一个问题。

类在反序列化的时候会调用 ``readResolve``，此时返回该类的唯一单例。

## 3. 最佳实践

最佳实践的代码模板，能解决线程安全问题和序列化反序列化可能破坏单例模式的问题。

```java
public class BillPughSingleton implements Serializable {
    private static final long serialVersionUID = 1L;

    private class SingletonHolder {
        private static final BillPughSingleton INSTANCE = new BillPughSingleton();
    }

    // this class will not be instanced.
    private BillPughSingleton() {}

    public static BillPughSingleton getInstance() {
        return SingletonHolder.INSTANCE;
    }

    protected Object readResolve() {
        return SingletonHolder.INSTANCE;
    }
}
```

## 4. 用 Java 的反射来破坏单例模式

通过使用反射（Reflection）可以破坏上面的所有单例模式实现方式。

```java
import java.lang.reflect.Constructor;

public class ReflectSingletonTest {
    public static void main(String[] args) {
        BillPughSingleton instanceOne = BillPughSingleton.getInstance();
        BillPughSingleton instanceTwo = null;
        try {
            Constructor[] constructors = BillPughSingleton.class.getDeclaredConstructors();
            for (Constrctor constructor : constructors) {
                // Destroy the singleton pattern
                constructor.setAccessible(true);
                instanceTwo = (BillPughSingleton) constructor.newInstance();
                break;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        System.out.println(instanceOne.hashCode());
        System.out.println(instanceTwo.hashCode());
    }
}
```

> References
> 1. [https://howtodoinjava.com/design-patterns/creational/singleton-design-pattern-in-java/](https://howtodoinjava.com/design-patterns/creational/singleton-design-pattern-in-java/)
> 2. [https://www.journaldev.com/1377/java-singleton-design-pattern-best-practices-examples](https://www.journaldev.com/1377/java-singleton-design-pattern-best-practices-examples)
