import "./style.css";
import * as dat from "dat.gui";
import Vector3 from "./Library";
import Diriction from "./Directions";
import GMath from "./GMath";

class Boat {
  constructor() {
    this.position = new Vector3(); //position of the boat
    this.velocity = new Vector3(); //velocity of the boat
    this.accel = new Vector3();   //acceleration of the boat

    this.mass = 5000.0;
    this.BgTofront = 2.2;
    this.BgToRear = 2.2;
    this.BgTofrontAxle = 2;
    this.BgToRearAxle = 2;
    this.engineForce = 4000.0;
    this.brakeForce = 6000.0;
    this.ebrakeForce = this.brakeForce / 2.5;
    this.airResist = 2.5;
    this.rollResist = 8.0;
    this.gravity = 9.81;
    this.vLength = 0.0;
    this.gui = new dat.GUI();

    this.throttle = 0;
    this.InputBrake = 0;
    this.InputThrottle = 0;

    this.fluidDensity = 1000; // Density of water in kg/m³
    this.submergedVolume = 5; // Submerged volume in cubic meters (can be dynamic)

    this.dragCoefficient = 0.7; // Hypothetical value
    this.frontalArea = 3; // Frontal area facing the flow
    this.propellerEfficiency = 0.85; // Efficiency of the propeller


    
    //control
    document.addEventListener('keydown', (event) => {
      if (event.key === 'w'){
        if (this.InputThrottle <= 1){
          this.InputThrottle += 0.01;
        }
      }
    
      if (event.key === 's'){
        if( this.InputBrake <= 0.4){
          this.InputBrake += 0.01;
        }
    
    }
  });
  document.addEventListener('keyup',(event) => {
    if (event.key === 'w'){
      this.InputThrottle = 0;
    }
    if (event.key === 's'){
      this.InputBrake = 0;
    }
  });



  }

  /////////////////// update //////////////////
  update() {

    // Total Force // 
    var totalF = this.totalForce();

    // linear acceleration //
    this.acceleration = totalF.divideScalar(this.mass);

    // linear vilocity //
    this.velocity = this.velocity.addVector(
      this.acceleration.clone().multiplyScalar(1)
    );

    this.vLength = this.velocity.length();

    //position//
    this.position = this.position.addVector(
      this.velocity.clone().multiplyScalar(1)
    );

    //break 
    if(Math.abs(this.vLength) < 0.1 && this.throttle == 0) {
      this.velocity.x = this.velocity.y = this.velocity.z = this.vLength = 0;
      this.acceleration.x = this.acceleration.y = this.acceleration.z = 0;
    }

}

    
    totalForce(){
      var tf = new Vector3();
      tf = tf.addVector(this.dragForce());
      tf = tf.addVector(this.tractionForce());
      tf = tf.addVector(this.buoyancyForce());
      tf = tf.addVector(this.weightForce());
      return tf;
    }


    /////////////////////////////////// Forces /////////////////////////////////////

    //
    
    tractionForce(){

      var brake = this.InputBrake * this.brakeForce;
      this.throttle = this.InputThrottle * this.engineForce;
      var tractionForce = this.throttle - (brake * GMath.sign(this.vLength));
      var tractionVector = new Vector3(tractionForce,0,0);

      return tractionVector;
    }

    //

    dragForce(){
      
      var F_drag = -(this.rollResist *this.velocity.length()-this.airResist * this.velocity.length() * Math.abs(this.velocity.length()));
      var dragVector = new Vector3(F_drag,0,0);
      return dragVector;
    }
      //1000*5*9.81 = 49050
    buoyancyForce() {
      var buoyancyForce = this.fluidDensity * this.submergedVolume * this.gravity;
      var buoyancyVector = new Vector3(0, buoyancyForce, 0);
      return buoyancyVector;
    }

    // 5000 *9.81 = 49050
    weightForce() {
      var weightForce = this.mass * this.gravity;
      var weightVector = new Vector3(0, -weightForce, 0);
      return weightVector;
    }
  }









export default Boat;



















import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
import { gsap } from "gsap";
import Boat from "./Physic";



var boat = new Boat();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Textures
const textureLoader = new THREE.TextureLoader();

// floor
const grasscolorTexture = textureLoader.load(
  "./textures/ocean/Screenshot 2024-05-31 214826.jpg"
);
const grassambientocculsionTexture = textureLoader.load(
  "./textures/ocean/Screenshot 2024-05-31 215336.jpg"
  
);
const grassroughnessTexture = textureLoader.load(
  "./textures/ocean/Screenshot 2024-05-31 215011.jpg"
);
const grassnormalTexture = textureLoader.load("./textures/ocean/Screenshot 2024-05-31 214619.jpg");
const DisplacementTexture = textureLoader.load(
  "./textures/grass/Displacement.jpg"
);

// Scene
const scene = new THREE.Scene();

const geometry = new THREE.CircleGeometry(20000, 20000);
// //const material = new THREE.MeshStandardMaterial({
// color: "#ffff11"
// });

const material = new THREE.MeshStandardMaterial({
  map: grasscolorTexture,
  aoMap: grassambientocculsionTexture,
  roughnessMap: grassroughnessTexture,
  normalMap: grassnormalTexture,
  displacementMap: DisplacementTexture,
});

const Meshfloor = new THREE.Mesh(geometry, material);

Meshfloor.rotation.x = -Math.PI * 0.5;
Meshfloor.position.y = 0;
scene.add(Meshfloor);

grasscolorTexture.repeat.set(18000, 18000);
grassambientocculsionTexture.repeat.set(18000, 18000);
grassnormalTexture.repeat.set(18000, 18000);
grassroughnessTexture.repeat.set(18000, 18000);
DisplacementTexture.repeat.set(18000, 18000);

grasscolorTexture.wrapS = THREE.RepeatWrapping;
grassambientocculsionTexture.wrapS = THREE.RepeatWrapping;
grassnormalTexture.wrapS = THREE.RepeatWrapping;
grassroughnessTexture.wrapS = THREE.RepeatWrapping;
DisplacementTexture.wrapS = THREE.RepeatWrapping;

grasscolorTexture.wrapT = THREE.RepeatWrapping;
grassambientocculsionTexture.wrapT = THREE.RepeatWrapping;
grassnormalTexture.wrapT = THREE.RepeatWrapping;
grassroughnessTexture.wrapT = THREE.RepeatWrapping;
DisplacementTexture.wrapT = THREE.RepeatWrapping;

// Lights

// Ambient light
const ambientLight = new THREE.AmbientLight("#ffffff", 0.75);
scene.add(ambientLight);

// Directional light
const moonLight = new THREE.DirectionalLight("#ffffff", 0.5);
moonLight.position.set(4, 5, -2);
scene.add(moonLight);



// end light

//////////////////////////////////////////camera and resize  ////////////////////////////////////////////
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

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.x = 15;
camera.position.y = 10;
camera.position.z = 70;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// camera

// resize
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
  document.addEventListener("keydown", onDocumentKeyDown, false);
});
// end resize

////////////////////////////////////end camera and resize  ////////////////////////////////////////////

renderer.setClearColor("#87ceeb");
//renderer.setClearColor("#000000");

////////////////////////////////////  Model   ////////////////////////////////////////////////////////

//اظهار المحاور
var axesHelper = new THREE.AxesHelper(500);
scene.add(axesHelper);

const loader = new GLTFLoader();
const mixers = [];
const models = [];
let animationPaused = true;



function loadModel(
  modelPath,
  modelLocation,
  modelScale,
  animationIndex,
  modelRotations
) {
  loader.load(
    modelPath,
    function (gltf) {
      // I dont need animations from now on because i dont have time to scrape my ass.
      // const mixer = new THREE.AnimationMixer(gltf.scene);
      // const animation = gltf.animations[animationIndex];
      // if (animation) {
      //   const action = mixer.clipAction(animation);
      //   mixers.push(mixer);
      //   action.play();
      // }

      const model = gltf.scene;
      model.scale.set(modelScale.x, modelScale.y, modelScale.z);
      model.position.set(modelLocation.x, modelLocation.y, modelLocation.z);
      model.rotation.set(modelRotations.x, modelRotations.y, modelRotations.z);
      scene.add(model);

      models.push(model);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

const modelPaths = [
  "models/boat4.glb",
  
];

const modelLocations = [
  { x: 0, y: 0, z: 0 }, 
  
   
];  
const modelRotations = [
  { x: 0, y: -Math.PI/180, z: 0 },
  
];


const modelScales = [
  { x: 0.1, y: 0.1, z: 0.1},
  
];

const animationIndex = [];

for (let i = 0; i < modelPaths.length; i++) {
  loadModel(
    modelPaths[i],
    modelLocations[i],
    modelScales[i],
    animationIndex[i],
    modelRotations[i]
  );
}


  loader.load(
    "models/scene.glb",
    function (gltf) {
      var originalModel = gltf.scene.children[0];
      
      for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 15; j++) {
          var newModel = originalModel.clone();
          newModel.position.set(i * 50, -1, j * 50); // Use both i and j to set position
          scene.add(newModel);
        }
      }
      for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 15; j++) {
          var newModel = originalModel.clone();
          newModel.position.set(i * -50, -1, j * -50); // Use both i and j to set position
          scene.add(newModel);
        }
      }
      for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 15; j++) {
          var newModel = originalModel.clone();
          newModel.position.set(i * 50, -1, j * -50); // Use both i and j to set position
          scene.add(newModel);
        }
      }
      for (var i = 0; i < 15; i++) {
        for (var j = 0; j < 15; j++) {
          var newModel = originalModel.clone();
          newModel.position.set(i * -50, -1, j * 50); // Use both i and j to set position
          scene.add(newModel);
        }
      }
    }
  );
  



// document.addEventListener("keydown", function (event) {
//   if (event.key === "p") {
//     if (animationPaused) {
//       animationPaused = false;
//     }
//   }
// });

// function HalfMovement(ModelIndex, actionIndex) {
//    // في حال لم تصل الابواب لنصف الحركة
//   if (!animationPaused) {
//     mixers[ModelIndex].update(0.05);
//     const action = mixers[ModelIndex]._actions[actionIndex];
//     const clipDuration = action.getClip().duration; // حساب وقت الحركة كاملا
//     const currentTime = mixers[ModelIndex].time % clipDuration; // حساب الوقت الحالي
//     if (currentTime >= clipDuration / 2) {
//       // التأكد من وصول الحركة إلى نصف مدتها
//       action.paused = true; // توقيف الحركة في الموضع الحالي
//       animationPaused = true; // إيقاف حالة التشغيل
//     }
//   }
// }



var elapsedtime;
var oldElapsedTime;
var deltatime;
const clock = new THREE.Clock();

function animate() {
  setTimeout(function () {
    requestAnimationFrame(animate);
  }, 15);

  // elapsedtime
  elapsedtime = clock.getElapsedTime();
  deltatime = elapsedtime - oldElapsedTime;
  oldElapsedTime = elapsedtime;


  for (let i = 0; i < mixers.length; i++) {
    if(i==!0)
      mixers[i].update(deltatime);
    else
    HalfMovement(0,0) ;
  }

  boat.update();

  models[0].position.x = boat.position.x;
  models[0].position.y = boat.position.y;
  models[0].position.z = boat.position.z;


  console.log("throttle",boat.throttle);
console.log("position boat",models[0].position);
console.log("position camera",camera.position);







  // رسم الاشعة 
 // ...
  
  controls.update();
  renderer.render(scene, camera);
  // how i fixed the lighting issue
  renderer.gammaOutput = true;
renderer.gammaFactor = 2.2;
renderer.outputEncoding = THREE.sRGBEncoding;
}

animate();
