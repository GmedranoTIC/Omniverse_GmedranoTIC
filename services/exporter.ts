
import { WorldState } from '../types';

export const exportWorldToHTML = (state: WorldState): string => {
  // Obfuscate the GLB URLs slightly or just bundle state
  // In a real production app, we would use a build step to bundle Three.js
  const worldData = JSON.stringify(state);

  return `
<!DOCTYPE html>
<html>
<head>
    <title>My Virtual World</title>
    <meta charset="UTF-8">
    <style>
        body { margin: 0; background: #000; overflow: hidden; }
        canvas { display: block; }
        #overlay { position: fixed; top: 20px; left: 20px; color: white; font-family: sans-serif; pointer-events: none; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
    </style>
    <script async src="https://unpkg.com/es-module-shims@1.6.3/dist/es-module-shims.js"></script>
    <script type="importmap">
    {
        "imports": {
            "three": "https://unpkg.com/three@0.154.0/build/three.module.js",
            "three/addons/": "https://unpkg.com/three@0.154.0/examples/jsm/"
        }
    }
    </script>
</head>
<body>
    <div id="overlay">
        <h1>Virtual World</h1>
        <p>Use WASD to Move, Mouse to Look</p>
    </div>
    <script type="module">
        import * as THREE from 'three';
        import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
        import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

        const world = ${worldData};
        
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#0a0a0a');
        
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 2, 5);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        document.body.appendChild(renderer.domElement);

        const controls = new PointerLockControls(camera, document.body);
        document.addEventListener('click', () => controls.lock());

        // Lights
        const amb = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(amb);
        const sun = new THREE.PointLight(0xffffff, 1.5);
        sun.position.set(10, 20, 10);
        scene.add(sun);

        // Ground
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshStandardMaterial({ color: world.groundColor || '#111' })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        // Load Objects
        const loader = new GLTFLoader();
        world.objects.forEach(obj => {
            if (obj.type === 'glb') {
                loader.load(obj.url, (gltf) => {
                    const model = gltf.scene;
                    model.position.set(...obj.position);
                    model.rotation.set(...obj.rotation);
                    model.scale.set(...obj.scale);
                    scene.add(model);
                });
            } else if (obj.type === 'text') {
                // Simplified text for export
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                ctx.font = '48px sans-serif';
                ctx.fillStyle = 'white';
                ctx.fillText(obj.content || '', 10, 50);
                const tex = new THREE.CanvasTexture(canvas);
                const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
                sprite.position.set(...obj.position);
                sprite.scale.set(obj.scale[0] * 2, obj.scale[1], 1);
                scene.add(sprite);
            }
        });

        // Movement Logic
        const move = { f: false, b: false, l: false, r: false };
        const vel = new THREE.Vector3();
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyW') move.f = true;
            if (e.code === 'KeyS') move.b = true;
            if (e.code === 'KeyA') move.l = true;
            if (e.code === 'KeyD') move.r = true;
        });
        document.addEventListener('keyup', (e) => {
            if (e.code === 'KeyW') move.f = false;
            if (e.code === 'KeyS') move.b = false;
            if (e.code === 'KeyA') move.l = false;
            if (e.code === 'KeyD') move.r = false;
        });

        function animate() {
            requestAnimationFrame(animate);
            if (controls.isLocked) {
                const delta = 0.016;
                const speed = 10;
                vel.x -= vel.x * 10 * delta;
                vel.z -= vel.z * 10 * delta;
                if (move.f) vel.z += speed * delta;
                if (move.b) vel.z -= speed * delta;
                if (move.l) vel.x -= speed * delta;
                if (move.r) vel.x += speed * delta;
                controls.moveRight(vel.x);
                controls.moveForward(vel.z);
            }
            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    </script>
</body>
</html>
  `;
};
