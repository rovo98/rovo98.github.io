---
title: Data Shuffling in Spark
author: rovo98
date: '2021-03-25 11:50'
categories:
  - BigData
  - Spark
tags:
  - spark
abbrlink: 350ed39b
---

Spark action 算子触发 Spark 作业执行，一个作业 job 包含若干阶段 stage，而 Spark 划分 stage 的依据是 transformation 算子之间是否存在宽依赖（wide dependencies），即以 shuffle 操作来划分 stage，一个 stage 会尽可能地包含更多窄依赖 transformations。

Shuffle 是 Spark 用于跨 JVM (executor) 甚至跨机器（不同节点上的 executor 或 driver）的数据重分发机制。需要注意的是，Spark Shuffle 是一个昂贵的操作，因为它通常包含以下开销：

- 磁盘 I/O
- 涉及数据序列化与反序列化
- 网络 I/O

因此，为了提高 Spark 开发应用的性能，我们应尽可能地避免 shuffle。

<!-- more -->

### Spark RDD Shuffle

我们知道 Spark 是 lazy 计算的，因此，当从某一外部稳定存储或现有 RDD，创建一个新 RDD 时，相应 RDD 分区中并不持有相应 key 数据，也无法在创建 RDD 时同时为该数据集设置相应的分区 key 数据。

因而，当该新创建 pair RDD 执行如 ``reduceByKey()`` 操作来根据 key 对数据进行聚合时，Spark 会做以下操作：

- Spark 首先会在 RDD 的作用分区上运行 map 任务，map 任务会将单个 key 的所有值进行分组；
- map 任务得到的结果会维持在内存中；
- 当内存不足，Spark 会将结果数据保存到磁盘中；
- Spark 接着会跨分区 shuffle 这些已映射的数据，有时会将已 shuffle 的数据存储到磁盘中，以进行重用；
- 执行垃圾回收；
- 最后，在每一个分区上运行基于 key 的 reduce 任务。

![spark shuffle illustration](spark_shuffle.png)

Spark RDD 触发 shuffle 的操作有 ``repartition()``、``coalesce()``、``groupByKey()``、``reduceByKey()``、``cogroup()`` 和 ``join()`` 等。

NOTICE: shuffle 并不一定会改变 RDD 的分区数。

### Spark SQL DataFrame Shuffle

与 RDD 不同，Spark SQL DataFrame API 在执行需要 shuffle 的 transformation 操作后，其分区数将会增加。能触发 shuffle 的 DataFrame 操作有 ``join()``、``union()`` 以及所有聚合函数（aggregate functions）。

如：

```scala
val spark = SparkSession.builder()
						.master(local[*])
						.appName("DataFrameShufflePartitions")
						.getOrCreate()

import spark.implicits._

val simpleData = Seq(("James", "Sales", "NY", 90000, 34, 10000),
                    ("Michael", "Sales", "NY", 86000, 56, 20000),
                    ("Robert", "Sales", "CA", 81000, 30, 23000),
                    ("Maria", "Finance", "CA", 90000, 24, 23000),
                    ("Raman", "Finance", "CA", 99000, 40, 24000),
                    ("Scott", "Finance", "NY", 83000, 36, 19000),
                    ("Jen", "Finance", "NY", 79000, 53, 15000),
                    ("Jeff", "Marketing", "CA", 80000, 25, 18000),
                    ("Kumar", "Marketing", "NY", 91000, 50, 21000)
                  )
val df = simpleData.toDF("employee_name", "department", "state", "salary", "age", "bonus")
val df2 = df.groupBy("state").count()

println(df2.rdd.getNumPartitions)
```

上面输出的分区数为 200， Spark 会在执行数据 shuffle 操作时，自动将分区数增加到 200，该值由配置 ``spark.sql.shuffle.partitions`` 指定，默认为 200。可进行自定义修改：

```scala
spark.conf.set("spark.sql.shuffle.partitions", 100)
println(df.groupBy("_c0").count().rdd.getNumPartitions)
```

### Shuffle 分区数

取决于数据集的大小、 CPU 核的数据以及内存等，Spark Shuffle 对作业的影响可以说是有利有弊。

当处理的数据量较小时，我们应尽可能地减少 shuffle 分区数，否则将使其产生较多的分区文件，但每个分区包含的结果数据很少，会运行许多任务来处理很少量的数据。

另一方面，当有非常大数据量处理却只拥有少量分区数时，则会造成任务运行时间过长，甚至出现 OOM 问题。

因此，在实践中，配置一个合适的 shuffle 分区数往往需要多次尝试运行来进行调优。当 Spark 作业有性能问题时，这也是检查关键点之一。

### Spark Shuffle manager

在 Spark 中，数据 shuffle 的过程并非是不可控的，shuffle 过程由 ``ShuffleManager`` 的实现进行处理，我们可通过指定 ``spark.shuffle.manager`` 配置的值来选择具体的实现，可选值为 ``sort`` 以及 ``tungsten-sort`` - 这两种实现实现在 Spark 内部均由一个类表示 - ``SortShuffleManager``，当然，我们还可选择自定义实现，并将 ``spark-shuffle.manager`` 属性值指定为自定义实现类的全称限定名。一些现有的自定义 ``ShuffleManager`` 实现有 [Spark-PMoF](https://github.com/Intel-bigdata/Spark-PMoF)、[splash](https://github.com/MemVerge/splash) 等。

此外，我们还能指定 shuffle 数据是否进行压缩（``spark.shuffle.compress``, 默认为 ``true``），使用的压缩编码方式由 ``spark.io.compression.codec`` 指定。使用压缩可以减少在网络传输中的数据量，但在数据读取阶段则需要额外的解压缩步骤。

#### Sort shuffle manager

在 Spark 2.0 发布后，其 shuffle 管理发生了一些改变。Spark 完全移除了 hash shuffle manager，仅保留了 **sort-based shuffle manager** (基于排序的 shuffle 管理器)。

由于历史关系，且为了更好地了解 sort-based shuffle manager，我们简单了解一下为什么 Spark 要淘汰 hash shuffle manager，它主要有以下两大缺点：

- 创建的中间文件过多 - 每个 mapper 都会为每个 reducer 创建一个文件，如若有 5 个 mapper 及 5 个 reducer，则 hash-based shuffle manager 需要操作 25 个文件（当然在实际大数据环境中肯定远远不止 25 个文件）；
- 随机写问题 - 与顺序写（sequential write）不同，随机写（random write）包含了写以及检索（seek），由于增加了检索步骤，速度自然要慢一些，而又因需要操作非常多的文件，整体性能自然就大大降低了。

Sort-based shuffle manager 的出现，改变了 Spark 的 shuffle 管理，其 mapper 将所有分区记录只写到单个文件。为了理解该 shuffle manager 的 shuffle 工作流程，下方列出了它涉及到的一些重要步骤：

1. 首先，mapper 在使用 ``PartitionedAppendOnlyMap`` 将所有记录累积起来，放入内存中。这些记录由分区进行分组。当内存空间不足时，记录会被保存到磁盘中，在 Spark 术语中，该过程被称为 **spiling** （倾出）。通过查看类似下面的日志，我们可以判断 spilling 是否发生：
   ```txt
   INFO ExternalSorter: Task 1 force spilling in-memory map to disk it will release 352.2 MB memory
   ```
   
2. 当所有记录处理完后，Spark 会将它们保存到磁盘中，生成两个文件：保存记录数据的 ``.data`` 文件以及保存按分区排序的记录数据文件 ``.index``。索引文件包含数据文件中排序分区的起始及结束位置。

3. Shuffle 读取阶段中，reducers 使用 ``.index`` 所有文件来查找它们需要的记录数据，知道这些信息后，便会获取相应数据并对其进行迭代，以构造出预期的输出结果。如果文件在 mapping 阶段没有合并，则它们会在读取阶段中迭代前进行合并。

需要注意的是，当分区数小于 ``spark.shuffle.sort.bypassMergeThreshold`` 配置指定的值时，将出现特殊的情况，不会执行排序及聚合操作。在这种情况下， sort-based manager 会将记录输出到单独的文件中，每个 reducer 分区对应一个文件，仅在最后才把这些文件合并为一个通用文件。

#### Shuffle manager 底层实现

在底层实现中，在 ``org.apache.spark.SparkEnv`` 创建的同时，shuffle manager 也会被创建，它可被初始化为基于 spark 的 tungsten-sort 或 sort manager，``spark.shuffle.manager`` 的默认值为 ``'sort'``。此时，运行时中会创建一个 ``SortShuffleManager`` 实例作为相应的 shuffle manager，从 ``SortShuffleManager`` 的具体实现来看，我们可以找到许多与上述 shuffle 工作流程相关的部分。



对于 reducer 部分，我们可以在 ``SortShuffleManger`` 及其实现接口 ``ShuffleManager`` 中看到 ``getRead(...)`` 方法，该方法返回一个用于读取已 shuffle 数据的 ``ShuffleReader``，最终调用 ``read(...)`` 方法来通过一个迭代器获取 shuffled 数据，并使用一个 ``SerializerInstance`` 实例将 shuffled 数据反序列化成 Java 对象。

而对于 mapper 部分，数据则会被序列化后移交给一个 ``ShuffleWriter`` （通过 ``getWritter(...)`` 方法获得），并根据给定 ``ShuffleHandle`` 来决定具体的实现，可返回 ``UnsafeShuffleWriter`` 、``BypassMergeSortShuffleWriter`` 或 ``SortShuffleWriter`` 。

之前已经提到，当分区数小于或等于 ``spark.shuffle.bypassMergeThreshold`` 指定的阈值时，``ShuffleHandle`` 具体实现表示为 ``BypassMergeSortShuffleHandle``，返回 ``BypassMergeSortShuffleWriter``，另外两种 ``ShuffleHandle`` 实现分别表示为 ``SerializedShuffleHandle`` (以序列化形式输出，返回 ``UnsafeShuffleWriter``)，以及 ``BaseShuffleHandle``（输出不进行序列化，返回 ``SortShuffleWriter``）。

在选定好合适的 writer 后，将会为 reducer 生成两个临时文件：一个用于存储数据(.data)，一个用于存储索引(.index)，数据压缩文件部分样例如下：

```txt
LZ4Block%\8D\00\00\00\A5\00\00\00\E0\87\D6\F6!\AC\ED\00sr\00java.lang.Integer⠤\F7\81\878\00I\00valuexr\00(\00\F4Number\86\AC\95\94\E0\8B\00\00xp\00\00\00t\00SMALL (101); 
\00\8011)sq\00~\00\00Dt\00\003%\00wBIG (15#\00\D03t\00	BIG (171)LZ4Block\00\00\00\00\00\00\00\00\00\00\00\00
```

下面则是 mapping 阶段后的目录结构样例：

```txt
# when 1 partition is used
.
├── 0c
│   └── shuffle_0_0_0.data
├── 0d
├── 0e
├── 11
├── 13
└── 30
    └── shuffle_0_0_0.index
# when 2 partitions are used
.
├── 0c
│   └── shuffle_0_0_0.data
├── 0d
├── 0e
├── 0f
│   └── shuffle_0_1_0.index
├── 11
├── 13
├── 15
│   └── shuffle_0_1_0.data
└── 30
    └── shuffle_0_0_0.index
```

其中，``shuffle_`` 之后的三个数字，依次分别表示 shuffle id, map id, reduce id。

### Summary

本文主要简单介绍了 Spark 中的数据 shuffle，我们可以了解到 Shuffle 过程并不是仅由 Spark 自动控制，我们可通过一些相关的配置对该 shuffle 过程进行自定义。其次，通过对 Spark 提供的默认 sorted-base shuffle manager 进行简单介绍，可更好地理解 spark shuffle 的工作机制。最后，关于 Spark shuffle 架构，更多地，可阅读本文文末给出的参考链接及推荐阅读。

### References

1. https://spark.apache.org/docs/latest/rdd-programming-guide.html#shuffle-operations
2. https://sparkbyexamples.com/spark/spark-shuffle-partitions
3. https://www.waitingforcode.com/apache-spark/shuffling-in-spark/read

### More

1. [Spark architecture shuffle](https://0x0fff.com/spark-architecture-shuffle/)
2. [Sorted-based shuffle](https://issues.apache.org/jira/secure/attachment/12655884/Sort-basedshuffledesign.pdf)
3. [When does shuffling occur in Apache Spark?](http://stackoverflow.com/questions/31386590/when-does-shuffling-occur-in-apache-spark)
4. [Shuffle process](https://github.com/JerryLead/SparkInternals/blob/master/markdown/english/4-shuffleDetails.md)
5. [Shuffle in Apache Spark, back to the basics](https://www.waitingforcode.com/apache-spark/shuffle-apache-spark-back-basics/read)
6. [What's new in Apache Spark 3.0 - shuffle service changes](https://www.waitingforcode.com/apache-spark/what-new-apache-spark-3-shuffle-service-changes/read)
7. [External shuffle service in Apache Spark](https://www.waitingforcode.com/apache-spark/external-shuffle-service-apache-spark/read)
8. [Shuffle join in Spark SQL](https://www.waitingforcode.com/apache-spark-sql/shuffle-join-spark-sql/read)
9. [Spark shuffle - complementary notes](https://www.waitingforcode.com/apache-spark/spark-shuffle-complementary-notes/read)

