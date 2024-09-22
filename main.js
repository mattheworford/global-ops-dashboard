import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Chart from 'chart.js/auto';

// Set up the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a); // Dark background for the scene

const container = document.getElementById('globe-container');
const aspect = container.clientWidth / container.clientHeight;
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Create Earth
const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load('/earth_texture.jpg');
const earthMaterial = new THREE.MeshPhongMaterial({ 
    map: earthTexture,
    bumpMap: earthTexture,
    bumpScale: 0.05,
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Reduced intensity for darker theme
scene.add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7); // Increased intensity to compensate for darker theme
directionalLight.position.set(5, 3, 5);
scene.add(directionalLight);

// Add data points (red cubes)
const cubeGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: 0x330000 }); // Added emissive for glow effect

for (let i = 0; i < 10; i++) {
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    const phi = Math.acos(-1 + (2 * i) / 10);
    const theta = Math.sqrt(10 * Math.PI) * phi;
    cube.position.setFromSphericalCoords(5.2, phi, theta);
    scene.add(cube);
}

camera.position.z = 15;

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    earth.rotation.y += 0.001;
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Create the chart
const ctx = document.getElementById('sales-chart').getContext('2d');
new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['USA', 'China', 'India', 'Brazil', 'Russia'],
        datasets: [{
            label: 'Sales (millions $)',
            data: [120, 100, 80, 60, 40],
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)' // Lighter grid lines
                },
                ticks: {
                    color: '#f0f0f0' // Light colored ticks
                }
            },
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)' // Lighter grid lines
                },
                ticks: {
                    color: '#f0f0f0' // Light colored ticks
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#f0f0f0' // Light colored legend text
                }
            }
        }
    }
});

// Handle window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    const newAspect = container.clientWidth / container.clientHeight;
    camera.aspect = newAspect;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Initial call to set the correct size
onWindowResize();