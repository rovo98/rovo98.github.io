---
title: Advanture 1 -  leetcode 1 - Two Sum(两数之和)
author: rovo98
date: '2018.2.1 09:00:30'
categories:
  - Leetcode
tags:
  - leetcode-array-easy
mathjax: true
abbrlink: 917327d3
---

``leetcode``解题思路总结:

>给定一个整数数组和一个目标值，找出数组中和为目标值的两个数。
>
> 你可以假设每个输入只对应一种答案，且同样的元素不能被重复利用。
> 链接:
> - [https://leetcode-cn.com/problems/two-sum/](https://leetcode-cn.com/problems/two-sum/)(中文)
> - [https://leetcode.com/problems/two-sum/](https://leetcode.com/problems/two-sum/)(en)
>
> 示例:

```
给定 nums = [2, 7, 11, 15], target = 9

因为 nums[0] + nums[1] = 2 + 7 = 9
所以返回 [0, 1]
```

<!-- more -->


### 解题思路

对于这样的题目，最容易想到的是``brute-force``暴力解法, 直接两重循环进行迭代.

```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) {
            for (int j = i+1; j < nums.length; j++) {
                if (nums[j] == target-nums[i])
                    return new int[] {i, j};
            }
        }
        // Returns null if solution not found.
        return null;
    }
}
```

**复杂度分析(Complexity Analysising):**
- 时间复杂度(Time complexity): $O(n^2)$
- 空间复杂度(Space complexity): $O(1)$

暴力解法虽然可行，但是时间复杂度为$O(n^2)$, 考虑进行优化，首先想到是可以以空间换时间:

{% note primary %}
如果能够把给定数组的数，用某种数据结构将每个数的数值以及对应的索引(index)保存起来，则只需要用一次遍历查找
``target - nums[i]``是否存在于该数据结构中，且非``nums[i]``即可。

[solution]: 使用``hashMap``保存数组中每个数以及对应的索引
{% endnote%}

```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            map.put(nums[i], i);
        }

        for (int i = 0; i < nums.length; i++) {
            int remain = target - map.get(nums[i]);
            if (map.containsKey(remain) && map.get(remain) != i)
                return new int[] {i, map.get(remain)};
        }
        // returns null if solution not found.
        reutrn null;
    }
}
```

**复杂度分析(Complexity Analysising)**:
- 时间复杂度(Time complexity): $O(n)$
- 空间复杂度(Space complexity): $O(n)$

{% note warning%}
年轻的我，本以为上面的这种解法已经是最优的了，但是看完讨论区之后，才焕然大悟，它还可以进行优化:
仔细看的话，上面的``HashMap``算法访问了``nums``数组两遍，而接下来，从``leetcode``上学习到的优化方法就是**将``nums``数组的访问从两遍降到一遍**.
{% endnote%}

```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int remain = target - nums[i];
            if (map.containsKey(remain))
                return new int[] {map.get(remain), i};
            map.put(nums[i], i);
        }
        return null;
    }
}
```

{% note info %}
由于``map``中保存的肯定是索引``i``之前的数，因此不需要判断``map.get(remain) != i``.
{% endnote%}

**复杂度分析(Complexity Analysising)**:
- 时间复杂度(Time complexity): O(n)
- 空间复杂度(Space complexity): O(n)


### 总结

对于能够快速使用``brute-force``暴力解法解决的问题，考虑优化时，首先考虑能够减少循环的嵌套，其次是考虑减少数组的访问次数、元素比较次数、元素交换次数等。
