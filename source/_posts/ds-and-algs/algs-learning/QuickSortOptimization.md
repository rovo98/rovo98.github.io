---
title: 快排序优化
author: rovo98
date: '2019.05.22 12:22'
categories:
  - Algorithms
  - sorting algs
tags:
  - sorting algs
mathjax: true
abbrlink: 6dcc34f7
---

&nbsp;&nbsp;&nbsp;&nbsp;不同与归并排序``mergeSort``，快排序不需要使用额外的数组来辅助进行排序，但是这并不意味着快排序就属于原地排序 ([in-place](https://some-link))。

>&nbsp;&nbsp;&nbsp;&nbsp;快排序递归时需要使用栈空间，当执行递归函数调用时，需要将当前执行函数的状态压入线程栈中，递归调用完成后再一层层返回。快排序不属于原地排序，那么有没有方法进行优化呢？

<!--more-->

## Introduction

我们知道快排序 ``quickSort ``的排序性能很好，特别是针对于数组来说。**JDK**中 ``Arrays.sort`` 中针对于原始类型的数组的排序也是用到了快排序(双基准快排 ``DualPivotQuickSort`` )。



### QuickSort in JDK

简单看一下，JDK8 中有关快速排序算法的实现。

``Arrays.class`` 的一个 ``sort(int[])`` 方法:

```java
    /**
     * Sorts the specified array into ascending numerical order.
     *
     * <p>Implementation note: The sorting algorithm is a Dual-Pivot Quicksort
     * by Vladimir Yaroslavskiy, Jon Bentley, and Joshua Bloch. This algorithm
     * offers O(n log(n)) performance on many data sets that cause other
     * quicksorts to degrade to quadratic performance, and is typically
     * faster than traditional (one-pivot) Quicksort implementations.
     *
     * @param a the array to be sorted
     */
    public static void sort(int[] a) {
        DualPivotQuicksort.sort(a, 0, a.length - 1, null, 0, 0);
    }
```



``DualPivotQuicksort`` 的实现就相对复杂一点，如果感兴趣的话可以自行查看相关源代码和实现文档, 这里只对有关快排序的内容进行简单地阐述。

![DualPivotQuickSort](quickSortOptimization-1.png)

从上面给到的文档内容看，我们关注以下的常量:

- ``QUICKSORT_THRESHOLD=286``: 在归并排序中用到，当数组元素数量小于286时，切换为快速排序；
- ``INSERTION_SORT_THRESHOLD=47``: 在快速排序中用到，当数组元素数量小于47时，切换为插入排序； 

- ``MAX_RUN_COUNT=67``: 归并排序中最大运行次数；
- ``MAX_RUN_LENGTH=33``: 归并排序允许的连续重复元素个数的最大值

主要排序方法如下:

```java
    /*
     * Sorting methods for seven primitive types.
     */

    /**
     * Sorts the specified range of the array using the given
     * workspace array slice if possible for merging
     *
     * @param a the array to be sorted
     * @param left the index of the first element, inclusive, to be sorted
     * @param right the index of the last element, inclusive, to be sorted
     * @param work a workspace array (slice)
     * @param workBase origin of usable space in work array
     * @param workLen usable size of work array
     */
    static void sort(int[] a, int left, int right,
                     int[] work, int workBase, int workLen) {
        // Use Quicksort on small arrays
        // 即， array.length < 286 时使用快排序
        if (right - left < QUICKSORT_THRESHOLD) {
            sort(a, left, right, true);
            return;
        }

        /*
         * Index run[i] is the start of i-th run
         * run[i] 表示第 i-th 次运行
         * (ascending or descending sequence).
         */
        int[] run = new int[MAX_RUN_COUNT + 1];
        int count = 0; run[0] = left;

        // Check if the array is nearly sorted
        // 判断数组是否已经基本排好序(部分有序)
        for (int k = left; k < right; run[count] = k) {
            if (a[k] < a[k + 1]) { // ascending
                // while 循环结束后，k会指向连续生序元素的最后一个
                while (++k <= right && a[k - 1] <= a[k]);
            } else if (a[k] > a[k + 1]) { // descending
                // 同上, 类似地，k 会指向连续降序元素的最后一个
                while (++k <= right && a[k - 1] >= a[k]);
                // 对这一部分进行翻转(reverse), 使其生序
                for (int lo = run[count] - 1, hi = k; ++lo < --hi; ) {
                    int t = a[lo]; a[lo] = a[hi]; a[hi] = t;
                }
            } else { // equal
                for (int m = MAX_RUN_LENGTH; ++k <= right && a[k - 1] == a[k]; ) {
                    // 数组中连续重复元素超过MAX_RUN_LENGTH(33)时
                    // 使用快排序
                    if (--m == 0) {
                        sort(a, left, right, true);
                        return;
                    }
                }
            }

            /*
             * The array is not highly structured,
             * use Quicksort instead of merge sort.
             * 如果数组非高度结构化，使用快排序
             */
            if (++count == MAX_RUN_COUNT) {
                sort(a, left, right, true);
                return;
            }
        }

        // Check special cases
        // Implementation note: variable "right" is increased by 1.
        if (run[count] == right++) { // The last run contains one element
            run[++count] = right;
        } else if (count == 1) { // The array is already sorted
            return;
        }

        // Determine alternation base for merge
        byte odd = 0;
        for (int n = 1; (n <<= 1) < count; odd ^= 1);

        // Use or create temporary array b for merging
        int[] b;                 // temp array; alternates with a
        int ao, bo;              // array offsets from 'left'
        int blen = right - left; // space needed for b
        if (work == null || workLen < blen || workBase + blen > work.length) {
            work = new int[blen];
            workBase = 0;
        }
        if (odd == 0) {
            System.arraycopy(a, left, work, workBase, blen);
            b = a;
            bo = 0;
            a = work;
            ao = workBase - left;
        } else {
            b = work;
            ao = 0;
            bo = workBase - left;
        }

        // Merging
        for (int last; count > 1; count = last) {
            for (int k = (last = 0) + 2; k <= count; k += 2) {
                int hi = run[k], mi = run[k - 1];
                for (int i = run[k - 2], p = i, q = mi; i < hi; ++i) {
                    if (q >= hi || p < mi && a[p + ao] <= a[q + ao]) {
                        b[i + bo] = a[p++ + ao];
                    } else {
                        b[i + bo] = a[q++ + ao];
                    }
                }
                run[++last] = hi;
            }
            if ((count & 1) != 0) {
                for (int i = right, lo = run[count - 1]; --i >= lo;
                    b[i + bo] = a[i + ao]
                );
                run[++last] = right;
            }
            int[] t = a; a = b; b = t;
            int o = ao; ao = bo; bo = o;
        }
    }
```

其他相关的更详细内容可以自行移步到 JDK 源代码文档中查看。



### Problem

本文只讨论简单的最原始的快排序(单基准, single-pivot )实现(伪代码如下), 即

```txt
QuickSort (if low < high):
	pi = partition(arr, low, high);
	QuickSort(arr, low, pi - 1);
	QuickSort(arr, pi + 1, high);
```

**复杂度分析:**

- Time complexity: $O(n log n)$
- Space complexity: $O(n)$ in worst case

由于上述实现的代码最后是两次递归调用，因此在最坏情况下，将需要 $O(n)$ 空间的函数调用栈。

> 最坏情况: 因为使用单基准元素对数组进行划分，如果每次都将数组划分为  $0$ 个元素和 $n-1$ 个元素两个部分的话，将出现最坏情况。

例如对于选择第一个元素作为基准元素，如果给定数组是逆序的(或者反过来，选择最后一个作为基准，给定数组已排序)，则出现最坏情况。

```java
public static void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        /* pi is the partiioning index */
        int pi = partition(arr, low, high);
        // Separately sort elements before
        // partition and after partition
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}
```

最坏情况示例:

![quickSort-worst-case](quickSortOptimization-2.png)

## Solutions

上面讨论了快排序存在的问题，接下来将针对上述问题提出解决方法。

### Method I

对于每次数组划分，使得各个部分都小于 $n/2$, 其中 $n$ 为数组长度。

![method-1-1](quickSortOptimization-3.png)

这种方法并不是最好的解决方案，**栈中单个项目的大小仍可能为 $O(n)$ **.

![method-1-2](quickSortOptimization-4.png)

### Method II

思想: 只对较小的划分部分调用递归函数，否则继续划分。(这种方式使用了尾递归，想了解更多可以留意本文最后给出的参考链接)

![method-2-1](quickSortOptimization-5.png)

![method-2-2](quickSortOptimization-6.png)

## Implementation

下面是对上述解决方法II的实现，使用尾递归进行处理。

我们可以将之前的代码转换为如下，使用``while``循环以减少递归调用的次数。

```java
public static void quickSort(int[] arr, int low, int high) {
    while (low < high) {
        // pi is partitioning index
        int pi = partition(arr, low, high);
        // Separately sort elements before
        // partition and after partition
        quickSort(arr, low, pi - 1);
        low = pi + 1;
    }
}
```

> 这种实现方式，尽管减少了递归函数调用的次数，但是在最坏情况，所需的栈空间仍是$O(n)$. 因为我们仍可以将数组划分为$n-1$个元素部分和另一部分。

进一步优化:

> 以下的实现方式，在划分(*partition*)之后，只在较小的部分上执行递归函数。

```java
// java implementation
public class Quick {
    pulbic static void sort(int[] arr) {
        quickSort(arr, 0, arr.length - 1);
        assert isSorted(arr);
    } 
    /* This QuickSort requires O(log n) auxiliary space in worst case.
    */
    private static void quickSort(int[] arr, int low, int high) {
        while (low <  high) {
            // pi is partitioning index
            int pi = partition(arr, low, high);
            // if left part is smaller, then recur for left
            // part and handle right part iteratively
            if (pi - low < high - pi) {
                quickSort(arr, low, pi - 1);
                low = pi + 1;
            } else { // else recur for right part
                quickSort(arr, pi+1, high);
                high = pi - 1;
            }
        }
    }
    private static int partition(int[] arr, int low, int high) {
        if (low > high) 
            throw new Exception("invalid arguments");
        int i = low, j = high + 1;
        int povit = arr[low];
        while (true) {
            while (arr[++i] < povit)
                if (i == high) break;
            while (arr[--j] > povit)
                if (j == low) break; // reduntant
            if (i > j) break;
            swap(arr, i, j);
        }
        if (j > low) swap(arr, low, j);
        return j;
    }
    ////////////// Help functions //////////////////////
    private static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    private boolean isSorted(int[] arr) {
        for (int i = 0; i < arr.length-1; i++) {
            if (arr[i] > arr[i+1]) return false;
        }
        return true;
    }
    ////////////////////////////////////////////////////////
}
```

上述优化后的实现方式中，我们只在更小的部分上递归调用函数；因此在最坏情况下，当所有递归调用中的两个部分大小相同时，使用$O(log\ n)$的额外空间。



> *References*:
>
> 1. [https://www.geeksforgeeks.org/tail-call-elimination/](https://www.geeksforgeeks.org/tail-call-elimination/)
> 2. [https://www.geeksforgeeks.org/quicksort-tail-call-optimization-reducing-worst-case-space-log-n/](https://www.geeksforgeeks.org/quicksort-tail-call-optimization-reducing-worst-case-space-log-n/)
>
> 3. [http://www.cs.nthu.edu.tw/~wkhon/algo08-tutorials/tutorial2b.pdf](http://www.cs.nthu.edu.tw/~wkhon/algo08-tutorials/tutorial2b.pdf)
