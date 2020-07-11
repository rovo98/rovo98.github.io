---
title: SpringBoot + Docker + Nginx 负载均衡实现
author: rovo98
date: '2020-07-06 13:47'
categories:
  - Practices
tags:
  - SpringBoot
  - Docker
  - Nginx
abbrlink: 39885a36
---

Nginx 是高性能的 http 服务器，反向代理服务器。结合 Tomcat 一起使用可以很容易实现负载均衡。

本文主要介绍使用 SpringBoot + Docker + Nginx 实现的负载均衡的一次简单实践。

![](/images/Dev/springboot-docker-load-balancing/sb-nginx-load-balancing.png)

<!-- more -->

## 1. 构建 SpringBoot 项目 Docker 镜像

我个人使用 docker 已经有一段时间了，虽然仍有许多未掌握的内容，但它确实在开发过程中给我带来了极大的便利。docker 能够为开发者提供一致的开发环境和部署环境，很好地提升了编程开发体验。接下来，我将给出两个几乎相同的 SpringBoot 项目，然后用 docker 来构建镜像。

### 1.1 SpringBoot 项目

由于我们的主要目的是实现负载均衡，因此只需要简单的 SpringBoot 项目实现即可。

1. 创建 SpringBoot 项目，添加 ``spring-boot-starter-web`` 和  ``spring-boot-starter-test`` 依赖就可以了；
2. 然后，编译一个简单的 ``RestController``，写一个处理 ``GET`` 请求 Mapping，返回一个字符串即可。
```java
@SpringBootApplication
public class Demo1Application {

    public static void main(String[] args) {
        SpringApplication.run(Demo1Application.class, args);
    }

}
@RestController
@RequestMapping("/app")
class TestController {
    @GetMapping("/sayHello/{name}")
    public String hello(@PathVariable("name") String name) {
        return "Hello " + name + " from demo1. " + new Date().toString();
    }
}
```
3. 第二个 SpringBoot 也是类似的，为了区分，我们将 ``/app/sayHello{name}`` 的返回字符串改为 
```java
...
return "Hello " + name + " from demo2 at " + new Date().toString();
...
```

#### 编写 Dockerfile

我们知道，运行 SpringBoot 项目，是通过 ``java -jar xxx.jar`` 的方式来运行的。因此我们可以编写如下 ``Dockerfile``：

sb-demo1 ``Dockerfile``:
```dockerfile
FROM openjdk:8-jdk-alpine

MAINTAINER rovo98 <rovo984sff@gmail.com>

VOLUME /tmp

ADD target/demo1-0.0.1-SNAPSHOT.jar app1.jar

ENTRYPOINT [ "sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -jar /app1.jar" ]
```

sb-demo2 ``Dockerfile``:
```dockerfile
FROM openjdk:8-jdk-alpine

MAINTAINER rovo98 <rovo984sff@gmail.com>

VOLUME /tmp

ADD target/demo2-0.0.1-SNAPSHOT.jar app2.jar

ENTRYPOINT [ "sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -jar /app2.jar" ]
```

{% note info %}

关于 ``-Djava.security.egd=file:/dev/./urandom`` 系统属性的作用：主要是为了提升 docker 容器中 Tomcat 启动的性能。

Tomcat 使用 ``java.security.SecureRandom`` 来提供密码学上安全性强的伪随机数。类 Unix 系统具有一个特殊的文件 ``/dev/random`` 来通过访问从设备驱动程序和其他源收集的环境噪声来提供伪随机数。这这种情况下，如果请求大于熵，则会发生阻塞。而 ``/dev/urandom`` 则永远不会阻塞，即使伪随机数产生器的种子在启动时没有完全用熵初始化。另外，还有一个 ``/dev/arandom``特殊文件，它则是在启动时阻塞，直到种子已经完全初始化为止，之后就再也不会阻塞了。

默认情况下，JVM 使用 ``/dev/random`` 作为 ``SecureRandom`` 的伪随机数生成器，因此，Java 代码可能会以我们不期望的方式进行阻塞。``-Djava.security.egd=file:/dev/./urandom`` 就是为了告诉JVM 使用 ``/dev/urandom`` 而不是 ``/dev/random`` 的。

额外的  ``/./`` 似乎是让 JVM 使用 ``SHA1PRNG`` 算法作为 PRNG (Pseudo Random Number Generater，伪随机数生成器)的基础。它要比``/dev/urandom`` 的原始伪随机数生成算法要强。
{% endnote %}

### 1.2 构建镜像的方式

1. 直接通过 ``docker image build -t <tag> <context_location>`` 命令来进行构建:
```sh
docker image build -t springboot-docker-demo/sb-demo1:latest .
```

2. maven 项目可以使用 ``dockerfile-maven-plugin`` 插件来构建镜像:
```xml
<plugin>
    <groupId>com.spotify</groupId>
    <artifactId>dockerfile-maven-plugin</artifactId>
    <version>1.4.13</version>
    <configuration>
        <repository>${docker.image.prefix}/${project.artifactId}</repository>
<!--                    <tag>${version}</tag>-->
    </configuration>
</plugin>
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-dependency-plugin</artifactId>
    <executions>
        <execution>
            <id>unpack</id>
            <phase>package</phase>
            <goals>
                <goal>unpack</goal>
            </goals>
            <configuration>
                <artifactItems>
                    <artifactItem>
                        <groupId>${project.groupId}</groupId>
                        <artifactId>${project.artifactId}</artifactId>
                        <version>${project.version}</version>
                    </artifactItem>
                </artifactItems>
            </configuration>
        </execution>
    </executions>
</plugin>
```

之后使用如 ``mvn clean compiler:compile jar:jar spring-boot:repackage dockerfile:build`` 这样的命令即可构建出相应的镜像。

## 2. 配置 Nginx

同样地，还是使用 docker 来运行 nginx，但不管用什么方式，我们都只需要关注 nginx 的配置文件 ``nginx.conf`` 的编写，之后在运行 nginx 容器时，将相应的配置文件、日志目录等以数据卷的方式挂载到容器中即可。

### 2.1 proxy_pass 反向代理

nginx 实现反向代理的方式非常简单，只需要在配置文件中的 ``proxy_pass`` 后写要代理的服务器的地址即可。如：

```conf
server { # simple reverse-proxy
    listen       80;
    server_name  domain2.com www.domain2.com;
    access_log   logs/domain2.access.log  main;

    # serve static files
    location ~ ^/(images|javascript|js|css|flash|media|static)/  {
      root    /var/www/virtual/big.server.com/htdocs;
      expires 30d;
    }

    # pass requests for dynamic content to rails/turbogears/zope, et al
    location / {
      proxy_pass      http://127.0.0.1:8080;
    }
  }
```

### 2.2 upstream 负载均衡

类似地，实现负载均衡，也只需要对 nginx 的配置文件进行简单的修改即可。如：

```conf
upstream big_server_com {
    server 127.0.0.3:8000 weight=5;
    server 127.0.0.3:8001 weight=5;
    server 192.168.0.1:8000;
    server 192.168.0.1:8001;
  }

  server { # simple load balancing
    listen          80;
    server_name     big.server.com;
    access_log      logs/big.server.access.log main;

    location / {
      proxy_pass      http://big_server_com;
    }
  }
```

nginx 的配置文件参考 [https://www.nginx.com/resources/wiki/start/topics/examples/full/](https://www.nginx.com/resources/wiki/start/topics/examples/full/)

## 3. 运行方式

上面我们已经准备好了所有需要的镜像，要运行这些镜像，启动容器，我们有以下几种方式。

### 3.1 直接启动各容器

```sh
docker run --rm -p 8080:8080 --name sb-demo1 -d springboot-docker-demo/demo1
```

```sh
docker run --rm -p 8089:8080 --name sb-demo2 -d springboot-docker-demo/demo2
```

```sh
docker run --rm -p 80:80 --name sb-nginx -d nginx:latest \
-v ./nginx-data/conf/nginx.conf:/etc/nginx/nginx.conf \
-v ./nginx-data/html:/etc/nginx/nginx/html
-v ./nginx-data/log:/var/log/nginx
```

此时，``nginx.conf``中关于负载均衡配置的部分应该这样编写：

```conf
...
upstream app {
    #ip_hash;
    server localhost:8080 weight=1;
    server localhost:8088 weight=1;
}
server {
    listen       80;
    server_name  localhost;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
        proxy_pass http://app;
    }
    ...
}
```

这种运行方式下，两个 SpringBoot 项目是暴露的，即我们能通过 ``localhost:8080`` 或 ``localhost:8088`` 来对 SpringBoot 应用进行访问。如果要只让 nginx 能被外界访问，而两个SpringBoot 项目不要被外界访问，我们可以使用 ``docker network`` 来创建一个网络，用于连接这些容器。

### 3.2 docker-compose 方式

docker-compose 是 docker 提供的定义由多个容器组成的应用的方式，以更好地组织和管理多个容器组成的应用。为了运行我们的应用，我们可以编写以下 ``docker-compose.yml`` 文件：

```yml
version: "3"
services:
  app1:
    image: springboot-docker-demo/demo1:latest
    #    build: ./demo1 # if using build approach, un-comment demo1 dir in .dockerignore file.
    container_name: sb-demo1
    networks:
      webnet:
        ipv4_address: 10.0.1.4
  app2:
    image: springboot-docker-demo/demo2:latest
    #    build: ./demo2 # if using build approach, un-comment demo2 dir in .dockerignore file.
    container_name: sb-demo2
    networks:
      webnet:
        ipv4_address: 10.0.1.3
  nginx:
    image: nginx:latest
    container_name: sb-nginx
    ports:
      - 80:80
    volumes:
      - ./nginx-data/conf/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx-data/html:/etc/nginx/nginx/html
      - ./nginx-data/log:/var/log/nginx
    networks:
      webnet:
        ipv4_address: 10.0.1.2

networks:
  webnet:
    ipam:
      driver: default
      config:
        - subnet: 10.0.1.0/24
```

执行 ``docker-compose up -d`` 来运行，通过这种方式，能让所有的容器运行在同一个网络中，并只让 nginx 暴露出 80 端口，以供外部访问。

不过，需要注意的是，为了方便，我在创建网络时配置了子网，并为各个容器指定了固定 ip 地址。这时，``nginx.conf`` 中 upstream 部分应该改为：

```conf
upstream app {
    #ip_hash;
    server 10.0.1.4:8080 weight=1;
    server 10.0.1.3:8088 weight=1;
}
```

### 3.3 使用 docker stack deploy 部署到 swarm 集群上

通过 ``docker stack deploy docker-compose.yml`` 的方式能够将应用部署到 swarm 集群上。

```sh
# create three virtualbox machines
docker-machine create --driver virtualbox myvm1
docker-machine create --driver virtualbox myvm2
docker-machine create --driver virtualbox myvm3
```

``docker-machine ls``:

![](sb-docker-stack-machines.png)

```sh
# create a swarm
docker swarm init --advertise-addr 192.168.1.100
# add host mahcine as  manager
docker swarm join-token manager
# add virtual machines as workers
docker-machine ssh myvm1 "docker swarm join --token SWMTKN-1-10nk6yfukgx4ie1d739i8w43itzdzya2yvo51je0hgisvxqzkf-3awbtfab6h00873ic7njvt8yr 192.168.1.100:2377"
docker-machine ssh myvm2 "docker swarm join --token SWMTKN-1-10nk6yfukgx4ie1d739i8w43itzdzya2yvo51je0hgisvxqzkf-3awbtfab6h00873ic7njvt8yr 192.168.1.100:2377"
docker-machine ssh myvm3 "docker swarm join --token SWMTKN-1-10nk6yfukgx4ie1d739i8w43itzdzya2yvo51je0hgisvxqzkf-3awbtfab6h00873ic7njvt8yr 192.168.1.100:2377"

# deploy app to the swarm
docker stack deploy -c docker-compose.yml sb-load-balancing-demo
```

之后可使用 ``docker service ls`` 或 ``docker stack services <service_name>`` 来查看应用的部署情况。


### 运行结果测试

为了更快地测试结果，我使用的 ``docker-compose`` 的运行方式。

![](sb-load-balancing-result-testing.gif)

可以看到，在刷新后，nginx 能够将请求分发给另一个 SpringBoot 应用，来实现负载均衡。当然，我们还可以结合 ``ip_hash`` 使用，此时，客户端第一次访问应用时，会分配到一个特定 SpringBoot 应用，之后再次访问时会继续访问同一个 SpringBoot 应用。

## 4. 小结

使用 nginx 结合 Tomcat 实现负载均衡看起来是非常简单的，但有些事情必须要实际动手实践才能真正地掌握。在实践的过程中往往也能发现自己之前未能察觉的或他人未提到的问题。

使用 docker 确实能够让的人的开发体验有所提升，熟练使用 docker 后，在日常开发以及学习中，我们即便是在个人笔记本电脑上也能快速地搭建出需要的环境。

本文涉及相关源代码: [springboot-docker-nginx-load-balacning](https://github.com/rovo98/java-dev-practices/tree/master/dev-practices/springboot-docker-demo)

> references:
> 1. [https://docs.nginx.com/nginx/admin-guide/web-server/web-server/](https://docs.nginx.com/nginx/admin-guide/web-server/web-server/)
> 2. [https://stackoverflow.com/questions/58991966/what-java-security-egd-option-is-for](https://stackoverflow.com/questions/58991966/what-java-security-egd-option-is-for)
> 3. [https://fbrx.github.io/post/fixing-tomcat-startup-performance-on-cloud-servers/](https://fbrx.github.io/post/fixing-tomcat-startup-performance-on-cloud-servers/)
> 4. [https://docs.docker.com/develop/dev-best-practices/](https://docs.docker.com/develop/dev-best-practices/)

