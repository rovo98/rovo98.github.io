---
title: Maven 项目构建提速
author: rovo98
date: '2021-02-28 20:01'
categories:
  - Java
tags:
  - maven
abbrlink: 4d39110c
---

Maven 作为 Java 项目的一个常用构建工具，它很容易上手使用，但若不对其进行深入了解，则往往会在我们后续使用过程中留下一些隐患。
在日常开发环境中，我们很容易遇到较大代码规模的项目，涉及多种不同语言及技术，此时，在使用 Maven 作为主构建工具进行本地项目编译及构建时，则有可能会遇到项目构建速度慢的问题。为提升开发体验，本文将讨论 Maven 项目构建速度优化相关技巧。

<!-- more -->

## 影响构建速度的因素
在 Maven 项目中，影响项目构建速度的因素有很多，常见的有以下几个因素：
### 1、没有充分利用 CPU 等资源
正常情况下，Maven 构建项目模块是按顺序执行的，然而，在大多项目中我们其实并不需要按序构建模块。理论上来说，Maven 可以通过依赖图来分析项目，并尽可能地并行构建项目模块。
### 2、项目构建时包含许多无效的阶段和步骤
Maven 项目的构建由特定生命周期（Lifecycle）进行描述，一个生命周期一般包含多个阶段（phase），而一个阶段还可包含多个步骤（steps）。当执行某特定 phase 时，这过程中包含了一些隐性开销，为执行某一生命周期的特定阶段，Maven 需要先执行完该阶段之前的所有阶段。
如，对于 Maven 提供的默认生命周期（default，不与任何插件相关联），它包含的所有阶段如下：
``` xml
<phases>
<phase>validate</phase>
<phase>initialize</phase>
<phase>generate-sources</phase>
<phase>process-sources</phase>
<phase>generate-resources</phase>
<phase>process-resources</phase>
<phase>compile</phase>
<phase>process-classes</phase>
<phase>generate-test-sources</phase>
<phase>process-test-sources</phase>
<phase>generate-test-resources</phase>
<phase>process-test-resources</phase>
<phase>test-compile</phase>
<phase>process-test-classes</phase>
<phase>test</phase>
<phase>prepare-package</phase>
<phase>package</phase>
<phase>pre-integration-test</phase>
<phase>integration-test</phase>
<phase>post-integration-test</phase>
<phase>verify</phase>
<phase>install</phase>
<phase>deploy</phase>
</phases>
```
因此，当我们执行 `mvn install` 命令时，Maven 需要先执行 `install` 阶段之前的所有阶段后，才能执行该 `install` 阶段。
### 3、网络访问影响
和其他大部分构建系统一样，如 npm、gradle、sbt等，项目在构建时，往往需要连网去下载项目的依赖以及传递依赖。而当我们明确本地仓库缓存已经存在项目构建需要的所有依赖及传递依赖时，可选择让 maven 以离线方式运行。
### 4、Maven 进程的启动速度
Maven 作为一个构建工具，也是一个运行在 JVM 上的 Java 程序，因此，它也可以通过对 JVM 进行优化配置，从而提升 Maven 的启动速度。
## 提升构建速度的技巧
针对上述提到的影响 Maven 项目构建速度的因素，可以使用以下技巧进行处理。
### 1、Maven 并行构建
为能在项目构建时充分的利用 CPU 资源， 我们可指定 maven 构建项目时使用的线程数。
``` bash
mvn -T num # 指定 maven 构建项目时使用的具体线程数
mvn -T numC # 指定 maven 构建项目时使用的线程数，每个 CPU num 个线程
```
虽然项目尽管可能不容易进行并行构建，但值得尝试，因为它可以大大地提升项目构建的速度。设置**每个 CPU 核使用一个线程是一个比较好的默认配置**。
### 2、跳过测试或并行执行测试
从构建层面上来讲，测试可能是影响项目构建速度的最大因素。因此，我们通常会在构建工件时选择跳过测试，大多数插件可通过指定 `-DskipTests=true` 来跳过测试，但一般情况下，我们不推荐使用这种非常规的工程实践方案，仅在明确需要跳过测试时使用，很明显，这可以大大地提高项目构建的速度。
一般我们讨论的并行技术作用于模块级别，例如，当项目使用插件（如 surefire 等）来运行测试时，我们可以配置它在模块内进行并行执行。需要注意的是，使用并行技术来执行测试虽然可以大大提高项目构建的速度，但这一过程有可能导致一些副作用，但实际实践中，我们应该尽可能地尝试并行运行测试，在遇到错误时再进行相应处理即可。
### 3、只构建必要的模块
大多数人在构建项目时，可能会直接使用以下默认命令:
``` bash
mvn clean install
```
但正如上文提到的，但在执行 install 时，需要先之前该阶段前的所有阶段，当 Maven 执行 clean 时，会将所有生成的 artifacts 及临时文件等（除VCS管理的文件外）都清理掉。clean 在遇到奇怪的缓存或bug时很有用。

然而，每次项目修改后，都执行一次 clean，然后再 install 的速度并不理想，大多数情况下，我们应该是增量地构建项目，即仅构建变化的部分。举个例子，假设我们有一个多模块的项目，其中一些通用的核心模块几乎是不变的，则可以通过以下命令来只构建变动的模块：
``` bash
mvn install -pl $moduleName -am
```
首先，可以看到，因为项目很少需要清理，该命令移除了 `clean` 阶段，其他的 mvn 命令选项如下：

- `-pl`，`--projects` : 由逗号分隔的项目列表，项目可由 `[groupId]:artifactId` 或相对目录表示。指定 Maven 需构建的模块，而不是构建整个项目。
- `-am`, `--also-make` : 当项目列表指定后，同时构建列表中项目的依赖项目。
- `-amd`, `--also-make-dependents`: 当项目列表指定后，同时构建依赖于列表项目的项目。

结合以上选项使用 maven 命令可以大大地提高项目构建的速度及灵活度，这种情况下，只有工作的项目模块及相应的修改的依赖才会被构建，而其他大量的构建工作，由于文件仍是新的或不是目标模块的一部分，则无需重新构建，可以跳过。
### 4、离线或限制网络访问
网络下载也是影响构建速度的一个重要因素，当然，在国内环境中，我们一般都配置 maven 库的镜像来下载依赖，可有效的提高依赖下载的网络速度，这一部分内容不是本文的关注点，读者可自行检索了解。

离线或限制网络访问均可以提升 Maven 项目构建的速度，但我们可能需要对它们的使用场景作一下限制：
对于离线构建，`mvn` 命令增加 `-o` 或 `--offline` 选项，需要明确项目所需的所有依赖及传递依赖均已缓存至本地仓库；
当网络质量不佳且需要联网构建时，则可在 `MAVEN_OPTS` 变量中增加 `-DdependendencyLocationsEnabled=false` 设置来尽可能地减少项目构建时进行的网络传输。
### 5、提升 Maven Java 进程的启动速度
Maven 作为一个 Java 应用程序，就意味着我们可以通过对 JVM 进行调优以提高 Maven 进程启动速度。
``` bash
-XX:+TieredCompilation -XX:TieredStopAtLevel=1
```
通过上述配置，可使 JVM 只执行基本的 jIT 编译，而不尝试去获取更多精确配置信息优化代码的执行。
> 为提高 Maven 的构建速度，Maven 官方参考 Gradle 和 Takari 的技术，开发了 [maven-mvnd](https://github.com/apache/maven-mvnd)。mvnd 会启动一个长时运行的守护进程来负责项目构建，并采用 GraalVM 开发 mvnd 的客户端，与传的 mvn 相比，启动速度更快且需要的内存更少。

## 总结
本文主要简单地讨论了影响 maven 项目构建速度的一些因素及一些提高 maven 构建速度的技巧。更多关于 maven 的理论知识及内容，可以前往 maven 官网查看，另外 `mvn` 命令行选项可以参考 http://maven.apache.org/ref/3.6.3/maven-embedder/cli.html。
## References
1. https://www.jrebel.com/blog/how-to-speed-up-your-maven-build
2. https://forgettingtocode.com/2019/01/23/readme-slow-maven-builds/
3. https://mincong.io/2018/11/01/speed-up-the-maven-build/
4. http://maven.apache.org/ref/3.6.3/maven-embedder/cli.html
