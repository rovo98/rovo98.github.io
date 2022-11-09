---
title: 浅谈 Java SPI 及其应用 - 以 Flink connector-jdbc Dialect 扩展为例
author: rovo98
categories:
  - Java
tags:
  - basic
abbrlink: 6910d276
date: 2021-04-10 20:20:00
---

SPI (Service Provider Interface) 即服务提供者接口，主要用于创建可扩展的应用程序。可扩展应用程序（extensible application）是指在不修改原应用代码的情况下，能通过集成新插件或模块进行扩展的应用程序。

<!-- more -->

一般地，开发者、软件提供商或用户可通过在应用 classpath 或应用特定扩展目录下添加 JAR 

包来为应用提供新功能或 API (Application programming interfaces)。

> e.g.  [Dictionary Service Example](https://docs.oracle.com/javase/tutorial/ext/basics/spi.html#dictionary-service-example)
>
> 可扩展应用程序的一个例子：Word processor 文字处理器，允许终端用户添加新的字典（dictionary）或拼写检查器（spelling checker）。此时，文字处理器需要定义字典以及拼写检查器特性的接口，以供其他开发人员或用户对该接口进行实现。

关于可扩展应用程序的一些重要术语及定义：

1. Service (服务)： 提供某些应用功能或特性的编程接口或类。服务可定义功能的接口以及检索其实现的方式。

2. Service provider interface (SPI): 一个服务定义的一组公共接口（public interfaces）及抽象类。
3. Service Provider (服务提供者)：负责实现 SPI。

> 在上面文字处理器的例子中，一个字典服务可以定义检索字典的方式以及定义词语，但它并不负责具体实现。它需要依赖于相应的 Service Provider 来提供实现。

### ServiceLoader Class

``java.util.ServiceLoader`` 可用于发现、加载以及使用 Service providers。它可从应用类路径或运行时环境扩展目录下加载服务提供者（Service provider）。因此，在将新服务提供者添加到类路径或运行时环境扩展目录下后，便可使用 ``ServiceLoader`` 来加载它们，获取特定 SPI 的所有实现，我们便能在服务 （Service）中根据需要获取一个特定的实现来使用。

在 ``ServiceLoader`` 中，Providers 根据需要进行加载以及初始化，``ServiceLoader`` 会维护一个存储已加载 providers 的缓存。每次调用 ``ServiceLoader.iterator()`` 方式时，都会优先返回一个携带所有已缓存 providers 的 iterator，遍历完已缓存 providers 后，才会重新去加载相应的 providers。当然，我们也可以人为地调用 ``reload()`` 方法来清除缓存，并重新加载 providers。

#### 1. ServiceLoader 的基本使用

为特定 SPI 创建一个 ``ServiceLoader``，可通过 ``load()`` 或 ``loadInstalled()`` 方法加载 providers。其中，``load()`` 方法通过 ``ThreadContextClassLoader`` （线程上下文类加载器）来进行加载，而 ``loadInstalled()`` 则使用 ``ExtClassLoader`` （扩展类加载器）来加载默认运行时环境目录 ``jre/lib/ext`` 下的 providers。当然，我们也可以指定默认的 ClassLoader 或自定义的 ClassLoader。

Java SPI 机制的使用步骤：

1. 定义 Service 服务及 Service Provider 服务提供者接口；
2. 创建具体服务提供者接口实现类；
3. 创建或配置服务提供者注册文件 (``META-INF/services`` 目录下)
4. 使用 ``ServiceLoader.load()`` 创建 ``ServiceLoader`` 实例，然后调用 ``iterator()`` 实现相关服务提供者实现的懒加载；



#### 2. ServiceLoader 工作原理

我们可以从 ``ServiceLoader`` 使用来分析其工作原理。

1. 使用 ``load()``, ``loadInstalled()`` 来创建 ``ServiceLoader`` 实例:

```java
...
// Creates a new service loader for the given service type and class loader.
public static <S> ServiceLoader<S> load(Class<S> service,
                                        ClassLoader loader){
    return new ServiceLoader<>(service, loader);
}
...
// Creates a new service loader for the given service type, using the current
// thread's context class loader.
public static <S> ServiceLoader<S> load(Class<S> service) {
    ClassLoader cl = Thread.currentThread().getContextClassLoader();
    return ServiceLoader.load(service, cl);
}
...
// Creates a new service loader for the given service type, using the extension
// class loader.
public static <S> ServiceLoader<S> loadInstalled(Class<S> service) {
    ClassLoader cl = ClassLoader.getSystemClassLoader();
    ClassLoader prev = null;
    while (cl != null) {
        prev = cl;
        cl = cl.getParent();
    }
    return ServiceLoader.load(service, prev);
}
...
```

2. 获得 ``ServiceLoader`` 实例后，便能通过调用其 ``iterator()`` 方法来获取所有加载到的 service providers。
2. ``ServiceLoader`` 实例工作原理，从其构造方法及成员变量可以看出，当我们创建一个 ``ServiceLoader`` 实例时，它会维护一个懒加载的服务查找 Iterator ``lookupIterator`` ，用于用户调用 ``iterator()`` 方法时使用：

```java
public final class ServiceLoader<S>
    implements Iterable<S>
{

    // 服务提供者实现注册文件路径前缀
    private static final String PREFIX = "META-INF/services/";

    // The class or interface representing the service being loaded
    private final Class<S> service;

    // The class loader used to locate, load, and instantiate providers
    private final ClassLoader loader;

    // The access control context taken when the ServiceLoader is created
    private final AccessControlContext acc;

    // Cached providers, in instantiation order
    // 缓存的服务提供者实现 map，<class qualifier name, ServiceT> 
    private LinkedHashMap<String,S> providers = new LinkedHashMap<>();

    // The current lazy-lookup iterator
    private LazyIterator lookupIterator;

    /**
     * Clear this loader's provider cache so that all providers will be
     * reloaded.
     *
     * <p> After invoking this method, subsequent invocations of the {@link
     * #iterator() iterator} method will lazily look up and instantiate
     * providers from scratch, just as is done by a newly-created loader.
     *
     * <p> This method is intended for use in situations in which new providers
     * can be installed into a running Java virtual machine.
     */
    // 我们还可以显式地调用该 reload 方法来重新加载服务提供者实现
    public void reload() {
        providers.clear();
        lookupIterator = new LazyIterator(service, loader);
    }
    
    private ServiceLoader(Class<S> svc, ClassLoader cl) {
        service = Objects.requireNonNull(svc, "Service interface cannot be null");
        loader = (cl == null) ? ClassLoader.getSystemClassLoader() : cl;
        acc = (System.getSecurityManager() != null) ? AccessController.getContext() : null;
        reload();
    }

......   
}
```

4. ``iterator()`` 方法及 ``LazyIterator`` :

```java
......
// 返回一个 iterator，优先从缓存的服务提供者实现获取
public Iterator<S> iterator() {
    return new Iterator<S>() {

        Iterator<Map.Entry<String,S>> knownProviders
            = providers.entrySet().iterator();

        public boolean hasNext() {
            if (knownProviders.hasNext())
                return true;
            return lookupIterator.hasNext();
        }

        public S next() {
            if (knownProviders.hasNext())
                return knownProviders.next().getValue();
            return lookupIterator.next();
        }

        public void remove() {
            throw new UnsupportedOperationException();
        }

    };
}
......
// Private inner class implementing fully-lazy provider lookup
//
private class LazyIterator
        implements Iterator<S>
{

    Class<S> service;
    ClassLoader loader;
    Enumeration<URL> configs = null;
    Iterator<String> pending = null;
    String nextName = null;

    private LazyIterator(Class<S> service, ClassLoader loader) {
        this.service = service;
        this.loader = loader;
    }

    // 判断是否还有服务提供者实现
    private boolean hasNextService() {
        if (nextName != null) {
            return true;
        }
        // 使用 ExtClassLoader 或
        // 给定 classloader (e.g. Thread.currentThread().getContextClassLoader()) 
        // 加载服务注册配置文件 (e.g. META-INF/services/com.rovo98.service.Engine)
        
        if (configs == null) {
            try {
                String fullName = PREFIX + service.getName();
                if (loader == null)
                    configs = ClassLoader.getSystemResources(fullName);
                else
                    configs = loader.getResources(fullName);
            } catch (IOException x) {
                fail(service, "Error locating configuration files", x);
            }
        }
        while ((pending == null) || !pending.hasNext()) {
            if (!configs.hasMoreElements()) {
                return false;
            }
            // 将服务注册配置文件中的每一行解析
            // - 验证配置文件语法是否正确
            // - 验证 provider-class 名称是否合法
            // - 仅加载不重复且不在已缓存的服务提供者实现的
            //   类全称限定名(qualifier name)
            pending = parse(service, configs.nextElement());
        }
        // 待加载服务提供者实现类全称限定名
        nextName = pending.next();
        return true;
    }

    private S nextService() {
        if (!hasNextService())
            throw new NoSuchElementException();
        String cn = nextName;
        nextName = null;
        Class<?> c = null;
        try {
            // 根据类全称限定名和给定 classloader 加载类
            c = Class.forName(cn, false, loader);
        } catch (ClassNotFoundException x) {
            fail(service,
                 "Provider " + cn + " not found");
        }
        if (!service.isAssignableFrom(c)) {
            fail(service,
                 "Provider " + cn  + " not a subtype");
        }
        try {
            S p = service.cast(c.newInstance());
            // 加载后的服务提供者实现添加至缓存中
            providers.put(cn, p);
            return p;
        } catch (Throwable x) {
            fail(service,
                 "Provider " + cn + " could not be instantiated",
                 x);
        }
        throw new Error();          // This cannot happen
    }

    public boolean hasNext() {
        if (acc == null) {
            return hasNextService();
        } else {
            PrivilegedAction<Boolean> action = new PrivilegedAction<Boolean>() {
                public Boolean run() { return hasNextService(); }
            };
            return AccessController.doPrivileged(action, acc);
        }
    }

    public S next() {
        if (acc == null) {
            return nextService();
        } else {
            PrivilegedAction<S> action = new PrivilegedAction<S>() {
                public S run() { return nextService(); }
            };
            return AccessController.doPrivileged(action, acc);
        }
    }

    public void remove() {
        throw new UnsupportedOperationException();
    }
}
......
```



### SPI 实践案例

最近，我在工作中使用 Flink 时，用到了 flink-connector-jdbc（在项目用的 **Flink 1.9** 版本中，为 flink-jdbc），用于流数据处理完成后，sink 到 Oracle 中。但了解 Flink 的人，应该知道，Flink 官方目前（最新版本 1.12）所提供的 flink-connector-jdbc 仍仅支持 MySQL、PostgreSQL 以及 Derby 的驱动。此时摆在我面前有几种解决方案：

1. 基于 ``RichSinkFunction`` 以及 JDBC 实现批量数据插入或更新，以确保流数据在达到一定量或经过一定时间后，能持久化到数据库中；

2. 找寻 Flink 看是否有提供能使用的 API 或类实现；

3. 寻找 Flink jdbc connector 的扩展点。

在实际项目开发中，我们应该避免重复造轮子，因此，我选择优先查看 Flink 1.9 是否有提供相应可用的 API。果不其然，找到了 ``JDBCUpsertOutputFormat`` ，该 JDBC 输出格式能够指定 ``flushInterval`` 以及 ``batchSize``，可控制流数据写入数据库时的批量大小，以及刷新时间（即经一定时间后，将已缓存数据写入数据库，不管是否达到 ``batchSize``）。``JDBCUpsertTableSink`` 使用 ``JDBCUpsertOutputFormat``，因此，我们可使用 ``StreamTableEnvironment`` 的 ``registerTableSink()`` 方法来注册一个 ``JDBCUpsertTableSink``，之后便能通过 sql api 向该已注册的表插入数据，以 sink 到相应的数据库中。例：

```java
...
tableEnv.registerTableSink("registered_tbl_name", JDBCUpsertTableSink.builder()
                          .setOptions(...)
                          .setTableSchema(...)
                          .setFlushMaxSize(10_000)
                          .setFlushIntervalMills(10000)
                          .setMaxRetryTimes(3)
                          .build());
tableEnv.fromDataStream("processed_records");
tableEnv.sqlUpdate("insert into reigstered_tbl_name
                   select a_xxx, b_xxx from processed_records");
...
```

在上例中，由于 ``setOptions()`` 需要指定 ``JDBCOptions`` ，而该 ``JDBCOptions`` 包含维持一个 ``JDBCDialect``，目前官方仅提供 MySQL、PostgreSQL 及 Derby 的 dialect。因此我们需要在构建 ``JDBCOptions`` 时，显式地指定目标 ``JDBCDialect``。以 ``OracleDialect`` 为例，我们需要实现 ``JDBCDialect`` 接口，以便能在构建 ``JDBOptions`` 时使用。

```java
// OracleDialect.java
/**
 * Oracle dialect implementation for flink 1.9 jdbc.
 *
 * ref: https://issues.apache.org/jira/browse/FLINK-14078
 * @author rovo98
 */
public class OracleDialect implements JDBCDialect {
    private static final long serialVersionUID = 1L;

    @Override
    public boolean canHandle(String url) {
        return url.startsWith("jdbc:oracle:");
    }

    @Override
    public Optional<String> defaultDriverName() {
        return Optional.of("oracle.jdbc.OracleDriver");
    }

    @Override
    public String quoteIdentifier(String identifier) {
        // if we use double-quotes identifier then Oracle becomes case-sensitive
        return identifier;
    }

    // FIXME: this implementation is not been well tested
    // maybe provides canHandle and quoteIdentifier methods can meet the minimum requirements.

    @Override
    public Optional<String> getUpsertStatement(String tableName, String[] fieldNames, String[] uniqueKeyFields) {
        String sourceFieldValues = Arrays.stream(fieldNames)
                .map(f -> "? " + quoteIdentifier(f))
                .collect(Collectors.joining(", "));
        String sourceSelect = "SELECT " + sourceFieldValues + " FROM DUAL";
        return Optional.of(getMergeIntoStatement(tableName, fieldNames, uniqueKeyFields, sourceSelect));
    }

    public String getMergeIntoStatement(String tableName, String[] fieldNames, String[] uniqueKeyFields, String sourceSelect) {
        final Set<String> uniqueKeyFieldsSet = Arrays.stream(uniqueKeyFields).collect(Collectors.toSet());
        String onClause = Arrays.stream(uniqueKeyFields)
                .map(f -> "t." + quoteIdentifier(f) + "=s." + quoteIdentifier(f))
                .collect(Collectors.joining(", "));
        String updateClause = Arrays.stream(fieldNames)
                .filter(f -> !uniqueKeyFieldsSet.contains(f))
                .map(f -> "t." + quoteIdentifier(f) + "s." + quoteIdentifier(f))
                .collect(Collectors.joining(", "));
        String insertValueClause = Arrays.stream(fieldNames)
                .map(f -> "s." + quoteIdentifier(f))
                .collect(Collectors.joining(", "));
        String columns = Arrays.stream(fieldNames)
                .map(this::quoteIdentifier)
                .collect(Collectors.joining(", "));
        // if we can't divide schema and table-name is risky to call quoteIdentifier(tableName)
        // for example in SQL-server [tbo].[sometable] is ok but [tbo.sometable] is not
        return "MERGE INTO " + tableName + " t " +
                "USING (" + sourceSelect + ") s" +
                "ON (" + onClause + ")" +
                " WHEN MATCHED THEN UPDATE SET " + updateClause +
                " WHEN NOT MATCHED THEN INSERT (" + columns + ") VALUES (" + insertValueClause + ")";
    }
}

// 显式地使用 OracleDialect
...
JDBCOptions.builder()
    .setDBUrl(url)
    .setPassword(password)
    .setDriverName(drivername)
    .setUsername(username)
    .setTableName(tblName)
    .setDialect(new OracleDialect())
    .build(); 
...
```

以上示例代码体现了解决方案 2。总体感觉还不够优雅。毕竟 Flink 还允许我们自定义 TableFactory，实现自定义的 ``TableSource`` 以及 ``TableSink``。



为了在 flink 1.9 提供的 jdbc connector 基础上扩展其支持的 JDBCDialect，我 Flink 1.9 jdbc 包提供 api 做了以下修改：

- 将 ``JDBCDialect`` 接口作为 SPI，并创建一个相应的服务 (Service) - ``JDBCDialectService``，用于发现和加载 ``JDBCDialect`` 的供应者（providers）；
- 对原有提供的 ``JDBCTableSourceSinkFactory``、``JDBCValidator`` 进行简单修改，让他们使用 ``JDBCDialectService`` 来根据给定 ``jdbcUrl`` 的格式（如： ``jdbc:oracle:xx``）来获取相应的 ``JDBCDialect``。

具体相关修改如下：

1. ``JDBCDialectService.java``

```java
/**
 * util class for finding  JDBC dialects
 * - extended from JDBCDialects provided by flink 1.9 - see {@link JDBCDialects}
 *
 * @author rovo98
 */
public class JDBCDialectService {

    private JDBCDialectService() {}

    private static final List<JDBCDialect> DIALECTS = new ArrayList<>();

    static {
        // find and load JDBCDialects through SPI.
        ClassLoader cl = Thread.currentThread().getContextClassLoader();
        Iterator<JDBCDialect> jdbcDialectIterator = ServiceLoader.load(JDBCDialect.class, cl)
                .iterator();
        jdbcDialectIterator.forEachRemaining(DIALECTS::add);
    }

    /**
     * Fetch the JDBCDialect class corresponding to a given database url.
     */
    public static Optional<JDBCDialect> get(String url) {
        return DIALECTS.stream()
                .filter(e -> e.canHandle(url))
                .findFirst();
    }
}
```

2. ``CustomizedJDBCTableSourceSinkFactory.java``

```java
/**
 * A modified version of {@link JDBCTableSourceSinkFactory}.
 *
 * @author rovo98
 */
public class CustomizedJDBCTableSourceSinkFactory implements
        StreamTableSourceFactory<Row>,
        StreamTableSinkFactory<Tuple2<Boolean, Row>> {

    @Override
    public Map<String, String> requiredContext() {
        Map<String, String> context = new HashMap<>();
        context.put(CONNECTOR_TYPE, "extended-jdbc"); // jdbc with other dialects supported
        context.put(CONNECTOR_PROPERTY_VERSION, "1"); // backwards compatibility
        return context;
    }

    @Override
    public List<String> supportedProperties() {
        List<String> properties = new ArrayList<>();

        // common options
        properties.add(CONNECTOR_DRIVER);
        properties.add(CONNECTOR_URL);
        properties.add(CONNECTOR_TABLE);
        properties.add(CONNECTOR_USERNAME);
        properties.add(CONNECTOR_PASSWORD);

        // scan options
        properties.add(CONNECTOR_READ_PARTITION_COLUMN);
        properties.add(CONNECTOR_READ_PARTITION_NUM);
        properties.add(CONNECTOR_READ_PARTITION_LOWER_BOUND);
        properties.add(CONNECTOR_READ_PARTITION_UPPER_BOUND);
        properties.add(CONNECTOR_READ_FETCH_SIZE);

        // lookup options
        properties.add(CONNECTOR_LOOKUP_CACHE_MAX_ROWS);
        properties.add(CONNECTOR_LOOKUP_CACHE_TTL);
        properties.add(CONNECTOR_LOOKUP_MAX_RETRIES);

        // sink options
        properties.add(CONNECTOR_WRITE_FLUSH_MAX_ROWS);
        properties.add(CONNECTOR_WRITE_FLUSH_INTERVAL);
        properties.add(CONNECTOR_WRITE_MAX_RETRIES);

        // schema
        properties.add(SCHEMA + ".#." + SCHEMA_TYPE);
        properties.add(SCHEMA + ".#." + SCHEMA_NAME);

        return properties;
    }

    @Override
    public StreamTableSource<Row> createStreamTableSource(Map<String, String> properties) {
        final DescriptorProperties descriptorProperties = getValidatedProperties(properties);

        return JDBCTableSource.builder()
                .setOptions(getJDBCOptions(descriptorProperties))
                .setReadOptions(getJDBCReadOptions(descriptorProperties))
                .setLookupOptions(getJDBCLookupOptions(descriptorProperties))
                .setSchema(descriptorProperties.getTableSchema(SCHEMA))
                .build();
    }

    @Override
    public StreamTableSink<Tuple2<Boolean, Row>> createStreamTableSink(Map<String, String> properties) {
        final DescriptorProperties descriptorProperties = getValidatedProperties(properties);

        final JDBCUpsertTableSink.Builder builder = JDBCUpsertTableSink.builder()
                .setOptions(getJDBCOptions(descriptorProperties))
                .setTableSchema(descriptorProperties.getTableSchema(SCHEMA));

        descriptorProperties.getOptionalInt(CONNECTOR_WRITE_FLUSH_MAX_ROWS).ifPresent(builder::setFlushMaxSize);
        descriptorProperties.getOptionalDuration(CONNECTOR_WRITE_FLUSH_INTERVAL).ifPresent(
                s -> builder.setFlushIntervalMills(s.toMillis()));
        descriptorProperties.getOptionalInt(CONNECTOR_WRITE_MAX_RETRIES).ifPresent(builder::setMaxRetryTimes);

        return builder.build();
    }

    private DescriptorProperties getValidatedProperties(Map<String, String> properties) {
        final DescriptorProperties descriptorProperties = new DescriptorProperties(true);
        descriptorProperties.putProperties(properties);

        new SchemaValidator(true, false, false).validate(descriptorProperties);
        // disabling the JDBCValidator provided by flink 1.9
        // using our own JDBCValidator, a modified version of original
        new CustomizedJDBCValidator().validate(descriptorProperties);

        return descriptorProperties;
    }

    private JDBCOptions getJDBCOptions(DescriptorProperties descriptorProperties) {
        final String url = descriptorProperties.getString(CONNECTOR_URL);
        final JDBCOptions.Builder builder = JDBCOptions.builder()
                .setDBUrl(url)
                .setTableName(descriptorProperties.getString(CONNECTOR_TABLE))
                // using customized JDBCDialects to set the specified dialect.
                // 使用自定义的 JDBCDialectSerice 来加载 JDBCDialect
                .setDialect(JDBCDialectService.get(url).get());

        descriptorProperties.getOptionalString(CONNECTOR_DRIVER).ifPresent(builder::setDriverName);
        descriptorProperties.getOptionalString(CONNECTOR_USERNAME).ifPresent(builder::setUsername);
        descriptorProperties.getOptionalString(CONNECTOR_PASSWORD).ifPresent(builder::setPassword);

        return builder.build();
    }

    private JDBCReadOptions getJDBCReadOptions(DescriptorProperties descriptorProperties) {
        final Optional<String> partitionColumnName =
                descriptorProperties.getOptionalString(CONNECTOR_READ_PARTITION_COLUMN);
        final Optional<Long> partitionLower = descriptorProperties.getOptionalLong(CONNECTOR_READ_PARTITION_LOWER_BOUND);
        final Optional<Long> partitionUpper = descriptorProperties.getOptionalLong(CONNECTOR_READ_PARTITION_UPPER_BOUND);
        final Optional<Integer> numPartitions = descriptorProperties.getOptionalInt(CONNECTOR_READ_PARTITION_NUM);

        final JDBCReadOptions.Builder builder = JDBCReadOptions.builder();
        if (partitionColumnName.isPresent()) {
            builder.setPartitionColumnName(partitionColumnName.get());
            builder.setPartitionLowerBound(partitionLower.get());
            builder.setPartitionUpperBound(partitionUpper.get());
            builder.setNumPartitions(numPartitions.get());
        }
        descriptorProperties.getOptionalInt(CONNECTOR_READ_FETCH_SIZE).ifPresent(builder::setFetchSize);

        return builder.build();
    }

    private JDBCLookupOptions getJDBCLookupOptions(DescriptorProperties descriptorProperties) {
        final JDBCLookupOptions.Builder builder = JDBCLookupOptions.builder();

        descriptorProperties.getOptionalLong(CONNECTOR_LOOKUP_CACHE_MAX_ROWS).ifPresent(builder::setCacheMaxSize);
        descriptorProperties.getOptionalDuration(CONNECTOR_LOOKUP_CACHE_TTL).ifPresent(
                s -> builder.setCacheExpireMs(s.toMillis()));
        descriptorProperties.getOptionalInt(CONNECTOR_LOOKUP_MAX_RETRIES).ifPresent(builder::setMaxRetryTimes);

        return builder.build();
    }
}
```

3. ``CustomizedJDBCValidator.java``

```java
/**
 * A modified version of {@link JDBCValidator}.
 * NOTICE: this implementation has the difference to check jdbc.url only.
 * (using our CustomizedJDBCDialects instead of the original one {@link JDBCDialects}).
 *
 * @author rovo98
 */
public class CustomizedJDBCValidator extends ConnectorDescriptorValidator {

    public static final String CONNECTOR_URL = "connector.url";
    public static final String CONNECTOR_TABLE = "connector.table";
    public static final String CONNECTOR_DRIVER = "connector.driver";
    public static final String CONNECTOR_USERNAME = "connector.username";
    public static final String CONNECTOR_PASSWORD = "connector.password";

    public static final String CONNECTOR_READ_PARTITION_COLUMN = "connector.read.partition.column";
    public static final String CONNECTOR_READ_PARTITION_LOWER_BOUND = "connector.read.partition.lower-bound";
    public static final String CONNECTOR_READ_PARTITION_UPPER_BOUND = "connector.read.partition.upper-bound";
    public static final String CONNECTOR_READ_PARTITION_NUM = "connector.read.partition.num";
    public static final String CONNECTOR_READ_FETCH_SIZE = "connector.read.fetch-size";

    public static final String CONNECTOR_LOOKUP_CACHE_MAX_ROWS = "connector.lookup.cache.max-rows";
    public static final String CONNECTOR_LOOKUP_CACHE_TTL = "connector.lookup.cache.ttl";
    public static final String CONNECTOR_LOOKUP_MAX_RETRIES = "connector.lookup.max-retries";

    public static final String CONNECTOR_WRITE_FLUSH_MAX_ROWS = "connector.write.flush.max-rows";
    public static final String CONNECTOR_WRITE_FLUSH_INTERVAL = "connector.write.flush.interval";
    public static final String CONNECTOR_WRITE_MAX_RETRIES = "connector.write.max-retries";

    @Override
    public void validate(DescriptorProperties properties) {
        super.validate(properties);
        validateCommonProperties(properties);
        validateReadProperties(properties);
        validateLookupProperties(properties);
        validateSinkProperties(properties);
    }

    private void validateCommonProperties(DescriptorProperties properties) {
        properties.validateString(CONNECTOR_URL, false, 1);
        properties.validateString(CONNECTOR_TABLE, false, 1);
        properties.validateString(CONNECTOR_DRIVER, true);
        properties.validateString(CONNECTOR_USERNAME, true);
        properties.validateString(CONNECTOR_PASSWORD, true);

        final String url = properties.getString(CONNECTOR_URL);

        // using JDBCDialectService to find JDBCDialects here.
        final Optional<JDBCDialect> dialect = JDBCDialectService.get(url);
        Preconditions.checkState(dialect.isPresent(), "Cannot handle such jdbc url: " + url);

        Optional<String> password = properties.getOptionalString(CONNECTOR_PASSWORD);
        if (password.isPresent()) {
            Preconditions.checkArgument(
                    properties.getOptionalString(CONNECTOR_USERNAME).isPresent(),
                    "Database username must be provided when database password is provided");
        }
    }

    private void validateReadProperties(DescriptorProperties properties) {
        properties.validateString(CONNECTOR_READ_PARTITION_COLUMN, true);
        properties.validateLong(CONNECTOR_READ_PARTITION_LOWER_BOUND, true);
        properties.validateLong(CONNECTOR_READ_PARTITION_UPPER_BOUND, true);
        properties.validateInt(CONNECTOR_READ_PARTITION_NUM, true);
        properties.validateInt(CONNECTOR_READ_FETCH_SIZE, true);

        Optional<Long> lowerBound = properties.getOptionalLong(CONNECTOR_READ_PARTITION_LOWER_BOUND);
        Optional<Long> upperBound = properties.getOptionalLong(CONNECTOR_READ_PARTITION_UPPER_BOUND);
        if (lowerBound.isPresent() && upperBound.isPresent()) {
            Preconditions.checkArgument(lowerBound.get() <= upperBound.get(),
                    CONNECTOR_READ_PARTITION_LOWER_BOUND + " must not be larger than " + CONNECTOR_READ_PARTITION_UPPER_BOUND);
        }

        checkAllOrNone(properties, new String[]{
                CONNECTOR_READ_PARTITION_COLUMN,
                CONNECTOR_READ_PARTITION_LOWER_BOUND,
                CONNECTOR_READ_PARTITION_UPPER_BOUND,
                CONNECTOR_READ_PARTITION_NUM
        });
    }

    private void validateLookupProperties(DescriptorProperties properties) {
        properties.validateLong(CONNECTOR_LOOKUP_CACHE_MAX_ROWS, true);
        properties.validateDuration(CONNECTOR_LOOKUP_CACHE_TTL, true, 1);
        properties.validateInt(CONNECTOR_LOOKUP_MAX_RETRIES, true);

        checkAllOrNone(properties, new String[]{
                CONNECTOR_LOOKUP_CACHE_MAX_ROWS,
                CONNECTOR_LOOKUP_CACHE_TTL
        });
    }

    private void validateSinkProperties(DescriptorProperties properties) {
        properties.validateInt(CONNECTOR_WRITE_FLUSH_MAX_ROWS, true);
        properties.validateDuration(CONNECTOR_WRITE_FLUSH_INTERVAL, true, 1);
        properties.validateInt(CONNECTOR_WRITE_MAX_RETRIES, true);
    }

    private void checkAllOrNone(DescriptorProperties properties, String[] propertyNames) {
        int presentCount = 0;
        for (String name : propertyNames) {
            if (properties.getOptionalString(name).isPresent()) {
                presentCount++;
            }
        }
        Preconditions.checkArgument(presentCount == 0 || presentCount == propertyNames.length,
                "Either all or none of the following properties should be provided:\n" + String.join("\n", propertyNames));
    }
}
```

当然，别忘了把修改后的 service providers 放到 ``META-INF/services`` 目录下。

```txt
// filename: org.apache.flink.api.java.io.jdbc.dialect.JDBCDialect
com.rovo98.flink.extend.connector.jdbc.dialect.OracleDialect
com.rovo98.flink.extend.connector.jdbc.dialect.DerbyDialect
com.rovo98.flink.extend.connector.jdbc.dialect.PostgreDialect
com.rovo98.flink.extend.connector.jdbc.dialect.SeaBoxDialect
//...

// filename: org.apache.flink.table.factories.TableFactory
com.rovo98.flink.extend.connector.jdbc.CustomizedJDBCTableSourceSinkFactory
```

此时，我们便能同使用原官方 jdbc-connector 那样，使用 DDL 语法来创建 jdbc connector 并向其写入数据了，以自动 sink 到数据库中对应的表。例:

```java
...
String sourceTblName = "pt_user";
String registeredTblName = "users";
// sinks processed result to db.
tableEnv.sqlUpdate(String.format("create table %s (\n"
                        + "id INT, name VARCHAR, age INT"
                        + ") with (\n"
                        + "'connector.type'='extended-jdbc',\n"
                        + "'connector.table'='%s',\n"
                        + "'connector.url'='%s',\n"
                        + "'connector.driver'='%s',\n"
                        + "'connector.username'='%s',\n"
                        + "'connector.password'='%s',\n"
                        + "'connector.write.flush.max-rows'='%s',\n"
                        + "'connector.write.flush.interval'='%s',\n"
                        + "'connector.write.max-retries'='%s'"
                        + ")",
                registeredTblName,
                sourceTblName,
                dbConfigs.getProperty(JdbcUtil.URL_KEY),
                dbConfigs.getProperty(JdbcUtil.DRIVER_CLASS_KEY),
                dbConfigs.getProperty(JdbcUtil.USER_KEY),
                dbConfigs.getProperty(JdbcUtil.PASSWORD_KEY),
                1, 0, 3));

tableEnv.registerDataStream("processed_users", userDataStream);
tableEnv.sqlUpdate("insert into " + registeredTblName + 
                  "select id, name, age from processed_users");
...
```

### Summary

本文主要讨论了 Java SPI 如何用于创建可扩展应用程序并简单分析了 ``ServiceLoader`` 的工作原理，最后以 Flink connector-jdbc 的 dialect 扩展为例，实际展示了 SPI 的一个简单应用场景。



Java JDK 其实也已经包含了许多 SPI，如 ``Driver`` 在 JDBC 4.0 版本后（在此之前使用 ``Class.forName()`` 来加载驱动类），支持通过 ``ServiceLoader`` 来加载 JDBC 驱动类，也要求驱动厂商要在 ``META-INF/services/java.sql.Driver`` 中进行服务注册。更多地还有：

- [CurrencyNameProvider](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/spi/CurrencyNameProvider.html): ``Currency`` 类 Service provider，提供本地化的货币符号；
- [LocaleNameProvider](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/spi/LocaleNameProvider.html): ``Locale`` 类 Service provider，提供语言环境本地名称；
- [TimeZoneNameProvider](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/spi/TimeZoneNameProvider.html): ``TimeZone`` 类 Service provider，提供区域时区名称；
- [DateFormatProvider](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/text/spi/DateFormatProvider.html): 提供指定区域的日期时间格式；
- [NumberFormatProvider](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/text/spi/NumberFormatProvider.html): 使 ``NumberFormat`` 支持货币、整型和百分比值格式；
- [PersistenceProvider](https://docs.oracle.com/javaee/7/api/javax/persistence/spi/PersistenceProvider.html): 提供 JPA API 实现；
- [JsonProvider](https://docs.oracle.com/javaee/7/api/javax/json/spi/JsonProvider.html): 提供 JSON 处理对象；
- [JsonbProvider](https://javaee.github.io/javaee-spec/javadocs/javax/json/bind/spi/JsonbProvider.html): 提供 JSON 绑定对象；
- [Extension](): 为 CDI 容器提供扩展；
- [ConfigSourceProvider](https://openliberty.io/docs/20.0.0.7/reference/javadoc/microprofile-1.2-javadoc.html#package=org/eclipse/microprofile/config/spi/package-frame.html&class=org/eclipse/microprofile/config/spi/ConfigSourceProvider.html): 提供检索配置属性的 Source；



总的来说，SPI 是 Java 开箱提供的一种用于设计可扩展程序的机制，符合 IoC(Inversion of Control) 原则，我们可以用它来设计可扩展程序，也给现有采用 SPI 机制的程序实现更多的功能扩展。当然熟悉 Spring 的人可能便会知道 Spring 也用了一种类似的 IoC 机制[^1]，e.g. ``SpringFactoriesLoader.loadFactories(Foo.class, null)``, 也可以通过 ``FactoryBean`` 来集成Java SPI 实现。

### Remark

经 [FLINK-24253](https://issues.apache.org/jira/browse/FLINK-24253) 处理后，目前 Flink 社区在 1.15 版本中已经采用 ``ServiceLoader`` 对 ``JdbcDialect`` SPI 实现了插件化加载。

### References

1. https://docs.oracle.com/javase/tutorial/ext/basics/spi.html
1. https://ci.apache.org/projects/flink/flink-docs-release-1.9/dev/table/connect.html#jdbc-connector
1. [https://issues.apache.org/jira/browse/FLINK-16833](https://issues.apache.org/jira/browse/FLINK-16833)
1. [https://issues.apache.org/jira/browse/FLINK-24253](https://issues.apache.org/jira/browse/FLINK-24253)
1. https://www.baeldung.com/java-spi

[^1]: https://dzone.com/articles/java-service-loader-vs-spring-factories-loader
