---
title: 如何使用 Redis ACL 来控制客户端连接的访问
date: 2021-09-11 14:00:00
categories:
 - Redis
abbrlink: d94f4269
---


ACL (Access Control List，访问控制列表) 是 Redis 中用于限制和控制 Redis 服务器访问的一种安全机制。使用 ACL，我们可以控制客户端连接可执行的 keys 和 commands。

<!-- more -->

接下来，我们将讨论如何通过 ACL 功能来加强 Redis 服务器的安全性。

###  ACL 作用原理

通过定义用户的 ACL，当客户端连接访问 Redis CLI 时，必须通过访问控制列表中的用户名(username) 和密码 (password) 进行身份认证。

身份认证成功后，Redis 会给该连接的用户分配定义的权限。例如，如果客户端以一个只读权限用户进行认证，那么相应的 Redis 连接也会继承该用户的权限。



NOTE: ACL 需要 Redis 6.0 及以上版本才支持。

### Redis Auth 命令

在较新的 Redis 版本中，我们可以使用 ``auth`` 命令后面跟用户名（username）和密码（password）来进行身份认证。

如果只提供密码的话，Redis 将会以默认用户 ``default`` 进行身份认证。

### Redis 配置 ACL

Redis 一般使用默认用户 ``default``，我们可以使用 ``acl setuser other_user`` 来创建出新的用户。要查看当前 ACL 列表，可以使用 ``acl list`` 命令：

```bash
127.0.0.1:6379> ACL LIST
1) "user default on #5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8 ~* +@all"
```

ACL LIST 命令的输出遵循以下模式：

1. 第一部分是 ``user`` 关键字；
2. 接着是用户名，如 ``default``；
3. 第三部分是 ``on`` 关键字，``on`` 表示启用该用户认证，相应地，``off`` 则是禁用该用户认证；
4. 第四部分是用户密码的 ``sha256`` hash 格式。如果没有设置密码，则该值为 ``nopass``；
5. 接着是定义用户可访问的 keys，在上面例子中，``~*`` 表示包含所有 key；
6. 最后是定义用户可执行的 commands，在上面例子中，``+@all`` 表示可执行所有命令；

### ACL 规则

Redis 有一系列可扩展的 ACL 规则，下面我们先列出一些比较重要的规则：

1. ``on`` 启用指定用户，以使客户端能认证该用户名及密码；
2. ``off`` 禁用指定用户，使客户端无法使用该用户名及密码进行身份认证;;
3. ``+<command>`` 向用户可执行的命令列表中添加一条命令。其中多条命令则使用管道符 ``|`` 进行分隔，如要向用户添加 ``set`` 和 ``get`` 命令，则可以使用 ``+SET|GET``；
4. ``-<command>`` 从用户可执行的命令列表中移除一条命令，同样也可以同时移除多条命令；
5. ``@all`` 或 ``allcommands`` 允许用户执行所有命令；
6. ``~<pattern>`` 添加符合某一模式的 keys 允许用户访问。如 ``~*`` 指定所有的 key；
7. ``><password>`` 向指定用户添加可进行认证的密码；
8. ``<<password>`` 与上面相反，移除可进行认证的密码；
9. ``resetpass`` 删除所有允许的密码；
10. ``nopass`` 允许用户无密码访问；



### Redis 配置 ACL 用户

要向 ACL 列表添加用户，可以使用 ``ACL SETUSER`` 命令。对于该命令主要用于给指定用户配置 ACL 规则，如果该定用户名不存在，则会创建出新的用户。

例如：

```bash
127.0.0.1:6379>acl setuser rovo98
OK
```

然后，可用 ``acl list`` 来查看：

```bash
127.0.0.1:6379> acl list
1) "user default on <HASH> ~* +@all"
2) "user rovo98 off -@all"
```

默认情况下，新添加的用户 ``rovo98`` 处于禁用状态，且无法执行任何命令以及访问任何 key。Redis 在创建新用户时会尽可能赋于其最少的权限。

我们可以使用以下命令来启用用户 ``rovo98`` 并指定一个密码。

```bash
127.0.0.1:6379> acl setuser rovo98 on >rovo98@redis
OK
```

 执行该命令后，我们便启用了 ``rovo98`` 用户且指定了一个密码 ``rovo98@redis``。

要向该用户添加可执行的命令，我们可以:

```bash
127.0.0.1:6379> acl setuser rovo98 +set|get|del
OK
```

并让用户能够访问所有的 key：

```bash
127.0.0.1:6379> acl setuser rovo98 ~*
OK
```

需要注意的是，用户名是大小写敏感的。

经上面配置后，我们现在大概可获得以下类似的 ACL 列表：

```txt
1) "user default on <HASH> ~* +@all"
2) "user rovo98 on <HASH> ~* -@all +set|get|del"
```

### Redis 用户描述

要获取一个 ACL 用户的描述信息，我们可以执行 ``acl getuser`` 命令。

```bash
127.0.0.1:6379> acl getuser rovo98
1) "flags"
2) 1) "on"
2) "allkeys"
3) "passwords"
4) 1) "<HASH>"
5) "commands"
6) "-@all +set|get|del"
7) "keys"
8) 1) "*"
```

### 总结

本文主要描述了关于 Redis  ACL 功能的使用，介绍了如何使用 ACL 来配置规则控制用户对 keys 和 commands 的访问。

更多的内容建议前往官网的[文档](https://redis.io/docs/manual/security/acl/) 进行查看。

### References

1. https://redis.io/docs/manual/security/acl/

2. https://linuxhint.com/redis-acl/

