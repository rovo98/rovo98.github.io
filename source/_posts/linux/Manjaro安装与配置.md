---
author: rovo98
title: Manjaro linux 安装与配置
date: '2018.8.22 12:00'
categories:
  - Linux
tags:
  - linux
  - manjaro
keywords: manjaro, linux, 安装， 配置
abbrlink: a1898ce2
---

![](/images/linux/manjaro-installed.jpg)

> Manjaro是一款基于Arch Linux、对用户友好、全球排名第一的Linux发行版。（排名数据源于[DistroWatch](http://distrowatch.com/)，统计日期2018.08.22，时间段3个月。）
> 在Linux圈，Arch的确是一个异常强大的发行版。它有3个无与伦比的优势：

> 1. 滚动更新可以使软件保持最新；
> 2. AUR软件仓库有着世界上最齐全的Linux软件（[参考《一张列表展示ArchLinux系软件有多丰富——看哭百万Debian、RedHat系同学》](https://www.lulinux.com/archives/2787)）；
> 3. 丰富的wiki和活跃的社区让所有问题都可以快速得到满意的答案。

相比于``Arch linux``, 不得感叹, [人生苦短,我用 **Manjaro**啊!](http://www.manjaro.cn/451)

<!-- more -->

### 一、Manjaro的安装


#### 镜像下载

官方网站：[https://manjaro.org/get-manjaro/](https://manjaro.org/get-manjaro/)
选择自己喜欢的桌面环境就好，目前官方支持包括xfce、kde、gnome三种桌面环境。而在官方的社区版本中提供更多桌面环境的支持，比如国产的deepin桌面环境

但是官方服务器在海外，所以我们也可以选择国内开源镜像进行下载 
清华大学开源镜像：[https://mirrors.tuna.tsinghua.edu.cn/manjaro-cd/](https://mirrors.tuna.tsinghua.edu.cn/manjaro-cd/)

> 由于我基本都把上述的版本和一些社区版本安装过(出于各种原因>_<)，我建议是从官方网站下载最新的官方版本进行安装(好像清华大学源的镜像并不是最新的)，至于桌面环境的选择，看个人，我选择的是``KDE``(其实，桌面环境在安装之后也是可以换的)。

#### 制作U盘启动盘

manjaro官方提供的[Manjaro User Guide](https://manjaro.github.io/homepage/public/support/userguide/)手册里面介绍了使用 来制作镜像的方法许多方法，例如：

- Linux系统下，使用 ``dd``命令来制作：<br>``sudo dd if=manjaro-xfce-17.1-stable-x86_64.iso of=/dev/sdc
bs=4M
 ``, ``of``指定烧录U盘的挂载位置;
- 在windows系统下使用烧录软件``Rufus``来进行烧录:<br> ![](Rufus.png)


**[注意]**： 烧录完成后，在进入``Live``系统前，需要对``BIOS``进行一些设置，关闭安全启动。之后即可顺利进入这个界面(至于BIOS vs UEFI的启动进入的``Live``系统的方式，详见手册。由于我安装的是多个系统，所以是``GPT+UEFI``引导):

![](manjaro-boot-menu.png)



#### 安装系统

进入启动菜单界面后，可以对一些基本的选项进行配置，如，时区，语言，键盘布局等。

具体的安装步骤请直接参考官网的``Manjaro User Guide.pdf``,这里主要说说安装系统时可能遇到的问题(我基本踩过的坑...)。

1. **对于双显卡的电脑,特别是有Nvidia卡的**: 在进入``live``系统之前,可以将``Driver``选项设置为``no-free``(让系统自动安装合适的闭源驱动),并在``boot``项那里按``E``编辑, 在``boot``那一行将``nouveau.modeset=1``设置为``nouveau.modeset=0``来禁用开源``nouveau``驱动,然后进入``Live``安装系统。<br>**但是,安装完系统后重启还有可能进不去桌面**,可以尝试在``Grub``菜单启动界面按[E]编辑,找到``quiet``并在后面加入(注意空格):
> ``acpi_osi=! acpi_osi='Windows 2009'``
> 或者 
> ``acpi_osi=! acpi_osi=Linux acpi_osi='Windows 2015' pcie_port_pm=off``
> **(很多硬件厂商的BIOS驱动都对Linux不友好(我的电脑就是这样的...)，无法顺利加载ACPI模块，而导致无法驱动独立显卡,acpi_osi=’Windows 2009’的意思是告诉ACPI模块，我是‘Windows 7’，别闹情绪了，赶紧工作吧。)**
> 接着按 F10 进入系统。
> <br>顺利进入系统后,将这些内核启动参数配置永久生效(修改grub的配置文件):
> ``sudo vim /etc/default/grub``
> 在``GRUB_CMDLINE_LINUX``中添加参数:
![](manjaro-grub.png)
> 之后更新 ``grub``文件:
>``sudo update-grub``
>或
>``sudo grub-mkconfig -o /boot/grub/grub.cfg``
![](update-grub.png)
>参考链接: 
> 1. [https://forum.manjaro.org/t/a-start-job-is-running-for-livemedia-mhwd-script/3395/15](https://forum.manjaro.org/t/a-start-job-is-running-for-livemedia-mhwd-script/3395/15)
> 2. [https://wiki.archlinux.org/index.php/Kernel_parameters](https://wiki.archlinux.org/index.php/Kernel_parameters)
> 3. [https://www.kernel.org/doc/Documentation/admin-guide/kernel-parameters.txt](https://www.kernel.org/doc/Documentation/admin-guide/kernel-parameters.txt)
2. 启动时出现的``ACPI ERROR``问题，很多都说是内核版本的原因，有尝试过添加内核启动参数``acpi=off``，启动正常进入系统，但键盘无法使用，所以这个提示``ACPI``错误的问题，由于不影响使用，可以不管(强迫症的可以再看看)
> ![](boot-acpi-error.png)
> 参考链接: [https://forum.manjaro.org/t/acpi-error-during-boot/35125](https://forum.manjaro.org/t/acpi-error-during-boot/35125)
3. 屏幕亮度无法调节或异常的问题： ``Arch Wiki``已经给出很详细的解决方法:
链接: [https://wiki.archlinux.org/index.php/backlight](https://wiki.archlinux.org/index.php/backlight)
例如：开机亮度设置: ``vim /etc/rc.local``:
```zsh
#!/bin/sh -e
#
# rc.local
#
# This script is executed at the end of the each multiuser runlevel.
# Make sure that the script will "exit 0" on successs or any other value on error
# 
# In order to enable or disable this script just change the execution bits.
# 
# By default this script does nothing.

echo 127 >> /sys/class/backlight/intel_backlight/brightness
exit 0
```

{% note primary %}
对于安装``Manjaro``系统出现的问题，大多数都可以在官方的论坛[Manjaro Forum](https://forum.manjaro.org/)以及[Manjaro Wiki](https://wiki.manjaro.org/index.php?title=Main_Page)，还有``Arch Linux``的[Arch Wiki](https://wiki.manjaro.org)以及上找到解决方法。
{% endnote %}

### 二、Manjaro 配置

简单说一下一些安装系统之后的一些常规配置。

#### 配置更新源并更新系统

1. 配置中国的mirrors：
```zsh
sudo pacman-mirrors -i -c China -m rank
```

2. 在 ``/etc/pacman.conf``中添加``archlinuxcn``源:
```
[archlinuxcn]
SigLevel= TrustedOnly
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinuxcn/$arch
```

3. 安装``archlinuxcn-keyring``:
```
sudo pacman -S archlinuxcn-keyring
```

4. 同步并更新系统；
```zsh
sudo pacman -Syyu
```

#### 安装配置中文输入法

1. 安装中文输入法和``fcitx``管理工具:
```zsh
sudo pacman -S fcitx-sougoupinyin # 输入法看个人
sudo pacman -S fcitx-im
sudo pacman -S fcitx-configtool
```

2. 解决中文输入法无法切换问题: 添加文件`` ~/.xprofile``:
```
export GTK_MODULE=fcitx
export QT_IM_MODULE=fcitx
export XMODIFIERS="@im=fcitx"
```

重启即可。

#### 配置Intel 和 Nvidia 双显卡切换

Manjaro 提供了强大的硬件检测模块``mhwd``，可以很方便的安装各种驱动，要实现Intel 和 Nvidia 双显卡切换，我们需要安装video-hybrid-intel-nvidia-bumblebee ``nvidia``闭源驱动和intel驱动的混合版``bumblebee``。对于之前安装系统是在``Live``启动菜单选择``Driver=no-free``的可以看看这个驱动是否已经安装：
系统设置中的硬件设置:
![](manjaro-graphic-cards.png)<br>或<br>
![](manjaro-mhwd-installed-pci.png)

对于未安装的，这里提供一个最为简单的方式，**直接在硬件设置中，右键安装即可，这样可以省去自己去添加用户组和开机启动，以及切换状态初始化**

{% note warning%}
**[注意：]** 下面的这些依赖必须安装，否则会出现独立显卡无法正常工作的问题(fps跟集成显卡差不多)：
{% endnote %}

```zsh
sudo pacman -S virtualgl lib32-virtualgl
```

对于独立显卡的使用，可以使用``bbswitch``来进行切换开关，然后使用``optirun``来运行程序:
> 1. 首先查看显卡的状态: ``lspci | grep -i nvidia``(rev ff 表示关闭状态)
> ![](nvidia-off.png)
> 2. 打开独立显卡，并进行测试，对比集成显卡的fps：
>	- 集成显卡 FPS:
> 	![](intel-fps.png)
>	- 打开独立显卡``sudo tee /proc/acpi/bbswitch <<< "ON"``,测试FPS:
>	![](nvidia-fps.png)
> 3. 独立显卡设置 nvidia-settings 需要用``optirun nvidia-setting -c :8``才能打开:
> ![](nvidia-settings.png)

#### 使用 zsh 和 oh-my-zsh 配置终端

``zsh`` shell(theme: rjkirch_mod)：

![](my-zsh.png)

基本配置过程：
- 查看系统安装了多少shell ``cat /etc/shells``
- 查看当前shell : ``echo $SHELL``
- 使用 ``chsh``切换默认``shell``.

配置 zsh，直接使用**oh-my-zsh**来进行配置: [Oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh).
zsh 主题可以自行按个人喜好配置，当然也可以随机(每次打开终端都随机选择一个主题).

插件推荐: (插件配置太多的话，会使shell启动速度变慢，适当就好)

![](zsh-plugins.png)

- [Autojump](https://github.com/wting/autojump)
- [zsh-syntax-highlighting](https://github.com/zsh-users/zsh-syntax-highlighting)
- [zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions)

### 总结

``Manjaro``的安装和基本配置就到此结束。最后，简单说一下我安装此系统的缘由。在安装``manjaro``之前，我使用的是``win10 LTSB 2016``，之前接触过的的Linux发行版是``CentOS``, ``Unbuntu``以及 ``kali``， 前两者我不怎么想要，本来想直接换成``kali``，但是考虑到``kali``一般是作为一个工具来使用，并不适合我平时开发和日常使用，就再次寻找适合的Linux发行版，最后看上了``Arch Linux``，但是又因为``Arch``上手难度较高，退而求其次，选择了``Manjaro``。当然啦，``Win10``肯定是要保留的，``Kali``也是要的。

于是乎，在原先的``GPT+UEFI``引导方式的基础之上，我重新分配了我的磁盘，将原有的``Win10``系统盘缩小，把它当备用系统，``Manjaro``作为主要系统使用，而``Kali``只作为工具使用，其他的磁盘分区作为数据存放的分区，各个系统共用。

![](win-manjaro-kali.jpg)

![](disk-structure.png)

{% note danger%}
说明: 对于上面给出的分区方案仅供参考，**例如: 对于``Linux``的``swap``分区(用于虚拟内存的置换)来说，由于系统启动时会对``swap``进行初始化，因此多个系统可以使用一个``swap``分区即可。只要配置``UUID``没错就行了，毕竟多系统主机每次也只能启动一个系统。。。**

上面的分区旨在演示，基于``GPT`` (*GUID Partion Table* 分区表(可以分128主要分区，而``MBR``(*Master Boot Record*)分区表只能是4个主要分区, 请自行了解两者的区别) 使用``UEFI``(*Unified Extensible Firmware Interface*)如何为安装多系统做准备。
{%endnote%}


然后使用 ``REfind``来管理和引导系统:

![](refind-menu.jpg)

{% note primary %}
对于Refind有兴趣的可以直接``google``或``baidu``了解一下，选择一个现有的主题然后自己稍微进行配置一下，就可以了。
参考:
- [http://www.rodsbooks.com/refind/](http://www.rodsbooks.com/refind/)
- [Arch Wiki 上关于refind的内容](https://wiki.archlinux.org/index.php/REFInd_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))
{% endnote %}


#### 各个系统桌面

- Win10 LTSB

![](win10.jpg)

- Manjaro(DE: KDE)

![](manjaro-desktop.jpg)

- Kali

![](kali.jpg)
