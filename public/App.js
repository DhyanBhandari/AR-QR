import * as THREE from '/libs/three125/three.module.js';
import { GLTFLoader } from '/libs/three/jsm/GLTFLoader.js';

class App {
    constructor() {
        this.assetsPath = '/assets/ar-shop/';
        this.initScene();
        this.initAR();
        window.addEventListener('resize', this.resize.bind(this));
    }

    initScene() {
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
        this.camera.position.set(0, 1.5, 3);

        // Scene setup
        this.scene = new THREE.Scene();

        // Enhanced lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
        keyLight.position.set(2, 2, 1);
        this.scene.add(keyLight);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            preserveDrawingBuffer: true // Important for AR
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.physicallyCorrectLights = true; // Enable physically correct lighting
        document.body.appendChild(this.renderer.domElement);

        // Load the model
        this.loadModel();
    }

    loadModel() {
        const loader = new GLTFLoader().setPath(this.assetsPath);
        
        // Create materials for different parts of the burger
        const bunMaterial = new THREE.MeshStandardMaterial({
            color: 0xE3B778, // Light brown for bun
            roughness: 0.8,
            metalness: 0.1
        });
        
        const lettuceMaterial = new THREE.MeshStandardMaterial({
            color: 0x4CAF50, // Green for lettuce
            roughness: 0.7,
            metalness: 0.1
        });
        
        const meatMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513, // Brown for meat patty
            roughness: 0.6,
            metalness: 0.2
        });

        const tomatoMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF6B6B, // Red for tomato
            roughness: 0.6,
            metalness: 0.1
        });

        loader.load(
            'pancake.glb',
            (gltf) => {
                this.scene.add(gltf.scene);
                this.model = gltf.scene;

                // Position and scale
                this.model.position.set(0, -0.3, -0.5);
                this.model.scale.set(1.2, 1.2, 1.2);

                // Apply materials based on mesh names
                this.model.traverse((child) => {
                    if (child.isMesh) {
                        // Keep original textures if they exist
                        if (child.material.map) {
                            child.material.map.encoding = THREE.sRGBEncoding;
                            child.material.needsUpdate = true;
                        } 
                        
                        // Enable shadows
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                console.log('Model Loaded:', this.model);
                this.renderer.setAnimationLoop(this.render.bind(this));
            },
            undefined,
            (error) => {
                console.error('Error loading model', error);
            }
        );
    }

    initAR() {
        if (navigator.xr) {
            navigator.xr.requestSession('immersive-ar', { 
                requiredFeatures: ['hit-test'],
                optionalFeatures: ['light-estimation']
            }).then((session) => {
                this.renderer.xr.setReferenceSpaceType('local');
                this.renderer.xr.setSession(session);
            }).catch((err) => console.error('Failed to start AR session', err));
        } else {
            console.error('WebXR not supported');
        }
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render(timestamp, frame) {
        this.renderer.render(this.scene, this.camera);
    }
}

export { App };