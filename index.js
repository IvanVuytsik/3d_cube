import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js'; 
 
    // ==================scene==================
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene.background = new THREE.Color('#f0f0f0');

    // ==================geometries and textures================== 
    const cubeGeometry = new THREE.BoxGeometry();
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xdda0dd });  
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

    // ===================custom user data==========================
    cube.userData = {
        clickedColor: new THREE.Color(0xffc0cb),
        unclickedColor: new THREE.Color(0xdda0dd),
        rotationSpeed: 2 * Math.PI ,
        initialScale: new THREE.Vector3(1, 1, 1),
    };
 
    scene.add(cube); 
    // ==================main functions==================
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
   
    let isRotating = false;
    let isScaling = false;
    // ==================scale helpers===================
    cube.scale.copy(cube.userData.initialScale); 

    const handleRadius = 0.1;
    const handleSegments = 16;

    const handleX = createHandle(1, 0, 0, 0xff0000); 
    const handleY = createHandle(0, 1, 0, 0x00ff00); 
    const handleZ = createHandle(0, 0, 1, 0x0000ff); 

    scene.add(handleX, handleY, handleZ);

    function createHandle(x, y, z, color) {
        const handleGeometry = new THREE.SphereGeometry(handleRadius, handleSegments, handleSegments);
        const handleMaterial = new THREE.MeshBasicMaterial({ color: color });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(x, y, z);
        return handle;
    }


    // ===================mouse click=====================
    function onMouseClick(event) {
        event.preventDefault();

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        //const intersects = raycaster.intersectObjects([cube]);
        const intersects = raycaster.intersectObjects([cube, handleX, handleY, handleZ]);

        if (intersects.length > 0) {  
            // change color on cube click and animate
                // user data 
            const clickedColor = cube.userData.clickedColor;
            const rotationSpeed = cube.userData.rotationSpeed;
    
            //cube.material.color.set(0xffc0cb); 
            cube.material.color.copy(clickedColor);
            isScaling = true; 
            rotateCube(rotationSpeed);  

            if (intersects[0].object === handleX) {
                scaleCube('x');
            } else if (intersects[0].object === handleY) {
                scaleCube('y');
            } else if (intersects[0].object === handleZ) {
                scaleCube('z');
            }

        } else {
            // change color on outer space click
                // user data 
            const unclickedColor = cube.userData.unclickedColor;

            //cube.material.color.set(0xdda0dd);
            cube.material.color.copy(unclickedColor); 
            render();
            }
    }

    // ==================event listener==================
    window.addEventListener('click', onMouseClick);

    // ==================scaling function==================
    function scaleCube(axis) {
        const scaleSpeed = 0.5; 
        const targetScale = 1.5; 

        const initialScale = cube.scale[axis];
        const targetScaleValue = initialScale < targetScale ? targetScale : 1;

        const duration = 1000;
        const startTime = Date.now();

        function updateScale() {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress < 1) {
               const easingProgress = 1 - Math.pow(1 - progress, scaleSpeed);  
                const newScale = initialScale + easingProgress * (targetScaleValue - initialScale);
                cube.scale[axis] = newScale;
                render();
                requestAnimationFrame(updateScale);
            } else {
                cube.scale[axis] = targetScaleValue;
                render();
 
            }
        }

        updateScale();
    }
    // ==================rotation animation==================
    function rotateCube() {
    if (!isRotating ) {
        isRotating = true;

        const startRotation = { y: cube.rotation.y };
        const targetRotation = { y: startRotation.y + Math.PI * 2 };

        const duration = 1000; 
        const startTime = Date.now();

        function updateRotation() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
            cube.rotation.y = startRotation.y + progress * (targetRotation.y - startRotation.y);
            render();
            requestAnimationFrame(updateRotation);
        } else { 
            isRotating = false;
        }
        }

        updateRotation();
    }
    }
    // ==================window resize==================
    window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
    });

    // ==================animation loop==================
    function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
    }


    function render() {
    renderer.render(scene, camera);
    } 

    animate();