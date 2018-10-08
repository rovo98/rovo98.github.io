---
title: Java Reflection
author: rovo98
date: '2017.8.12 12:45'
categories:
  - Java
tags:
  - basic
abbrlink: d897152e
---

简单了解Java反射的基本内容。

<!-- more -->

### Java反射

#### Class类的使用
- A class named Class
- 1)在面向对象的世界里，万事万物皆对象。
- 类是对象，类是java.lang.Class类的实例对象
- 2)任何一个类都是Class的实例对象，这个实例对象有三种表示方式：

```java
package com.rovo98.reflect;

public class ClassDemo1 {
	public static void main(String args[]) {
  		//Foo的实例对象如何表示
  		Foo foo1 = new Foo() ;// foo1就表示出来了.
  		//Foo这个类本身 也是一个实例对象，Class类的实例对象
  		// 第一种表示方式 --> 任何一个类都有一个隐含的静态成员变量class
  		Class c1 = Foo.class;
  		//第二种表示方式 --> 已经知道该类的对象通过getClass()方法
  		Class c2 = foo1.getClass() ;
  		/* c1,c2 表示了Foo类的类类型(class type)*/
  		// 不管c1 or c2 都代表了Foo类的类类型，一个类只可能是Class类的一个实例对象
  		// 第三种表达方式
  		Class c3 = null ;
  		c3 = Class.forName("com.rovo98.Foo");
  		// 我们完全可以通过类的类类型创建该类的对象实例
  		Foo foo = (Foo)c1.newInstance() ;//需要有无参构造方法
	}
}
class Foo{}
```

#### Java动态加载类
- Class.forName("类的名称")
  - 不仅表示了类的类类型，还代表了动态加载类
  - 编译时刻加载类是静态加载类、运行时刻加载类是动态加载类
- 使用：当有多个功能模块(具体由类实现)时，使用动态加载

```java
//动态加载实例
interface OfficeAble  // 指定接口标准
{
  public void start() ;
}
class Word implements OfficeAble {
  public static void start() {
  	System.out.println("Start the Word");
  }
}
class Office
{
  public static void main(String args[])
  {
  		try{
  			//实现动态加载，运行时加载类
  			Class c = Class.forName(args[0]) ;
  			OfficeAble oa = c.newInstance() ;
  			oa.start() ;
		}
		catch (Exception e) {
  			e.printStackTrace() ;
		}
  }
}
```

#### 通过反射获取方法信息
- getMethods()  获取所有public 方法，包括父类继承而来的
- getDeclaredMethods() 获取所有自定义的方法，不包含访问权限

```java
package com.rovo98.reflect;

public class ClassDemo2 {
  public static void main(String args[]){
  	 
  	 Class c1 = int.class; // int 的类类型
  	 Class c2 = String.class; //String的类类型
  	 Class c3 = double.class ;
  	 Class c4 = Double.class ;
  	 Class c5 = void.class ;
  	 System.out.println(c1.getName()) ;
  	 System.out.println(c3.getSimpleName()) ;//打印不包含包名的类信息
  }
}
```

案例：

```java
package com.rovo98.feflect;

public class ClassUtil {
  /**
  *打印类的信息，包括类的成员变量，成员方法
  *@param obj 该对象所属类的信息
  */
  public static void printClassMessage(Object obj) {
  	//要获取类的信息 首先要获取类的类类型
  	Class c = obj.getClass() ;//传递的是哪个子类的对象 c就是该子类的类类型
  	// 获取类名称
  	System.out.println("类的名称："+c.getName()) ;
  	/*
  	*Method类 ，方法对象
  	*一个成员方法就是一个Method对象
  	*getMethods()方法获取的是所有public的函数，包括父类继承而来的
  	*getDeclaredMethods()获取的是所有该类自己声明的方法，不包含访问权限
  	*/
  	Method[] ms = c.getMethods() ;//c.getDeclaredMethods()
  	for (int i=0; i<ms.length; i++) {
        // 得到方法的返回值类型的类类型
        Class returnType = ms[i].getReturnType() ;
        System.out.print(returnType.getName()+" ") ;
        //得到方法的名称
        System.out.print(ms[i].getName()+"(");
        //获取参数类型 --> 得到的是参数列表的类型的类类型
        for (Class class1 : paramTypes) {
  			System.out.print(class1.getName()+",");
        }
        System.out.println(")");
	 }
  }
}
```
#### 成员变量和构造方法信息的获取
- getField()方法获取的是所有的public的成员变量的信息
- getDeclaredField()获取的是该类自己声明的成员变量的信息
- getConstructors获取所有的public的构造方法
- getDeclaredConstructors得到所有的构造方法

```java
public static void printClassFieldMessage(Object obj) {
  /*
*成员变量也是对象
*java.lang.reflect.Field
*Field类封装了关于成员变量的操作
*getField()方法获取的是所有的public的成员变量的信息
*getDeclaredField()获取的是该类自己声明的成员变量的信息
*/
//Field[] fs = c.getDeclaredFields();
Filed[] fs = c.getDeclaredFields();
for (Field field:fs) {
  //得到成员变量的类型的类类型
  Class fieldType = field.getType();
  String typeName = fieldType.getName();
  //得到成员变量的名称
  String fieldName = field.getName();
  System.out.println(typeName+" "+fieldName) ;
 }
}
/**
*打印对象的构造函数的信息
*@param obj
*/
public static void printConMessage(Object obj) {
  Class c = obj.getClass();
  /*
  *构造方法也是对象
  *java.lang.Constructor中封装了构造方法的信息
  *getConstructors获取所有的public的构造方法
  *getDeclaredConstructors得到所有的构造方法
  */
  //Constructor[] cs = c.getConstructors();
  Construtor() cs = c.getDeclaredConstructors();
  for (Constructor constructor : cs) {
    //打印构造方法信息
    System.out.print(constructor.getName()+"(");
    Class[] paramTypes = constructor.getParameterTypes();
    for (Class class1 : paramTypes) {
       System.out.print(class1.getName+" ");
    }
    System.out.println(")");
  }
}
```

###  java方法反射的基本操作

#### 方法的反射
- 1)如何获取某个方法
  方法的名称和方法的参数列表才能唯一决定某个方法
- 2)方法反射的操作
  method.invoke(对象,参数列表)
  
```java
package com.rovo98.reflect;

public class MethodDemo1 {
  public static main(String args[]) {
    //要获取print(int, int)方法
    //1.要先获取类的类类类型
    //2.获取类的信息
    A a1 = new A() ;
    Class c = a1.getClass() ;
    // 3.获取方法 名称和参数列表决定
    //getMethod获取的是public的方法
    //getDeclaredMethod自己的声明的方法
    //c.getMethod(name,parameterTypes);
    //Method m = c.getMethod("print",new Class[]{int.class,int.class});
    try {
      // 获取print(int,int)方法
      Method m = c.getMethod("print",int.class,int.class);
      //方法的反射操作
      //使用m对象来进行方法调用 和a1对象调用一样
      //方法如果没有返回值返回null,有则返回具体返回值
      //本来是a1.print(10,20);
      Object o = m.invoke(a1,new Object[]{10,20});
    }
    catch (Exception e) {
      e.printStackTrace();
   }
  }
}
class A {
  public vodi print(int a, int b) {
    System.out.println(a + b) ;
  }
  public void print(String a, String b) {
    System.out.println(a.toUpperCase()+","+b.tolowerCase()) ;
  }
}
```

#### 通过反射了解集合泛型的本质

```java
package com.rovo98.reflect;

public class MethodDemo4{
  public static void main(String args[]) {
    ArrayList list = new ArrayList() ;
    ArrayList<String> list1 = new ArrayList<String>();
    list1.add("hello");
    //list1.add(20);  错误的
    
    Class c1 = list.getClass() ;
    Class c2 = list1.getClass() ;
    System.out.println(c1 == c2) ;
    //反射的操作都是编译之后的操作
    
    /*
    *c1 == c2 结果返回true说明编译之后集合的泛型是去泛型化的
    *java中集合的泛型，是防止错误输入的，只在编译阶段有效
    *验证：可以通过方法的反射操作，绕过编译
    */
    try {
       Method m = c1.getMethod("add",Object.class) ;
       // 绕过编译操作，绕过了泛型
       Object o = c1.invoke(list1,20) ;
       System.out.println(list1.size()) ;
       // list1.size --> 2
       // list1 -- > ["hello",20]
    }catch (Exception e) {
      e.printStackTrace();
    }
  }
}
```
