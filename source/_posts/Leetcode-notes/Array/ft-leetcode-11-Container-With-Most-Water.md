---
title: Advantrue 1 - Leetcode 11 Container With Most Water
author: rovo98
date: '2018.2.1 16:01:00'
categories:
  - Leetcode
tags:
  - leetcode-array-medium
mathjax: true
abbrlink: dac7fdaa
---

> 给定 n 个非负整数 ``a1，a2，...，an``，每个数代表坐标中的一个点 ``(i, ai)`` 。在坐标内画 ``n`` 条垂直线，垂直线 ``i`` 的两个端点分别为 ``(i, ai)`` 和 ``(i, 0)``。找出其中的两条线，使得它们与 ``x`` 轴共同构成的容器可以容纳最多的水。
> <br />
> - [https://leetcode-cn.com/problems/container-with-most-water/](https://leetcode-cn.com/problems/container-with-most-water/)(中文)
> - [https://leetcode.com/problems/container-with-most-water/](https://leetcode.com/problems/container-with-most-water/)(en)
> <br />
> 说明：你不能倾斜容器，且 n 的值至少为 2。
> 示例:
> 输入: [1,8,6,2,5,4,8,3,7]
> 输出: 49

<!-- more -->

### 解题思路

对于这样的题目，很明显可以快速的使用``brute-force``方式得到解法:

```java
class Solution {
    public int maxArea(int[] height) {
        int maxArea = Integer.MIN_VALUE;
        for (int i = 0; i < height; i++) {
            for (int j = i+1; j < height; j++) {
                int temp = (j-i) * (height[i]>height[j]?height[j]:height[i]);
                if (temp > maxArea)
                    maxArea = temp;
            }
        }
        return maxArea;
    }
}
```

**复杂度分析(Complexity Analysis)**:
- 时间复杂度(Time complexity): $O(n^2)$
- 空间复杂度(Space complexity): $O(1)$

{%note primary %}
显然使用``brute-force``解法设计的算法是正确的，但是时间复杂度是$O(n^2)$级别，因此我们需要考虑优化。
代码提交状况:
运行时间(Runtime): 269 ms
beats rate: 20.1%
{%endnote%}

{%note warning%}
其实仔细看的话，要使围成的矩形面积最大，无非就是让长和宽尽量的大，因此我们可以使用``Two-pointers``双指针的思想:
使用两个指针``i,j``分别指向``0``和``height.length-1``，让一开始的``x``坐标距离最大化，然后判断它们所对应的高度谁低，
依据较低的高度值计算面积，再将对应索引指针增``1``(对于低索引指针)或减``1``(高索引指针)。
{%endnote%}

```java
class Solution {
    public int maxArea(int[] height) {
        int maxArea = Integer.MIN_VAlUE;
        int i = 0;
        int j = height.length-1;
        while (i < j) {
            // int x = j - i;
            // maxArea = Math.max(maxArea,Math.min(heigth[i], height[j])*x);
            // if (height[i] < height[j]) {
            //     i++;
            // } else {
            //     j--;
            // }
            // 对代码进行缩减
            maxArea = Math.max(maxArea, height[j]<height[i]?(j-i)*height[j--]:(j-i))*height[i++]);
        }
        return maxArea;
    }
}
```


**复杂度分析(Complexity Analysis)**:
- 时间复杂度(Time complexity): $O(n)$
- 空间复杂度(Space complexity): $O(1)$

{%note primary%}
使用**双指针**，只需要一次遍历就能得到结果。可以见得双指针是非常有效的工具，也是数组类问题中常见的解题思路: 例如，对于已经排好序的两数之和(Two sum - sorted)问题,就可以使用双指针进行解决。

代码提交状况:
运行时间(Runtime): 6 ms
beat rate: 65.95%
{%endnote%}

