import * as THREE from '/libs/three125/three.module.js';
import { GLTFLoader } from '/libs/three/jsm/GLTFLoader.js';
import { RGBELoader } from '/libs/three/jsm/RGBELoader.js';

class App {
    constructor() {
        const container = document.createElement('div');
        document.body.appendChild(container);

        this.assetsPath = '/assets/ar-shop/';
        this.pancake = null;

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
        this.scene = new THREE.Scene();

        const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        this.scene.add(ambient);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.xr.enabled = true;
        container.appendChild(this.renderer.domElement);

        this.setEnvironment();
        this.loadModel();
        this.initAR();

        window.addEventListener('resize', this.resize.bind(this));

        this.renderer.setAnimationLoop(this.render.bind(this)); // Continuous rendering
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    setEnvironment() {
        const loader = new RGBELoader().setDataType(THREE.UnsignedByteType);
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        pmremGenerator.compileEquirectangularShader();

        loader.load('/assets/hdr/venice_sunset_1k.hdr', (texture) => {
            const envMap = pmremGenerator.fromEquirectangular(texture).texture;
            pmremGenerator.dispose();
            this.scene.environment = envMap;
        }, undefined, (err) => {
            console.error('Error setting environment:', err);
        });
    }

    loadModel() {
        const loader = new GLTFLoader().setPath(this.assetsPath);
        loader.load('pancake.glb', (gltf) => {
            this.pancake = gltf.scene;
            this.pancake.position.set(0, 0, -2); // Adjust position if needed
            this.scene.add(this.pancake);
        }, undefined, (error) => {
            console.error('Error loading model:', error);
        });
    }

    async initAR() {
        if (!navigator.xr) {
            console.error("WebXR not supported on this device.");
            return;
        }

        try {
            const session = await navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['local-floor'] });
            this.renderer.xr.setReferenceSpaceType('local');
            this.renderer.xr.setSession(session);
        } catch (error) {
            console.error("Failed to start AR session:", error);
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

export { App };
