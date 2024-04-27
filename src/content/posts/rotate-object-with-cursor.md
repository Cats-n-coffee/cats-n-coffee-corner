---
title: 'Rotate an Object According to Cursor Position in ThreeJs'
pubDate: 2024-04-27
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

The goal is to have the cat's eyes tracking the cursor. In other words, the eyes should rotate according to the cursor position on the scene. As an example, if the cursor is in the top right corner of the scene, the eyes should look up and to the right. Note that this is a fixed scene without any controls, the only interaction is with the mouse position. 
### Summary of a Hilarious Eye Rotation Experience

To get a baseline (and understand where to begin), it started with adding basic code for listening to the `mousemove` event and update an object's `cursor.x` and `cursor.y` positions with their `event.clientX` and `Y` respective values. Then inside the `loop` function of the scene, adding this line `eyeBall.rotation.y = cursor.x;`. Result was funny and creepy, and gave insights about the next steps.

## Breaking Down the Problem

After briefly trying to get the actual eye mesh from the cat model to follow the cursor, it becomes clear that the problem needs to be broken down into multiple parts, and work on each individually. As the title suggests, this post is about breaking down the problem to rotate an *object* according to cursor position (not the eyes of the cat just yet).

Summary of the steps:
1. Grab a piece of paper and a pencil.
2. Understand the problem: translate eye rotation - cursor movement relationship into simple rules.
3. Simplify the problem: break it down into multiple tasks.
4. Implement pieces in a simplified environment.
5. Build up complexity as needed.

The following code and explanation assume there is basic ThreeJs scene setup with a cube, and the canvas takes the entire viewport (we'll use the window width and height).  
### Determine Eye Movements and the Relation to the Cursor

On paper, we can draw a simple rectangle representing the screen, a simple cat head with eyes in the middle of the rectangle, and identify our X and Y axes.

Which kind of rotation do we need? We might have at least two parts to consider:
1. Our cursor moves on a "flat" plane with X and Y coordinates, so we probably will use rotation on those same axes, as our cursor cannot move on the Z axis.
2. Let's consider eye rotation (Note: I am not responsible for any injuries if you try the following). Similar to a doctor's tests, with your finger vertical in front of you, if you move your finger up and down, that's rotation on X. If you move your finger left to right, that's rotation on Y.
   This gives us the eye rotation - target (cursor) translation relationship. 

We can summarize like this:
```
Eyes rotate left/right --> rotation on Y
Eyes rotate up/down --> rotation on X
```

Back to the piece of paper, to understand which rotation (X or Y) is affected by the cursor's position (X or Y).
Let's place a point directly to the right of the cat. If that point is our cursor and our cat looks at it, then we can observe that cursor's X (`clientX`) position affects left and right rotation.
If we place a point directly above the head of the cat,  the cat would look up, and we can observe that cursor's Y (`clientY`)position affects up and down rotation.

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

To keep things simple, we'll keep the center of the scene as our (0, 0) coordinates, so rotations happen from the center of the cube (which is placed in the middle by ThreeJs by default). But outside of ThreeJs, since the (0, 0) of the viewport is by default the top left corner, we need to adjust that.

Back to the piece of paper. Let's draw a rectangle (our viewport), a cube in the center (our cube), and split the viewport in four quadrants intersecting in the middle. 
Since our cube has the correct center, we need to bring our cursor up to speed, so they both have their center in the middle of the viewport.
We'll update the mouse move listener (might be a good idea to throttle such event):
```javascript
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};
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

We'll simplify this to start, and use ranges starting at 0. Therefore, eye rotation range is `[0, 45]`, and cursor range `[0, 300]`. That means we're only paying attention to the right half of the viewport for now.

Let's update our mouse move listener to take the smallest of values for the X axis:
```javascript
document.addEventListener('mousemove', throttle((e) => {
    cursor.x = Math.min(e.clientX - (sizes.width / 2), 300);
    cursor.y = -(e.clientY - (sizes.height / 2));
}, 100));
```
Note that this won't work for the left side, we're only using this to test the right side.

We have two ranges (`[0, 300]` and `[0, 45]`), we need to translate one to the other, to get: `cursor at 300px --> eyes rotated at 45 degrees`. So we'd need our pixels range to get converted into the degrees range. Google is our friend, and searching for `convert a range to another range`, eventually gets us on this [SO post](https://stackoverflow.com/questions/929103/convert-a-number-range-to-another-range-maintaining-ratio) . That's all we need:
```javascript
const maxAngle = 45; // new range
const maxPixels = 300; // old range

const newAngle = (((cursor.x - 0) * maxAngle) / maxPixels) + 0;
```

We're getting the correct angles according to cursor's X position. Now we need to rotate the cube.

## Rotating the Cube

If we try to plug our `newAngle` directly, we can see that the cube is rotating too much.
Adding this line to our `loop` function:
```javascript
cube.rotation.y = newAngle;
```
seems to make the cube rotating by this angle **on top of the current angle**. 
We probably need the difference between the current angle and the new angle:
```javascript
cube.rotation.y = newAngle - cube.rotation.y;
```
Nope, that's not it.

Logging those values, seems that they could be used indeed, just not like that.
There is also something that wasn't taken into account so far, the different kinds of rotations. We've been calculating degrees, while the model rotation is expressed in radians. [Here](https://byjus.com/maths/degrees-to-radians/) is a nice page to help out with the conversion.

Taking a big step back, commenting all the cube rotation updates and adding those two lines:
```javascript
// Add outside the loop
console.log(Math.PI * 0.25);
cube.rotation.y = Math.PI * 0.25;
```
Our cube is rotated 45 degrees, but the logged value is 0.7853... . So we know what value to expect once we plug the radians formula.

Let's convert our angle to radians and rotate the cube:
```javascript
// inside the loop
console.log((newAngle - cube.rotation.y) * Math.PI / 180); // ~ 0.78...
cube.rotation.y = (newAngle - cube.rotation.y) * Math.PI / 180;
```

If we bring the cursor all the way to right until the cube no longer rotates, we should log something close to 0.78... . Note that ThreeJs provides a `degToRad()` function in their Math utils. The final solution uses that, but while figuring out those steps, reading the formula was a nice thing to learn.

This seems like a good start for the right side.

## Adding the Left Side

All the logic and behavior holds for the left side, there one thing we need to update. In the mouse move listener, the `Math.min()` needs to be swapped for a clamp function. We could write one ourselves, or since we already have ThreeJs imported, we can use the one provided. Our event handler looks like this:
```javascript
document.addEventListener('mousemove', throttle((e) => {
    cursor.x = THREE.MathUtils.clamp(e.clientX - (sizes.width / 2), -300, 300);
    cursor.y = THREE.MathUtils.clamp(-(e.clientY - (sizes.height / 2)), -400, 400);
}, 100));
```

We can also clamp the values for the cursor Y while we're there.

## Adding Up and Down Rotations

All the logic is the same, we only need to swap X values for Y values, and declare a new variable for `maxPixelsY`. So far, it also seems that the minus sign to invert the `clientY` value can be removed, at least for this simple cube.

This is the cleaned up code for the event listener and constants:
```javascript
const cursor = { x: 0, y: 0 };
const maxAngle = 45; // new range
const maxPixelsX = 300; // old range
const maxPixelsY = 400; // old range

document.addEventListener('mousemove', throttle((e) => {
    cursor.x = THREE.MathUtils.clamp(e.clientX - (sizes.width / 2), -maxPixelsX, maxPixelsX);
    cursor.y = THREE.MathUtils.clamp(e.clientY - (sizes.height / 2), -maxPixelsY, maxPixelsY);
}, 100));
```

And inside the `loop` function:
```javascript
const newAngleY = (((cursor.x - 0) * maxAngle) / maxPixelsX) + 0;
const newAngleX = (((cursor.y - 0) * maxAngle) / maxPixelsY) + 0;

cube.rotation.y = (newAngleY - cube.rotation.y) * Math.PI / 180;
cube.rotation.x = (newAngleX - cube.rotation.x) * Math.PI / 180;
```

This is a great start, next step will be to apply this to a model with the position offset to the left and lower half of the viewport. This means the cursor's (0, 0) will need to be adjusted to match the object's position.

## Make an Object the Pivot Point

So far, we were using the default's ThreeJs object positioning in the center of the scene, and adjusted our cursor's (0, 0) coordinates accordingly. But once we transfer all this to the cat model, this won't work, because the cat won't be at the center of the scene. 

Let's make the object the cursor's (0, 0). To start, we'll need the object's coordinates in pixels. 

```javascript
const cubePosition = cube.position.clone();
cubePosition.project(camera); // values in [-1, 1] range

// offset from center of the scene - we can round the values
const cubeScreenPositionX = Math.round(cubePosition.x * (sizes.width / 2));
const cubeScreenPositionY = Math.round(cubePosition.y * (sizes.height / 2));
```

Then to update the cursor's (0, 0) coordinates, we can follow the same operations our object went through: from the center of the scene (0, 0), offset X and Y to the desired position.

```javascript
// (0, 0) at center of the scene + object offset
const objectCenterX = ((sizes.width / 2) + cubeScreenPositionX);
const objectCenterY = ((sizes.height / 2) + cubeScreenPositionY);

document.addEventListener('mousemove', throttle((e) => {
    cursor.x = THREE.MathUtils.clamp(e.clientX - objectCenterX, -maxPixelsX, maxPixelsX);
    cursor.y = THREE.MathUtils.clamp(e.clientY - objectCenterY, -maxPixelsY, maxPixelsY);

}, 100));
```

Previously, we did `e.clientX - (sizes.width / 2)` to place the cursor's (0, 0) from the usual top left, to the middle of the viewport.
Now, we need to move the cursor from the middle of the viewport to the center of our object, essentially adding the object's coordinates to half the viewport in both directions. 

## Testing on the Cat

After making a basic cat model in Blender with a body, a tail, two legs and two eyes (cat is sitting), we can add it to the scene and figure out the last parts.

Once the eye meshes are retrieved, it seems to work, besides the pivot point seems off. After doing some digging and debugging, logging the position of the cat, the eyes, and adding a center square, it's starting to make sense. The eye's position are *local* coordinates of the model, meaning that once we uploaded the model and retrieved the eyes coordinates, our mouse center was using the wrong numbers. 

We need to convert the eye local coordinates to the world's:
```javascript
// Inside gltfLoader.load()
// First, we need to convert the eye's local coordinates to the world's  
const catEye1PositionToWorld = new THREE.Vector3();
eyeBall1.localToWorld(catEye1PositionToWorld);
eyeBall1.updateMatrixWorld();

// Then clone the vector to "normalize it"
const catEye1Position = catEye1PositionToWorld.clone();
catEye1Position.project(camera); // normalize position

// Convert to pixels - distance from center converted to pixels
const catEye1ScreenPositionX = Math.round(catEye1Position.x * (WIDTH / 2));
const catEye1ScreenPositionY = Math.round(catEye1Position.y * (HEIGHT / 2));

// Make the object the cursor's center
catEye1CenterX = (WIDTH / 2) + catEye1ScreenPositionX; // Global Variable
catEye1CenterY = (HEIGHT / 2) + catEye1ScreenPositionY; // Global Variable
```

This is enough to re-center our mouse cursor to the eyes, and concludes this post.
The final code looks slightly different, re-organized and more performant from removing operations from the loop, as well as strengthening conditionals.

One take away not mentioned until now, if using imported models. If you are starting with ThreeJs (or any graphics tool) and starting with Blender (or another modeling tool), the model used for this, can make things harder. Here are a couple things I learned along the way:
- Check every mesh in Blender and ensure normals are re-calculated (rotations at 0, scale at 1),
- It's much easier to export  a model built at the world origin,
- When figuring out any animation, create a very simple mesh with the very minimum needed, because you'll likely modify it multiple times. And the fancy (unnecessary) stuff could get in the way.

