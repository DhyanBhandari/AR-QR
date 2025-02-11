import * as THREE from '/libs/three125/three.module.js'; 
import { GLTFLoader } from '/libs/three/jsm/GLTFLoader.js';
import { RGBELoader } from '/libs/three/jsm/RGBELoader.js';

class App {
    constructor() {
        const container = document.createElement('div');
        document.body.appendChild(container);

        this.assetsPath = '/assets/ar-shop/';

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
        this.camera.position.set(0, 1.6, 0);

        this.scene = new THREE.Scene();

        const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        ambient.position.set(0.5, 1, 0.25);
        this.scene.add(ambient);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.xr.enabled = true;
        container.appendChild(this.renderer.domElement);

        this.setEnvironment();
        this.loadModel();
        this.initAR();

        window.addEventListener('resize', this.resize.bind(this));
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
            this.scene.add(gltf.scene);
            this.pancake = gltf.scene;
            this.pancake.position.set(0, 0, -2); // Adjust position if needed
        }, undefined, (error) => {
            console.error('Error loading model:', error);
        });
    }

    initAR() {
        navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['local-floor'] }).then((session) => {
            this.renderer.xr.setReferenceSpaceType('local');
            this.renderer.xr.setSession(session);
        }).catch(console.error);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

export { App };
