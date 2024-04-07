import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// =================== Constants
const width = window.innerWidth;
const height = window.innerHeight;
const canvas = document.querySelector('canvas.webgl');

const scene = new THREE.Scene();

// =============== Texture Loader
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();


// =============== Models
let mixer;
gltfLoader.load(
    '/src/assets/models/firstcat.glb',
    (gltf) => {
        console.log(gltf);

        mixer = new THREE.AnimationMixer(gltf.scene);
        const actionLeft = mixer.clipAction(gltf.animations[6]);
        actionLeft.play();
        const actionRight = mixer.clipAction(gltf.animations[8]);
        actionRight.play();

        gltf.scene.scale.set(15, 15, 15);
        gltf.scene.position.y = -12;
        // gltf.scene.position.x = 0;
        // gltf.scene.position.z = 8;
        scene.add(gltf.scene);
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


// =================== Camera and Controls
const camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 100);
// camera.position.set(- 3, 3, 3);
camera.position.z = 3;
scene.add(camera);

// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;


// =================== Renderer
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
});
renderer.setSize(width, height);
renderer.render(scene, camera);


// =================== Render loop
const clock = new THREE.Clock();

const loop = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update controls
    //controls.update();

    if (mixer) mixer.update(clock.getDelta());

    // Render
    renderer.render(scene, camera);

    // Call loop again on the next frame
    window.requestAnimationFrame(loop);
}

loop();