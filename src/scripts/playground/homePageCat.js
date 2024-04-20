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
let mixer;
let eyeBall1;
let eyeBall2;

let catEye1CenterX;
let catEye1CenterY;

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
            if (child.name === 'EyeBoneL') {
                eyeBall1 = child;
            }
            if (child.name === 'EyeBoneR') {
                eyeBall2 = child;
            }
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
    }
);


// ================= Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);


// ================= Objects
// const mesh = new THREE.Mesh(
//     new THREE.PlaneGeometry(10, 10),
//     new THREE.MeshStandardMaterial({ color: 'red', side: THREE.DoubleSide }),
// );
// mesh.rotation.x = Math.PI * 0.5;

// scene.add(mesh);

// const cubeCenter = new THREE.Mesh(
//     new THREE.BoxGeometry(0.5, 0.5, 0.5),
//     new THREE.MeshBasicMaterial({ color: 'yellow' }),
// );
// cubeCenter.position.z = -4;
// scene.add(cubeCenter);

// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(0.5, 0.5, 0.5),
//     new THREE.MeshBasicMaterial({ color: 'green' }),
// );
// cube.position.z = -4;
// cube.position.y = 4.55;
// cube.position.x = 0.4766;
// scene.add(cube);

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

    // Render
    renderer.render(scene, camera);

    // Call loop again on the next frame
    // window.requestAnimationFrame(loop);
}
renderer.setAnimationLoop(loop);

loop();