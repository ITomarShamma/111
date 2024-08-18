import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Boat from "./Physic";

// Initialize Boat

var boat = new Boat();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// // Textures
// const textureLoader = new THREE.TextureLoader();

// // Floor textures
// const grasscolorTexture = textureLoader.load(
//   "./textures/ocean/Screenshot 2024-05-31 214826.jpg"
// );
// const grassambientocculsionTexture = textureLoader.load(
//   "./textures/ocean/Screenshot 2024-05-31 215336.jpg"
// );
// const grassroughnessTexture = textureLoader.load(
//   "./textures/ocean/Screenshot 2024-05-31 215011.jpg"
// );
// const grassnormalTexture = textureLoader.load("./textures/ocean/Screenshot 2024-05-31 214619.jpg");

// Scene
const scene = new THREE.Scene();

const geometry = new THREE.CircleGeometry(20000, 20000);

// const material = new THREE.MeshStandardMaterial({
//   map: grasscolorTexture,
//   aoMap: grassambientocculsionTexture,
//   roughnessMap: grassroughnessTexture,
//   normalMap: grassnormalTexture,
// });

// const Meshfloor = new THREE.Mesh(geometry, material);
// Meshfloor.rotation.x = -Math.PI * 0.5;
// Meshfloor.position.y = 500;
// scene.add(Meshfloor);

// grasscolorTexture.repeat.set(18000, 18000);
// grassambientocculsionTexture.repeat.set(18000, 18000);
// grassnormalTexture.repeat.set(18000, 18000);
// grassroughnessTexture.repeat.set(18000, 18000);

// grasscolorTexture.wrapS = THREE.RepeatWrapping;
// grassambientocculsionTexture.wrapS = THREE.RepeatWrapping;
// grassnormalTexture.wrapS = THREE.RepeatWrapping;
// grassroughnessTexture.wrapS = THREE.RepeatWrapping;

// grasscolorTexture.wrapT = THREE.RepeatWrapping;
// grassambientocculsionTexture.wrapT = THREE.RepeatWrapping;
// grassnormalTexture.wrapT = THREE.RepeatWrapping;
// grassroughnessTexture.wrapT = THREE.RepeatWrapping;

// Lights
// const ambientLight = new THREE.AmbientLight("#ffffff", 0.75);
// scene.add(ambientLight);

const moonLight = new THREE.DirectionalLight("#ffffff", 0.5);
moonLight.position.set(4, 5, -2);
scene.add(moonLight);
const moonLight1 = new THREE.DirectionalLight("#ffffff", 0.5);
moonLight.position.set(-4, 5, -2);
scene.add(moonLight1);
const moonLight2 = new THREE.DirectionalLight("#ffffff", 0.5);
moonLight.position.set(4, 5, 2);
scene.add(moonLight2);
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
// directionalLight.position.set(100, 100, 100).normalize();
// directionalLight.target.position.set(0, 0, 0);
// scene.add(directionalLight);
// scene.add(directionalLight.target);
const upcolor = 0xffffff;
const downcolor = 0xffffff;
const light1 = new THREE.HemisphereLight(upcolor, downcolor,1.0);
scene.add(light1);
// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.onload = () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // // Update renderer
  // renderer.setSize(sizes.width, sizes.height);
  // renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
};

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(0, 10, -30);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enableZoom = false; // Disable zoom
controls.enableRotate = false; // Disable manual rotation
controls.enabled = false;  // Disable OrbitControls

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Resize
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Set renderer background color
renderer.setClearColor("#87ceeb");

// Axes Helper
// var axesHelper = new THREE.AxesHelper(500);
// scene.add(axesHelper);

// GLTF Loader
const loader = new GLTFLoader();
const mixers = [];
const models = [];
//let animationPaused = true;
const obstacleBoundingBox = new THREE.Box3(); // Bounding box for the obstacle
const oceanBox = new THREE.Box3() ;
const boatBox = new THREE.Box3();
const  cube1 = new THREE.Box3();
let obstacleCollisionMesh ;
let mixer; // Declare mixer in the global scope

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(100,100,100),
  new THREE.MeshPhongMaterial({color : 0x333333}),
);
cube.position.set(300,50,3);
cube.castShadow = true;
cube.receiveShadow = true;


cube1.setFromObject(cube);
scene.add(cube);
function loadBoatModel() {
  loader.load(
    "models/boat4.glb",
    function (gltf) {
      const model = gltf.scene;
      
      model.scale.set(0.2, 0.2, 0.2);
      scene.add(model);
      models.push(model);

      boat.setModel(model);
      
      boatBox.setFromObject(model);
      // Start animation loop only after the model is loaded
      if (models.length === 2) {
        animate();
      }
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

///////////////////////////////////////////////////////////////////////
// function loadModel(
//   modelPath,
//   modelLocation,
//   modelScale,
//   animationIndex,
//   modelRotations
// ) {
//   loader.load(
//     modelPath,
//     function (gltf) {
//       const model = gltf.scene;
//       model.scale.set(modelScale.x, modelScale.y, modelScale.z);
//       model.position.set(modelLocation.x, modelLocation.y, modelLocation.z);
//       model.rotation.set(modelRotations.x, modelRotations.y, modelRotations.z);
//       scene.add(model);
//       models.push(model);

//       // Start animation loop only after the model is loaded
//       if (models.length === 1) { // Assuming only one model to load
//         animate();
//       }
//     },
//     undefined,
//     function (error) {
//       console.error(error);
//     }
//   );
// }

// const modelPaths = [
//   "models/boat4.glb",
// ];

// const modelLocations = [
//   { x: 0, y: 0, z: 0 },
// ];

// const modelRotations = [
//   { x: 0, y: -Math.PI/180, z: 0 },
// ];

// const modelScales = [
//   { x: 0.1, y: 0.1, z: 0.1 },
// ];
//////////////////////////////////////////////////////////////////////////////////////////////

// // Load Boat Model
// function loadBoatModel() {
//   loader.load(
//     "models/boat4.glb",
//     function (gltf) {
//       const model = gltf.scene;
//       model.scale.set(0.1, 0.1, 0.1);
//       scene.add(model);
//       models.push(model);

//       boat.setModel(model);

//       // Start animation loop only after the model is loaded
//       if (models.length === 2) { // Ensure both boat and obstacle models are loaded
//         animate();
//       }
//     },
//     undefined,
//     function (error) {
//       console.error(error);
//     }
//   );
// }

// // Load Obstacle Model
// function loadObstacleModel() {
//   loader.load(
//     "models/fantasy_island.glb",
//     function (gltf) {
//       const model = gltf.scene;
//       model.scale.set(1, 1, 1);
//       model.position.set(50, 0, 0); // Set initial position of the obstacle
//       scene.add(model);
//       models.push(model);

//       obstacleBoundingBox.setFromObject(model);

//       // Start animation loop only after the model is loaded
//       if (models.length === 2) { // Ensure both boat and obstacle models are loaded
//         animate();
//       }
//     },
//     undefined,
//     function (error) {
//       console.error(error);
//     }
//   );
// }

// loadBoatModel();
// loadObstacleModel();

//const animationIndex = [];

// for (let i = 0; i < modelPaths.length; i++) {
//   loadModel(
//     modelPaths[i],
//     modelLocations[i],
//     modelScales[i],
//     animationIndex[i],
//     modelRotations[i]
//   );
// }
//models/scene.glb
//models/animated_water_surface.glb
// function loadSceneModels() {
//   loader.load("models/animated_water_surface.glb", function (gltf) {
//     const originalModel = gltf.scene.children[0];
//     mixer = new THREE.AnimationMixer(originalModel);

//     gltf.animations.forEach((clip) => {
//       mixer.clipAction(clip).play();
//     });
//     for (let i = 0; i < 5; i++) {
//       for (let j = 0; j < 5; j++) {
//         const positions = [
//           { x: i * 50, y: -70, z: j * 50 },
//           // { x: i * -50, y: -100, z: j * -50 },
//           // { x: i * 50, y: -100, z: j * -50 },
//           // { x: i * -50, y: -100, z: j * 50 },
//           // { x: i * 50, y: -400, z: j * 50 },
//           // { x: i * -50, y: -400, z: j * -50 },
//           // { x: i * 50, y: -400, z: j * -50 },
//           // { x: i * -50, y: -400, z: j * 50 }
//         ];
//         positions.forEach(pos => {
//           const newModel = originalModel.clone();
//           newModel.position.set(pos.x, pos.y, pos.z);
//           newModel.scale.set(1.5, 1.5, 1.5);
//           scene.add(newModel);
//         });
//       }
//     }
//   });
// }
function loadSceneModels() {
  loader.load("models/scene1.glb", function (gltf) {
    const originalModel = gltf.scene.children[0];
    //const oceanGeometry = originalModel.geometry;
    mixer = new THREE.AnimationMixer(originalModel);
    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    });

    // Set original model scale and position
     originalModel.scale.set(50, 50, 50);
     originalModel.position.set(0, -42, 0);

    // // Add the original model to the scene
     scene.add(originalModel);

    // Clone the model multiple times
    for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
              
              const positions = [
                { x: i * 1710, y: -42, z: j * 1420 },
                 { x: i * -1710, y: -42, z: j * -1420 },
                 { x: i * 1710, y: -42, z: j * -1420 },
                 { x: i * -1710, y: -42, z: j * 1420 },
                // { x: i * 50, y: -400, z: j * 50 },
                // { x: i * -50, y: -400, z: j * -50 },
                // { x: i * 50, y: -400, z: j * -50 },
                // { x: i * -50, y: -400, z: j * 50 }
              ];
              
              positions.forEach(pos => {
                const newModel = originalModel.clone();
                const newMixer = new THREE.AnimationMixer(newModel);
                gltf.animations.forEach((clip) => {
                newMixer.clipAction(clip).play();});
                mixers.push(newMixer);
                newModel.position.set(pos.x, pos.y, pos.z);
                newModel.scale.set(50, 50, 50);
                
                scene.add(newModel);
              });
              // Optional: add each cloned model to the mixer if they should have independent animations
              
            }
          }
    // for (let i = 0; i < 2; i++) {
    //   for (let j = 0; j < 2; j++) {
    //     if (i === 0 && j === 0) continue; // Skip adding the original model again

    //     const newModel = originalModel.clone();
    //     newModel.position.set(i * 1800, -50, j * 1500); // Adjust position as needed
    //     newModel.scale.set(50, 50, 50); // Adjust scale as needed
    //     scene.add(newModel);

        
    //   }
    // }
    // // Optional: add each cloned model to the mixer if they should have independent animations
    // const newMixer = new THREE.AnimationMixer(newModel);
    // gltf.animations.forEach((clip) => {
    //   newMixer.clipAction(clip).play();
    // });
    // mixers.push(newMixer); // Store the new mixer
  //   for (let i = 0; i < oceanGeometry.vertices.length; i++) {
  //     const vertex = oceanGeometry.vertices[i];
  
  //     // Check if the vertex is inside the boat's bounding box
  //     if (boatBox.containsPoint(vertex)) {
  //         // Remove or modify the vertex
  //         oceanGeometry.vertices.splice(i, 1);
  //         i--; // Adjust the index after removal
  //     }
  // }
  //oceanBox.setFromObject(newModel);
  //oceanGeometry.verticesNeedUpdate = true;
    animate();
  }, undefined, function (error) {
    console.error('An error occurred loading the model:', error);
  });
}
// function loadSceneModels() {
//   loader.load("models/animated_water_surface.glb", function (gltf) {
//     const originalModel = gltf.scene.children[0];
//     mixer = new THREE.AnimationMixer(originalModel);
//     gltf.animations.forEach((clip) => {
//       mixer.clipAction(clip).play();
//     });
//     originalModel.scale.set(1, 1, 1);
//     originalModel.position.set(0, -40, 0);
//     scene.add(originalModel);
//     boat.setModel(originalModel);


//     // for (let i = 0; i < 5; i++) {
//     //   for (let j = 0; j < 5; j++) {
        
//     //     const pos = { x: i * 50, y: -70, z: j * 50 };
//     //     const newModel = originalModel.clone();
//     //     newModel.position.set(pos.x, pos.y, pos.z);
//     //     newModel.scale.set(1.5, 1.5, 1.5);
//     //     scene.add(newModel);
//     //   }
//     // }
//     animate();
//   }, undefined, function (error) {
//     console.error('An error occurred loading the model:', error);
//   });
// }

// Load Obstacle Model
function loadObstacleModel() {
  loader.load(
    "models/fantasy_island.glb",
    function (gltf) {
      const model = gltf.scene;
      model.scale.set(1, 1, 1);
      model.position.set(500, 20, 0); // Set initial position of the obstacle

      // Calculate precise bounding box based on geometry
      // model.traverse((child) => {
      //   if (child.isMesh) {
      //     child.geometry.computeBoundingBox();
      //     obstacleBoundingBox.expandByObject(child);
      //   }
      // });

      scene.add(model);
      models.push(model);

      
      // loader.load(
      //   "models/fantasy_island.glb",
      //   function (collisionGltf) {
      //     const collisionModel = collisionGltf.scene;
      //     collisionModel.scale.set(1, 1, 1);
      //     collisionModel.position.set(500, 0, 0); // Ensure it has the same position as the main model
      //     //obstacleBoundingBox.setFromObject(model);
      //     // Set up collision detection using the simplified geometry
      //     const collisionMesh = collisionModel.children[0];
      //     obstacleCollisionMesh = collisionMesh;
      //     //obstacleCollisionMesh.setFromObject(model);
      //     // Add helper to visualize collision geometry
          
      //     const collisionHelper = new THREE.BoxHelper(collisionMesh, 0xff0000);
      //     scene.add(collisionHelper);

          
      //     // Start animation loop only after both models are loaded
      //     if (models.length === 2) {
      //       animate();
      //     }
      //   },
      //   undefined,
      //   function (error) {
      //     console.error(error);
      //   }

      // );
    
      obstacleBoundingBox.setFromObject(model);
      const collisionHelper = new THREE.BoxHelper(obstacleBoundingBox, 0xff0000);
          scene.add(collisionHelper);
      // Start animation loop only after the model is loaded
      if (models.length === 2) {
        animate();
      }
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

loadBoatModel();
//loadObstacleModel();
loadSceneModels();

var oldElapsedTime = 0;
var elapsedtime;
var deltatime;
const clock = new THREE.Clock();

function updateCameraPosition() {
  const offset = new THREE.Vector3(-50, 20, 0); // Adjust these values as needed
  const matrix = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(boat.rotation.x, boat.rotation.y, boat.rotation.z));
  const relativeOffset = offset.applyMatrix4(matrix);
  const cameraPosition = boat.position.clone().add(relativeOffset);

  // Smoothly transition camera position
  camera.position.lerp(cameraPosition, 0.1);

  // Update the camera target to look at the boat
  const targetPosition = boat.position.clone().add(new THREE.Vector3(0, 5, 0)); // Look slightly above the boat
  camera.lookAt(targetPosition);
}


function animate() {
  setTimeout(function () {
    requestAnimationFrame(animate);
  }, 30);

  // elapsed time
  elapsedtime = clock.getElapsedTime();
  deltatime = elapsedtime - oldElapsedTime;
  oldElapsedTime = elapsedtime;
  
  boat.update(deltatime);
  boat.checkCollisions(obstacleBoundingBox,cube1); // Check for collisions
  // Ensure models[0] is defined before accessing its properties
  if (models[0]) {
    // Update the boat model's position and rotation
    models[0].position.x = boat.position.x;
    // if (models[0].position.y < -400){
    //   velocity.length() = 0;
    // }
    models[0].position.y = boat.position.y;
    
    models[0].position.z = boat.position.z;
    
    // Assuming models[0].rotation.x represents the pitch rotation of the boat
    models[0].rotation.x = boat.rotation.x;
    models[0].rotation.y = boat.rotation.y;
    models[0].rotation.z = boat.rotation.z;
    
  }
  if (mixer) {
    mixer.update(deltatime); // Update the mixer for the original model
  }

  mixers.forEach((mixer) => {
    mixer.update(deltatime); // Update each additional mixer
  });
  
  //boat.checkCollisions(obstacleBoundingBox);
  updateCameraPosition();

  renderer.render(scene, camera);
  renderer.gammaOutput = true;
  renderer.gammaFactor = 2.2;
  renderer.outputEncoding = THREE.sRGBEncoding;
  
}

animate();
















// import "./style.css";
// import * as THREE from "three";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import * as dat from "dat.gui";
// import { gsap } from "gsap";
// import Boat from "./Physic";

// var boat = new Boat();

// // Canvas
// const canvas = document.querySelector("canvas.webgl");

// // Textures
// const textureLoader = new THREE.TextureLoader();

// // Floor textures
// const grasscolorTexture = textureLoader.load(
//   "./textures/ocean/Screenshot 2024-05-31 214826.jpg"
// );
// const grassambientocculsionTexture = textureLoader.load(
//   "./textures/ocean/Screenshot 2024-05-31 215336.jpg"
// );
// const grassroughnessTexture = textureLoader.load(
//   "./textures/ocean/Screenshot 2024-05-31 215011.jpg"
// );
// const grassnormalTexture = textureLoader.load("./textures/ocean/Screenshot 2024-05-31 214619.jpg");
// // const DisplacementTexture = textureLoader.load(
// //   "./textures/grass/Displacement.jpg"
// // );

// // Scene
// const scene = new THREE.Scene();

// const geometry = new THREE.CircleGeometry(20000, 20000);

// const material = new THREE.MeshStandardMaterial({
//   map: grasscolorTexture,
//   aoMap: grassambientocculsionTexture,
//   roughnessMap: grassroughnessTexture,
//   normalMap: grassnormalTexture,
//   // displacementMap: DisplacementTexture,
// });

// const Meshfloor = new THREE.Mesh(geometry, material);

// Meshfloor.rotation.x = -Math.PI * 0.5;
// Meshfloor.position.y = -2;
// scene.add(Meshfloor);

// grasscolorTexture.repeat.set(18000, 18000);
// grassambientocculsionTexture.repeat.set(18000, 18000);
// grassnormalTexture.repeat.set(18000, 18000);
// grassroughnessTexture.repeat.set(18000, 18000);
// // DisplacementTexture.repeat.set(18000, 18000);

// grasscolorTexture.wrapS = THREE.RepeatWrapping;
// grassambientocculsionTexture.wrapS = THREE.RepeatWrapping;
// grassnormalTexture.wrapS = THREE.RepeatWrapping;
// grassroughnessTexture.wrapS = THREE.RepeatWrapping;
// // DisplacementTexture.wrapS = THREE.RepeatWrapping;

// grasscolorTexture.wrapT = THREE.RepeatWrapping;
// grassambientocculsionTexture.wrapT = THREE.RepeatWrapping;
// grassnormalTexture.wrapT = THREE.RepeatWrapping;
// grassroughnessTexture.wrapT = THREE.RepeatWrapping;
// // DisplacementTexture.wrapT = THREE.RepeatWrapping;

// // Lights

// // Ambient light
// const ambientLight = new THREE.AmbientLight("#ffffff", 0.75);
// scene.add(ambientLight);

// // Directional light
// const moonLight = new THREE.DirectionalLight("#ffffff", 0.5);
// moonLight.position.set(4, 5, -2);
// scene.add(moonLight);

// // Sizes
// const sizes = {
//   width: window.innerWidth,
//   height: window.innerHeight,
// };

// window.onload = () => {
//   // Update sizes
//   sizes.width = window.innerWidth;
//   sizes.height = window.innerHeight;

//   // Update camera
//   camera.aspect = sizes.width / sizes.height;
//   camera.updateProjectionMatrix();

//   // Update renderer
//   renderer.setSize(sizes.width, sizes.height);
//   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// };

// // Camera
// const camera = new THREE.PerspectiveCamera(
//   75,
//   sizes.width / sizes.height,
//   0.1,
//   1000
// );
// camera.position.x = 15;
// camera.position.y = 10;
// camera.position.z = 70;
// scene.add(camera);

// // Controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

// // Renderer
// const renderer = new THREE.WebGLRenderer({
//   canvas: canvas,
// });
// renderer.setSize(sizes.width, sizes.height);
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// // Resize
// window.addEventListener("resize", () => {
//   // Update sizes
//   sizes.width = window.innerWidth;
//   sizes.height = window.innerHeight;

//   // Update camera
//   camera.aspect = sizes.width / sizes.height;
//   camera.updateProjectionMatrix();

//   // Update renderer
//   renderer.setSize(sizes.width, sizes.height);
//   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// });

// // Set renderer background color
// renderer.setClearColor("#87ceeb");

// // Axes Helper
// var axesHelper = new THREE.AxesHelper(500);
// scene.add(axesHelper);

// // GLTF Loader
// const loader = new GLTFLoader();
// const mixers = [];
// const models = [];
// let animationPaused = true;

// function loadModel(
//   modelPath,
//   modelLocation,
//   modelScale,
//   animationIndex,
//   modelRotations
// ) {
//   loader.load(
//     modelPath,
//     function (gltf) {
//       const model = gltf.scene;
//       model.scale.set(modelScale.x, modelScale.y, modelScale.z);
//       model.position.set(modelLocation.x, modelLocation.y, modelLocation.z);
//       model.rotation.set(modelRotations.x, modelRotations.y, modelRotations.z);
//       scene.add(model);
//       models.push(model);

//       // Start animation loop only after the model is loaded
//       if (models.length === 1) { // Assuming only one model to load
//         animate();
//       }
//     },
//     undefined,
//     function (error) {
//       console.error(error);
//     }
//   );
// }

// const modelPaths = [
//   "models/boat4.glb",
// ];

// const modelLocations = [
//   { x: 0, y: 0, z: 0 },
// ];

// const modelRotations = [
//   { x: 0, y: -Math.PI/180, z: 0 },
// ];

// const modelScales = [
//   { x: 0.1, y: 0.1, z: 0.1 },
// ];

// const animationIndex = [];

// for (let i = 0; i < modelPaths.length; i++) {
//   loadModel(
//     modelPaths[i],
//     modelLocations[i],
//     modelScales[i],
//     animationIndex[i],
//     modelRotations[i]
//   );
// }

// loader.load(
//   "models/scene.glb",
//   function (gltf) {
//     var originalModel = gltf.scene.children[0];
    
//     for (var i = 0; i < 15; i++) {
//       for (var j = 0; j < 15; j++) {
//         var newModel = originalModel.clone();
//         newModel.position.set(i * 50, -3, j * 50); // Use both i and j to set position
//         scene.add(newModel);
//       }
//     }
//     for (var i = 0; i < 15; i++) {
//       for (var j = 0; j < 15; j++) {
//         var newModel = originalModel.clone();
//         newModel.position.set(i * -50, -3, j * -50); // Use both i and j to set position
//         scene.add(newModel);
//       }
//     }
//     for (var i = 0; i < 15; i++) {
//       for (var j = 0; j < 15; j++) {
//         var newModel = originalModel.clone();
//         newModel.position.set(i * 50, -3, j * -50); // Use both i and j to set position
//         scene.add(newModel);
//       }
//     }
//     for (var i = 0; i < 15; i++) {
//       for (var j = 0; j < 15; j++) {
//         var newModel = originalModel.clone();
//         newModel.position.set(i * -50, -3, j * 50); // Use both i and j to set position
//         scene.add(newModel);
//       }
//     }
//   }
// );

// var oldElapsedTime = 0;
// var elapsedtime;
// var deltatime;
// const clock = new THREE.Clock();

// function animate() {
//   setTimeout(function () {
//     requestAnimationFrame(animate);
//   }, 30);

//   // elapsed time
//   elapsedtime = clock.getElapsedTime();
//   deltatime = elapsedtime - oldElapsedTime;
//   oldElapsedTime = elapsedtime;

//   for (let i = 0; i < mixers.length; i++) {
//     if (i !== 0)
//       mixers[i].update(deltatime);
//     else
//       HalfMovement(0, 0);
//   }

//   boat.update(deltatime);

//   // Ensure models[0] is defined before accessing its properties
//   if (models[0]) {
//     // Update the boat model's position and rotation
//     models[0].position.x = boat.position.x;
//     models[0].position.y = boat.position.y;
//     models[0].position.z = boat.position.z;

//     // Assuming models[0].rotation.x represents the pitch rotation of the boat
//     models[0].rotation.x = boat.rotation.x;
//     models[0].rotation.y = boat.rotation.y;
//     models[0].rotation.z = boat.rotation.z;
//     console.log("position boat", models[0].position);
//     console.log("position camera", camera.position);
//   }

//   controls.update();
//   renderer.render(scene, camera);
//   renderer.gammaOutput = true;
//   renderer.gammaFactor = 2.2;
//   renderer.outputEncoding = THREE.sRGBEncoding;
// }





















// Start the animation loop only after models are loaded
// animate();



// import "./style.css";
// import * as THREE from "three";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import * as dat from "dat.gui";
// import { gsap } from "gsap";
// import Boat from "./Physic";



// var boat = new Boat();

// // Canvas
// const canvas = document.querySelector("canvas.webgl");

// // Textures
// const textureLoader = new THREE.TextureLoader();

// // floor
// const grasscolorTexture = textureLoader.load(
//   "./textures/ocean/Screenshot 2024-05-31 214826.jpg"
// );
// const grassambientocculsionTexture = textureLoader.load(
//   "./textures/ocean/Screenshot 2024-05-31 215336.jpg"
  
// );
// const grassroughnessTexture = textureLoader.load(
//   "./textures/ocean/Screenshot 2024-05-31 215011.jpg"
// );
// const grassnormalTexture = textureLoader.load("./textures/ocean/Screenshot 2024-05-31 214619.jpg");
// const DisplacementTexture = textureLoader.load(
//   "./textures/grass/Displacement.jpg"
// );

// // Scene
// const scene = new THREE.Scene();

// const geometry = new THREE.CircleGeometry(20000, 20000);
// // //const material = new THREE.MeshStandardMaterial({
// // color: "#ffff11"
// // });

// const material = new THREE.MeshStandardMaterial({
//   map: grasscolorTexture,
//   aoMap: grassambientocculsionTexture,
//   roughnessMap: grassroughnessTexture,
//   normalMap: grassnormalTexture,
//   displacementMap: DisplacementTexture,
// });

// const Meshfloor = new THREE.Mesh(geometry, material);

// Meshfloor.rotation.x = -Math.PI * 0.5;
// Meshfloor.position.y = -2;
// scene.add(Meshfloor);

// grasscolorTexture.repeat.set(18000, 18000);
// grassambientocculsionTexture.repeat.set(18000, 18000);
// grassnormalTexture.repeat.set(18000, 18000);
// grassroughnessTexture.repeat.set(18000, 18000);
// DisplacementTexture.repeat.set(18000, 18000);

// grasscolorTexture.wrapS = THREE.RepeatWrapping;
// grassambientocculsionTexture.wrapS = THREE.RepeatWrapping;
// grassnormalTexture.wrapS = THREE.RepeatWrapping;
// grassroughnessTexture.wrapS = THREE.RepeatWrapping;
// DisplacementTexture.wrapS = THREE.RepeatWrapping;

// grasscolorTexture.wrapT = THREE.RepeatWrapping;
// grassambientocculsionTexture.wrapT = THREE.RepeatWrapping;
// grassnormalTexture.wrapT = THREE.RepeatWrapping;
// grassroughnessTexture.wrapT = THREE.RepeatWrapping;
// DisplacementTexture.wrapT = THREE.RepeatWrapping;

// // Lights

// // Ambient light
// const ambientLight = new THREE.AmbientLight("#ffffff", 0.75);
// scene.add(ambientLight);

// // Directional light
// const moonLight = new THREE.DirectionalLight("#ffffff", 0.5);
// moonLight.position.set(4, 5, -2);
// scene.add(moonLight);



// // end light

// //////////////////////////////////////////camera and resize  ////////////////////////////////////////////
// // Sizes
// const sizes = {
//   width: window.innerWidth,
//   height: window.innerHeight,
// };

// window.onload = () => {
//   // Update sizes
//   sizes.width = window.innerWidth;
//   sizes.height = window.innerHeight;

//   // Update camera
//   camera.aspect = sizes.width / sizes.height;
//   camera.updateProjectionMatrix();

//   // Update renderer
//   renderer.setSize(sizes.width, sizes.height);
//   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// };

// // Camera
// const camera = new THREE.PerspectiveCamera(
//   75,
//   sizes.width / sizes.height,
//   0.1,
//   1000
// );
// camera.position.x = 15;
// camera.position.y = 10;
// camera.position.z = 70;
// scene.add(camera);

// // Controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

// // Renderer
// const renderer = new THREE.WebGLRenderer({
//   canvas: canvas,
// });
// renderer.setSize(sizes.width, sizes.height);
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// // camera

// // resize
// window.addEventListener("resize", () => {
//   // Update sizes
//   sizes.width = window.innerWidth;
//   sizes.height = window.innerHeight;

//   // Update camera
//   camera.aspect = sizes.width / sizes.height;
//   camera.updateProjectionMatrix();

//   // Update renderer
//   renderer.setSize(sizes.width, sizes.height);
//   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//   document.addEventListener("keydown", onDocumentKeyDown, false);
// });
// // end resize

// ////////////////////////////////////end camera and resize  ////////////////////////////////////////////

// renderer.setClearColor("#87ceeb");
// //renderer.setClearColor("#000000");

// ////////////////////////////////////  Model   ////////////////////////////////////////////////////////

// //اظهار المحاور
// var axesHelper = new THREE.AxesHelper(500);
// scene.add(axesHelper);

// const loader = new GLTFLoader();
// const mixers = [];
// const models = [];
// let animationPaused = true;



// function loadModel(
//   modelPath,
//   modelLocation,
//   modelScale,
//   animationIndex,
//   modelRotations
// ) {
//   loader.load(
//     modelPath,
//     function (gltf) {
//       // I dont need animations from now on because i dont have time to scrape my ass.
//       // const mixer = new THREE.AnimationMixer(gltf.scene);
//       // const animation = gltf.animations[animationIndex];
//       // if (animation) {
//       //   const action = mixer.clipAction(animation);
//       //   mixers.push(mixer);
//       //   action.play();
//       // }

//       const model = gltf.scene;
//       model.scale.set(modelScale.x, modelScale.y, modelScale.z);
//       model.position.set(modelLocation.x, modelLocation.y, modelLocation.z);
//       model.rotation.set(modelRotations.x, modelRotations.y, modelRotations.z);
//       scene.add(model);

//       models.push(model);
//     },
//     undefined,
//     function (error) {
//       console.error(error);
//     }
//   );
// }

// const modelPaths = [
//   "models/boat4.glb",
  
// ];

// const modelLocations = [
//   { x: 0, y: 0, z: 0 }, 
  
   
// ];  
// const modelRotations = [
//   { x: 0, y: -Math.PI/180, z: 0 },
  
// ];


// const modelScales = [
//   { x: 0.1, y: 0.1, z: 0.1},
  
// ];

// const animationIndex = [];

// for (let i = 0; i < modelPaths.length; i++) {
//   loadModel(
//     modelPaths[i],
//     modelLocations[i],
//     modelScales[i],
//     animationIndex[i],
//     modelRotations[i]
//   );
// }


//   loader.load(
//     "models/scene.glb",
//     function (gltf) {
//       var originalModel = gltf.scene.children[0];
      
//       for (var i = 0; i < 15; i++) {
//         for (var j = 0; j < 15; j++) {
//           var newModel = originalModel.clone();
//           newModel.position.set(i * 50, -3, j * 50); // Use both i and j to set position
//           scene.add(newModel);
//         }
//       }
//       for (var i = 0; i < 15; i++) {
//         for (var j = 0; j < 15; j++) {
//           var newModel = originalModel.clone();
//           newModel.position.set(i * -50, -3, j * -50); // Use both i and j to set position
//           scene.add(newModel);
//         }
//       }
//       for (var i = 0; i < 15; i++) {
//         for (var j = 0; j < 15; j++) {
//           var newModel = originalModel.clone();
//           newModel.position.set(i * 50, -3, j * -50); // Use both i and j to set position
//           scene.add(newModel);
//         }
//       }
//       for (var i = 0; i < 15; i++) {
//         for (var j = 0; j < 15; j++) {
//           var newModel = originalModel.clone();
//           newModel.position.set(i * -50, -3, j * 50); // Use both i and j to set position
//           scene.add(newModel);
//         }
//       }
//     }
//   );
  



// // document.addEventListener("keydown", function (event) {
// //   if (event.key === "p") {
// //     if (animationPaused) {
// //       animationPaused = false;
// //     }
// //   }
// // });

// // function HalfMovement(ModelIndex, actionIndex) {
// //    // في حال لم تصل الابواب لنصف الحركة
// //   if (!animationPaused) {
// //     mixers[ModelIndex].update(0.05);
// //     const action = mixers[ModelIndex]._actions[actionIndex];
// //     const clipDuration = action.getClip().duration; // حساب وقت الحركة كاملا
// //     const currentTime = mixers[ModelIndex].time % clipDuration; // حساب الوقت الحالي
// //     if (currentTime >= clipDuration / 2) {
// //       // التأكد من وصول الحركة إلى نصف مدتها
// //       action.paused = true; // توقيف الحركة في الموضع الحالي
// //       animationPaused = true; // إيقاف حالة التشغيل
// //     }
// //   }
// // }



// var elapsedtime;
// var oldElapsedTime;
// var deltatime;
// const clock = new THREE.Clock();

// function animate() {
//   setTimeout(function () {
//     requestAnimationFrame(animate);
//   }, 30);

//   // elapsed time
//   elapsedtime = clock.getElapsedTime();
//   deltatime = elapsedtime - oldElapsedTime;
//   oldElapsedTime = elapsedtime;

//   for (let i = 0; i < mixers.length; i++) {
//     if (i !== 0)
//       mixers[i].update(deltatime);
//     else
//       HalfMovement(0, 0);
//   }

//   boat.update();

//   // Update the boat model's position and rotation
//   models[0].position.x = boat.position.x;
//   models[0].position.y = boat.position.y;
//   models[0].position.z = boat.position.z;

//   // Assuming models[0].rotation.x represents the pitch rotation of the boat
//   models[0].rotation.x = boat.rotation.x;
//   models[0].rotation.y = boat.rotation.y;
//   models[0].rotation.z = boat.rotation.z;
//   console.log("position boat", models[0].position);
//   console.log("position camera", camera.position);

//   controls.update();
//   renderer.render(scene, camera);
//   renderer.gammaOutput = true;
//   renderer.gammaFactor = 2.2;
//   renderer.outputEncoding = THREE.sRGBEncoding;
// }

// animate();

