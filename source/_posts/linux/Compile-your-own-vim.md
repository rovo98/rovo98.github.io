---
title: 编译自己的Vim8.1
author: rovo98
date: '2018.8.27 20:12:13'
categories:
  - Linux
  - softwares
tags:
  - linux
  - vim
abbrlink: 97c4fd12
---

最近换了``Manjaro`` linux系统，发现通过系统``pacman -S vim``安装的无图形版本``vim``不支持``clipboard``功能。

![](/images/linux/vim-version-original.png)


本想看能不能通过某种方式，来扩展现有安装好的``vim``,但是通过``google``了解到：

> VIM is intended to be a portable editor that "just works" on all systems. By having the default version use the clipboard functionality, it will need to link against X11 libraries, and a separate version of VIM would need to be compiled for desktop versus server (no pre-installed X11/xorg) builds. This is why the vim and vim-gtk packages are provided.

> VIM旨在成为一个可在所有系统上“正常工作”的便携式编辑器。通过使默认版本使用剪贴板功能，它将需要链接到X11库，并且需要针对桌面与服务器（没有预安装的X11 / xorg）构建编译单独版本的VIM。这就是提供vim和vim-gtk软件包的原因。

<!-- more -->
虽然知道``gvim``带有支持``clipboard``的``vim``，但是我又不想装``gvim``。自己的系统又有``X11``库和 ``Xorg``，所以决定自己编译一个``vim``.

**[注意]**： 对于没有``X11``和``Xorg``的需要在编译前配置好，否则编译会出错.

### 一、从github上获取vim的源码

直接使用``git`` clone ``vim``仓库：

```
git clone https://github.com/vim/vim.git vim_source
```

### 二、配置、编译并安装

我的编译配置：

```
make clean
./configure \
    --enable-cscope \ 
    --enable-largefile \ 
    --enable-multibyte \ 
    --enable-mzschemeinterp \ 
    --enable-xim \ 
    --enable-tclinterp=dynamic \ 
    --enable-perlinterp=dynamic \ 
    --enable-python3interp=dynamic\ 
    --enable-pythoninterp=dynamic \ 
    --enable-rubyinterp=dynamic \ 
    --enable-luainterp=dynamic \
    --enable-gui=no \
    --enable-fontset \
    --enable-terminal \
    --with-features=huge \
    --with-x \
    --with-compiledby="rovo98" \
    --with-python-config-dir=/usr/lib/python2.7/config-$(uname-m)-linux-gnu
    --with-python3-config-dir=/usr/lib/python3.7/config-$(uname -m)-linux-gnu
```

编译并安装:

```
make && sudo make install
```

**编译配置的说明**:

上面的参数中启用了对tcl、perl、python、ruby、lua的支持。同时为了使用系统的剪切板还启用了对X的支持， 安装位置默认是``/usr/local``下， 由``--perfix=PREFIX``参数指定。

更多详细可以使用``./configure --help``查看:

**删除编译产生的中间文件** :

```
make clean && make distclean
```

**成果:**

![](vim_installed.png)

**为``vim``创建一个桌面图标**:

``vim.desktop``:

```
[Desktop Entry]
Name=Vim[compiled by rovo98]
Version=8.1
Exec=vim
Comment=Vim is a highly configurable text editor for efficiently creating and changing any kind of text.
Icon=/usr/share/vim/vim81/src/vim.ico
Type=Application
Terminal=true
Encoding=UTF-8
Categories=Utility;
```

把``vim.desktop``放到``/usr/share/applications/``下就行了。

现在可以享受你自己编译的vim了。


参考链接: 

- [https://vi.stackexchange.com/questions/13564/why-is-vim-for-debian-compiled-without-clipboard](https://vi.stackexchange.com/questions/13564/why-is-vim-for-debian-compiled-without-clipboard)
- [https://stackoverflow.com/questions/11416069/compile-vim-with-clipboard-and-xterm](https://stackoverflow.com/questions/11416069/compile-vim-with-clipboard-and-xterm)


