---
title: JVM知识体系 (一) | 类的装载
author: rovo98
date: '2019.04.04 12:00:00'
categories:
  - Java
tags:
  - JVM
toc_number: false
abbrlink: 4661f621
---

![class-loading-subsystem](/images/java/basic/class-loading-subsystem.png)

了解Java中**类的结构**(class file struture, 这里指``.class``文件的结构)、**类的加载机制**、**类的加载过程**、**类加载器的应用**。

<!-- more -->


## 一、类的结构

我们知道除了``java``以外，还有许多的编程语言(如：Groovy/Kotlin/Scala等)同样也是编译成``.class``字节码文件，然后由JVM执行的。可以看出JVM只关心``.class``文件，所以我们有必要了解一下这个**class**文件中到底包含什么东西。

JVM规范严格定义了**class**文件的格式，有严格数据结构，下面是``.class``文件的结构:

```txt
ClassFile {
    u4             magic;
    u2             minor_version;
    u2             major_version;
    u2             constant_pool_count;
    cp_info        constant_pool[constant_pool_count-1];
    u2             access_flags;
    u2             this_class;
    u2             super_class;
    u2             interfaces_count;
    u2             interfaces[interfaces_count];
    u2             fields_count;
    field_info     fields[fields_count];
    u2             methods_count;
    method_info    methods[methods_count];
    u2             attributes_count;
    attribute_info attributes[attributes_count];
}
```

### 1. 类文件的格式(The class file format)
- 每个类文件包含一个类或者接口的定义，虽然类或者接口不需要在文件中真正包含外部表示(因为类是由类加载器生成的)，但是我们通常**类或接口的任何有效表示称为类文件格式**；
- **一个类文件由8位(bit)的字节流组成**。所有16位，32位和64位字节分别通过读取两个，四个和八个连续8位字节构成。多字节数据项始终以大端顺序(big-endian)存储(即高字节位首先出现)。在Java SE平台中，接口``java.io.DataInput``和``java.io.DataOutput``以及``java.io.DataInputStream``和``java.io.DataOutputStream``等支持这种格式；
- JVM规范中定义了一组表示类文件数据的数据类型:``u1``, ``u2``, ``u4``分别表示无符号的一个，两个和四个字节的数量。在Java SE平台中，可以通过诸如``readUnsignedByte``, ``readUnsignedShort``和``java.io.DataInput``接口的``readInt``之类的方法来读取这些类型的数据;
- 规范中使用类似**C**语言结构符号编写的伪结构来表示类文件格式。为了避免与类的字段和类实例等混淆，将描述类文件结构的内容称为**项(item)**，多个连续的项按顺序存储在类文件中，无需填充和对齐；
- 一个**表(Tables)**包含一个或多个项(*item*)，用于表示多个类文件结构。**尽管使用类似C语言的数组语法来引用表项，但表是不同大小结构的流这一事实，意味着无法将表索引直接转换为表中的字节偏移量**。

### 2. 项含义简单说明

- 1、**magic**

``magic``项提供标识类文件格式的*magic number*, 这是一个预先定义好的值，是JVM用来识别``.class``类文件是否由合法的编译器产生。 预先定义的值是16进制格式，例如: ``0xCAFEBABE``

我们可以做以下测试来进行简单的验证:
-  首先编写一个简单的``Sample.java``源文件:
```java
public class Sample {
    public static void main(String[] args) {
        System.out.println("Magic Number");
    }
}
```
- 使用``javac``将其编译成``Sample.class``文件，打开并随意删除或修改一个或多个字符，然后保存
![sample-class-file](jvm-1-sample-class.png)
- ``java sample``查看结果
![](jvm-1-incompatible-magic-value.png)

- 2、**minor_version 和 major_version**
它们合在一起表示``.class``类文件的版本。JVM使用这个版本信息来识别当前的类文件是由哪个版本的编译产生的。规范用``M.m``的格式来表示版本，``M``表示主版本(``major_version``)，而``m``表示次版本(``minor_version``)。

{% note warning %}
**[Notice]**: 低版本的编译器生成的``.class``类文件可以被高版本的JVM执行，但是高版本的编译器生成的``.class``类文件无法被较低版本的JVM执行。

会报错: ``UnsupportedClassVersionError: ***``
{% endnote %}

{% note primary %}
JDK 1.0.2版本中的Oracle Java 虚拟机支持包含45.0 ~ 45.3版本的类文件格式。

JDK发布1.1.\*支持的类文件格式版本，范围为45.0 ~ 45.65535。 对于$k \gt 2$, JDK版本1.k 支持45.0 ~ 44 + k.0 范围内的类文件格式版本。

例如: JDK 1.8.0 版本支持的类文件格式版本范围为: 45.0 ~ 52.0
{% endnote %}

- 3、**constant_pool_count**

``constant_pool_count``项的值等于``constant_pool``表(*Table*)中的项(*item*)数加1。它表示常量池中存在的常量数(当编译Java文件时，对变量和方法的所有引用都存储在常量池作为符号引用-*Symbolic reference*)。

- 4、**constant_pool[]**

``constant_pool[]``是一个结构表(*Table*), 表示各种字符串常量，类和接口名称，字段名称以及在类文件结构及其子结构中引用的其他常量。每个常量池条目(*entry*)的格式由第一个"标记(*tag*)"字节表示。

- 5、**access_flags**

``access_flags``项提供关于类文件中声明的修饰符(*modifier*)的信息。``access_flags``的值用于表示对该类或接口属性的访问权限。

|Flag Name|Value|Interpretation|
|:---:|:---:|:---:|
|ACC\_PUBLIC|0x0001|声明``public``，可以从包的外部进行访问|
|ACC\_FINAL|0x0010|声明``final``, 不允许子类继承|
|ACC\_SUPER|0x0020|在调用``invokespecial``指令时特别处理超类的方法|
|ACC\_INTERFACE|0x0200|标明是一个接口，而不是一个类|
|ACC\_ABSTRACT|0x0400|声明``abstract``，不能实例化|
|ACC\_SYNTHETIC|0x1000|声明``synthetic``，表示类或者接口由编译器生成，不会出现在源代码中|
|ACC\_ANNOTATION|0x2000|声明一个注解``annotation``类型|
|ACC\_ENUM|0x4000|声明一个枚举``enum``类型|

- 6、**this_class**

该类项的值必须是常量池表(``constant_pool[]``)中的有效索引。索引处的常量池条目必须是一个``CONSTANT_Class_info``结构，表示此类文件定义的类或接口。简单的说，它表示类文件的完全限定名。

- 7、**super_class**

``super_class``表示当前类的直接超类的完全限定名。例如上面``Sample.java``文件。当我们编译它时，可以说``this_class``是``Sample``类，而``super_class``是``Object``类。

- 8、**interface_count**

``interface_count``表示当前类文件实现的接口数量。

- 9、**interface[]**

``interface[]``存放当前类文件实现的接口信息。

- 10、**fields_count**

``fields_count``表示当前类文件中的字段数(类或接口中声明的所有字段，包括类变量和实例变量)。

- 11、**fields[]**

``fields[]``表中的每个值必须是``field_info``结构，给出该类或接口中字段的完整描述。``fields``表仅包括由当前(*this*)类或接口声明的那些字段，不包括从超类(*super class*)或超接口(*super interface*)继承的字段的项。

- 12、**method_count**

``method_count``表示当前类文件中的方法的数量(即``methods[]``表中``method_info``项的数量)。

- 13、**methods[]**

``methods[]``表中的每个值必须是``method_info``结构，它给出了该类或接口中的方法的完整描述。
``method_info``结构表示该类或接口中声明的所有方法，包括实例方法、类方法、实例初始化方法和任何类的或接口的初始化方法。但是``methods[]``表不包含表示从超类或超接口继承的方法的项。

- 14、**attributes_count**

同上，``attributes_count``表示``attributes[]``表中``attribute_info``项的数量。

- 15、**attributes[]**

``attributes[]``表存放``attribute_info``结构项。提供当前类中所有属性的信息。

**类文件结构的整体布局**:

![class-file-structure](jvm-1-class-file-structure.png)

可以简单地将每个类的文件结构理解成一个个数据库，里面有常量池(``constant_pool``)、接口(``interfaces``)、字段(``fields``)、方法(``methods``)和属性(``attributes``)表，类似与数据库中的数据表，表与表之间存在关联，例如：常量池存放这其他表需要的所有字面量(*literal*)。

{% note primary %}
以上内容大多参照*The Java@ Virtual Machine Specification Java SE 8 Edition*

详细的内容，可以仔细阅读Hotspot JVM规范说明书给出的Class文件格式说明。
[https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.1](https://docs.oracle.com/javase/specs/jvms/se8/html/jvms-4.html#jvms-4.1)
{% endnote %}

{% note primary %}
**[参考链接]:**
[https://www.geeksforgeeks.org/java-class-file/](https://www.geeksforgeeks.org/java-class-file/)
{% endnote %}

## 二、加载机制

### 1. 类的入口

我们知道编程语言在计算机体系结构中的按功能的分层是属于上面三层的（汇编语言、高级语言、应用语言），在向低一级别虚拟机语言转换时，使用的是**翻译(Translation)**的方式，即将高一级别机器上的程序转换为低一级别机器上的一段等效程序，然后再执行。

Java、C等大多是用这种方式，例如我们回顾一下我们是如何运行一个C程序的:

- (1). 编写``helloworld.c``源文件:
```c
#include <stdio.h>

int main() {
    printf("hello, world!");
    return 0;
}
```
- (2). 使用``gcc/g++``编译器将它编译成机器指令集, 然后读取到内存直接在计算机的CPU上执行。从操作系统的层面上，就是一个进程的启动到结束的生命周期。
```bash
$ gcc helloworld.c -o helloworld # 默认输出 a.out
$ ./helloworld

hello, world!
```

下面我们再看Java的程序是如何运行的。

**简单的来说，编写Java程序源代码, 然后使用**``javac``**编译器将源代码编译成**``.class``**类文件，经过JVM的类加载子系统，将必要的数据装入内存区，然后由执行引擎执行（此过程是解释执行的，加上JIT及时编译）**。

- (1)先有源码:
```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("hello, world!");
    }
}
```
- (2) 编译执行:
```bash
$ javac HelloWorld.java
$ java HelloWorld

hello, world!
```

对比C语言在命令行直接运行编译后的``helloworld``二进制文件，Java则是在命令执行``.class``类文件，**从命令的区别，我们知道操作启动的其实是**``java``**进程, 而**``HelloWorld.class``类文件只是作为命令行参数，在操作系统看来``java``也是一个普通的进程而已，这个进程就是JVM的执行形态。

我们都是Java的入口方法是``public static void main(String[] args)``, 缺一不可，下面我们通过一个简单的例子来验证为什么？

- (1) 去掉``public``修饰:
![](jvm-1-public-error.png)
说明JVM在调用``main``方法时是在外部调用的(JVM调用``main``方法是底层的JNI方法调用)，为了确保能够调用``main``，入口方法需声明为``public``。
- (2) 去掉``static``修饰:
![](jvm-1-static-error.png)
JVM调用``main``方法时不会创建类的实例，因此将``main``方法修饰为``static``。
- (3) 修改方法的返回来类型为``int``:
![](jvm-1-return-type-error.png)
``void``类型JVM调用``main``方法后无需关心调用者的使用情况，执行完成就停止，简化JVM的设计。
- (4) 修改``main``为``main1``:
![](jvm-1-main1-error.png)
``main``方法的命名其实是约定俗成的，毕竟也是*c-family*语言，与C语言相同。

上面说了这么多，其实我们一般只关心下面这两点:
- ``HelloWorld``是如何被JVM使用的;
- ``HelloWorld``类里面的``main``方法是如何被执行的.

下面我们详细了解一下JVM是如何使用``HelloWorld``这个类文件的。

我们知道JVM的实现是由C/C++实现的(我们可以从下载的JDK中的``src``源代码中看到), JVM在跟``.class``打交道时需要用到JNI(*Java Native Interface*), 当我们在命令行执行java时，由C/C++实现的java应用程序通过JNI找到了``HelloWorld``中符合规范的``main``，然后开始调用。

- 源代码:
![](jvm-1-jdk8-launcher-source-codes.png)
- ``int JNICALL javaMain(void *args)``方法:
![](jvm-1-launcher-source-code-javaMain.png)

### 2. 类加载器

JVM在执行类的入口之前，首先必须找到类文件，然后将类文件装入JVM实例中，也就是JVM进程维护的内存区域(Runtime Data Area或Memory Area)中。我们都知道有一个叫做**类加载器(*ClassLoader*)**的工具负责把类加载到JVM实例中，抛开细节从操作系统层面观察，那么就是JVM实例在运行过程中通过IO从硬盘或者网络读取``.class``类文件，然后在JVM管辖的内存区域存放对应的文件。

我们对于类加载器的实现还不是很清楚，但是从功能需求上了解到，无非就是读取文件到内存，看起来是一个很简单的操作。

如果类加载器的实现是用C/C++实现的，那么大概可能是如下代码实现的:
```c
char *fgets( char *buf, int n, FILE *fp );
```

如果是JAVA实现的话(上面已经提到过我们可以用``java.io.InputStream``等接口来读取类文件中的数据), 那么也是很简单的:
```java
InputStream is = new FileInputStream("temporary/code/java/HelloWorld.class");
```

从操作系统层面看，如果只是加载，以上的代码就足以把类文件加载到JVM内存中。但是缺乏良好的管理，还必须设计一套规则来管理存放到内存中的类文件, **而这一套规则就是所谓的类的加载机制**。

在启动JVM的时候会把JRE默认的一些类加载到内存，这部分的类加载使用的是系统提供的内置类加载器``Bootstrap``和``Extensions``类加载器，但是内置的类加载器只能加载指定路径下的jar包(类文件集合)。JRE只是提供了底层所需的类，更多的业务需要我们从外部加载类来支持，所以我们需要指定新的类加载规则，以方便加载我们所需的外部路径的类文件。

#### 2.1. 系统默认加载器

##### 2.1.1 Bootstrap class loader

> 作用: 启动类加载器， 加载JDK核心类
> 实现: C/C++实现
> 类加载路径: ``/jre/lib``目录下的jar包和类文件

```java
import sun.misc.Launcher;

import java.net.URL;

/**
 * @author rovo98
 */
public class BoostrapClassLoaderTest {
    public static void main(String[] args) {
        URL[] urls = Launcher.getBootstrapClassPath().getURLs();
        for (URL url : urls) {
            System.out.println(url.toString());
        }
    }
}
```
```bash
$ javac BoostrapClassLoaderTest.java
$ java BoostrapClassLoaderTest

file:/opt/jdk1.8.0_181/jre/lib/resources.jar
file:/opt/jdk1.8.0_181/jre/lib/rt.jar
file:/opt/jdk1.8.0_181/jre/lib/sunrsasign.jar
file:/opt/jdk1.8.0_181/jre/lib/jsse.jar
file:/opt/jdk1.8.0_181/jre/lib/jce.jar
file:/opt/jdk1.8.0_181/jre/lib/charsets.jar
file:/opt/jdk1.8.0_181/jre/lib/jfr.jar
file:/opt/jdk1.8.0_181/jre/classes
```
##### 2.1.2.Extensions class loader
> 作用: 扩展类加载器，加载JAVA扩展类库
> 实现: Java实现
> 类加载器: ``sun.misc.Launcher$ExtClassLoader``
> 类加载路径: ``/jre/lib/ext``

```java
System.out.println(System.getProperty("java.ext.dirs"));

/opt/jdk1.8.0_181/jre/lib/ext:/usr/java/packages/lib/ext
```

实现原理：扩展类加载器``ExtClassLoader``本质上是``URLClassLoader``。

参考``jdk8``中的``sun.misc.Launcher.java``源码:

```java
// Launcher构造方法部分代码，获取类加载器
public Launcher() {
    Launcher.ExtClassLoader var1; // ExtClassLoader 类加载器
    try {
        // 1. 获取Extensions 类加载器
        var1 = Launcher.ExtClassLoader.getExtClassLoader();
    } catch (IOException var10) {
        throw new InternalError("Could not create extension class loader", var10);
    }

    try {
        this.loader = Launcher.AppClassLoader.getAppClassLoader(var1);
    } catch (IOException var9) {
        throw new InternalError("Could not create application class loader", var9);
    }
    ...
}
// ExtClassLoader 实现
static class ExtClassLoader extends URLClassLoader {
    private static volatile Launcher.ExtClassLoader instance;

    // 2. 获取Extensions类加载器实例(instance)
    // 可以看到是用了ClassLevelLock(类级别锁，在该类以及类的所有实例中，
    // 在同一时间内只有一个线程能够这一临界区Critical Section)实现实例的
    // 单例模式(Singleton Pattern)
    public static Launcher.ExtClassLoader getExtClassLoader() throws IOException {
        if (instance == null) {
            Class var0 = Launcher.ExtClassLoader.class;
            synchronized(Launcher.ExtClassLoader.class) {
                if (instance == null) {
                    // 3. 创建Extensions类加载器
                    instance = createExtClassLoader();
                }
            }
        }

        return instance;
    }
    // 4. 创建Extensions类加载器的具体实现
    private static Launcher.ExtClassLoader createExtClassLoader() throws IOException {
        try {
            return (Launcher.ExtClassLoader)AccessController.doPrivileged(new PrivilegedExceptionAction<Launcher.ExtClassLoader>() {
                public Launcher.ExtClassLoader run() throws IOException {
                    // 5. 获取Extensions类加载器加载目标类的目录
                    File[] var1 = Launcher.ExtClassLoader.getExtDirs();
                    int var2 = var1.length;

                    for(int var3 = 0; var3 < var2; ++var3) {
                        MetaIndex.registerDirectory(var1[var3]);
                    }

                    // 7 构造Extensions类加载器
                    return new Launcher.ExtClassLoader(var1);
                }
            });
        } catch (PrivilegedActionException var1) {
            throw (IOException)var1.getException();
        }
    }

    void addExtURL(URL var1) {
        super.addURL(var1);
    }

    // 8. Extensions类加载器构造方法
    public ExtClassLoader(File[] var1) throws IOException {
        super(getExtURLs(var1), (ClassLoader)null, Launcher.factory);
        SharedSecrets.getJavaNetAccess().getURLClassPath(this).initLookupCache(this);
    }

    // 6. Extensions类加载器加载目录路径
    private static File[] getExtDirs() {
        // 即 /jre/lib/ext 目录
        String var0 = System.getProperty("java.ext.dirs");
        File[] var1;
        if (var0 != null) {
            StringTokenizer var2 = new StringTokenizer(var0, File.pathSeparator);
            int var3 = var2.countTokens();
            var1 = new File[var3];

            for(int var4 = 0; var4 < var3; ++var4) {
                var1[var4] = new File(var2.nextToken());
            }
        } else {
            var1 = new File[0];
        }
        // var1(File[]):
        // /opt/jdk1.8.0_181/jre/lib/ext
        // /usr/java/packages/lib/ext
        // ...
        return var1;

    }

    private static URL[] getExtURLs(File[] var0) throws IOException {
        Vector var1 = new Vector();

        for(int var2 = 0; var2 < var0.length; ++var2) {
            // File 对象的list()方法会返回一个当前目录下的所有文件
            // 这里会返回类加载目录下的所有jar包等
            String[] var3 = var0[var2].list();
            if (var3 != null) {
                for(int var4 = 0; var4 < var3.length; ++var4) {
                    if (!var3[var4].equals("meta-index")) {
                        File var5 = new File(var0[var2], var3[var4]);
                        var1.add(Launcher.getFileURL(var5));
                    }
                }
            }
        }

        URL[] var6 = new URL[var1.size()];
        var1.copyInto(var6);
        return var6;
    }

    public String findLibrary(String var1) {
        var1 = System.mapLibraryName(var1);
        URL[] var2 = super.getURLs();
        File var3 = null;

        for(int var4 = 0; var4 < var2.length; ++var4) {
            URI var5;
            try {
                var5 = var2[var4].toURI();
            } catch (URISyntaxException var9) {
                continue;
            }

            File var6 = Paths.get(var5).toFile().getParentFile();
            if (var6 != null && !var6.equals(var3)) {
                String var7 = VM.getSavedProperty("os.arch");
                File var8;
                if (var7 != null) {
                    var8 = new File(new File(var6, var7), var1);
                    if (var8.exists()) {
                        return var8.getAbsolutePath();
                    }
                }
                var8 = new File(var6, var1);
                if (var8.exists()) {
                    return var8.getAbsolutePath();
                }
            }
            var3 = var6;
        }
        return null;
    }

    private static AccessControlContext getContext(File[] var0) throws IOException {
        PathPermissions var1 = new PathPermissions(var0);
        ProtectionDomain var2 = new ProtectionDomain(new CodeSource(var1.getCodeBase(), (Certificate[])null), var1);
        AccessControlContext var3 = new AccessControlContext(new ProtectionDomain[]{var2});
        return var3;
    }

    static {
        ClassLoader.registerAsParallelCapable();
        instance = null;
    }
}
```

##### 2.1.3.System class loader

> 作用: 系统类加载器，加载应用指定环境变量(classpath)路径下的类
> 类加载器: ``sun.misc.Launcher$AppClassLoader``
> 实现原理: ``AppClassLoader``本质上也是``URLClassLoader``

参考``jdk8``中的``sun.misc.Launcher.java``源码:

```java
// Launcher构造方法部分代码，获取类加载器
public Launcher() {
    Launcher.ExtClassLoader var1;
    try {
        var1 = Launcher.ExtClassLoader.getExtClassLoader();
    } catch (IOException var10) {
        throw new InternalError("Could not create extension class loader", var10);
    }

    try {
        // 1. 获取系统类加载器AppClassLoader
        this.loader = Launcher.AppClassLoader.getAppClassLoader(var1);
    } catch (IOException var9) {
        throw new InternalError("Could not create application class loader", var9);
    }
    ...
}
// AppClassLoader具体实现
static class AppClassLoader extends URLClassLoader {
    final URLClassPath ucp = SharedSecrets.getJavaNetAccess().getURLClassPath(this);

    // 2. 与上面提到的Extensions类加载器类似，实现逻辑差不多
    public static ClassLoader getAppClassLoader(final ClassLoader var0) throws IOException {
        final String var1 = System.getProperty("java.class.path");
        final File[] var2 = var1 == null ? new File[0] : Launcher.getClassPath(var1);
        return (ClassLoader)AccessController.doPrivileged(new PrivilegedAction<Launcher.AppClassLoader>() {
            public Launcher.AppClassLoader run() {
                URL[] var1x = var1 == null ? new URL[0] : Launcher.pathToURLs(var2);
                // 3. 构造AppClassLoader类加载器
                return new Launcher.AppClassLoader(var1x, var0);
            }
        });
    }

    // AppClassLoader构造方法
    AppClassLoader(URL[] var1, ClassLoader var2) {
        super(var1, var2, Launcher.factory);
        this.ucp.initLookupCache(this);
    }

    public Class<?> loadClass(String var1, boolean var2) throws ClassNotFoundException {
        int var3 = var1.lastIndexOf(46);
        if (var3 != -1) {
            SecurityManager var4 = System.getSecurityManager();
            if (var4 != null) {
                var4.checkPackageAccess(var1.substring(0, var3));
            }
        }

        if (this.ucp.knownToNotExist(var1)) {
            Class var5 = this.findLoadedClass(var1);
            if (var5 != null) {
                if (var2) {
                    this.resolveClass(var5);
                }
                return var5;
            } else {
                throw new ClassNotFoundException(var1);
            }
        } else {
            return super.loadClass(var1, var2);
        }
    }

    protected PermissionCollection getPermissions(CodeSource var1) {
        PermissionCollection var2 = super.getPermissions(var1);
        var2.add(new RuntimePermission("exitVM"));
        return var2;
    }

    private void appendToClassPathForInstrumentation(String var1) {
        assert Thread.holdsLock(this);
        super.addURL(Launcher.getFileURL(new File(var1)));
    }

    private static AccessControlContext getContext(File[] var0) throws MalformedURLException {
        PathPermissions var1 = new PathPermissions(var0);
        ProtectionDomain var2 = new ProtectionDomain(new CodeSource(var1.getCodeBase(), (Certificate[])null), var1);
        AccessControlContext var3 = new AccessControlContext(new ProtectionDomain[]{var2});
        return var3;
    }

    static {
        ClassLoader.registerAsParallelCapable();
    }
}
```

#### 2.2. 自定义类加载器

JVM内置的类加载器只加载了最少需要的核心JAVA基础类和环境变量下的类，但是我们往往需要依赖第三方中间件来完成额外的业务，那么如何把它们的类加载进来就显得格外的重要。

幸好JVM提供了自定义的类加载器，可以很方便的完成自定义操作，最终的目的也是将我们需要的类加载到JVM内存中。

通过继承``ClassLoader``类并重写(*Override*)``findClass``方法和``loadClass``方法就可以达到自定义获取``.class``文件的目的。

``ClassLoader``中的核心方法``loadClass``方法:

``java.lang.ClassLoader``

```java
/**
 * Loads the class with the specified <a href="#name">binary name</a>.  The
 * default implementation of this method searches for classes in the
 * following order:
 *
 * <ol>
 *
 *   <li><p> Invoke {@link #findLoadedClass(String)} to check if the class
 *   has already been loaded.  </p></li>
 *
 *   <li><p> Invoke the {@link #loadClass(String) <tt>loadClass</tt>} method
 *   on the parent class loader.  If the parent is <tt>null</tt> the class
 *   loader built-in to the virtual machine is used, instead.  </p></li>
 *
 *   <li><p> Invoke the {@link #findClass(String)} method to find the
 *   class.  </p></li>
 *
 * </ol>
 *
 * <p> If the class was found using the above steps, and the
 * <tt>resolve</tt> flag is true, this method will then invoke the {@link
 * #resolveClass(Class)} method on the resulting <tt>Class</tt> object.
 *
 * <p> Subclasses of <tt>ClassLoader</tt> are encouraged to override {@link
 * #findClass(String)}, rather than this method.  </p>
 *
 * <p> Unless overridden, this method synchronizes on the result of
 * {@link #getClassLoadingLock <tt>getClassLoadingLock</tt>} method
 * during the entire class loading process.
 *
 * @param  name
 *         The <a href="#name">binary name</a> of the class
 *
 * @param  resolve
 *         If <tt>true</tt> then resolve the class
 *
 * @return  The resulting <tt>Class</tt> object
 *
 * @throws  ClassNotFoundException
 *          If the class could not be found
 */
protected Class<?> loadClass(String name, boolean resolve)
    throws ClassNotFoundException
{
    synchronized (getClassLoadingLock(name)) {
        // First, check if the class has already been loaded
        // 先判断类是否已经加载
        Class<?> c = findLoadedClass(name);
        if (c == null) {
            long t0 = System.nanoTime();
            try {
                // 判断顶层parent类加载器是否为null, 不为空使用它进行加载
                if (parent != null) {
                    c = parent.loadClass(name, false);
                } else {
                // parent 为 null, 使用系统内置类加载器
                    c = findBootstrapClassOrNull(name);
                }
            } catch (ClassNotFoundException e) {
                // ClassNotFoundException thrown if class not found
                // from the non-null parent class loader
            }

            if (c == null) {
                // If still not found, then invoke findClass in order
                // to find the class.
                // 仍找不到，执行findClass方法继续查找
                long t1 = System.nanoTime();
                c = findClass(name);

                // this is the defining class loader; record the stats
                sun.misc.PerfCounter.getParentDelegationTime().addTime(t1 - t0);
                sun.misc.PerfCounter.getFindClassTime().addElapsedTimeFrom(t1);
                sun.misc.PerfCounter.getFindClasses().increment();
            }
        }
        if (resolve) {  // 找到类，进行解析
            resolveClass(c);
        }
        // 返回类类型对象
        return c;
    }
}
```

一个自定义类加载的简单例子: ``UserDefinedClassLoaderExample.java``
```java
package basical.test.userDefinedClassLoaderTest;

import java.io.FileInputStream;

/**
 * @author rovo98
 * date: 2019.04.06 23:42
 *
 */
public class UserDefinedClassLoaderExample {
    /**
     * Driver the program to test the methods
     * @param args command-line arguments.
     */
    public static void main(String[] args) {
        try {
            // 定义要加载类的完全限定名
            String className = "basical.test.userDefinedClassLoaderTest.UserDefinedClassLoaderExample$Demo";
            Class<?> class1 = Demo.class; // 用系统默认类加载器加载(AppClassLoader)
            // 用我们自定义的类加载器加载
            Class<?> class2 = new UserDefinedClassLoader("/home/rovo98/rovo98-dev-resources/ideaProjects/JavaDataStructure/out/production/DataStructureAndAlgorithmWithJavaImplement")
                    .loadClass(className);
            System.out.println("---------------------------Class Name--------------------------------------");
            System.out.println(class1.getName());
            System.out.println(class2.getName());
            System.out.println("---------------------------ClassLoader Name-------------------------------");
            System.out.println(class1.getClassLoader());
            System.out.println(class2.getClassLoader());
            Demo.example = 1; // 修改的是系统默认类加载器加载进去的类
            System.out.println("---------------------------Field Value------------------------------------");
            System.out.println(class1.getDeclaredField("example").get(null));
            System.out.println(class2.getDeclaredField("example").get(null));
        } catch(ClassNotFoundException | NoSuchFieldException | IllegalAccessException e) {
            e.printStackTrace();
        }
    }

    /**
     * A demo class to be loaded to test the {@code UserDefinedClassLoader}
     */
    public static class Demo {
        public static int example = 0;
    }

    /**
     * UserDefined class loader.
     */
    public static class UserDefinedClassLoader extends ClassLoader {
        private String classPath;

        /**
         * default constructor
         * @param classPath the class path of the specify class to be loaded.
         */
        public UserDefinedClassLoader(String classPath) {
            this.classPath = classPath;
        }

        @Override
        public Class<?> loadClass(String name) throws ClassNotFoundException {
            if (!name.contains("java.lang")) { // 排除加载系统的核心类
                byte[] data = new byte[0];
                try {
                    data = loadByte(name);
                } catch (Exception e) {
                    e.printStackTrace();
                }
                return defineClass(name, data, 0, data.length);
            } else {
                return super.loadClass(name);
            }
        }

        /**
         * Loading binary class file into the memory
         * @param name the name of the class file to be loaded.
         * @return binary data of the class file to be loaded.
         */
        @SuppressWarnings("ResultOfMethodCallIgnored")
        private byte[] loadByte(String name) throws Exception {
            name = name.replaceAll("\\.", "/");
            String dir = classPath + "/" + name + ".class";
            FileInputStream fileInputStream = new FileInputStream(dir);
            int len = fileInputStream.available();
            byte[] data = new byte[len];
            fileInputStream.read(data);
            fileInputStream.close();
            return data;
        }

    }
}
```

Console output:
```txt
---------------------------Class Name--------------------------------------
basical.test.userDefinedClassLoaderTest.UserDefinedClassLoaderExample$Demo
basical.test.userDefinedClassLoaderTest.UserDefinedClassLoaderExample$Demo
---------------------------ClassLoader Name-------------------------------
sun.misc.Launcher$AppClassLoader@18b4aac2
basical.test.userDefinedClassLoaderTest.UserDefinedClassLoaderExample$UserDefinedClassLoader@6d6f6e28
---------------------------Field Value------------------------------------
1
0
```
从执行结果可以看到，加载到内存中的两个类的包名+全称限定名是相同的, 而对应的类加载器却是不同的，输出的被加载类的值也是不同的。

### 3. 加载机制

类加载机制是规定类加载器如何加载``.class``类文件到JVM内存区域中以及如何管理的规则。

#### 3.1 双亲委派机制
> Parent-Delegation Principle or Delegation-Hierarchy principle

定义：某个特定的类加载器在接到加载类的请求后，首先将请求委托给它的上一级父类加载器，依次递归，知道最顶层``Bootstrap``类加载器，如果能够加载，则成功返回，否则，将类的加载请求依次往下一级别的类加载器传递，递归，此过程中，如果类找到则成功加载，否则到最后将抛出``ClassNotFound``异常。

{% note info %}
简单的来说，双亲委派原则对于当前类加载器，首先会将加载类的请求(*classloading request*)委托给它的父类加载器，只有它父类加载器无法加载请求的类时，它才会去响应类加载请求并尝试加载类。
{% endnote %}

实现：参考``java.lang.ClassLoader.java``中的``loadClass``方法。

{% note warning %}
从Java SE JVM 规范文档中了解到，``java.lang.ClassLoader``及其子类中的构造函数允许我们在实例化新的类加载器时指定父级类加载器。如果未明确父级，则默认使用JVM的默认类加载器作为父级加载器。

``ClassLoader``中的``loadClass``主要做三件事情(从上面给的源码我们也可以看到):
- 1.如果已经类加载直接返回该类；
- 2.否则，将加载类的请求委托给父级类加载器；
- 3.如果父级类加载器未找到该类，则调用``findClass``方法来加载。

如果父级类加载器找不到类，则``ClassLoader``的``findClass``方法将在当前类加载器中搜索该类。在应用程序中实例化类加载器子类，我们可能会覆盖(``Overriding``)此方法。

``java.net.URLClassLoader``类作为基本类加载器的扩展和其他jar文件，覆盖``java.lang.ClassLoader``的``findClass``方法，可以搜索一个或多个指定的``URL``以获取类和资源。
{% endnote %}

- **visibility principle**
> Visibility principle allows child class loader to see all the classes loaded by parent ClassLoader, but parent class loader can not see classes loaded by child.

可见性原则: 父类加载器加载的所有类对于其子类加载器都是是可见的，但是自类加载器的加载的类对于父类加载器是不可见的。

简单验证：假设我们随便写一个类，然后显式地(explicitly)用这个类的类加载器(``AppClassLoader``)的父类加载器(``ExtClassLoader``)来加载同一个类，然后验证它们时候是同一个类。
> ps: 如果子类加载器加载的类对于其父类加载是可见的，那么应该是同一个类。

```java
package com.rovo98.miscExamples.classLoading;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * @author rovo98
 * date: 2019.04.08 22:36
 */
public class VisibilityPrincipleTest {
    /**
     * Driver the program to test the visibility principle in class loading.
     *
     * @param args command-line arguments.
     */
    public static void main(String[] args) {
        try {
            ClassLoader classLoader = VisibilityPrincipleTest.class.getClassLoader();
            // print out the class loader of this class.
            System.out.println("VisibilityPrincipleTest's class loader is " + classLoader);
            ClassLoader parentClassLoader = classLoader.getParent();

            // loading this class using its parent class loader
            Class.forName("com.rovo98.miscExamples.classLoading.VisibilityPrincipleTest",
                    true, parentClassLoader);
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            Logger.getLogger(VisibilityPrincipleTest.class.getName()).log(Level.SEVERE, null, e);
        }
    }
}
```

**Output**:

```txt
VisibilityPrincipleTest's class loader is sun.misc.Launcher$AppClassLoader@18b4aac2
java.lang.ClassNotFoundException: com.rovo98.miscExamples.classLoading.VisibilityPrincipleTest
	at java.net.URLClassLoader.findClass(URLClassLoader.java:381)
	at java.lang.ClassLoader.loadClass(ClassLoader.java:424)
	at java.lang.ClassLoader.loadClass(ClassLoader.java:357)
	at java.lang.Class.forName0(Native Method)
	at java.lang.Class.forName(Class.java:348)
	at com.rovo98.miscExamples.classLoading.VisibilityPrincipleTest.main(VisibilityPrincipleTest.java:24)
Apr 08, 2019 10:42:41 PM com.rovo98.miscExamples.classLoading.VisibilityPrincipleTest main
SEVERE: null
java.lang.ClassNotFoundException: com.rovo98.miscExamples.classLoading.VisibilityPrincipleTest
	at java.net.URLClassLoader.findClass(URLClassLoader.java:381)
	at java.lang.ClassLoader.loadClass(ClassLoader.java:424)
	at java.lang.ClassLoader.loadClass(ClassLoader.java:357)
	at java.lang.Class.forName0(Native Method)
	at java.lang.Class.forName(Class.java:348)
	at com.rovo98.miscExamples.classLoading.VisibilityPrincipleTest.main(VisibilityPrincipleTest.java:24)


Process finished with exit code 0
```

- **uniqueness principle**
> Uniqueness principle allows to load a class exactly once, which i sbasically achieved by delegation and ensures that child ClassLoader doesn't reload the class already loaded by parent.

唯一性原则，一个类只加载一次，双亲委派原则已经实现了这一原则。

![](jvmclassloader.jpg)

双亲委派机制比较好理解，目的是为了**不重复加载已经加载的类, 提高效率**, 还有就是**强制从最顶层的类加载器开始搜索类文件，确保核心基础类优先加载**。

下面介绍**破坏双亲委派机制**, 了解为什幺要破坏看似很好的双亲委派机制。

#### 3.2 破坏双亲委派机制

##### 3.2.1. 唯一标识

对于任意的一个类，都需要由**加载它的类加载器**和这个**类本身**来一同确定其在Java虚拟机中**唯一性**。

验证例子: ``DifferentClassLoaderTest.java``

判断一个类是否相同，通常用``equals()``方法，``isInstance()``方法和``isAssignableFrom()``方法来判断，对于同一类，如果没用采用相同的类加载器来加载，那么即使是同一个类，JVM也是判断它为不同类的(唯一标识不同)。

```java
package basical.test;

import java.io.IOException;
import java.io.InputStream;

/**
 * @author rovo98
 * date: 2019.04.07 17:47
 */
public class DifferentClassLoaderTest {

    /**
     * Driver the program to test
     * @param args command-line arguments.
     * @throws Exception if ClassNotFoundException throws
     */
    public static void main(String[] args) throws Exception {
        // a user defined classloader
        ClassLoader classLoader = new ClassLoader() {
            @SuppressWarnings("ResultOfMethodCallIgnored")
            @Override
            public Class<?> loadClass(String name) throws ClassNotFoundException {
                String fileName = name.substring(name.lastIndexOf(".") + 1) + ".class";
                InputStream stream = getClass().getResourceAsStream(fileName);
                if (stream == null) {
                    return super.loadClass(name);
                }
                try {
                    byte[] b = new byte[stream.available()];
                    // 将流写入字节数组b中
                    stream.read(b);
                    return defineClass(name, b, 0, b.length);
                } catch (IOException e) {
                    e.printStackTrace();
                }

                return super.loadClass(name);
            }
        };
        Object obj = classLoader.loadClass("basical.test.DifferentClassLoaderTest").newInstance();
        System.out.println(obj.getClass());
        System.out.println(obj instanceof DifferentClassLoaderTest);

    }
}
```

**Output:**
```txt
class basical.test.DifferentClassLoaderTest
false
```

如果在通过实例化的使用，直接转化成``DifferentClassLoaderTest``对象:

```java
Object obj = (DifferentClassLoaderTest) classLoader.loadClass("basical.test.DifferentClassLoaderTest").newInstance();
```
就会报``java.lang.ClassCastException``, 因为两者不属于同一类加载器加载，所以不能转化。
```txt
Exception in thread "main" java.lang.ClassCastException: basical.test.DifferentClassLoaderTest cannot be cast to basical.test.DifferentClassLoaderTest
	at basical.test.DifferentClassLoaderTest.main(DifferentClassLoaderTest.java:40)
```

##### 3.2.2. 为什么需要破坏双亲委派机制

在某些时候父类加载器需要委托子类加载器去加载``.class``文件。受到加载范围的限制，父类加载器无法加载到需要的文件，以``Driver``接口为例，由于``Driver``接口定义在JDK中，而其实现由各个数据库的服务商来提供，比如MySQL的就写了``MySQL Connector``，那么问题来了，``DriverManager``（也由JDK提供）要加载各个实现``Driver``接口的实现类，然后进行管理，但是``DriverManager``由``Bootstrap``类加载器加载，只能记载``JAVA_HOME``的``lib``目录下的文件，而其实实现是由服务商提供的，由系统类加载器加载，这个时候就需要``Bootstrap``类加载器来委托子类加载器来加载``Driver``实现，从而破坏了双亲委派，这仅仅是破坏双亲委派机制的一个简单例子。

##### 3.2.3. 破坏双亲委派机制的实现

既然我们已经知道了什么是双亲委派机制(*Delegation-Hierarchy Principle or Parent-Delegation principle*)， 那么实现破坏双亲委派机制要做的就是打破双亲委派机制指定的规则。

具体实现大概就是自定义类加载，通过复写``loadClass``和``findClass``来实现。这里就不再展开探讨。

{% note primary %}
参考连接:
- [https://www.geeksforgeeks.org/jvm-works-jvm-architecture/](https://www.geeksforgeeks.org/jvm-works-jvm-architecture/)
- [http://www.cnblogs.com/joemsu/p/9310226.html](http://www.cnblogs.com/joemsu/p/9310226.html)
- [https://docs.oracle.com/javase/tutorial/ext/basics/load.html](https://docs.oracle.com/javase/tutorial/ext/basics/load.html)
- [https://dzone.com/articles/demystify-java-class-loading](https://dzone.com/articles/demystify-java-class-loading)
{% endnote %}

### 4. 加载过程

通过上面的介绍，我们已经大致了解了类加载器的工作原理。下面主要了解的是JVM加载类的过程。

即JVM类的加载子系统到底做了什么？

简单的来说，类的加载分为三个阶段: *loading*(**加载**)、*linking*(**链接**)、*intiailising*(**初始化**)。

![](jvm-1-class-loading-phases.gif)

#### 4.1. 加载 - loading

这一阶段就是把``.class``类文件以二进制数据的形式加载到JVM的内存区中的方法区(Method Area, JVM内存区部分内容会讲到)中。由类加载器来完成，我们简单了解一下什么时候会触发JVM去加载外部的``.class``类文件:

- 显式的字节码指令集(``new/getstatic/putstatic/invokestatic``): 对应的场景就是创建对象或者调用到类文件的静态变量/静态方法/静态代码块;
- 反射: 通过对象反射获取类对象时;
- 继承: 创建子类触发父类加载;
- 入口: 包含``main``方法的类首先被加载。


需要知道的是，JVM只定了类加载器的规范，但是却不明确的规定类加载器的目标文件，也就是说，JVM把具体加载类的逻辑交给用户来处理，我们可以从硬盘、网络、中间文件等来加载``.class``文件，只要加载进去内存的二进制数据符合JVM规定的格式，都是合法的。

#### 4.2. 链接 - linking

类加载到JVM的内存区中后，在**链接** 阶段要经过**验证(verifing)**、**准备(preparation)**、**解析(Resolving)**三个阶段的处理。
- **验证(Bytecode verification)**: 主要包含对类文件对应内存二进制数据的格式、语义关联、语法逻辑和符号引用(Symbolic Reference)的验证， 如果验证不通过则抛出``VerifyError``错误。但是该阶段是不强制性执行的，我们可以通过指定JVM的参数``-Xverify:none``来关闭，提高性能(在确保字节码数据无需再验证的情况下);
- **准备(Class preparation)**: 当我们通过验证阶段后，内存的方法区存放的是被“紧密压缩”的数据段，在这个阶段会对静态(*static*)变量进行内存分配，扩展内存段的空间，但是**还未初始化数据，即还是**``0``**或**``null``;
- **解析(Resolving)**: 把方法区中的所有符号引用(**Symbolic Reference**)全部替换成直接引用(**Direct Reference**)， 经过解析阶段后，类在方法区中占用的空间将膨胀变大。

#### 4.3. 初始化 - initializing

类加载过程的最后一个阶段，为所有的静态变量赋初值，并执行静态代码块(*static block*)

**misc**:

类的使用对应这类加载的触发的条件，就是说的类的使用就是触发类加载的条件，不过对类的使用需要的初始化操作过后。

最后是类的卸载，我们都知道JVM有专门的垃圾回收机制来处理。以上就是类的生命周期了。

{% note primary %}
参考链接:
- [http://www.techjava.de/topics/2008/01/java-class-loading/](http://www.techjava.de/topics/2008/01/java-class-loading/)

我之前写过的相关文章:
- [JDK, JRE, JVM | 深入了解](/posts/12448424/)

{% endnote %}

## 三、应用场景

通过前文，我们已经基本了解了类加载器的工作原理以及类的生命周期。

下面我们需要了解的是该如何利用类加载器的特点，最大限度地发挥它的作用。


### 1. 热部署

说到热部署，我们第一时间可能想到的是在生产机器上更新代码后，无需重启应用容器就能更新服务，这样的好处是服务无需中断可以持续运行，那么与之对应的**冷部署**就是需要重启容器实例的。

- **热部署(Hot Deployment)**: 热部署是应用容器自动更新应用的一种能力。

首先热部署应用是容器拥有的一种能力，这种能力是容器本身设计出来的，跟具体的IDE开发工具无关。而且热部署无需重启服务器，应用可以保持用户态不受影响。

{% note danger %}
有一种看似很像热部署的情况我们需要注意： 在使用IDE开发时也不需要重启服务，修改代码后即时生效，这看起来和热部署的服务无需重启一样，但是它背后的运行机制却是截然不同的。它应用的是JVM的本身附带的**热替换(Hot Swap)**能力。热部署和热替换是两个完全不同的概念。

由于在开发的时候，它们经常一起使用，所以非常容易把他们搞混。
{% endnote %}

#### 1.1. 原理

从热部署的定义来看，我们知道它其实应用容器的一种能力，要达到的目的是**在服务没有重启的情况下更新应用，也就是把新的代码编译后产生的新类文件替换掉内存中的旧类文件**。

结合前文已经介绍过的类加载器的特性，热部署的过程大概要分为两个步骤进行:

- 由于同一类加载器只能加载一次类文件(同一类文件, 因为有缓存), 在没有把新类文件加载进内存之前，我们不能把旧的类文件卸载，所以我们需要通过一个心得类加载器来加载。(**此时，内存存在两个新旧的类文件, 它们的类名路径相同但类加载器不同，即类的唯一标识不同**)
- 最后一步，我们要做的就是如何使用新的类文件，并卸载旧的类文件及其对象。

完成上面两个步骤，就可以达到新代码热部署的效果。

#### 1.2. 实现

下面通过一系列简单的例子来一步步实现热部署。

- **实现自定义类加载**

使用不同的类加载器可以把同一个类文件加载到JVM的方法区中，但是注意它们本质还是不同的"类(一个类由它的全称限定名加上它的类加载器类来标识)"

- **替换自定义类加载器**

既然一个类可以通过不同的类加载器多次的加载到JVM的方法区中，那么一个类经过修改编译后再加载进去，从应用的角度来看，这就做到了应用更新，那么如何在线程运行不中断的情况下更新类呢？

下面给出一个简单的例子，``ClassReloading``启动``main``方法通过死循环来不断创建类加载器，同时不断地加载类而且执行类的方法。


```java
package com.rovo98.miscExamples.hotDeployment;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.InvocationTargetException;

/**
 * @author rovo98
 * date: 2019.04.09 15:01
 */
public class ClassReloading {
    /**
     * Driver the program to test the class reloading
     *
     * @param args command-line arguments.
     */
    @SuppressWarnings("InfiniteLoopStatement")
    public static void main(String[] args) throws ClassNotFoundException, NoSuchMethodException, InvocationTargetException, IllegalAccessException, InterruptedException, InstantiationException {

        int count = 0;
        for (;;) {
            count++;
            // Using infinite loop to make the thread keep running.
            String className = "com.rovo98.miscExamples.hotDeployment.ClassReloading$User";
            Class<?> target = new MyClassLoader().loadClass(className);
            // Invokes the method of the loaded class using Reflection
            System.out.println(count + " round: loading target successfully, ready to invoke the method!");
            target.getDeclaredMethod("execute").invoke(target.newInstance());

            // If we use system class loader, it will be 'AppClassLoader'

            // Sleep to avoid the case happen that it will occurs 'ClassNotFoundException' error
            // if the target class had been removed.
            // so make the thread stop to avoid this case happen.
            Thread.sleep(10000);

        }

    }

    /**
     * The class to be tested for loading.
     */
    public static class User {
        public void execute() {
            ask();
//            say();
        }
        void ask() {
            System.out.println("What is your name?");
        }
        void say() {
            System.out.println("My name is rovo98!");
        }

    }
    // a user defined classloader
    public static class MyClassLoader extends ClassLoader {
        @SuppressWarnings("ResultOfMethodCallIgnored")
        @Override
        public Class<?> loadClass(String name) throws ClassNotFoundException {
            String fileName = name.substring(name.lastIndexOf(".") + 1) + ".class";
            InputStream stream = getClass().getResourceAsStream(fileName);
            if (stream == null) {
                return super.loadClass(name); // load the class using system default class loaders
            }
            try {
                byte[] b = new byte[stream.available()];
                // write the stream into the byte array b
                stream.read(b);
                return defineClass(name, b, 0, b.length);
            } catch (IOException e) {
                e.printStackTrace();
            }

            return super.loadClass(name);
        }
    }
}
```

``ClassReloading``线程运行起来，然后通过修改代码来查看结果，这里可以简单通过交替注释``User``类中的``ask()``和``say()``方法来测试。

**Output**:

```txt
1 round: loading target successfully, ready to invoke the method!
What is your name?
2 round: loading target successfully, ready to invoke the method!
What is your name?
3 round: loading target successfully, ready to invoke the method!
My name is rovo98!
4 round: loading target successfully, ready to invoke the method!
What is your name?
5 round: loading target successfully, ready to invoke the method!
What is your name?
6 round: loading target successfully, ready to invoke the method!
My name is rovo98!
7 round: loading target successfully, ready to invoke the method!
My name is rovo98!
...
...
```

每次循环调用都新创建一个自定义的类加载器，然后通过反射创建对象调用方法，在修改代码编译后，新的类就会通过反射被创建，并执行新的代码业务，而主线程一直没有停过(死循环)。

到了这里，我们已经简单实现了热部署了，即实现了手动无中断部署，但是存在很明显的缺点，我们需要手动编译代码(当然在IDE中我们可以通过简单的设置, 使得类文件修改后随着保存操作而自动编译, 但这也是属于"手动编译"), 而且内存中会不断新增的类加载器和对象，如果速度过快而且过于频繁更新，就非常容易造成堆溢出(``OutOfMemoryError``), 下面的一个例子，我们将通过增加一些规则来保证旧的类和对象能够被垃圾收集器(GC, Garbage Collector)自动回收。

- **回收自定义类加载器**

通常情况下，类加载器会持有该加载器加载过的所有类的引用, 所以如果类是经系统默认类加载器加载的话，那就很难被回收，除非符合根节点不可达原则(GC 算法内容，见下面给出的简单说明)才会被回收。

{% note warning %}
GC算法， 首先GC的垃圾回收算法使用的不是**引用计数(Reference counting)原理**, 因为会出现"循环引用“ -> 如： 如果存在不可达对象(dead object)``A``和``B``, 它们互相指向对方，那么垃圾回收器将永远无法回收它们。

为此GC引入以下算法:

- **1.**``mark``标记， 即标记现有的可达对象(alive object), 选择一个对象(方法，线程局部变量等)作为``GC root``，然后从这个根开始遍历图，直到所有的结点遍历完，遍历过的结点标记为alive.
> 为了确保这一步骤能够顺利进行，JVM需要挂起正在执行的线程，因为对象如果一直发生变化的话，图的遍历是无法成功遍历的。这一现象，我们一般称为``Stop the world pause``

![](jvm-1-gc-mark.png)

- **2.**``sweep``清除阶段：即清除不可达对象, 有直接对堆内存上的对象直接清除然后不管的，有清除之后，进行压缩的，有将堆内存分成两个分区，每次只使用一个分区，当``mark``操作结束后，将**alive objects**复制到另一个分区，然后清除当前分区，使用另一个分区，交替进行。 分别对应下面是三种情况。
- ``mark-sweep``
![](jvm-1-gc-mark-sweep.png)
- ``mark-sweep-compact``
![](jvm-1-gc-mark-sweep-compact.png)
- ``mark-copy``
![](jvm-1-gc-mark-copy.png)

当然，实际上JVM使用的GC算法还有更多，垃圾收集器也很多种，例如对堆内存分代(generations, young generation, old generation, permanent generation), 不同的生代使用不同的策略。

😅额。。。差点跑偏了，这里就不再做过多的解释了。
{% endnote %}

下面继续给出一个简单的例子，我们知道上文的``ClassReloading``只是不断创建心得类加载器类加载新类，从而更新类的方法。下面的例子，通过模拟WEB应用，更新整个应用的上下文``Context``。其实代码本质上和上面的是一样的，只不过我们通过加载``Model``层、``DAO``层和``Service``层来模拟WEB应用。

{% note warning %}
为了方便测试，所有的类均写在同一个类文件中。
{% endnote %}

```java
package com.rovo98.miscExamples.hotDeployment;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.InvocationTargetException;

/**
 * @author rovo98
 * date: 2019.04.09 16:18
 */
public class ContextReloading {
    /**
     * Driver the program to test the {@code ContextReloading}.
     *
     * @param args command-line arguments.
     */
    @SuppressWarnings("InfiniteLoopStatement")
    public static void main(String[] args) throws ClassNotFoundException, NoSuchMethodException,
         InstantiationException, IllegalAccessException, InvocationTargetException, InterruptedException {

        int count = 0;
        for (;;) {
            count++;
           Object context = newContext();
            System.out.println(count + " round: context loaded successfully, ready to invoke the methods!");
           invokeContext(context);

           Thread.sleep(8000);
        }
    }

    /**
     * 1. Create the Context
     * 2. Context object is used as a GC root
     * 3. Before returning the context object, we call the init() method.
     *
     * @return a Context Object.
     */
    public static Object newContext() throws ClassNotFoundException, NoSuchMethodException,
         InvocationTargetException, IllegalAccessException, InstantiationException {
        String className = "com.rovo98.miscExamples.hotDeployment.ContextReloading$Context";
        Class<?> contextClass = new MyClassLoader().loadClass(className);
        Object context = contextClass.newInstance();
        contextClass.getDeclaredMethod("init").invoke(context);

        return context;
    }

    /*
    Simply invokes the method of the context class
    since the method's rules will be update during the runtime
     */
    public static void invokeContext(Object context) throws NoSuchMethodException,
         InvocationTargetException, IllegalAccessException {
        context.getClass().getDeclaredMethod("showUser").invoke(context);
    }

    public static class Context {
       private UserService userService = new UserService();
       public void showUser() {
           System.out.println(userService.getUserMessage());
           System.out.println("method invoked");
       }
       // initialize the object
        public void init() {
//            System.out.println("init successfully");
           UserDao userDao = new UserDao();
           userDao.setUser(new User());
           userService.setUserDao(userDao);
        }
    }

    // simple user service object
    public static class UserService {
       private UserDao userDao;
       public String getUserMessage() {
           return userDao.getUserName();
       }
       public void setUserDao(UserDao userDao) {
           this.userDao = userDao;
       }
    }

    // simple user DAO object
    public static class UserDao {
        private User user;
        public String getUserName() {
            return user.getName();
//            return user.getAlias();
        }
        public void setUser(User user) {
            this.user = user;
        }
    }

    // A simple model class
    public static class User {
        private String name = "rovo98";
        private String alias = "testUser";

        public String getName() {
            return name;
        }
        public void setName(String name) {
            this.name = name;
        }
        public String getAlias() {
            return alias;
        }
        public void setAlias(String alias) {
            this.alias = alias;
        }
    }

    // a user defined class loader.
    public static class MyClassLoader extends ClassLoader {
        @SuppressWarnings("ResultOfMethodCallIgnored")
        @Override
        public Class<?> loadClass(String name) throws ClassNotFoundException {
            String fileName = name.substring(name.lastIndexOf(".") + 1) + ".class";
            InputStream stream = getClass().getResourceAsStream(fileName);
            if (stream == null) {
                return super.loadClass(name);
            }
            try {
                byte[] b = new byte[stream.available()];
                stream.read(b);
                return defineClass(name, b, 0, b.length);

            } catch (IOException e) {
                e.printStackTrace();
            }
            return super.loadClass(name);
        }
    }
}
```

**Output**:

```txt
1 round: context loaded successfully, ready to invoke the methods!
rovo98
2 round: context loaded successfully, ready to invoke the methods!
rovo98
3 round: context loaded successfully, ready to invoke the methods!
rovo98
4 round: context loaded successfully, ready to invoke the methods!
testUser
5 round: context loaded successfully, ready to invoke the methods!
testUser
6 round: context loaded successfully, ready to invoke the methods!
testUser
init successfully
7 round: context loaded successfully, ready to invoke the methods!
testUser
init successfully
8 round: context loaded successfully, ready to invoke the methods!
testUser
init successfully
9 round: context loaded successfully, ready to invoke the methods!
testUser
init successfully
10 round: context loaded successfully, ready to invoke the methods!
testUser
11 round: context loaded successfully, ready to invoke the methods!
rovo98
method invoked
...
...
```

输出结果和上一个例子类似，可以自己运行然后修改业务逻辑。不同与上一个例子，它解决了旧类的移除问题，因为``context``对象是作为GC root的，``context``又由我们自定义的类加载器加载, 由于``User/Dao/Service``的类都依赖于``context``，所以它们也是由自定义的类加载器加载的。

根据GC roots 原理，在创建新的自定义类加载后，旧的类加载器已经没有了任何引用链可达，符合GC回收规则，将会被GC收集器回收释放内存(注意不是马上回收)。
> 运行程序，启动线程，用jvisualvm工具查看，并手动执行GC来验证

- 线程启动并运行一小会后(可以看到线程加载的类数量在持续增加):
![](jvm-1-classreloading-vmdiagram-1.png)
- 手动执行GC来回收垃圾(从图中可以看到执行一次GC后卸载了56个类，而``1615``个类的加载刚刚就是一个类运行所需的基本的类(核心基础类等)):
![](jvm-1-classreloading-vmdiagram-2.png)

至此已经完成了热部署的流程，但是我们如果仔细看的话，这个热部署的实现的策略会把整个``context``对象也替换成新的, 那么用户的状态也将无法保留。而实际情况是我们只需要动态更新某些模块即可，而不是全局。这个也比较好处理，就是从业务上将需要热部署的交给自定义的类加载器加载，而持久化资源交给系统默认的类加载器去完成加载。

- **自动加载类加载器**

其实涉及到代码涉及优雅问题，基本上我们就需要拿出设计模式(**Design Pattern**) 来对号入座的解决问题，毕竟这是前人经过千万实践锤炼出来的软件构建内功心法。

针对于我们热部署的场景，如果想把热部署细节封装起来，那代理模式无疑是最符合要求的，把类加载器的更替、回收，隔离等细节都放在代理对象里面来完成，而对于用户是透明的，对于终端用户而言，给他们的感觉就是纯粹的热部署了。

至于如何实现自动热部署，方式也相对比较简单吧，监听我们需要部署的目录，如果文件的时间和大小发生改变，即修改过后，则判断应用更新需求，触发类加载器的创建和旧对象的回收，此时也可以引入观察者模式来实现。

至于实现，我们参考现有的别人已经实现的热部署工具:

- [Gretty](http://akhikhl.github.io/gretty-doc/Hot-deployment.html)
- [DECVM](https://dcevm.github.io/)
等等。。

或者使用现成的热部署工具。
参考这篇文章即可:
- [https://dzone.com/articles/hot-swap-java-bytecode-on-runtime](https://dzone.com/articles/hot-swap-java-bytecode-on-runtime)

其中有收费的商用工具JRabel, 免费开源的DECVM等。

{% note primary %}
参考链接:
- [https://stackoverflow.com/questions/35249234/how-hot-deployment-works-internally](https://stackoverflow.com/questions/35249234/how-hot-deployment-works-internally)
- [https://iq.opengenus.org/memory-management-in-java-mark-sweep-compact-copy/](https://iq.opengenus.org/memory-management-in-java-mark-sweep-compact-copy/)
- [https://plumbr.io/handbook/garbage-collection-algorithms](https://plumbr.io/handbook/garbage-collection-algorithms)
- [https://developer.jboss.org/wiki/CurrentStateOfHotDeploymentInJava](https://developer.jboss.org/wiki/CurrentStateOfHotDeploymentInJava)
- [https://www.future-processing.pl/blog/better-java-hot-code-replace-at-no-cost/](https://www.future-processing.pl/blog/better-java-hot-code-replace-at-no-cost/)
{% endnote %}

### 2. 类隔离

#### 2.1. 背景介绍

通常我们的应用依赖不同的第三方类库会出现个不同版本的类库，如果只是使用系统内置的类加载器的话, 那么一个类库只能加载唯一的一个版本，下那个家在其他版本的时候，会从加载缓存里面发现类已经存在而停止加载。但是不同的业务往往又需要不同版本的类库，这是就会出现``ClassNotFoundException``。一般是在运行时才会出现异常，因为在编译的时候我们通常都使用[MAVEN](https://maven.apache.org/)等编译工具把冲突的版本给排除掉了。

另外一种情况是WEB容器的内核依赖的第三方类库需要跟应用依赖的类库隔离开来, 避免依稀而安全隐患，不然如果共用的话，应用升级依赖版本会导致WEB容器不稳定。

基于以上的介绍，我们已经基本知道了什么是**类隔离(class isolation)**以及它大概需要解决的问题。

#### 2.2. 原理

类隔离的原理其实也很简单，前文我们介绍过**类的唯一标识**(内存中定位一个类大概是这样的``<类加载器, 类全称限定名>``, 即一个类的标识有加载它的类加载器和它的全称限定名组成)。用不同的类加载器加载的相同的类(全称限定名一样，但是版本不一样), 在JVM看来，有通过这种方式加载进去的具有相同全称限定名的类是完全不同的。**但是在业务视角上来看，我们可以把它们看作是相同的类。**

验证唯一标识的例子可以看上文讨论加载机制时提到的唯一标识。下面再提供一个简单的例子:

```java
package com.rovo98.miscExamples.classLoading;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Field;

/**
 * @author rovo98
 * date: 2019.04.10 16:21
 */
public class DifferentClassLoaders {

    /**
     * Driver the program to test loading the same class using different classloader
     * @param args command-line arguments.
     */
    public static void main(String[] args) throws ClassNotFoundException, NoSuchFieldException,
         IllegalAccessException, InstantiationException {
       Class<?> clazz1 = Cat.class;
       String className = "com.rovo98.miscExamples.classLoading.DifferentClassLoaders$Cat";
       Class<?> clazz2 = new MyClassLoader().loadClass(className);

        System.out.println("Compare their class name(seems to be the same): ");
        System.out.println("clazz1: " + clazz1.getName());
        System.out.println("clazz2: " + clazz2.getName());
        System.out.println();

        System.out.println("Compare their class loader: ");
        System.out.println("clazz1's classloader: " + clazz1.getClassLoader());
        System.out.println("clazz2's classloader: " + clazz2.getClassLoader());
        System.out.println();

        System.out.println("The static field value: " + Cat.age);
        Cat.age = 3; // change the static field of the class Cat
        System.out.println("And to see the difference: ");
        Field f1 = clazz1.getDeclaredField("age");
        f1.setAccessible(true);
        Field f2 = clazz2.getDeclaredField("age");
        f2.setAccessible(true);
        System.out.println("clazz1's static field: " + f1.getInt(clazz1.newInstance()) + ".");
        System.out.println("clazz2's static field: " + f2.getInt(clazz2.newInstance()) + ".");

    }

    /**
     * A simple for testing
     */
    public static class Cat {
        private static int age = 2;
    }
    public static class MyClassLoader extends ClassLoader {
        @SuppressWarnings("ResultOfMethodCallIgnored")
        @Override
        public Class<?> loadClass(String name) throws ClassNotFoundException {
            String fileName = name.substring(name.lastIndexOf(".") + 1) + ".class";
            InputStream is = getClass().getResourceAsStream(fileName);
            if (is == null) {
                return super.loadClass(name); // loading the class using system default classloader if MyClassLoader
                                              // can not the specify class.
            }
            try {
                byte[] b = new byte[is.available()];
                is.read(b);
                return defineClass(name, b, 0, b.length);

            } catch (IOException e) {
                e.printStackTrace();
            }
            return super.loadClass(name);
        }
    }
}
```

**Output**:
```txt
Compare their class name(seems to be the same): 
clazz1: com.rovo98.miscExamples.classLoading.DifferentClassLoaders$Cat
clazz2: com.rovo98.miscExamples.classLoading.DifferentClassLoaders$Cat

Compare their class loader: 
clazz1's classloader: sun.misc.Launcher$AppClassLoader@18b4aac2
clazz2's classloader: com.rovo98.miscExamples.classLoading.DifferentClassLoaders$MyClassLoader@7f31245a

The static field value: 2
And to see the difference: 
clazz1's static field: 3.
clazz2's static field: 2.
```

#### 2.3. 实现

虽然类隔离的原理很简单，但是实现一个高性能可扩展的高可用的隔离容器却不是简单的。就比如我们都知道Spring容器本质就是一个生产和管理``Bean``的集合对象，但是它包含了大量优秀的设计模式和复杂的框架实现。

上文提到的类隔离应用场景是在内存运行时才发现问题的，需要通过**内存隔离**来处理。而在这里，我们只先了解一下更为通用和简单的冲突解决方法。

- **冲突排除**

冲突总是发生在编译时期，那么基本[Maven](https://maven.apache.org/)工具可以帮我们完成大部分的工作，Maven的工作模式就是将我们第三方类库的所有依赖都依次检索，最终排除掉产生冲突jar包的版本。

- **冲突匹配**

当我们无法通过简单的排除来解决问题的时候，另外一个方法就是重新装配第三方类库，例如通过[jarjar](https://github.com/shevek/jarjar)开源工具类处理。它可以通过字节码技术将我们依赖的第三方类库重命名，同时修改代码里面对第三方类库引用的路径。这样如果出现同名第三方类库的话，通过该"硬编码“的方式修改其中一个类库，从而消除了冲突。

- **冲突隔离**

上面的两种方式在小型系统中比较合适，也比较敏捷高效。但是对于分布式大型系统的话，通过硬编码方式来解决冲突就难以完成了。办法是通过隔离容器，从逻辑上区分类库的作用域，从而对内存的类进行隔离。


{% note primary %}
misc: 
- [应用程序隔离规范 JSR 121 - https://www.jcp.org/en/jsr/detail?id=121](https://www.jcp.org/en/jsr/detail?id=121)
- [An implementation of JSR 121 - https://www.flux.utah.edu/janos/jsr121-internal-review/java/lang/isolate/package-summary.html](https://www.flux.utah.edu/janos/jsr121-internal-review/java/lang/isolate/package-summary.html)

相关开源项目:
- [https://github.com/chrisgleissner/jisolate](https://github.com/chrisgleissner/jisolate)

参考链接:
- [https://www.toptal.com/java/java-wizardry-101-a-guide-to-java-class-reloading](https://www.toptal.com/java/java-wizardry-101-a-guide-to-java-class-reloading)
- [https://stackoverflow.com/questions/3726635/using-classloader-for-isolating-two-static-classes](https://stackoverflow.com/questions/3726635/using-classloader-for-isolating-two-static-classes)

{% endnote %}

有关于JVM中类加载的内容就先简单了解到这里了，后续再根据自己的需求深入学习吧!👆
