---
title: SQL - 查找并清除重复的数据行
author: rovo98
date: '2019.10.12 13:43:00'
categories:
  - Dev
tags:
  - sql
abbrlink: a264c38d
---

在实际开发场景中，我们需要导入数据库中的数据可能包含重复的行（row）。当然如果在建表时，对数据表中相应的字段进行限制的话，则有可能不会出现这样的问题。

接下来，我们谈一谈，如果数据库中已有重复的数据行，我们该如何把它们找出来，并将这些数据行删除。

<!-- more -->

## 1. 准备

为了方便后续进行处理展示，我们将创建一个简单的数据库，仅包含一个数据表，且该表包含重复的数据行。下面是创建测试用的数据库相应的 ``sql`` 脚本。

```sql
-- NOTICE: noly for testing 'find&remove dupicate rows experiment'.

DROP schema IF EXISTS testdb;
CREATE schema IF NOT EXISTS testdb;

USE testdb;

CREATE TABLE student
(
    id int not null auto_increment,
    name varchar(5),
    mail varchar(100),
    primary key (id)
);

-- insert data contains duplicate rows.
INSERT INTO student VALUES(1, 'Stu1', 'stu1@testdb.com');
INSERT INTO student VALUES(2, 'Stu2', 'stu2@testdb.com');
INSERT INTO student VALUES(3, 'Stu3', 'stu3@testdb.com');
INSERT INTO student VALUES(4, 'Stu4', 'stu4@testdb.com');
INSERT INTO student VALUES(5, 'Stu5', 'stu5@testdb.com');

--  the following are duplcate rows.
INSERT INTO student VALUES(6, 'Stu4', 'stu4@testdb.com');
INSERT INTO student VALUES(7, 'Stu5', 'stu5@testdb.com');
```

## 2. 查找重复的数据行

查找重复数据行的业务需求 - 「找到名字``name``相同的数据行」。

1. 使用自连接 self ``join``:
```sql
SELECT s1.* FROM student as s1
INNER JOIN student as s2
    ON s1.name = s2.name
WHERE s1.id <> s2.id;
```
2. 使用子查询:
```sql
SELECT s1.*
FROM student AS s1
INNER JOIN
(
    SELECT name
    FROM student
    GROUP BY name HAVING COUNT(1) > 1
) AS s2 ON s1.name = s2.name;
```
3. 使用双表查询:
```sql
SELECT s1.* 
FROM student s1, student s2
WHERE s1.name = s2.name AND s1.id <> s2.id;
```
4. 使用 ``group by``:
```sql
SELECT name, mail
FROM student
GROUP BY name, mail
HAVING COUNT(2) >= 2;
```

## 3. 删除重复的数据行

要删除重复的数据行，与查找重复数据行的方式类似，使用 ``delete from`` 语法即可。
> 删除重复的 ``id`` 字段较大的数据行，保留 ``id`` 较小的数据行

1. 使用双表进行删除:
```sql
DELETE s1
FROM student s1, student s2
WHERE s1.name = s2.name AND s1.id > s2.id;
```
2. 使用自链接 self join:
```sql
DELETE s1
FROM student s1
INNER JOIN student s2
ON s1.name = s2.name
WHERE s1.id > s2.id;
```

## 总结

以上就是关于查找和删除数据库中重复数据行的相关方法，需要说明的是，除了上面提到的 sql 以外，相信还有更多的实现方式。从简单易用的角度来考虑的话，双表以及自链接的实现方式都是不错的选择。

最后，对于已相关 sql 实现方法，我们并未对 sql 执行的性能进行测试。

> References
> - [https://www.dbrnd.com/2015/09/find-duplicate-records-in-mysql/](https://www.dbrnd.com/2015/09/find-duplicate-records-in-mysql/)
> - [https://howtodoinjava.com/sql/how-to-remove-duplicate-rows-in-mysql-without-using-temporary-table/](https://howtodoinjava.com/sql/how-to-remove-duplicate-rows-in-mysql-without-using-temporary-table/)
