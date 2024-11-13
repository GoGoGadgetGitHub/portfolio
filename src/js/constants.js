import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const SUN_RADIUS = 200

;
export const SCENE = new THREE.Scene();
export const CAMERA = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100000
);
export const RENDERER = new THREE.WebGLRenderer({
    antialias: true
});
RENDERER.setSize(window.innerWidth, window.innerHeight);

//Camera Controls
export const CONTROLS = new OrbitControls(CAMERA, RENDERER.domElement);
CAMERA.position.set(-995, 304, -45)
CONTROLS.update();