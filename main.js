import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Chart from 'chart.js/auto';

let salesData;

// Fetch the sales data
fetch('/sales_data.json')
    .then(response => response.json())
    .then(data => {
        salesData = data;
        initScene();
        createChart();
    });

function initScene() {
    // Set up the scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    const container = document.getElementById('globe-container');
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Create a group to hold the Earth and data points
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

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
    globeGroup.add(earth);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Add data points
    const cubeGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: 0x330000 });

    salesData.countries.forEach(country => {
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        const [lat, lon] = country.coordinates;
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const x = -(Math.sin(phi) * Math.cos(theta)) * 5;
        const z = (Math.sin(phi) * Math.sin(theta)) * 5;
        const y = (Math.cos(phi)) * 5;
        cube.position.set(x, y, z);
        cube.scale.setScalar(country.sales / 50); // Scale cube size based on sales
        globeGroup.add(cube);
    });

    camera.position.z = 15;

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        globeGroup.rotation.y += 0.001;
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

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
}

function createChart() {
    const ctx = document.getElementById('sales-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: salesData.countries.map(country => country.name),
            datasets: [{
                label: 'Sales (billions $)',
                data: salesData.countries.map(country => country.sales),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
                ],
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#f0f0f0'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#f0f0f0'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#f0f0f0'
                    }
                }
            }
        }
    });
}