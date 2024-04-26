import * as THREE from 'three';
import { throttle } from 'lodash-es';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// =================== Constants
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const canvas = document.querySelector('canvas.webgl');

const scene = new THREE.Scene();

// =============== Texture Loader
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();


// =============== Models
let eyeBall1;
let eyeBall2;

let pupil1;
let pupil2;

let catEye1CenterX;
let catEye1CenterY;

// Animation variables
let mixer;
let legBonesAction;
let cupAction;

// Cup and Leg loop once
let hasAnimiationPlayed = false;
// Eyes
let enlargeEyes = false;
let enlargeEyesCounter = 0;
const enlargeEyesDuration = 420;

gltfLoader.load(
    '/src/assets/models/secondcat.glb',
    (gltf) => {
        console.log(gltf);

        gltf.scene.scale.set(1, 1, 1);
        gltf.scene.position.y = -4.0;
        gltf.scene.position.x = -2.0;
        gltf.scene.position.z = -10;

        scene.add(gltf.scene);
        // ========================= NEW IMPL SECOND CAT =====================
        gltf.scene.traverse((child) => {
            if (child.name === 'EyeBoneL') eyeBall1 = child;
            if (child.name === 'EyeBoneR') eyeBall2 = child;
  
            if (child.name === 'PupilL') pupil1 = child;
            if (child.name === 'PupilR') pupil2 = child;
        })

        // =================== Cat eye position in pixels
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
        catEye1CenterX = (WIDTH / 2) + catEye1ScreenPositionX;
        catEye1CenterY = (HEIGHT / 2) + catEye1ScreenPositionY;

        // Tail Animation
        mixer = new THREE.AnimationMixer(gltf.scene);

        let tailClip = THREE.AnimationClip.findByName(gltf.animations, 'TailBonesAction');
        const tailBonesAction = mixer.clipAction(tailClip);
        tailBonesAction.play();

        let legClip = THREE.AnimationClip.findByName(gltf.animations, 'LegBonesAction');
        legBonesAction = mixer.clipAction(legClip);
        legBonesAction.setLoop(THREE.LoopOnce);
        legBonesAction.clampWhenFinished = true;
        legBonesAction.enable = true;

        let cupClip = THREE.AnimationClip.findByName(gltf.animations, 'CupAction');
        cupAction = mixer.clipAction(cupClip);
        cupAction.setLoop(THREE.LoopOnce);
        cupAction.clampWhenFinished = true;
        cupAction.enable = true;
    }
);


// ================= Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);


// ================= Objects
// const cubeCenter = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial({ color: 'yellow' }),
// );
// cubeCenter.position.z = -4;
// scene.add(cubeCenter);

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 'green' }),
);
cube.position.z = -4;
cube.position.y = -3.5;
cube.position.x = 0;
scene.add(cube);

// =================== Camera and Controls
const frustrumSize = 10;
const aspectRatio = WIDTH / HEIGHT;
// const camera = new THREE.PerspectiveCamera(75, WIDTH/HEIGHT, 0.1, 100);
// camera.position.set(- 3, 3, 3);
// camera.position.z = 10;
const camera  = new THREE.OrthographicCamera(
    frustrumSize * aspectRatio / -2, // left
    frustrumSize * aspectRatio / 2, // right
    frustrumSize / 2, // top
    frustrumSize / -2, // bottom
    1, // near
    100, // far
);
scene.add(camera);

// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

// ===================== Detect mouse over square/coffee mug

// Top Left
const cubeTopLeftPosition = new THREE.Vector3(
    cube.position.x - (cube.geometry.parameters.width / 2),
    cube.position.y + (cube.geometry.parameters.height / 2),
    cube.position.z,
);
cubeTopLeftPosition.project(camera); // normalize position

// const cubeTopLeftX = (1 + cubeTopLeftPosition.x) / 2 * WIDTH;
// const cubeTopLeftY = (1 - cubeTopLeftPosition.y) / 2 * HEIGHT;

// Top Right
// const cubeTopRightPosition = new THREE.Vector3(
//     cube.position.x + (cube.geometry.parameters.width / 2),
//     cube.position.y + (cube.geometry.parameters.height / 2),
//     cube.position.z,
// );
// cubeTopRightPosition.project(camera); // normalize position

// const cubeTopRightX = (1 + cubeTopRightPosition.x) / 2 * WIDTH;
// const cubeTopRightY = (1 - cubeTopRightPosition.y) / 2 * HEIGHT;
// console.log('top right x and y', cubeTopRightX, cubeTopRightY);

// Bottom Left
// const cubeBottomLeftPosition = new THREE.Vector3(
//     cube.position.x - (cube.geometry.parameters.width / 2),
//     cube.position.y - (cube.geometry.parameters.height / 2),
//     cube.position.z,
// );
// cubeBottomLeftPosition.project(camera); // normalize position

// const cubeBottomLeftX = (1 + cubeBottomLeftPosition.x) / 2 * WIDTH;
// const cubeBottomLeftY = (1 - cubeBottomLeftPosition.y) / 2 * HEIGHT;
// console.log('bottom left x and y', cubeBottomLeftX, cubeBottomLeftY);

// Bottom Right
const cubeBottomRightPosition = new THREE.Vector3(
    cube.position.x + (cube.geometry.parameters.width / 2),
    cube.position.y - (cube.geometry.parameters.height / 2),
    cube.position.z,
);
cubeBottomRightPosition.project(camera); // normalize position

// const cubeBottomRightX = (1 + cubeBottomRightPosition.x) / 2 * WIDTH;
// const cubeBottomRightY = (1 - cubeBottomRightPosition.y) / 2 * HEIGHT;

// All 4 coordinates
const cubeLeftSide =  (1 + cubeTopLeftPosition.x) / 2 * WIDTH;
const cubeRightSide = (1 + cubeBottomRightPosition.x) / 2 * WIDTH;
const cubeTop = (1 - cubeTopLeftPosition.y) / 2 * HEIGHT;
const cubeBottom = (1 - cubeBottomRightPosition.y) / 2 * HEIGHT;

// =================== Renderer
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
});
renderer.setSize(WIDTH, HEIGHT);
renderer.render(scene, camera);

// =================== Mouse motions
const cursor = { x: 0, y: 0 }; 

document.addEventListener('mousemove', throttle((e) => {
    if (catEye1CenterX && catEye1CenterY) {
        cursor.x = THREE.MathUtils.clamp(e.clientX - catEye1CenterX, -300, 300);
        cursor.y = THREE.MathUtils.clamp(e.clientY - catEye1CenterY, -400, 400);

        if (
            !hasAnimiationPlayed
            && (e.clientX > cubeLeftSide && e.clientX < cubeRightSide)
            && (e.clientY > cubeTop && e.clientY < cubeBottom)
        ) {
            enlargeEyes = true;
            pupil1.scale.x = 2.5;
            pupil2.scale.x = 2.5;

            if (!hasAnimiationPlayed) {
                hasAnimiationPlayed = true;
                legBonesAction.play();
                cupAction.play();
            }
        }
        else if (hasAnimiationPlayed && enlargeEyesCounter >= enlargeEyesDuration) {
            enlargeEyes = false;
            pupil1.scale.x = 1;
            pupil2.scale.x = 1;
        }
    }
}, 100));

const maxAngle = 45; // new range
const minAngle = -45; // new range
const maxPixelsX = 300; // old range
const minPixelsX = -300; // old range
const maxPixelsY = 400; // old range
const minPixelsY = -400; // old range

// =================== Render loop
const clock = new THREE.Clock();

const loop = () => {
    if (mixer) {
        mixer.update(clock.getDelta());
    }

    // =============== Rotation solution works on the meshes directly
    if (catEye1CenterX && catEye1CenterY) {
        const newAngleY = (((cursor.x - minPixelsX) * maxAngle) / maxPixelsX) + minAngle;
        const newAngleX = (((cursor.y - minPixelsY) * maxAngle) / maxPixelsY) + minAngle;
 
        eyeBall1.rotation.x = THREE.MathUtils.degToRad(newAngleX - eyeBall1.rotation.x);
        eyeBall1.rotation.y = THREE.MathUtils.degToRad(newAngleY - eyeBall1.rotation.y);

        eyeBall2.rotation.x = THREE.MathUtils.degToRad(newAngleX - eyeBall2.rotation.x);
        eyeBall2.rotation.y = THREE.MathUtils.degToRad(newAngleY - eyeBall2.rotation.y);
    }

    // Pupil meshes are loaded, and animation can run from mousemove
    if (pupil1 && pupil2 && enlargeEyes && enlargeEyesCounter < enlargeEyesDuration) {
        enlargeEyesCounter += 1;
    }

    // Render
    renderer.render(scene, camera);

    // Call loop again on the next frame
    // window.requestAnimationFrame(loop);
}
renderer.setAnimationLoop(loop);

loop();