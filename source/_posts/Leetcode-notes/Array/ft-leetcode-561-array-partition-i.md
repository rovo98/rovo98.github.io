---
title: Advanture 1 - Leetcode 561 - Array Partition I
author: rovo98
date: '2018.02.01 14:12:30'
categories:
  - Leetcode
tags:
  - leetcode-array-easy
mathjax: true
abbrlink: 270f73f9
---


> 给定长度为 2n 的数组, 你的任务是将这些数分成 n 对, 例如 (a1, b1), (a2, b2), ..., (an, bn) ，使得从1 到 n 的 min(ai, bi) 总和最大。<br /><br />
> 链接:
> 1. [https://leetcode-cn.com/problems/array-partition-i/](https://leetcode.com/problems/array-partition-i/)(中文)
> 2. [https://leetcode.com/problems/array-partition-i/](https://leetcode.com/problems/array-partition-i/)(en)
> 
> 示例 1:


```
输入: [1,4,3,2]

输出: 4
解释: n 等于 2, 最大总和为 4 = min(1, 2) + min(3, 4).
```
> 提示:
> 1. n 是正整数,范围在 [1, 10000].
> 2. 数组中的元素范围在 [-10000, 10000].

<!-- more -->

### 解题思路

个人解题思路，观察给定的例子，很容易发现，对于一个给定的$2n$大小的数组，只要在组成数对时每次都从数组选择最小的连两个数来组成$n$个数对。所获得的$1到n的min(a_i,b_i)$总和最大。

证明: 可以使用数学归纳法进行证明。

> 因此，首先考虑将数组进行排序，然后将所有奇数位置的元素加和起来就是结果.

```java
class Solution {
	public int arrayPairSum(int[] nums) {
        if (nums.length % 2 != 0)
            throw new IllegalArgumentException();
        // sort the array first if it is unsorted.
        if (!isSorted(nums))
            Arrays.sort(nums);
        
        int sum = 0;
        for (int i = 0; i < nums.length; i+=2) {
            sum += nums[i];
        }
        return sum;
    }
    // simple tool for sorting a integer array.
    private static boolean isSorted(int[] arr) {
        for (int i = 0; i < arr.length-1; i++) {
            if (arr[i]>arr[i+1])
                return false;
        }
        return true;
    }
}
```

**复杂度分析(Compelxity Analysis):**
- 时间复杂度(Time complexity): $O(nlogn)$，主要取决所使用的排序算法
- 空间复杂度(Space complexity): $O(1)$

Submission status:
> 以上解法，通过所有测试用例，运行时间$32 ms$击败$28.65$%的提交(英文版leetcode)

> 可以清楚的了解到该问题还有更好的解法。
> 由于**我的解题思路基于比较的排序算法，因此时间复杂度$O(nlogn)$已是最优**,需要考虑另外的解题思路。

如果不排序的情况下，得到结果。？？？ --> emmm.... 没想到。。。


> 额..., 解题思路不变，还是基于排序，但是应用**空间换时间**的思想，因此容易想到利用**桶排序**对给定数组进行排序(毕竟数组元素范围已经给定$-10000 ~ 10000$)


```java
class Solution {
    public int arrayPairSum(int[] nums) {
        if (nums.length % 2 != 0)
            throw new IllegalArgumentException();

        int[] bucket = new int[20001];
        int maxElemt = Integer.MIN_VALUE;
        int minElemt = Integer.MAX_VALUE;
        
        for (int i = 0; i < nums.length; i++) {
            bucket[nums[i]+10000]++;
            if (nums[i] > maxElemt)
                maxElemt = nums[i];
            if (nums[i] < minElemt)
                minElemt = nums[i];
        }
        
        int result = 0;
        minElemt += 10000;  // offset is 10000
        maxElemt += 10000;
        boolean isOdd = true;
        for (int i = minElemt; i <= maxElemt; i++) {
            if (bucket[i] > 0) {
                for (int j = 0; j < bucket[i]; j++) {
                    if (isOdd)
                        result += (i - 10000);
                    isOdd = !isOdd;
                }
            }
        }
        return result;
    }
}
```

{%note primary%}
代码简单解释，由于给定数组元素的范围为$-10000$ ~ $10000$, 因此桶排序所需要的总的容量为$20000$, 对给定数组出现的元素进行偏移(偏移量为$10000$)
``bucket[nums[i]+10000]++``，使用两个整型变量``minElemt``和``maxElemt``确定元素出现的范围, 使用*flag*变量``isOdd``判断当前处理元素是处于奇数位置还是偶数位置。
{% endnote %}

**复杂度分析(Complexity Analysis)**:
- 时间复杂度(Time complexity): $O(n)$, 就算是数组所有元素都相同的情况，也是只要遍历$n$次
- 空间复杂度(Space complexity): $O(n)$ 对于该题目来说，$n为20000$

**Submission status**:

> 代码提交状况: 运行时间$7 ms$,超过$100$%的``java``代码提交。

![](leetcode-561-2.png)

### 总结

第一种解法是通用解法，可以适用于不同的给定数组元素范围，而第二种解法只适用于此题，当元素范围比较大时，所花费的空间代价高。
