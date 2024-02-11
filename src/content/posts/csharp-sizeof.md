---
title: 'The "sizeof" Operator in C#'
pubDate: 2024-02-06
description: 'Notes from C# sizeof video and readings'
author: 'Cats-n-Coffee'
image:
    url: ''
    alt: ''
tags: ["csharp", "learning notes"]
introType: 'notesIntro'
---

Learning how C# works from watching Jamie King's C# Types playlist. These are my notes to summarize his [C# sizeof video](https://www.youtube.com/watch?v=fYIv22BUCK8&list=PLRwVmtr-pp07XP8UBiUJ0cyORVCmCgkdA&index=36&pp=iAQB).

While following the Vulkan tutorial on the official site and using [the Silk bindings example](https://github.com/dfkeenan/SilkVulkanTutorial) which uses unsafe C#, we use the `sizeof` operator, which I had not used in previous .Net projects because they only used managed types and never had to check the size of anything. 

## What is it?
The `sizeof` operator in C# returns the size of a type in bytes at compile time, very much like what I remembered from C++. Which means we can't get the size of managed type like classes with this operator. However, we can get the size of a `struct`, where the total size should be the sum of all members' sizes.

## Alignment and `struct`
While reference types like classes will get managed by the runtime (in a safe context) to align all members in an optimal way, when using unsafe C# and structs we need to be aware of the **order** in which members are declared.
As shown in the video, we start with the following `struct` (showing a similar one):
```
struct MyStruct {
  public char myChar1;
  public int myInt;
  public char myChar2;
}
```

Adding all the members we get 8 bytes total (2 `char` for 2 bytes each, 1 `int` for 4 bytes), but if we print a `sizeof(MyStruct)` we will see 12. 
As well explained (and drawn!) in the video, we get 12 instead of 8 because each char sits on a slot of 4 bytes, resulting in wasting 2 bytes in each slot. To get around this, we can reorder our members, or use attributes.

### Reordering Members
Our members reordered should be like this:
```
struct MyStruct {
  public char myChar1;
  public char myChar2;
  public int myInt;
}
```

### Using Attributes
Going back to our first `struct` layout:
```
struct MyStruct {
  public char myChar1;
  public int myInt;
  public char myChar2;
}
```

To have the runtime align things for us, we'll need to import a namespace:
```
using System.Runtime.InteropServices;
```

Then we can use the attribute above our `struct`. To get the runtime to optimize things for us we can use the `Auto` option:
```
[StructLayout(LayoutKind.Auto)]
```
There are 2 other options, the `Sequential` option will keep the order as we declared it, and the `Explicit` option will require us to use `[FieldOffset(<offset here>)] ` attributes for each member because we are now in charge of manually placing each of them