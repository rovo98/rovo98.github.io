---
title: Advanture 1 Leetcode - 944 - Delete Columns to Make Sorted
author: rovo98
date: '2018.2.10 10:00:00'
categories:
  - Leetcode
tags:
  - leetcode-greedy-easy
mathjax: true
abbrlink: f5b699c8
---

> 给出由 N 个小写字母串组成的数组 ``A``，所有小写字母串的长度都相同。
> 现在，我们可以选择任何一组删除索引，对于每个字符串，我们将删除这些索引中的所有字符。
> 举个例子，如果字符串为 ``"abcdef"``，且删除索引是 ``{0, 2, 3}``，那么删除之后的最终字符串为 ``"bef"``。
> 假设我们选择了一组删除索引 ``D``，在执行删除操作之后，``A`` 中剩余的每一列都是有序的。
> 形式上，第 ``c`` 列为 ``[A[0][c], A[1][c], ..., A[A.length-1][c]]``
> 返回 ``D.length`` 的最小可能值。
> <br />
> - [https://leetcode-cn.com/problems/delete-columns-to-make-sorted/](https://leetcode-cn.com/problems/delete-columns-to-make-sorted/)(中文)
> - [https://leetcode.com/problems/delete-columns-to-make-sorted/](https://leetcode.com/problems/delete-columns-to-make-sorted/)(en)
> <br />
> 示例 1：
> 输入：["cba","daf","ghi"]
> 输出：1
> 示例 2：
> 输入：["a","b"]
> 输出：0
> 示例 3：
> 输入：["zyx","wvu","tsr"]
> 输出：3
> 提示：
> 1 <= A.length <= 100
> 1 <= A[i].length <= 1000

<!-- more -->

### 解题思路

对于这种可以快速得出解题思路的题目：

{%note primary%}
由于每个字符串的长度一样，所以我们只需要依次比较字符串对应的每一列，**判断是否满足非降序**即可得到结果。
{%endnote%}

```java
class Solution {
    public int minDeletionSize(String[] A) {
        int count = 0;
        for (int i = A[0].length(); i++) {
            for (int j = A.length-1; j++) {
                if (A[j].charAt(i) > A[j+1].charAt(i)) {
                    count++;
                    break;
                }
            }
        }
        return count;
    }
}
```

**复杂度分析(Complexity Analysis)**:
- 时间复杂度(Time complexity): $O(n)$
- 空间复杂度(Space complexity): $O(1)$

{%note waring%}
此题目，在``leetcode``上被归类为``greedy``，但我觉的解题思路并没怎么体现贪心算法的思想。。。
{%endnote%}
