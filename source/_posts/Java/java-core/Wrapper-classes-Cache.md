---
title: Java 封装类内部缓存
author: rovo98
date: 2019.5.17
categories: Java
tags:
  - basic
abbrlink: 1017901c
---

在 Java 中通过 ``new`` 关键字等其他方式在堆（heap）上创建对象是一个比较耗费资源的操作。 Java 在封装类（Wrapper classes）上使用内部缓存来使封装类的某些常用值使用更高效。

与 ``String`` 类一样，Java 中的封装类都是不可变的（immutable）。Java 中的封装类与 String 类一样同样提供了类似的缓存池机制。这其实也是一个普遍的操作，对于较昂贵的资源创建操作，使用缓存来处理在其他地方也非常常见，如数据库连接池、线程池等。

<!-- more -->

## Integer 内部缓存

在 ``Integer`` 类中存在一个内部类 ``IntegerCache``，使用一个 ``Integer[]`` 数组来维持一组 ``Integer`` 实例，当我们使用以下语句时：

```java
Integer i = 10; // 或者
Integer i = Integer.valueOf(10);
```

``i`` 将存储一个指向已经缓存的 ``Integer`` 实例的引用。如果使用 ``new Integer(10)``，则会在堆上创建一个新的实例，而不是使用已缓存的实例。实际上，这一机制只有在使用 ``Integer.valueOf()`` 才起作用，本质上使用字面量的赋值最终也是通过调用 ``Integer.valueOf()`` 来实现的。在 Java 执行自动装箱（autoboxing）也是类似的。

``IntegerCache`` 类非常简单，我们可以看一下（jdk 1.8）：

```java
/**
 * Cache to support the object identity semantics of autoboxing for values between
 * -128 and 127 (inclusive) as required by JLS.
 *
 * The cache is initialized on first usage.  The size of the cache
 * may be controlled by the {@code -XX:AutoBoxCacheMax=<size>} option.
 * During VM initialization, java.lang.Integer.IntegerCache.high property
 * may be set and saved in the private system properties in the
 * sun.misc.VM class.
 */

private static class IntegerCache {
    static final int low = -128;
    static final int high;
    static final Integer cache[];

    static {
        // high value may be configured by property
        int h = 127;
        String integerCacheHighPropValue =
            sun.misc.VM.getSavedProperty("java.lang.Integer.IntegerCache.high");
        if (integerCacheHighPropValue != null) {
            try {
                int i = parseInt(integerCacheHighPropValue);
                i = Math.max(i, 127);
                // Maximum array size is Integer.MAX_VALUE
                h = Math.min(i, Integer.MAX_VALUE - (-low) -1);
            } catch( NumberFormatException nfe) {
                // If the property cannot be parsed into an int, ignore it.
            }
        }
        high = h;

        cache = new Integer[(high - low) + 1];
        int j = low;
        for(int k = 0; k < cache.length; k++)
            cache[k] = new Integer(j++);

        // range [-128, 127] must be interned (JLS7 5.1.7)
        assert IntegerCache.high >= 127;
    }

    private IntegerCache() {}
}
```

``Integer.valueOf()`` 方法：

```java
/**
 * Returns an {@code Integer} instance representing the specified
 * {@code int} value.  If a new {@code Integer} instance is not
 * required, this method should generally be used in preference to
 * the constructor {@link #Integer(int)}, as this method is likely
 * to yield significantly better space and time performance by
 * caching frequently requested values.
 *
 * This method will always cache values in the range -128 to 127,
 * inclusive, and may cache other values outside of this range.
 *
 * @param  i an {@code int} value.
 * @return an {@code Integer} instance representing {@code i}.
 * @since  1.5
 */
public static Integer valueOf(int i) {
    if (i >= IntegerCache.low && i <= IntegerCache.high)
        return IntegerCache.cache[i + (-IntegerCache.low)];
    return new Integer(i);
}
```

可以看到，``IntegerCache`` 是一个静态内部类，因此，只有我们调用 ``Integer.valueOf()`` 方法时，该类才会加载，然后创建缓存。以便提高资源重用率。

下面是使用 ``Integer`` 内部缓存的一个简单例子：

```java
public class IntegerCacheDemo {
    public static void main(String[] args) {
        Integer i1 = 100;
        Integer i2 = 100;
        Integer i3 = new Integer(100);

        System.out.println(i1 == i2);
        System.out.println(i1 == i3);
    }
}
```
```txt
# Output:
true
false
```

当程序执行第一条赋值语句时，``IntegerCache`` 会被加载，并创建相应的缓存池。之后 ``i2`` 的赋值使用的已缓存的实例。``i3`` 使用 ``new`` 关键字来创建实例，因此，它会在堆上创建一个新的实例对象。``==`` 对于作用于对象之间，比较的是对象的地址，因此，``i1 == i2`` 输出  ``true``， 而 ``i1 == i3`` 输出 ``false``。

### 修改缓存大小

从上面的 ``IntegerCache`` 类的实现来看，我们可以通过需求自己更改实例缓存范围的最大值，修改方式如下：

```txt
1. --XX:AutoBoxCache= 1000
2. -Djava.lang.Integer.IntegerCache.high = 1000
```

通过上面的修改后，``Integer`` 的缓存范围将变成 ``-128`` ~ ``1000``。需要注意的是，当前的实现中，并没有指定 ``IntegerCache.low`` 的取值。

## 其他封装类

通过查看 ``Integer`` 类的中 ``IntegerCache`` 的相关实现，我们了解的 ``Integer`` 的实例缓存方式。更多地，其他的封装类也有提供类似的机制：

1. ``java.lang.Boolean`` 默认存储两个实例 —— ``TRUE`` 和 ``FALSE``；
2. ``java.lang.Short`` 默认缓存范围为 ``-128 ~ 127``；
3. ``java.lang.Byte`` 默认缓存范围 ``-128 ~ 127``；
4. ``java.lang.Long`` 默认缓存范围为 ``-128 ~ 127``;
5. ``java.lang.Character`` 默认缓存范围为 ``0 ~ 127``；

需要说明的是，除了本文提到的 ``Integer`` 以外，其他的封装类只能使用默认的缓存范围，无法进行更改。``Float`` 和 ``Double`` 并没有提供这样的缓存机制。不同于这些封装类，``String`` 使用的是字符串池（string pool），采用不同的实现的方式。

``String`` 会为 ``String`` 字面量（literals）维持一个字符串池，该字符串池初始化为空，由 ``String`` 类维护，当字符串调用 ``intern`` 方法时，会将该字符串与字符串池中串使用 ``equals`` 方法进行比较，若返回 ``true`` 则直接使用字符串池中的串，返回该串的引用。若字符串池中不存在 ``equals`` 的串，则创建相应的串并添加到字符串池中。

```java
/**
 * Returns a canonical representation for the string object.
 * <p>
 * A pool of strings, initially empty, is maintained privately by the
 * class {@code String}.
 * <p>
 * When the intern method is invoked, if the pool already contains a
 * string equal to this {@code String} object as determined by
 * the {@link #equals(Object)} method, then the string from the pool is
 * returned. Otherwise, this {@code String} object is added to the
 * pool and a reference to this {@code String} object is returned.
 * <p>
 * It follows that for any two strings {@code s} and {@code t},
 * {@code s.intern() == t.intern()} is {@code true}
 * if and only if {@code s.equals(t)} is {@code true}.
 * <p>
 * All literal strings and string-valued constant expressions are
 * interned. String literals are defined in section 3.10.5 of the
 * <cite>The Java&trade; Language Specification</cite>.
 *
 * @return  a string that has the same contents as this string, but is
 *          guaranteed to be from a pool of unique strings.
 */
public native String intern();
```

更多详细相关内容见 [String literals](https://docs.oracle.com/javase/specs/jls/se8/html/jls-3.html#jls-3.10.5)。

> references:
> [https://docs.oracle.com/javase/specs/jls/se8/html/index.html](https://docs.oracle.com/javase/specs/jls/se8/html/index.html)
