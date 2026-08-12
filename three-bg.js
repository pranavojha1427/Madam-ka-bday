document.addEventListener("DOMContentLoaded", () => {
    // 1. Scene Setup
    const container = document.getElementById('bg-canvas');
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Particle Geometry
    const particlesCount = 1500;
    const posArray = new Float32Array(particlesCount * 3);

    // Generate random coordinates for each particle in 3D space
    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 12; // Spread across X, Y, Z
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // 3. Material Design (Customizing the look)
    const material = new THREE.PointsMaterial({
        size: 0.015,
        color: 0x3b82f6, // Matches the blue accent from your CSS
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);

    // 4. Mouse Interactivity
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (event) => {
        // Normalize mouse coordinates to a range of -0.5 to 0.5
        mouseX = (event.clientX / window.innerWidth) - 0.5;
        mouseY = (event.clientY / window.innerHeight) - 0.5;
    });

    // 5. Animation Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Constant slow rotation
        particlesMesh.rotation.y = -elapsedTime * 0.05;
        particlesMesh.rotation.x = elapsedTime * 0.02;

        // Smooth parallax effect reacting to the mouse
        particlesMesh.position.x += (mouseX * 0.5 - particlesMesh.position.x) * 0.05;
        particlesMesh.position.y += (-mouseY * 0.5 - particlesMesh.position.y) * 0.05;

        renderer.render(scene, camera);
    }

    animate();

    // 6. Handle Window Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});