import * as THREE from '/libs/three125/three.module.js';
import { GLTFLoader } from '/libs/three/jsm/GLTFLoader.js';

class App {
    constructor() {
        this.assetsPath = '/assets/ar-shop/';
        this.pancake = null;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

        const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        this.scene.add(ambient);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.xr.enabled = true;

        this.loadModel();

        // Delay AR session start until user interaction (fix for permissions issue)
        document.addEventListener('click', () => this.initAR(), { once: true });
    }

    loadModel() {
        const loader = new GLTFLoader().setPath(this.assetsPath);
        loader.load('pancake.glb', (gltf) => {
            this.pancake = gltf.scene;
            this.pancake.scale.set(1, 1, 1);
            this.scene.add(this.pancake);
        }, undefined, (error) => {
            console.error('Error loading model:', error);
        });
    }

    async initAR() {
        if (!navigator.xr) {
            alert("WebXR not supported on this device.");
            return;
        }

        try {
            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['local-floor']
            });

            this.renderer.xr.setReferenceSpaceType('local');
            this.renderer.xr.setSession(session);
            document.body.appendChild(this.renderer.domElement);

            session.addEventListener('end', () => {
                console.log("AR session ended");
            });

            this.renderer.setAnimationLoop(this.render.bind(this));
        } catch (error) {
            console.error("Failed to start AR session:", error);
            alert("AR session failed to start. Please ensure permissions are granted.");
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

export { App };
