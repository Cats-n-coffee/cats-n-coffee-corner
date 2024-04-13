---
title: 'Improving Patterns - Getting rid of Multiple Conditionals'
pubDate: 2024-04-13
description: 'Notes from peer review'
author: 'Cats-n-Coffee'
image:
    url: ''
    alt: ''
tags: ["javascript", "improving patterns", "learning notes"]
introType: 'improvingPatternsIntro'
---

While implementing a function at work, I had a basic and common solution. While reviewing, my coworker (Senior dev) proposed another one, much more elegant.

To recreate the situation, let's assume we want to determine a parent directory from a path. The input is the path name, the expected output is the parent directory as a formatted string. Let's assume we have a capitalize function available in our project called 'capitalizeMyString'.

Given 6 different inputs, expecting their respective outputs:
```
'sedans/honda-civic'           --> 'Sedans',
'sedans/toyota-corolla'        --> 'Sedans',
'long-sedans/mercedes-class-s' --> 'Sedans',
'trucks/ford-f150'             --> 'Trucks',
'suvs/chevrolet-tahoe'         --> 'Suvs',
'small-suvs/nissan-juke'       --> 'Suvs',
```

A basic solution might be using multiple conditionals (could be a `switch`):
```
function findParentDir(path) {
	const splitPath = path.split('/');
	
	if (splitPath[0] === 'sedans') return 'Sedans';
	if (splitPath[0] === 'long-sedans') return 'Sedans';
	if (splitPath[0] === 'trucks') return 'Trucks';
	if (splitPath[0] === 'suvs') return 'Suvs';
	if (splitPath[0] === 'small-suvs') return 'Suvs'; 
}
```

A more elegant solution might be:
```
function findParentDir(path) {
	const splitPath = path.split('/');

	return {
		'long-sedans': 'Sedans',
		'small-suvs': 'Suvs',
	} [splitPath[0]] || capitalizeMyString(splitPath[0]);
}
```

## How To Think About It

There are some questions that might come in handy:
- What does the task/function needs to achieving?
- Why are the conditionals needed? Compare the condition to the part inside the block, and notice the differences/similarities . In this case we **match a string and return another** and both are very similar.
- How much variety of input to output is there? Some of those inputs are only capitalized.
- Are there "special cases" ? In this case only two (`long-sedans` and `small-suvs`).

## Conclusion

When doing pattern matching and small transformations/formatting, if the input is very similar to the expected output, and if there are special cases to handle, this makes a very clean solution. It is also faster than having to visit and check every condition when necessary, since we're using an object. A clumsy `console.time()` comparison seems to show the second solution is 15 milliseconds faster on the inputs above.