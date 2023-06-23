---
title: Java shaded dependencies
author: rovo98
date: '2022-02-14 15:30'
categories:
  - Java
tags:
  - maven
abbrlink: 99f23fe2
---

Shade ，译为遮蔽、掩盖。我最早接触到该词是在使用 maven-shade-plugin 打包 uber-jar 时，从 Maven 官网对该插件的描述可了解到，shade 插件有两大功能，一是可用于在项目打包时将其打包成一个包含所有依赖的 uber-jar，以及**shade** - i.e. rename the packages of some dependencies (重命名一些依赖的包名)。

<!-- more -->

## Shade - Relocating classes

从 Maven 官网给出的 Relocting Classes 使用示例介绍来看，在 uber jar 重用其他项目作为依赖时，直接包含引用依赖的类可能会导致类加载冲突问题（如classpath 类重复），为解决该问题，我们可以将 shaded artifact 包含的依赖中的类进行重新安置，以创建出依赖相应的私有备份，从而避免了 classpath 类加载冲突问题。

Relocating classes 示例：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-shade-plugin</artifactId>
    <version>3.3.0</version>
    <executions>
        <execution>
            <phase>package</phase>
            <goals>
                <goal>shade</goal>
            </goals>
            <configuration>
                <relocations>
                    <relocation>
                        <pattern>org.codehaus.plexus.util</pattern>
                        <shadedPattern>org.shaded.plexus.util</shadedPattern>
                        <excludes>
                          <exclude>org.codehaus.plexus.util.xml.Xpp3Dom</exclude>
                            <exclude>org.codehaus.plexus.util.xml.pull.*</exclude>
                        </excludes>
                    </relocation>
                </relocations>
            </configuration>
        </execution>
    </executions>
</plugin>
```

可以看到，通过 shade 插件配置，我们可以将 ``org.codehaus.plexus.util`` 包中的所有类移至 ``org.shaded.plexus.util`` 包下， ``Xpp3Dom`` 类和 ``pull.*`` 包除外。当然也可以使用 ``include`` 标签来限制要重新安置的类，如：

```xml
 <relocation>
     <pattern>org.codehaus.plexus.util</pattern>
     <shadedPattern>org.shaded.plexus.util</shadedPattern>
     <includes>
         <include>org.codehaud.plexus.util.io.*</include>
     </includes>
</relocation>
```

具体 shade 插件的使用请自行移步至 [maven-shade-plugin](https://maven.apache.org/plugins/maven-shade-plugin/) 查看，这里不再赘述。

## Summary

至此，我们便了解清楚了什么是 dependency shading，以及为什么使用它 - 处理 Java 项目中的依赖版本冲突问题。这一技术方案在实际开源项目中也有许多应用，例如 [flink-shaded](https://github.com/apache/flink-shaded) 等，好在项目的发布包中提供独立的一份依赖，这样便可以不暴露依赖给下游用户 - 用户可使用其他版本相应依赖，而不会产生冲突问题。

![](java-shaded-dependency-ex-flink.png)



dependency shading 是处理 Java class shadowing （类掩盖）的一种实现方式，处理类掩盖的目的便是解决冲突问题 （Java class 由 class loader 从 classpath 进行加载，按全程限定名 FQN 进行区分, 因此当 classpath 中出现多个拥有相同 FQN 的类时，若这些类不是完全相同的，那么将会出现版本冲突问题）。依赖冲突问题出现的形式和解决方法有许多种，可以参考 https://medium.com/@akhaku/java-class-shadowing-and-shading-9439b0eacb13 进一步了解。

在执行 shading 时，我们需要考虑依赖的传递依赖问题，且 shading 也非银弹，使用它也会带来一些问题，如增加了最终 jar 包的大小、使涉及 shaded classess 的调试工作更难等。

## refs

1. https://softwareengineering.stackexchange.com/questions/297276/what-is-a-shaded-java-dependency
2. https://maven.apache.org/plugins/maven-shade-plugin/
3. https://yauaa.basjes.nl/developer/shadingdependencies/
4. https://medium.com/@akhaku/java-class-shadowing-and-shading-9439b0eacb13
