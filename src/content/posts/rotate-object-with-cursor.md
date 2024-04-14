---
title: 'Rotate an Object According to Cursor Position'
pubDate: 2024-02-06
description: 'Notes from building my first animation'
author: 'Cats-n-Coffee'
image:
    url: ''
    alt: ''
tags: ["webgl", "threejs", "javascript", "animations", "catsncoffeefirstcatanimation"]
introType: ''
---

This is the first post documenting the cat and coffee animation which will be on the home page of this blog. This scene will have multiple animations. This post is to explain the first steps of the cat eye-cursor tracking animation.

## The End Goal

The goal is to have the cat's eyes tracking the cursor. In other words, the eyes should rotate according the cursor position on the scene. As an example, if the cursor is in the top right corner of the scene, the eyes should look up and to the right. Note that this is a fixed screen without any controls, we only care about the mouse position. 
### Summary of a Hilarious Eye Rotation Experience

Just because of curiosity, it started with adding basic code for listening to the `mousemove` event and update an object's `cursor.x` and `cursor.y` positions with their `event.clientX` and `Y` respective values. Then inside the `loop` function of the scene, adding this line `eyeBall.rotation.y = cursor.x;`. Result was funny and creepy, of course not the solution, which turned out to be a little more than that.

## Breaking Down the Problem

After briefly trying to get the actual eye mesh from the cat model to follow the cursor, it becomes clear that the problem needs to be broken down into multiple parts, so we can simplify each piece of it, and get each one of these to work. As the title suggests, this post is about breaking down the problem to rotate an *object* according to cursor position (not the eyes of the cat just yet).

This is a summary of the steps:
1. Grab a piece of paper and a penCIL (if you grab a pen, that's up to you)

### Determine Eye Movements and the Relation to the Cursor

On paper, we can draw a simple rectangle representing the screen, a simple cat head with eyes in the middle of the rectangle, and identify our X and Y axes.

Which kind of rotation do we need? We might have at least two parts to consider:
1. Our cursor moves on a "flat" plane with X and Y coordinates, so we probably will use rotation on those same axes, as our cursor cannot move on the Z axis.
2. Let's consider eye rotation (Note: I am not responsible for any injuries if you try the following). Similar to doctor's tests, if you place your finger vertical in front of you, you'll notice we're rotating on the X and Y axes. 
   If you move your finger up and down, that's rotation on X. If you move your finger left to right, that's rotation on Y.

We can summarize like this:
```
Eyes rotate left/right --> rotation on Y
Eyes rotate up/down --> rotation on X
```

Back to the piece of paper. Let's place a point directly to the right of the cat. The cat would look to the right. If that point is our cursor and we only look at `clientX`, then we can observe that cursor's X position affects left and right rotation.
If we place a point directly above the head of the cat,  the cat would look up. If we only look at `clientY`, then we can observe that cursor's Y position affects up and down rotation.

We can reuse the previous summary:
```
Eyes rotate left/right --> rotation on Y --> cursor X position
Eyes rotate up/down --> rotation on X --> cursor Y position
```

We have the eye rotation - cursor position relation, let's port this to a simplified version of the scene.

### Rotating a Cube according to Cursor Position

To make things as simple as possible, we'll create a scene in ThreeJs having the following: a cube with a shader material allowing us to identify the center of each face, a perspective camera, some lights, a loop function, and our `mousemove` listener.

The `ShaderMaterial` can be as simple as this:
```c
// Vertex Shader:
varying vec2 vUv;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vUv = uv;
}

// Fragment Shader
varying vec2 vUv;

void main() {
    float strength = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5));
    gl_FragColor = vec4(vec3(strength), 1.0);
}
```

*Code is from the great ThreeJs Journey course, Shader Patterns chapter.*

To keep things simple, we'll keep the center of the scene as our (0, 0) coordinates, so rotations happen from the center of the cube (which is placed in the middle by ThreeJs by default). But since the (0, 0) of the viewport is by default the top left corner, we need to adjust that.

Back to the piece of paper. Let's draw a rectangle (our viewport), a cube in the center (our cube), and split the viewport in four quadrants intersecting in the middle. 
Since our cube has the correct center, we need to bring our cursor up to speed, so they both have their center in the middle of the viewport.
We'll update the mouse move listener (might be a good idea to throttle such event):
```javascript
const cursor = { x: 0, y: 0 };

document.addEventListener('mousemove', throttle((e) => {
    cursor.x = e.clientX - (sizes.width / 2);
    cursor.y = -(e.clientY - (sizes.height / 2));

}, 100));
```
 This will use the actual cursor position (original position from the top left corner) and subtract from it half of the screen width or height, leaving us with negative or positive values, starting from the center of the scene.

### Determine Ranges

To summarize to this point, we have the eye rotation - cursor position relation, both our scene and cursor using the same center/pivot point, and cursor values ranging `[-screenWidth, +screenWidth]` and `[-screenHeight, +screenHeight]`.

Let's determines our ranges, because in real life, cat or human eyes only rotate on a certain range. Let's start with left to right.
We'll use `[-45, 45]` degrees of eye rotation, and assume that past 45 degrees, the eyes won't rotate any more. That means we also need a range for our cursor.
We'll use `[-300, 300]` pixels (or fragments rather), and assume that if the cursor goes past those numbers, nothing more will happen.

We'll simply this to start, and use ranges starting at 0. Therefore, eye rotation range is `[0, 45]`, and cursor range `[0, 300]`. That means we're only paying attention to the right half of the viewport for now.

We have two ranges, which need to translate `cursor at 300px --> eyes rotated at 45 degrees`. So we'd need our pixels range to get converted into the degrees range. Google is our friend, and searching for `convert a range to another range`, eventually gets us on this [SO post](https://stackoverflow.com/questions/929103/convert-a-number-range-to-another-range-maintaining-ratio) . That's all we need:
```javascript
const maxAngle = 45; // new range
const maxPixels = 300; // old range

const newAngle = (((cursor.x - 0) * maxAngle) / maxPixels) + 0;
```






