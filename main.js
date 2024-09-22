import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Chart from "chart.js/auto";

let countriesData;

// Fetch data from REST Countries API
fetch("https://restcountries.com/v3.1/all?fields=name,population,latlng")
  .then((response) => response.json())
  .then((data) => {
    countriesData = data
      .filter((country) => country.population > 0 && country.latlng)
      .sort((a, b) => b.population - a.population)
      .slice(0, 15);
    initScene();
    createChart();
  })
  .catch((error) => console.error("Error fetching data:", error));

function initScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a);

  const container = document.getElementById("globe-container");
  const width = container.clientWidth;
  const height = container.clientHeight;
  const aspect = width / height;

  const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // Create Earth
  const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
  const textureLoader = new THREE.TextureLoader();
  const earthTexture = textureLoader.load("/earth_texture.jpg");
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
  const cubeMaterial = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    emissive: 0x330000,
  });

  const maxPopulation = Math.max(
    ...countriesData.map((country) => country.population)
  );
  const minPopulation = Math.min(
    ...countriesData.map((country) => country.population)
  );

  countriesData.forEach((country) => {
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    const [lat, lon] = country.latlng;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(Math.sin(phi) * Math.cos(theta)) * 5.1;
    const z = Math.sin(phi) * Math.sin(theta) * 5.1;
    const y = Math.cos(phi) * 5.1;
    cube.position.set(x, y, z);

    // Calculate the scale factor using a logarithmic scale
    const scaleFactor =
      (Math.log(country.population) - Math.log(minPopulation)) /
      (Math.log(maxPopulation) - Math.log(minPopulation));

    // Apply the scale factor, ensuring a minimum size and a maximum size
    const minScale = 0.1;
    const maxScale = 1.0;
    const scale = minScale + scaleFactor * (maxScale - minScale);

    cube.scale.setScalar(scale);
    globeGroup.add(cube);
  });

  camera.position.z = 15;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  function animate() {
    requestAnimationFrame(animate);
    globeGroup.rotation.y += 0.001;
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", onWindowResize, false);

  function onWindowResize() {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  }

  onWindowResize();
}

function createChart() {
  const ctx = document.getElementById("sales-chart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: countriesData.map((country) => country.name.common),
      datasets: [
        {
          label: "Population",
          data: countriesData.map((country) => country.population),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          bottom: 35,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "#f0f0f0",
          },
        },
        x: {
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "#f0f0f0",
            maxRotation: 45,
            minRotation: 45,
            autoSkip: false,
            font: {
              size: 10,
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}
