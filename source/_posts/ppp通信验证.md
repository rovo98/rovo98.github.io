---
title: PPP 点对点通信验证
author: rovo98
date: 2018.6.10 00:10
description: 使用Cisco PacketTracer验证ppp点对点通信
categories:
	- 计算机网络
tags:
	- ppp通信
---

使用Cisco Packet Tracer7 (思科网络模拟器)验证ppp点对点通信。

![Cisco packet Tracer7](packetTracer7.png)

<!-- more -->

### 实验内容

使用packet Tracer 模拟两台路由器，进行点对点通信测试。

#### 实验设计

实验设备结构图：

![结构](structure.png)

- 均使用思科模拟器中的Generic 泛型路由
### 实验步骤

#### 配置路由器

由于只需要验证点对点通信，对路由器的配置，相对比较简单，
路由器之间使用的是serial DCE 串口线相连。

配置Router1的serial 2/0串口为ip: 11.0.0.1 mask: 255.0.0.0,并配置时钟频率为64000

```txt
Router> enable
Router# configure terminal
Router(config) # hostname RA
RA (config) # interface serial 2/0
RA (config) # no shutdown
RA (config-if) # ip address 11.0.0.1 255.0.0.0
RA (config-if) # clock rate 64000
```

配置Router2的serial 3/0 串口为ip: 11.0.0.2 mask： 255.0.0.0

```txt
Router> enable
Router# configure terminal
Router(config) # hostname RB
RB (config) # interface serial 3/0
RB (config) # no shutdown
RB (config-if) # ip address 11.0.0.2 255.0.0.0
```

- 查看两个路由的串口状态：

RA:

![RA serial 2/0](hdsl_rt1.png)

RB:

![RB serial 3/0](hdsl_rt2.png)

可以看到，路由器这里点对点通信默认使用的HDLC(High Level Data Link Control, 面向比特的同步协议)协议。

#### HDLC情况下验证ping：

11.0.0.1 ping 11.0.0.2:

![RA ping Test](hdlc_ping_rt1.png)

11.0.0.2 ping 11.0.0.1:

![RB ping Test](hdlc_ping_rt2.png)

ping 测试成功。

#### 配置RA,RB使用ppp协议，再做ping测试：

- 先配置RA 使用 ppp协议：

```txt
RA # configure terminal
RA (config) # interface serial 2/0
RA (config-if) # encapsulation ppp
```

![RA serial 2/0](RA_ppp_setting.png)

可以看到RA当前使用的是ppp写协议，LCP处于Closed,此时，路由器应当无法进行点对点通信。

![ping Test](RA_ppp_fTest.png)

- 配置RB使用ppp协议：

```txt
RB # configure terminal
RB (config) # interface serial 3/0
RB (config-if) # encapsulation ppp
```

![RB serial 3/0](RB_ppp_setting.png)

这时，可以看到RB也是使用了ppp协议，且LCP也处于Open状态，路由器之间可以进行通信。

![ping Test](RB_ppp_sTest.png)

#### 给ppp协议添加authentication鉴别

- 先配置RA，使其开启ppp chap (Challenge Handshake Authentication Protocol), 给RB 添加身份验证

```txt
RA # config terminal
RA (config) # username RB password password
RA (config) # interface serial 2/0
RA (config-if) # ppp authentication chap
```

![RA serial 2/0](RA_ppp_au.png)

此时，虽然RA和RB都是使用ppp协议，但是RA给RB添加了身份认证，而RB则没有，此时LCP处于Closed状态，它们之间无法进行通信。

- 配置RB, 添加对RA的身份验证：

```txt
RB # config terminal
RB (config) # username RA password password
RB (config) # interface serial 2/0
RB (config-if) # ppp authentication chap
```

![RB serial 3/0](RB_ppp_au.png)

可以看到此时，LCP已经打开，路由器之间可以进行点对点通信。

![ping](RB_ping_final.png)

### 实验结果

通过该实验，简单地验证了ppp协议在点对点信道中的使用。
