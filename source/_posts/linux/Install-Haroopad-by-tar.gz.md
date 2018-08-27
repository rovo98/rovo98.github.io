---
author: rovo98
title: Arch linux系列 安装 haroopad markdown 编辑器
date: '2018.8.26 13:12'
categories:
  - Linux
  - softwares
tags:
  - linux
  - markdown
abbrlink: 63e58ebb
---

> Haroopad 是一个优秀的 Markdown 编辑器，是一个用于创建适宜 Web 的文档的处理器。使用 Haroopad 可以创作各种格式的文档，比如博客文章、幻灯片、演示文稿、报告和电子邮件等。Haroopad 在 Windows、Mac OS X 和 Linux 上均可用。它有 Debian/Ubuntu 的软件包，也有 Windows 和 Mac 的二进制文件。该应用程序使用 node-webkit、CodeMirror，marked，以及 Twitter 的 Bootstrap 。

> Haroo 在韩语中的意思是“一天”。


本文主要介绍通过压缩包``**.tar.gz``的方式安装 ``Haroopad``.

<!-- more -->

### 一、下载 Haroopad 

我们可以从官网直接下载我们需要的压缩包，官网地址: [Haroopad官网地址](http://pad.haroopress.com/user.html)

![](haroopad_website.png)

这里我选择的是linux binary 64 位的压缩包。

### 二、解压并安装Haroopad

根据下载的压缩包格式进行解压： 例如 **.tar.gz格式

解压并放到``/opt/``目录下:

```bash
tar zxvf haroopad-v0.13.1.x64.tar.gz -C haroopad
sudo cp -r haroopad /opt/

tar zxvf data.tar.gz
tar zxvf control.tar.gz
```
把解压出来的 usr中的文件放到``/usr/``下：

```bash
sudo cp -r ./usr /
# 执行 postinst
chmod 755 postinst
sudo ./postinst
```

![](haroopad_install.png)

### 三、修复桌面图标

为haroopad 换一个合适的桌面图标:

```bash
sudo vim /usr/share/applications/Haroopad.desktop
```

```txt
[Desktop Entry]
Name=haroopad
Version=0.13.1
Exec=haroopad
Comment=The Next Document processor based on Markdown
#Icon=haroopad
Icon=/usr/share/icons/hicolor/128x128/apps/haroopad.png
Type=Application
Terminal=false
StartupNotify=true
Encoding=UTF-8
Categories=Development;GTK;GNOME;
```

### 四、配置Haroopad

相关的Haroopad设置，可以打开 ``偏好设置``进行配置:

![](haroopad_settings.png)

到此，Haroopad 安装就完成了。

参考链接: [https://www.jianshu.com/p/dba9acabf0a7](https://www.jianshu.com/p/dba9acabf0a7)
