---
title: 'Detect Cursor Position Over an Object'
pubDate: 2024-04-27
description: 'Notes from building my first animation'
author: 'Cats-n-Coffee'
image:
    url: ''
    alt: ''
tags: ["webgl", "threejs", "javascript", "animations", "catsncoffeefirstcatanimation"]
introType: ''
---

As part of the cat home page animations, there will be one for the cat to enlarge its eyes when the cursor is over (or in the radius, later on) of the coffee mug.

We'll have two main steps:
1. Find the object's position in pixels
2. Detect the cursor being over the object

## Find the Object's Position in Pixels

This is the main task. Before we start, let's think about the pieces we have: an object in a ThreeJs scene using a defined unit system with `(0, 0)` being at the center of the canvas, and our cursor  using pixels with its `(0, 0)` in the top left corner.

For simplicity, our object will be a cube from now on.

We could choose the center of our cursor to be in the center of the canvas (like the previous animation). But the top left corner seems to make more sense here since we don't need a pivot point, it will avoid too many conversions and make steps easier to follow. 
If `(0, 0)` is in the top left corner, we don't have much to do for our cursor, but our cube needs to convert its coordinates. In other words, we need to **convert world coordinates to screen coordinates**.

### Step 1: Find the Object's Position in the Scene

Let's retrieve the cube's position, but let's remember: this is the position of our **cube's center**, so we'll also need to get its width and height.
To get the entire surface of the cube, we can retrieve the top left corner and the bottom right corner:
```javascript
// Top Left
const cubeTopLeftPosition = new THREE.Vector3(
    cube.position.x - (cube.geometry.parameters.width / 2),
    cube.position.y + (cube.geometry.parameters.height / 2)
    cube.position.z,
);
cubeTopLeftPosition.project(camera); // normalize position

// Bottom Right
const cubeBottomRightPosition = new THREE.Vector3(
    cube.position.x + (cube.geometry.parameters.width / 2),
    cube.position.y - (cube.geometry.parameters.height / 2),
    cube.position.z,
);
cubeBottomRightPosition.project(camera); // normalize position
```

### Step 2: Convert to Pixels

Using these two corners, we can now get left, right, top and bottom values.
For each of these sides, we add 1 or subtract 1, depending on which direction we need to go. This will bring the values to a range `[0, 2]` instead of `[-1, 1]` from our `project()` call above. 
But we need values from `[0, 1]` in order to get our pixels, so we're dividing by 2 each one of them.
We then multiply by the width or height of the canvas (which is the same as the window here), depending on the direction we need.
```javascript
const cubeLeftSide =  (1 + cubeTopLeftPosition.x) / 2 * WIDTH; // x
const cubeRightSide = (1 + cubeBottomRightPosition.x) / 2 * WIDTH; // x
const cubeTop = (1 - cubeTopLeftPosition.y) / 2 * HEIGHT; // y
const cubeBottom = (1 - cubeBottomRightPosition.y) / 2 * HEIGHT; // y
```

## Handle Cube Detection 

For this part, we'll assume that we're testing the animation described at the top of the post, which enlarges the cat's pupils.

We'll have a `mousemove` event handler which checks if the cursor X is between the left and right values, and cursor Y between the top and bottom values:
```javascript
let enlargeEyes = false;

document.addEventListener('mousemove', throttle((e) => {
        if (
            (e.clientX > cubeLeftSide && e.clientX < cubeRightSide)
            && (e.clientY > cubeTop && e.clientY < cubeBottom)
        ) enlargeEyes = true;
        else enlargeEyes = false;
    }
}, 100));
```

Any effect can be handled once the cube is detected, in this case we're testing scaling the meshes of the cat's pupils, which is handled in the loop function for this test.

The final version handles the effect in the event handler above, which seemed like a better solution after finishing the animation with the rest of the pieces. It prevents modifying a property or checking a condition on every frame.