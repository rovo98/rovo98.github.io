---
title: CSS 基础学习
author: rovo98
date: '2017.4.12 12:00'
categories:
  - JavaWeb
  - Web Basic
  - CSS
tags:
  - web dev
password: writting
abbrlink: c452f057
---

![](/images/css基础学习/css.jpg)

层叠样式表(**C**ascading **S**tyle **S**heets),简称``CSS``, 是一种简单的设计语言，旨在简化是网页渲染的过程。

<!-- more -->
``CSS``处理网页的外观部分。使用``CSS``，可以控制文本的颜色，字体的样式，段落的间距，列的大小和布局，使用的背景图像和颜色，布局设计，不同的设备的显示变化和屏幕尺寸以及的其他各种影响。

``CSS``易于学习和理解，但它提供了对``HTML``文档的强大控制。``CSS``一般与标记语言``HTML``或``XHTML``结合使用。

## 概述(Introduction)

### 一、CSS 的优点

- **节省时间** - 我们可以编写一次``CSS``，然后在多个``HTML``页面中重复使用相同的样式表。可以为每个``HTML``元素定义样式，并将其应用于任意数量的Web页面中;
- **页面加载更快** - 如果使用``CSS``，则不需要每次都编写``HTML``的标签属性。只需要编写一个标签的``CSS``规则并将其应用于该标签的所有实例中。因此代码越少意味着加载的速度会变快;
- **易于维护** - 要进行全局更改，只需要更改样式，所有网页中的所有元素都将自动更新;
- **HTML的高级风格** - ``CSS``具有比``HTML``更广泛的属性，因此与``HTML``属性相比，可以更好地渲染页面;
- **多设备兼容性** - 样式表允许针对多种类型的设备优化内容。通过使用相同的``HTMl``文档，可以为诸如*PDA*和*手机*之类的手持设备呈现不同版本的网站或用于打印;
- **全球Web标准** - 现在``HTML``属性已被弃用，建议使用``CSS``。因此，最好在所有``HTML``页面中开始使用``CSS``,以使它们与未来的浏览器兼容;
- **离线浏览** - ``CSS``可以在离线``catche``的帮助下在本地缓存Web应用程序。使用此功能，我们可以查看离线网站。缓存还可以确保更快的加载速度和更好的网站整体性能;
- **平台独立性** - 脚本提供一致的平台独立性，也可以支持最新的浏览器.

### 二、谁创建和维护CSS?

``CSS``是由*HåkonWiumLie*于1994年10月10日发明的，由W3c内的一组人员(称为CSS工作组)维护。``CSS``工作组创建称为规范(**specifications**)的文档，当``W3C``成员讨论并正式批准规范时，它就成为了建议(**recommendation**)。

**NOTE** - 万维网联盟(``W3C``)是一个小组，就互联网如何运作以及互联网如何发展提出建议。

### 三、CSS 的版本

``CSS1``层叠样式表在1996年1月作为建议(**recommendation**)出自``W3C``。该版本描述了``CSS``语言以及所有``HTML``标签的简单可视化模型。

``CSS2``于1998年5月成为``W3C``建议标准，并以``CSS1``为基础。此版本增加了对媒体特定样式表的支持，例如打印机和听觉设备，可下载字体，元素定位和表格。

``CSS3``与1999年6月成为``W3C``建议，并以旧版``CSS``为基础。它分为文档，称为模块，这里每个模块都有``CSS2``中定义的新扩展功能。

#### CSS3 模块

``CSS3``模块具有旧版的``CSS``规范以及扩展功能 - 

- 选择器 (Selectors)
- 盒子模型 (Box Model)
- 背景和边框 (Backgrounds and Borders)
- 图像值和替换内容 (Image Values and Replaced Content)
- 文本效果 (Text Effects)
- 2D/3D转换 (2D/3D Transformations)
- 动画 (Animations)
- 多列布局 (Multiple Column Layout)
- 用户界面 (User Interface)

## 语法(Syntax)

``CSS``包含的样式规则由浏览器解释，然后应用于文档中的相对应的元素。样式规则由以下三部分组成 - 

1. **选择器(Selector)** - 选择器是将要应用样式的``HTML``标签。可以是``<h1>``或``<table>``等任何标签;
2. **属性(Property)** - 属性是``HTML``标签的一种属性。简而言之，所有``HTML``属性都转换为``CSS``属性。它们可以是颜色，边框等;
3. **属性值(Value)** - 为属性设置的值。例如，``color``属性可以设置为``red``或``#F1F1F1``等。

``CSS``样式规则语法如下 - 

```
selector {property: value }
```

![](css_syntax.png)

例如：我们可以为表格定义一个边框 - 

```css
table {border: 1px solid #c00; }
```

### 一、类型选择器 (Type Selectors)

这与我们上面看到的选择器是相同的，以标签的类型作为选择器。我们再看一个例子 - 为所有1级标题提供颜色 

```css
h1 {
	color: #36CFFF;
}
```

### 二、通用选择器 (Universal Selectors)

通用选择器匹配任何元素类型的名称，即所有``HTML``元素，而不是选择特定类型的元素 - 

```css
* { 
	margin: 0px;
    padding: 0px;
}
```

### 三、后代选择器 (Descendant Selectors)

假设我们希望仅在特定元素位于特定元素内时才将样式规则应用于该元素。如以下所示，样式规则仅在``<em>``元素位于``<ul>``元素内时才应用于``<em>``。

```css
ul em {
	color: #000;
}
```

### 四、类选择器 (Class Selectors)

可以根据元素的``class``属性定义样式规则。具有该类的所有元素将根据定义的规则进行格式化。

```css
.black {
	color : #000;
}
```

此规则在文档中将``class``属性设置为``black``的每个元素呈现为黑色内容。我们还可以把它变得更特别。例如 -

```css
h1.black {
	color: #000;
}
```

上面的规则只适用于将``class``属性设置为``black``的``<h1>``元素。

对于类选择器，一个``HTML``元素可以使用多个类选择器。例如 - 

```html
<p class = "class1 class2 class3">
	This is a para will be styled.
</p>
```

### 五、ID选择器 (ID Selectors)

根据元素的``id``属性定义样式规则。具有该``id``的所有元素将根据定义规则进行格式化。

```css
#black {
	color : #000;
}
```

对于文档中的``id``属性设置为``black``的每个元素，此规则将它们的内容呈现为黑色。同类选择器一样，我们也可以把它变得特殊化 - 

```css
h1#black {
	color : #000;
}
```

该规则仅将``id``属性为``black``的``<h1>``元素的内容设置为黑色。id选择器的真正强大之处在于它们被用作后代选择器的基础，例如：

```css
#black h2 {
	color: #000;
}
```

在此示例中，当2级标题位于id属性设置为``black``的标签元素中时，所有的2级标题将以黑色显示。

### 六、孩子选择器 (Child Selectors)

之前我们已经看到了后代选择器。孩子选择器和它非常相似，但具有不同的功能。例如 - 

```css
body > p {
	color : #000;
}
```

该规则中，``<p>``只有在是``<body>``元素的直接子元素的情况下，样式规则才会应用。放在其他元素(如：``<div>``等)中，则样式规则不会起作用。

### 七、属性选择器 (Attribute Selectors)

我们还可以将样式应用与于具有特定属性的``HTML``元素上。下面的样式规则将匹配具有``type``属性值为``text``的所有``<input>``元素。

```css
input[type="text"] {
	color: #000;
}
```

此方法的优点是``<input type="submit" />``元素不受影响，并且颜色仅应用于所需的文本字段。

下面的规则适用于属性选择器 - 

- ``p[lang]`` - 选择所有拥有``lang``属性的段落元素;
- ``p[lang="fr"]`` - 选择所有具有``lang``属性且值为``fr``的段落元素;
- ``p[lang~="fr"]`` - 选择所有具有``lang``属性且值包含``fr``的段落元素;
- ``p[lang|="en"]`` - 选择其``lang``属性包含完全为``en``值的所有段落元素，或以``en-``开头的. 
- 
### 八、多样式规则

在实际的情况中，我们可能需要对单个元素定义多个样式规则。例如 - 

```css
h1 {
	color: #36C;
    font-weight: normal;
    letter-spacing: .4em;
    margin-bottom: 1em;
    text-transform: lowercase;
}
```

这里所有的属性和值对都用冒号``:``分隔，可以将它们写在同一行上，但是为了更好的可读性，建议是将它们分成不同的行。

### 九、分组选择器

如果需要，我们还可以将样式应用于多个选择器。只需要用逗号分隔选择器，如下所示 - 

```css
h1, h2, h3 {
	color: #36C;
    font-weight: normal;
    letter-spacing: .4em;
    margin-bottom: 1em;
    text-transform: lowercase;
}
```

此样式规则同时适用于``h1``,``h2``和``h3``元素。它们之间的顺序不重要，选择器中的所有规则都将被应用。

组合多个id选择器 - 

```css
#content, #footer, #supplement {
	position: absolute;
    left: 510px;
    width: 200px;
}
```

## CSS使用方式(Inclusion)

## 测量单位(Measurement Units)

## 颜色(Colors)

## 背景(Backgrouds)

## 字体(Fonts)

## 文本(Text)

## 图像(Images)

## 链接(Links)

## 表格(Tables)

## 边框(Borders)

## 外边距(Margins)

## 列表(Lists)

## 内边距(Padding)

## 游标(Cursors)

## 纲要(Outlines)

## 尺寸(Dimension)

## 滚动条(Scrollbars)
