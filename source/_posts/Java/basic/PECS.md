---
title: Java 泛型 PECS
author: rovo98
date: '2021-11-23 22:15'
categories:
  - Java
abbrlink: a3d08d1f
---

在 Java 的泛型集合使用中，我们经常可以看到这样的语法：``<? super T>`` 、``<? extends T>``。例如

```java
boolean addAll(Collection<? extends E> c);

public static <T> boolean addAll(Collection<? super T> c, T... elements);
```

上面的两个方法，前一个是负责将集合 ``c`` 中的元素添加到当前实例集合中，而后一个方法是将 ``elements`` 添加到指定集合 ``c`` 中。这一使用方式通常称为 **PECS** (由 Joshua Bloch 在 Effective Java 一书中首次提到)。
> Producer extends Consumer super

<!-- more -->

## 为什么使用泛型通配符？

Java 的泛型用于提供类型安全（type safety）和不变性（invariant）支持。例如 ``List<Integer>`` ，此时 Java 便能确保该集合中的元素都是 ``Integer``。

但在许多时候，我们可能面对这样的场景：需要将子类型或超类型作为参数传递给一个方法，以完成具体的任务。此时，我们需要引入协变（covariance，限制引用）及逆变（contra-variance，扩展引用）。

## 理解 <? extends T>

我们可以联系现实，考虑这样一个例子，假设有一篮子水果，我们需要从篮子中取出水果，且必须确保取出的东西一定是水果。

那么在该例子，我们便可以用 ``List<? extends Fruit>`` 来定义水果集合：

```java
class Fruit {
    @Override
    public String toString() {
        return "I am a Fruit !!";
    }
}
class Apple extends Fruit {
    @Override
    public String toString() {
        return "I am an Apple !!";
    }
}
public class ProducerExtendsExample {
    public static void main(String[] args) {
        // List of apples
        List<Apple> apples = new ArrayList<>();
        apples.add(new Apple());
        
        // We can assign a list of apples to a basket of fruits.
        // because apple is subtype of fruit
        List<? extends Fruit> basket = apples;
        
        // Here we know that in basket there is nothing but fruit only
        for (Fruit fruit : basket) {
            System.out.println(fruit);
        }
        
        // basket.add(new Apple()); // Compile time error
        // basket.add(new Fruit()); // Compile time error
    }
}
```

从上面例子上看，``basket`` 篮子中我们能够确保其中的所有元素均是 ``Fruit``。在最后两行代码，我们尝试向该篮子添加一个 ``Apple`` 和 ``Fruit`` ，此时 Java 编程器并不允许，这是因为 ``<? extends Fruit>`` 仅告诉了编译器要处理 ``Fruit`` 的子类型，但它并不知道具体的实际子类型是什么，因此无法向 ``basket`` 中添加元素。

> 在上面例子中，``List<? extends Fruit> baskset`` 可以看作是一个生产者，负责产出水果。
>
> 因此，当我们只需要从一个集合中检索元素时，可以把该集合当作是一个生产者，并使用 ``<? extends T> `` 语法。

## 理解 <? super T>

对于 ``<? super T>`` ，我们对上述例子进行简单修改，考虑将不同的水果添加到篮子中，此时篮子可以看作是一个消费者：

```java
class Fruit {
    @Override
    public String toString() {
     	return "I am a Fruit !!";   
    }
}
class Apple extends Fruit {
    @Override
    public String toString() {
        return "I am an Apple !!";
    }
}
class AsianApple extends Apple {
    @Override
    public String toString() {
    	return "I am an AsianApple !!";
    }
}
public class ConsumerSuperExample {
    public static void main(String[] args) {
        // List of apples
        List<Apple> apples = new ArrayList<>();
        apples.add(new Apple());
        
        // We can assign a list of apples to a basket of apples.
        List<? super Apple> basket = apples;
        
        basket.add(new Apple()); // Successful
        basket.add(new AsianApple()); // Successful
        // basket.add(new Fruit()); // Compile time error
    }
}
```

可以看到，我们能够把 ``Apple`` 以及  ``AsianApple`` 放入到 ``basket`` 篮子中，而 ``Fruit`` 则不行。这是因为 ``List<? super Apple>`` 期望包含的对象引用应该是 ``Apple`` 的超类，尽管我们不知道具体的超类是什么，但通过李氏原则，在 Java 中，我们永远可以将子类型赋予其超类型，因此，我们可以把 ``Apple`` 和 ``AsianApple`` 放入到 ``basket`` 中，因为它们都是 ``? super Apple`` 的子类型。

> 在上述例子可以了解到，集合 ``List<? super Apple> basket`` 负责消费元素，i.e 苹果。
>
> 因此，当我们仅需要向某一集合中添加元素时，可以考虑把该集合当作是一个消费者，使用 ``<? super T> `` 语法来处理。

## 总结

基于上述例子，对于 PECS 原则，我们可以做以下总结：

1、当需要从一个集合中检索类型 T 的对象时，使用 ``<? extends T>`` 通配符语法；

2、当需要将类型 T 的对象添加到某一集合中时，使用 ``<? super T>`` 通配符语法；

3、如果需要同时处理两种语义时，则不应该使用通配符；

## Refs

1. https://howtodoinjava.com/java/generics/java-generics-what-is-pecs-producer-extends-consumer-super/
2. https://stackoverflow.com/questions/2723397/what-is-pecs-producer-extends-consumer-super

