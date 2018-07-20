---
author: rovo98
date: '2017.4.11 12:00'
categories:
  - JavaWeb
  - Web Basic
  - HTML
tags:
  - web dev
title: HTML5 基础学习
password: writting
abbrlink: 9f461f83
---

![](/images/html5基础学习/html5.jpg)

``HTML5``是取代``HTML4.01``, ``XHTML 1.0``和``XHTML 1.1``的HTML标准的下一个主要修订版。``HTML5``是在万维网上构建和呈现内容的标准。
<!-- more -->
## 概述 (Overview)

``HTML5``是万维网联盟(World Wide Web Consortium, W3C)和Web超文本应用技术工作组(Web Hypertext Application Technology Working Group, WHATWG)合作的成果。

新标准包含了以前依赖于第三方浏览器插件(如： *Adobe Flash, Microsoft Sliverlight* 和 *Google Gears*)的视频播放和拖放等功能。

### 一、浏览器支持

*Apple Safari, Google Chrome, Mozilla Firefox*和*Opera*的最新版本都支持许多``HTML5``功能，*Internet explorer 9.0*也支持某些``HTML5``功能。

预装在*Iphone, iPad*和*Android*手机上的移动网络浏览器都对``HTML5``提供了出色的支持。

### 二、新特性

``HTML5``引入了许多新元素和属性，可以帮助我们构建现代网站。以下是``HTML5``引入的一些最突出的功能.

- **新的语义元素(Semantic Elements)** - 例如: ``<header>, <footer>``和``<section>``等；
- **表单2.0** - 对HTML的网页表单的改进，其中为``<input>``标签引入了新属性;
- **持久本地存储(Persistent Local Storage)** - 无需借助第三方插件即可实现;
- **WebSocket** - 用于Web应用程序的下一代双向通信技术;
- **服务器发送事件(Server sent Events)** -  ``HTML5``引入了从Web服务器流向Web浏览器的事件，它们被称为*Server-Sent-Events(SSE)*;
- **画布(Canvas)** - 支持二维绘图，可以使用``Javascript``进行编程;
- **声音&视频(Audio&Video)** - 不需要使用第三方插件，就可以在网页中嵌入音频或视频;
- **地理位置(Geolocation)** - 网页的浏览者可以选择与Web应用程序共享物理位置;
- **微数据(Microdata)** - 这使得我们可以在``HTML5``之外创建自己的词汇变,并使用自定义的语义元素来扩展网页;
- **拖放(Drag&Drop)** - 将项目从一个位置拖放到同一网页的另一个位置.

### 三、向后兼容性

``HTML5``尽可能设计为与现有Web浏览器向后兼容。它的新功能基于现有功能，允许为旧版浏览器提供后背内容。

使用``HTML5``时，建议使用几行``Javascript``代码检测对各个``HTML5``功能的支持。

## 语法 (Syntax)

``HTML5``具有“自定义”HTML语法，该语法与Web上发布的``HTML4``和``xHTML 1``文档兼容，但是与``HTML4``的更深奥的``SGML``功能不兼容。

``HTML5``与``XHTML``没有相同的语法规则，``XHTML``**需要小写标签名称，属性需要用引号括起来，属性必须有一个值并关闭所有的空元素**。

``HTML5``具有很大的灵活性，它支持以下功能 - 

- 大写标签名称;
- 引号对于属性是可选的;
- 属性的值也是可选的;
- 空元素的关闭也是可选的.

### 一、DOCTYPE

旧版的``HTML``中``DOCTYPE``较长，因为``HTML``是基于``SGML``的，因此需要引用``DTD``。``HTML5``可以使用下面的简单的语法来指定``DOCTYPE`` - 

```html
<!DOCTYPE html>
```

上面的语法**不区分大小写**。

### 二、字符编码

在``HTML5``中可以使用简单的语法指定字符编码 - 

```html
<meta charset = "UTF-8">
```

### 三、``<script>``标签

通过的做法是将一个值为``"text/javascript"``的``type``属性添加到脚本元素中，如下所示 -

```html
<script type = "text/javascript" src = "scriptfile.js"></script>
```

但``HTML5``删除了除了所需的额外信息，只需要使用以下语法即可 - 

```html
<script src = "scriptfile.js"></script>
```

### 四、``<link>``标签

以前我们是这样写``<link``标签元素的 - 

```html
<link rel = "stylesheet" type = "text/css" href = "stylefile.css">
```

在``HTML5``中删除了所需的额外的信息，使用下面的简单的语法即可 - 

```html
<link rel = "stylesheet" href = "stylefile.css">
```

### 五、HTML5 元素

``HTML5``元素使用开始标记和结束标记进行标记。标签是尖括号分隔，标签名称介于两者之间。不同于开始标记，结束标记在标签名名称中多了一个斜杠。<br />下面是使用``HTML5``元素的语法 - 

```html
<p> ... </p>
```

``HTML5``标签名称不区分大小写，**可以全部大写或者混合大小写，但最常见的是使用小写**。

大多数元素包含一些内容，如``<p>...</p>``包含一个段落。但是，有些元素根本不包含任何内容，这些元素称为空元素。例如: ``br``, ``hr``, ``link``, ``meta``等。

### 六、HTML5 属性

元素可能包含用于设置元素的各种属性的属性。某些元素是全局定义的，可以在任何元素上使用，而其他属性仅针对特定元素定义。所有属性都有一个名称和一个值，如下例所示 - 

```html
<div class = "example" id = "wrapper"> ... </div>
```

``HTML5``属性同样不区分大小写，可以全部使用大写或混合大小写，但约定俗成的是坚持使用小写。

### 七、HTML5 文档

``HTML5``中引入了下面的标签来更好的结构化文档 - 

1. **section** - 该标签表示通用文档或应用程序部分。它可以与``h1-h6``一起使用来指示文档结构;
2. **article** - 此标签表示文档的独立内容，例如博客条目或报纸文章;
3. **aside** - 该标签表示一段仅与页面其余部分略有相关的内容;
4. **header** - 此标签表示section的标题;
5. **footer** - 该标签表示section的页脚，可以包含有关作者，版权信息等的信息;
6. **nav** - 此标签表示用于导航的文档的一部分;
7. **dialog** - 该标签可用于标记对话;
8. **figure** - 此标签可以将标题与某些嵌入内容(例如图片或视频)相关联.

``HTML5``的文档结构简单例子如下 - 

```html
<!DOCTYPE html>

<html>
	<head>
    	<meta charset = "UTF-8">
        <title>...</title>
    </head>
    
    <body>
    	<header>...</header>
    	<nav>...</nav>
    
    	<article>
   			<section>
    		...
    		</section>
    	</article>
    
    	<aside>...</aside>
    
    	<footer>...</footer>
    </body>
</html>
```

## 属性 (Attributes)

之前已经提到，元素可能包含用于设置元素的各种属性的属性。某些元素是全局定义的，可以在任何元素上使用，而其他属性仅针对特定元素定义。所有属性都有一个名称和一个值。属性的设置只能在**开始标签中设置**。``HTML5``属性不区分大小写，可以混合大小写，但是约定俗成使用小写。

### 一、标准属性

几乎所有``HTML5``标签都支持下面列出的属性(常用部分属性) - 

|Attribute|Options|Function|
|:----:|:-----:|:-----:|
|accesskey|用户自定义|指定用于访问元素的键盘快捷方式|
|align|right,left,center|水平对齐标签|
|backgroud|URL|在元素后面放置背景图像|
|bgcolor|数字，<br />颜色十六进制表示,<br />RGB值|设置元素的背景颜色|
|class|用户自定义|对用于层叠样式表的元素进行分类|
|contenteditable|true, false|指定用户是否可以编辑元素内容|
|contextmenu|Menu id|指定元素的上下文菜单|
|data-XXXX|用户自定义|自定义属性。开发人员可以定义自己的属性。必须以``data-``开头|
|draggable|true, false, auto|指定是否允许用户拖动元素|
|height|数值|指定表格，图像，表格单元的高度|
|hidden|hidden|指定元素是否可见|
|id|用户自定义|命名用于层叠样式表的元素|
|item|元素列表|用于分组元素|
|itemprop|项目列表|用于分组项目|
|spellcheck|true,false|指定元素是否必须检查拼写或语法|
|style|CSS 样式表|指定元素的行内样式|
|subject|用户定义的id|指定元素对应的项目|
|tabindex|Tab数字|指定元素的Tab键顺序|
|title|用户自定义|定义元素的“弹出”标题|
|valign|top,middle,bottom|垂直对齐HTML元素中的标签|
|width|数值|指定表格，图像，或者表格单元的宽度|

### 二、自定义属性

用户可以添加自定义数据属性是``HTML5``中引入的新功能。自定义的数据属性一``data-``开头，并根据需求来命名，例如 - 

```html
<div class ="example" data-subject = "physics" data-level = "complext">
...
</div>
```

上面的代码在``HTML5``中是完全有效的，其中``data-subject``和``data-level``为自定义属性。可以使用``JavaScript API``或``CSS``以与标准属性类似的方式获取这些属性的值。

## 事件 (Events)

当用户访问往网站时，他们会执行各种活动，例如单机文本和图像以及链接，将鼠标悬停在已定义的元素上等。这些在``Javascript``中被称为**事件**。

我们可以在``JavaScript``或``VBscript``中编写事件处理程序，可以将这些事件处理程序指定为事件标记属性的值。``HTML5``规范定义了下面列出的各种事件属性 - 

当任何``HTML5``元素发生任何事件时，我们可以使用以下属性集来触发作为值给定的任何``javascript``或``vbscript``代码。

|Attribute|Value|Description|
|:---:|:---:|:----:|
|offline|script|文档脱机时触发|
|onabort|script|中止事件时触发|
|onafterprint|script|文档打印后触发|
|onbeforeonload|script|文档加载前触发|
|onbeforeprint|script|文档打印前触发|
|onblur|script|窗口失去焦点时触发|
|oncanplay|script|当媒体可以播放时触发，但可能必须停止缓冲|
|oncanpalythrough|script|当媒体可以播放到最后时触发，而不停止缓冲|
|onchange|script|元素内容改变时触发|
|onclick|script|鼠标单击时触发|
|oncontextmenu|script|触发上下文菜单时触发|
|ondbclick|script|双击鼠标时触发|
|ondrag|script|拖动元素时触发|
|ondragend|script|拖动操作结束时触发|
|ondragenter|script|将元素拖动到有效放置目标时触发|
|ondragleave|script|元素离开有效放置目标时触发|
|ondragstart|script|拖动操作开始时触发|
|ondrop|script|放置元素时触发|
|ondurationchange|script|媒体长度发生改变时触发|
|onemptied|script|媒体资源元素突然变空时触发|
|onended|script|媒体到达终点时触发|
|onerror|script|发生错误时触发|
|onfocus|script|窗口获得焦点时触发|
|onformchange|script|表单发生改变时触发|
|onforminput|script|用户输入表单内容时触发|
|onhaschange|script|文档更改时触发|
|oninput|script|元素获得用户输入时触发|
|oninvalid|script|元素无效时触发|
|onkeydown|script|某个键按下时触发|
|onkeypress|script|某个键被按下并释放时触发|
|onkeyup|script|某个键释放时触发|
|onlaod|script|文档加载时触发|
|onloadeddata|script|媒体数据加载时触发|
|onloadedmetadata|script|加载媒体元素的持续时间和其他媒体数据时触发|
|onlaodstart|script|浏览器开始加载媒体数据时触发|
|onmessage|script|触发消息时触发|
|onmousedown|script|按下鼠标按钮时触发|
|onmousemove|script|鼠标指针移动时触发|
|onmouseout|script|鼠标指针移开某个元素时触发|
|onmouseover|script|鼠标指针移动到某个元素上时触发|
|onmouseup|script|鼠标按钮释放时触发|
|onmousewheel|script|鼠标滑轮滚动时触发|
|onoffline|script|文档脱机时触发|
|ononline|script|文档联机时触发|
|onpagehide|script|隐藏窗口时触发|
|onpause|script|媒体暂停时触发|
|onpageshow|script|窗口可视时触发|
|onplay|script|媒体数据即将开始播放时触发|
|onplaying|script|媒体数据开始播放时触发|
|onpopstate|script|窗口历史记录更改时触发|
|onprogress|script|浏览器获取媒体数据时触发|
|onratechange|script|媒体数据的播放速率发生变化时触发|
|onreadystatechange|script|准备状态改变时触发|
|onredo|script|文档执行重做时触发|
|onresize|script|调整窗口大小时触发|
|onscroll|script|滚动元素的滚动条时触发|
|onseeked|script|当媒体元素的搜索属性不再为真时触发，并且搜索已经结束|
|onseeking|script|当媒体元素的搜索属性为真时触发，并且搜索已经开始|
|onselect|script|元素被选中时触发|
|onstalled|script|在获取媒体数据时出现错误事触发|
|onstorage|script|文档加载时触发|
|onsubmit|script|表单提交时触发|
|onsuspend|script|浏览器获取媒体数据时触发，但在获取整个每天文件之前停止|
|ontimeupdate|script|媒体更改其播放位置时触发|
|onundo|script|文档执行撤销时触发|
|onunload|script|用户离开文档时触发|
|onvolumechange|script|媒体更改音量时触发，当音量设置为“mute(静音)”时触发|
|onwaiting|script|当媒体停止播放时触发，当预计会恢复|

## 表单 (Web Forms 2.0)

## 矢量图 (SVG)

## MathML

## Web 存储

## Web SQL 数据库

## 服务器发送事件 (Server Sent Events)

## WebSocket

## Canvas

## 声音&视频 (Audio&Video)

## 地理位置 (Geolocation)

## 微数据 (Microdata)

## 拖放 (Drag & drop)

## Web Workers

## IndexedDB

## Web 通信 (Messaging)

## CORS

## RTC

