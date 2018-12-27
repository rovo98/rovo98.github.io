---
title: Advantrue 1 - Leetcode 189 - Rotate Array
author: rovo98
date: '2018.2.2 10:00:00'
categories:
  - Leetcode
tags:
  - leetcode-array-easy
mathjax: true
abbrlink: 885fe7d0
---

> 给定一个数组，将数组中的元素向右移动 k 个位置，其中 k 是非负数。
> 链接:
> 1. [https://leetcode-cn.com/problems/rotate-array/](https://leetcode-cn.com/problems/rotate-array/)(中文)
> 2. [https://leetcode.com/problems/rotate-array/](https://leetcode.com/problems/rotate-array/)(en)
>
> 示例 1:
>
> 输入: [1,2,3,4,5,6,7] 和 k = 3
> 输出: [5,6,7,1,2,3,4]
> 解释:
> 向右旋转 1 步: [7,1,2,3,4,5,6]
> 向右旋转 2 步: [6,7,1,2,3,4,5]
> 向右旋转 3 步: [5,6,7,1,2,3,4]
> 示例 2:
>
> 输入: [-1,-100,3,99] 和 k = 2
> 输出: [3,99,-1,-100]
> 解释: 
> 向右旋转 1 步: [99,-1,-100,3]
> 向右旋转 2 步: [3,99,-1,-100]
> 说明:
> 
> 尽可能想出更多的解决方案，至少有三种不同的方法可以解决这个问题。
> 要求使用空间复杂度为 O(1) 的原地算法。

<!-- more -->

### 解题思路

首先考虑考虑``brute-force``暴力解法，要使数组中的元素整体右移``k``位，最直接的方式是循环``k``次，每次循环让每个元素依次跟最后一个元素进行交换``swap``即可。
> 例如: input : [1, 2, 3, 4], k = 1
>       loop1: 4, 2, 3, 1 -> 
>              4, 1, 3, 2 -> 
>              4, 1, 2, 3

```java
class Solution {
    public void rotate(int[] nums, int k) {
        if (nums == null || nums.length <= 1) return;

        for (int i = 0; i < k; i++) {
            int last = nums[nums.length-1];
            for (int j = 0; j < nums.length; j++) {
                int temp = nums[j];
                nums[j] = last;
                last = temp;
            }
        }
    }
}
```

**复杂度分析(Compelxity Analysis):**
- 时间复杂度(Time complexity): $O(kn)$
- 空间复杂度(Space complexity): $O(1)$

Submission status:
> 该解法通过所有测试用例，但是执行时间为``109 ms``, 击败``14.9%``的``java``代码提交。

{%note primary%}
解题思路二:

> 利用辅助数组，先将需要移动变换的元素放在移动后的位置，再将辅助数组元素移回原数组.

{%endnote%}

```java
class Solution {
    public void rotate(int[] nums, int k) {
        if (nums == null || nums.length < 2) return;
        
        int[] aux = new int[nums.length];
        for (int i = 0; i < nums.length; i++) {
            aux[(i+k) % nums.length] = nums[i];
        }

        for (int i = 0; i < aux.length; i++) {
            nums[i] = aux[i];
        }
    }
}
```

**复杂度分析(Compelxity Analysis):**
- 时间复杂度(Time complexity): $O(n)$
- 空间复杂度(Space complexity): $O(n)$

Submission status:
> 代码提交运行时间: ``1 ms`` 击败``53.8%``的``java``提交代码。

{%note primary%}
解题思路三:

除了上面给出的第二种方案，还有更好的解题方法，能够做到``O(n)``运行时间，以及``O(1)``的空间复杂度.
{%endnote%}

> 思路: 拿题目给定的例子来说，[1,2,3,4,5,6,7], k = 3.
> 首先将数组划分成两个部分: ``0~nums.length-k-1``,即``[1,2,3,4]和``nums.length-k ~ nums.length-1],即``[5,6,7]``,把两个部分进行翻转，此时数组变成``[4,3,2,1,7,6,5]``.
> 最后，将整个数组进行翻转即可得到我们想要的结果: ``[5,6,7,1,2,3,4]``.

{%note warning%}
需要注意的是，需要对``k``进行处理，当``k > nums.length``情况，会出现越界情况。
解决方法: 使``k``进行 **mod** ``nums.length``运算(``k = k % nums.length``).
{%endnote%}

```java
class Solution {
    public void rotate(int[] nums, int k) {
        if (nums == null || nums.length < 2) return;

        k %= nums.length;
        reverse(nums, 0, nums.length-k - 1);
        reverse(nums, nums.length-k, nums.length-1);
        reverse(nums, 0, nums.length-1);
    }
    private void reverse(int[] nums, int i, int j) {
        while (i < j) {
            int temp = nums[i];
            nums[i] = nums[j];
            nums[j] = temp;
            i++;
            j--;
        }
    }
}
```

**复杂度分析(Complexity Analysis)**:
- 时间复杂度(Time complexity): $O(n)$
- 空间复杂度(Space complexity): $O(1)$

Submission status:
> 代码提交运行时间: ``0 ms``, 击败``100%``的``java``提交代码。

### 总结

在处理数组问题时，需要非常小心，时刻注意边界，避免发生数组越界问题。
