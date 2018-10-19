---
title: 记录一次linux系统迁移过程
author: rovo98
date: '2018.10.7 14:00'
categories:
  - Linux
tags:
  - ssd
abbrlink: 3babee60
---

就在最近，终于为自己的电脑加装了固态。在装完固态之后，首先面临的问题就是如何将原先安装在机械硬盘上的``linux``系统迁移到固态上。还要考虑后续配置的问题。

本文主要讲述在迁移``Linux``系统到新的固态硬盘上所遇到的问题以及找到的相应的解决方法。

这里先给出系统迁移以及相关配置完成之后的机械硬盘和固态硬盘的简单测速对比:

![](/images/linux/hdparam.png)


<!-- more -->


### 引入

拆开电脑，直接加装固态,顺便清清灰尘，换一下硅脂(ps: 这不知道是我第几次拆电脑了...,表示以后再也不买GPU风扇了，这已经是第二次失败的购买经历了[``除非得到与原来匹配的风扇一致的风扇，不然我是不再换了``]):

清尘换硅脂:

![install-ssd-01](install_ssd01.jpg)
加装固态和散热板:

![install-ssd-01](install_ssd02.jpg)

关于固态如何购买挑选，需要很好的了解自己电脑能够支持的固态类型和市场所提供的固态类型，并综合各种因素才能做出最好的选择。这里我推荐几篇个人觉得不错的文章:

- [https://www.laptopmag.com/articles/laptop-ssd-guide](https://www.laptopmag.com/articles/laptop-ssd-guide)
- [https://www.tomshardware.com/reviews/ssd-buying-guide,5602.html](https://www.tomshardware.com/reviews/ssd-buying-guide,5602.html)
- [https://www.velocitymicro.com/blog/nvme-vs-m-2-vs-sata-whats-the-difference/](https://www.velocitymicro.com/blog/nvme-vs-m-2-vs-sata-whats-the-difference/)
- [https://blog.csdn.net/u010109732/article/details/79032845](https://blog.csdn.net/u010109732/article/details/79032845)
- [https://www.zhihu.com/question/48972075](https://www.zhihu.com/question/48972075)
- [https://www.pc841.com/article/20180914-92342_all.html](https://www.pc841.com/article/20180914-92342_all.html)
- [https://www.techadvisor.co.uk/test-centre/storage/best-ssd-2018-3235200/](https://www.techadvisor.co.uk/test-centre/storage/best-ssd-2018-3235200/)

以上推荐文章仅作为参考。

### 迁移系统

#### 准备

进入原先的``linux``系统，对已经安装上的固态硬盘进行分区。因为我之前在没有固态之前，在机械硬盘上就已经安装了三个系统(``win10``, ``manjaro``, ``kali``),因此在分区时，我是考虑只把两个``linux``迁移到固态上，毕竟``win10``现在已经基本不使用了，并将机械硬盘上的``EFI``分区也迁移到固态上。分区这里，可以按照自己的需求对固态硬盘进行分区。

分区工具的选择，随意，哪个顺手用哪个，例如:``gparted``, ``fdisk``, ``parted``,还有各种桌面自带的分区工具。我是使用的是``fdisk``:
例如:
```
sudo fdisk /dev/nvme0n1
```

![diskparted](fdisk_parted.png)

这里我已经分好区了的，具体的操作在``fdisk``中进行:

```
Generic
   d   delete a partition
   F   list free unpartitioned space
   l   list known partition types
   n   add a new partition
   p   print the partition table
   t   change a partition type
   v   verify the partition table
   i   print information about a partition

  Misc
   m   print this menu
   x   extra functionality (experts only)

  Script
   I   load disk layout from sfdisk script file
   O   dump disk layout to sfdisk script file

  Save & Exit
   w   write table to disk and exit
   q   quit without saving changes

  Create a new label
   g   create a new empty GPT partition table
   G   create a new empty SGI (IRIX) partition table
   o   create a new empty DOS partition table
   s   create a new empty Sun partition table
```

例如创建``EFI``分区:

```
Command (m for help): n
Partition number (2-128, default 2): 2 # 创建一个分区作为EFI分区
First sector (xxxxx-xxxxxxxxxxx, default xxxxx): 
Last sector, +sectors or +size{K,M,G,T,P} (34-2047, default xxxxxxx): +200M
Created a new partition 2 of type 'Linux filesystem' and of size 200 Mb.
Command (m for help): t  # 修改EFI分区的分区类型为EFI系统分区
...

# 最后保存设置
Command (m for help): w
```

其他的分区创建类似``EFI``的创建，``swap``分区需要指定为``Linux swap``分区，作为``linux``数据分区的分区在创建时默认就是``linux filesystem``类型了，不需要更改，之后对创建的分区进行格式化:将``EFI``格式化为``fat32``，将``linux``数据分区格式化``ext4``； 先通过``sudo fdisk -l``或``lsblk``查看已经创建分区对应的设备名,例如:
``sudo fdisk -l``:

```
Disk /dev/nvme0n1: 238.5 GiB, 256060514304 bytes, 500118192 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt
Disk identifier: 6D071E80-FF82-420B-A2D8-7A0BC4759F06

Device             Start       End   Sectors  Size Type
/dev/nvme0n1p1        34    262177    262144  128M Microsoft reserved
/dev/nvme0n1p2    264192    673791    409600  200M EFI System
/dev/nvme0n1p3    673792   9062399   8388608    4G Linux swap
/dev/nvme0n1p4   9062400 428492799 419430400  200G Linux filesystem
/dev/nvme0n1p5 428492800 500117503  71624704 34.2G Linux filesystem


Disk /dev/sda: 931.5 GiB, 1000204886016 bytes, 1953525168 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disklabel type: gpt
Disk identifier: D5CB68A7-96DA-4C61-84E2-61C98489BFF1

Device          Start        End   Sectors   Size Type
/dev/sda1          64  125829183 125829120    60G Microsoft basic data
/dev/sda2   125829184  880802416 754973233   360G Microsoft basic data
/dev/sda3   880803904 1596575151 715771248 341.3G Microsoft basic data
/dev/sda4  1596575744 1953521663 356945920 170.2G Microsoft basic data
```

``lsblk``:

```
NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
sda           8:0    0 931.5G  0 disk 
├─sda1        8:1    0    60G  0 part /run/media/rovo98/System
├─sda2        8:2    0   360G  0 part /run/media/rovo98/Mshinoda
├─sda3        8:3    0 341.3G  0 part /run/media/rovo98/Chester bennington
└─sda4        8:4    0 170.2G  0 part /run/media/rovo98/LSR
sr0          11:0    1  1024M  0 rom  
nvme0n1     259:0    0 238.5G  0 disk 
├─nvme0n1p1 259:1    0   128M  0 part 
├─nvme0n1p2 259:2    0   200M  0 part /boot/efi
├─nvme0n1p3 259:3    0     4G  0 part [SWAP]
├─nvme0n1p4 259:4    0   200G  0 part /
└─nvme0n1p5 259:5    0  34.2G  0 part /run/media/rovo98/a002d542-c8c4-4c98-85af-8a4446dbaa1b
```

格式化,例如:

```
# 对于linux数据分区
mkfs.ext4 /dev/nvme0n1p4
mkfs.ext4 /dev/nvme0n1p5
# EFI分区
mkfs.fat /dev/nvme0n1p2
```

做好这些准备之后，就可以进行系统的迁移了

#### 系统迁移操作

对于``Linux``系统，我们只需要知道**Linux一切皆文件**就行了。因此对于系统的迁移就变得简单了，可以使用``dd``,打包压缩然后解压缩，有关系统备份和恢复可以参看``Arch wiki``给出的:[https://wiki.archlinux.org/index.php/System_backup](https://wiki.archlinux.org/index.php/System_backup).这里我是使用的是``tar``结合``pigz``([什么是pigz?](http://www.ywnds.com/?p=10332))解压缩工具进行备份和恢复:

备份(打包压缩)
```
sudo tar --use-compress-program=pigz -cvpf /run/media/rovo98/Chester\ bennington/LP/GHOST/manjaro_backup_2018.10.7.tgz --exclude=/proc --exclude=/sys --exclude=/mnt --exclude=/run/media --exclude=/lost+found /
```
恢复到目标硬盘分区上(解包解压缩):
先目标分区挂载到``/mnt``下，如:``/mnt/manjaro``

```
mount /dev/nvme0n1p4 /mnt/manjaro
```


```
sudo tar --use-compress-program=pigz -xvpf /run/media/rovo98/Chester\ bennington/LP/GHOST/manjaro_backup_2018.10.7.tgz -C /mnt/manjaro
```

完成后需要手动创建，上面打包压缩是排除的文件夹:``/proc``, ``/sys``, ``/mnt``, ``/run``, ``/lost+found``.

详细备份和恢复过程可以参考查看:[Arch上的备份还原](https://www.jianshu.com/p/b03a51c682a5)

#### 修复Grub、fstab文件以及refind引导管理

首先将``/proc``,``/run``,``/dev``,``/sys``重新挂载，让目标分区上的系统也拥有这些内容:

```
mount /proc /mnt/manjaro/proc
mount /sys /mnt/manjaro/sys
mount /run /mnt/manjaro/run
mount /dev /mnt/manjaro/dev
```

![](mount-bind.png)

在``chroot``到目标系统之前，需要挂载``EFI``分区到``/mnt/manjaro/boot/efi``（refind管理文件默认位置）下：

```
mount /dev/nvme0n1p2 /mnt/manjaro/boot/efi
```

![](efi_root.png)

``chroot``到目标系统中，进行之后的操作

```
chroot /mnt/manjaro
```

#### 更新fstab文件

获取相应分区的``UUID``，以更新``fstab``文件和``/etc/default/grub``文件:
``blkid``:

![](blkid.png)

或

``ls -l /dev/disk/by-uuid``:

![](byuuid.png)

更新``fstab``文件:

![](updated-fstab.png)

主要修改挂载项以及对应的``UUID``，有关``fstab``文件的详细内容可以参考[https://wiki.archlinux.org/index.php/Fstab](https://wiki.archlinux.org/index.php/Fstab)

#### 修复Grub

1. 重新生成Grub
```
sudo grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader=Manjaro --recheck
```
2. 更新Grub配置文件
```
sudo update-grub
或
sudo grub-mkconfig -o /boot/grub/grub.cfg
```

**[注意]**：如果此过程中出现以下提示信息:

```
EFI variables are not supported on this system.
```

需要先安装``efibootmgr``, ``dosfstools``以及``grub``包，然后重新尝试重新生成``Grub``并更新其配置文件.

若仍出现该信息，则先退出``chroot``环境，并加载``efivarfs``模块:

```
sudo modprobe efivarfs
```

然后再进入``chroot``环境，执行:

```
mount -t efivarfs efivarfs /sys/firmware/efi/efivars
```

再重新生成``Grub``并更新``Grub``配置文件就好了。

参考链接:[https://wiki.manjaro.org/index.php/Restore_the_GRUB_Bootloader](https://wiki.manjaro.org/index.php/Restore_the_GRUB_Bootloader)

#### 重新配置refind

对之前的``refind``配置文件进行备份，保留主题文件``themes``及``refind.conf``就好了，其余的文件在执行``refind-install``时会自动生成.

```
sudo refind-install

# 已经生成过了的,打印信息如下
ShimSource is none
Installing rEFInd on Linux....
ESP was found at /boot/efi using vfat
Found rEFInd installation in /boot/efi/EFI/refind; upgrading it.
Installing driver for ext4 (ext4_x64.efi)
Copied rEFInd binary files

Notice: Backed up existing icons directory as icons-backup.
Existing refind.conf file found; copying sample file as refind.conf-sample
to avoid overwriting your customizations.

Keeping existing NVRAM entry
rEFInd is set as the default boot manager.
Existing //boot/refind_linux.conf found; not overwriting.

```

![](refind.png)

可以使用``efibootmgr``管理启动项，例如:
``efibootmgr``查看当前所有的启动项，``efibootmgr -Bb xxxx``来删除不要的启动项，详细使用可以``man efibootmgr``来查看。

![](efibootmgr.png)

其中的``windows``系统启动项通过``PE``用``UEFI``引导修复生成即可(需要注意的是老旧的PE识别不了``nvme``固态)。

以上就是迁移Linux系统的完整过程了

#### 遇到的问题

在做完上面的所有操作，并将之前机械硬盘上的``EFI``分区等等(除``Win10``系统之外)都删除之后，重新启动进入固态盘上的系统，在``Grub``引导过程出现``UUID=***************``找不到的信息，经过查看之后发现，在``Grub``引导时居然没有挂载我那块``nvme``固态。

通过了解发现``Grub2.2``版本并不支持``nvme``的固态，可以使用安装``bootloader``来进行引导。PS: 但我``Manjaro``安装的``Grub``是``2.3``版本的，理论上是支持的。

参考链接: [https://bbs.archlinux.org/viewtopic.php?id=209653](https://bbs.archlinux.org/viewtopic.php?id=209653)

通过一番查找之后，终于找到了解决方法:

1. 添加加载模块
```
#vim /etc/mkinitcpio.conf
MODULES="...nvme..."
```
2. 更新``mkinitcpio``
```
mkinitcpio -p linux414
#参数说明，详细可以通过man查看
-p, --preset preset
Build initramfs image(s) according to specified preset. This may be a file in /etc/mkinitcpio.d (without the .preset extension) or a full, absolute path to a file. This option may be specified multiple times to process multiple presets.
```
3. 更新Grub
```
sudo update-grub
或
sudo grub-mkocnfig -o /boot/grub/grub.cfg
```

再次重启之后，便可以成功进入系统了。

参考链接:[http://blog.51cto.com/shenfly231/1918426](http://blog.51cto.com/shenfly231/1918426), 若要安装``bootloader``也可以参考该链接。

### SSD优化

#### 开启Trim功能

关于什么是``TRIM``?：

>SSD TRIM is an Advanced Technology Attachment (ATA) command that enables an operating system to inform a NAND flash solid-state drive (SSD) which data blocks it can erase because they are no longer in use. The use of TRIM can improve the performance of writing data to SSDs and contribute to longer SSD life.

了解可以参考: [https://searchstorage.techtarget.com/definition/TRIM](https://searchstorage.techtarget.com/definition/TRIM)，以及``Arch wiki``上的:<br />[https://wiki.archlinux.org/index.php/Solid_state_drive#TRIM](https://wiki.archlinux.org/index.php/Solid_state_drive#TRIM)

>Most SSDs support the **ATA_TRIM command** for **sustained long-term performance and wear-leveling**. A techspot article shows performance benchmark examples of before and after filling an SSD with data.

>As of Linux kernel version 3.8 onwards, support for TRIM was continually added for the different filesystems. See the following table for an indicative overview:

![](trim-supported.png)

在使用``Trim``功能之前需要查看固态硬盘是否支持，否则可能造成数据丢失:

```
lsblk --discard
```

![](lsblk-discard.png)

``DISC-GRAN``和``DISC-MAX``不为``0``则表示支持，详细查看上面的``Arch Wiki``给出的文章。

关于使用的``Trim``方式，我使用的``Continuous TRIM``(详见``Arch Wiki``)
即在``fstab``文件的挂载项中添加参数``discard``
```
UUID=D942-EEB0                            /boot/efi      vfat    defaults,discard,noatime 0 2
UUID=67180790-92d0-48d3-8f00-448161019f2d swap           swap    defaults,discard,noatime 0 2
UUID=e2708091-5a07-47a6-bc26-5fdaa044c5f3 /              ext4    defaults,discard,noatime 0 1
```

#### IO调度器选择

一般来说，IO调度算法是为低速硬盘准备的，对于固态，最好是不使用任何IO调度器，或使用对硬盘干预程度最低的调度算法。

1. 查看当前固态的IO调度器:
![](io-schedulers.png)
可以看到我当前固态没有使用任何调度器，而机械硬盘使用的是``bfq-sq``.
2. 修改IO调度器(临时的):
```
echo noop > /sys/block/sda/queue/scheduler
```
3. 要永久生效则需要添加编写开机自启动脚本
详见参考链接.

更多信息以及详细的内容可以参考下面给出的参考链接.
参考链接:
- [https://wiki.archlinux.org/index.php/Improving_performance#Storage_devices](https://wiki.archlinux.org/index.php/Improving_performance#Storage_devices)
- [https://blog.codeship.com/linux-io-scheduler-tuning/](https://blog.codeship.com/linux-io-scheduler-tuning/)
- [https://www.ibm.com/developerworks/cn/linux/l-lo-io-scheduler-optimize-performance/index.html](https://www.ibm.com/developerworks/cn/linux/l-lo-io-scheduler-optimize-performance/index.html)

#### 另外

更多有关``Linux VM``性能调优的可以参考:
[https://lonesysadmin.net/tag/linux-vm-performance-tuning/](https://lonesysadmin.net/tag/linux-vm-performance-tuning/)
