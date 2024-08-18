// import * as THREE from 'three';
// import "./style.css";
// import * as dat from "dat.gui";
// import Vector3 from "./Library";
// import Diriction from "./Directions";
// import GMath from "./GMath";





import * as THREE from 'three';
import "./style.css";
import * as dat from "dat.gui";


class Boat {
  constructor() {
    this.position = new THREE.Vector3(); // position of the boat
    this.velocity = new THREE.Vector3(); // velocity of the boat
    this.acceleration = new THREE.Vector3(); // acceleration of the boat
    //this.boundingBox = new THREE.Box3(); // Box affected by Collision Detection
    this.boundingBox = new THREE.Box3(); // Box affected by Collision Detection
    this.rotation = new THREE.Euler(); // rotation of the boat (Euler angles)
    this.angularVelocity = new THREE.Vector3(); // angular velocity
    this.angularAcceleration = new THREE.Vector3(); // angular acceleration

    this.mass = 5000.0;
    this.fakeMass = this.realToFakeMass(this.mass); // fake mass for display in GUI
    this.engineForce = 100.0;
    this.airResist = 2.5;
    this.rollResist = 1.0;
    this.gravity = 9.81;
    this.vLength = 0.0;
    this.aLength = 0.0;
    this.avLength = 0.0;
    this.aaLength = 0.0;
    //old value : 0.1
    this.frontalArea = 0.1; // Adjust as needed (cross-sectional area of boat facing the direction of motion)

    this.inputThrottle = 0;
    this.inputBrake = 0;
    this.inputSteering = 0; // For rotation control

    this.fluidDensity = 1000; // Density of water in kg/m³
    this.submergedVolume = 5; // Submerged volume in cubic meters (can be dynamic)
    this.waterDragCoefficient = 0.01;

    // Moments of inertia (simplified assumption)
    this.inertia = new THREE.Vector3(5000, 5000, 5000); // Adjust as needed

    // Damping coefficients
    this.linearDamping = 0.02; // Linear damping factor
    this.angularDamping = 0.5; // Damping coefficient for angular velocity
    // this.linearDamping = 0.02; // Linear damping factor
    // this.angularDamping = 0.5; // Damping coefficient for angular velocity

    // Initialize GUI
    this.initGUI();

    // Add event listeners
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    
  }


  // Mapping functions iam doing that for the display numbers its not cool to get large numbers display
  realToFakeMass(realMass) {
    return ((realMass - 4990) / (5005 - 4990)) * (10 - 1) + 1;
  }

  fakeToRealMass(fakeMass) {
    return ((fakeMass - 1) / (10 - 1)) * (5005 - 4990) + 4990;
  }


  initGUI() {
    const gui = new dat.GUI();

    // Add variables to GUI
    gui.add(this, 'fakeMass', 1, 10).name('Boat mass').onChange(value => {
      this.fakeMass = value;
      this.mass = this.fakeToRealMass(value); // Update the real mass based on fake mass
    });

    gui.add(this, 'engineForce', 0, 250).name('Engine Force');
    gui.add(this, 'airResist', 0, 10).name('Air Resistance');
    
    gui.add(this, 'gravity', 0, 100).name('gravity');
    gui.add(this, 'waterDragCoefficient', 0, 50).name('waterDragCoefficient');
    
    
    // Display read-only variables
    gui.add(this, 'vLength', 0, 3).name('Velocity Length').listen();
    gui.add(this, 'aLength', 0, 0.3).name('Acceleration Length').listen();
    gui.add(this, 'avLength', 0, 3).name('aVelocity Length').listen();
    gui.add(this, 'aaLength', -1, 1).name('aAcceleration Length').listen();
    gui.add(this.position, 'x').name('Position X').listen();
    gui.add(this.position, 'y').name('Position Y').listen();
    gui.add(this.position, 'z').name('Position Z').listen();
    // gui.add(this.rotation, 'x').name('Rotation X').listen();
    gui.add(this.rotation, 'y').name('Rotation Y').listen();
    // gui.add(this.rotation, 'z').name('Rotation Z').listen();
  }

  handleKeyDown(event) {
    switch (event.key) {
      case 'w':
        this.inputThrottle = Math.min(this.inputThrottle + 0.01, 1);
        break;
      case 's':
        
        break;
      case 'd':
        if (this.vLength > 0) {
          this.inputSteering = Math.max(this.inputSteering - 0.001, -1);
        }
        break;
      case 'a':
        if (this.vLength > 0) {
          this.inputSteering = Math.min(this.inputSteering + 0.001, 1);
        }
        break;
    }
  }

  handleKeyUp(event) {
    switch (event.key) {
      case 'w':
          this.inputThrottle = Math.max(this.inputThrottle - 0.01, 1);
        if (this.inputThrottle = 0) {  
        break;
        }
      case 's':
       
        break;
      case 'd':
        this.inputSteering = 0;
      case 'a':
        this.inputSteering = 0;
        break;
    }
  }

  update() {
    // Total Force and Torque
    const totalF = this.totalForce();
    const totalT = this.totalTorque();

    // Linear acceleration
    this.acceleration.copy(totalF).divideScalar(this.mass);
    this.aLength = this.acceleration.length();

    // Linear velocity
    this.velocity.add(this.acceleration.clone().multiplyScalar(1));
    this.vLength = this.velocity.length();

    
    this.velocity.multiplyScalar(1 - this.linearDamping);

    // Position
    this.position.add(this.velocity.clone().multiplyScalar(1 ));

    // Angular acceleration
    this.angularAcceleration.copy(totalT).divide(this.inertia);
    this.aaLength = this.angularAcceleration.length();

    // Angular velocity
    this.angularVelocity.add(this.angularAcceleration.clone().multiplyScalar(1));
    this.avLength = this.angularVelocity.length();

    
    this.angularVelocity.multiplyScalar(1 - this.angularDamping);

    // Rotation (Euler angles)
    this.rotation.x += this.angularVelocity.x;
    this.rotation.y += this.angularVelocity.y;
    this.rotation.z += this.angularVelocity.z;
    

    // Stop the boat when it's nearly stationary
    if (this.vLength < 0.01 && this.inputThrottle === 0) {
      this.velocity.set(0, 0, 0);
      this.acceleration.set(0, 0, 0);
    }
    
     // Update bounding box
     if (this.model) {
      this.boundingBox.setFromObject(this.model);
      // Update the helper box position and size
      // if (this.boxHelper) {
      //   this.boxHelper.update();
      // }
    }
    //this.updateBoundingBox();
  }

  // updateBoundingBox() {
  //   if (this.model) {
  //     this.boundingBox.setFromObject(this.model);
  //   }
  // }

  // checkCollisions(obstacleBoundingBox) {
  //   if (this.boundingBox.intersectsBox(obstacleBoundingBox)) {
  //     console.log("Collision detected!");
  //     // Handle collision response
  //     this.velocity.set(0, 0, 0); // Stop the boat for simplicity
  //   }
  // }

  // setModel(model) {
  //   this.model = model;
  //   this.updateBoundingBox();
  // }

  getDynamicSubmergedVolume() {
    const pitchAngle = this.getPitchAngle();
    const baseSubmergedVolume = this.submergedVolume; // Base volume when the boat is level
    return baseSubmergedVolume * Math.cos(pitchAngle);
  }

  getPitchAngle() {
    return this.rotation.x; // Assuming the rotation.x represents the pitch angle in radians
  }

  totalForce() {
    let tf = new THREE.Vector3();
    tf.add(this.airResistanceForce());
    tf.add(this.waterResistanceForce()); 
    tf.add(this.propulsionForce());
    tf.add(this.buoyancyForce());
    tf.add(this.weightForce());
    return tf;
  }

  totalTorque() {
    let tt = new THREE.Vector3();
    tt.add(this.propulsionTorque());
    tt.add(this.resistanceTorque());
    return tt;
  }

  propulsionForce() {
    const throttleForce = this.inputThrottle * this.engineForce;
    const forwardDirection = new THREE.Vector3(1, 0, 0);
    forwardDirection.applyEuler(this.rotation);
    const propulsionForce = forwardDirection.multiplyScalar(throttleForce);

    return propulsionForce;
  }

  propulsionTorque() {
    
    const steeringTorque = this.inputSteering * this.engineForce;
    return new THREE.Vector3(0, steeringTorque, 0); // Assuming yaw rotation around Y-axis
  }

  resistanceTorque() {
    // Damping torque based on angular velocity
    const dampingTorque = this.angularVelocity.clone().multiplyScalar(-this.angularDamping);
    return dampingTorque;
  }

  

  airResistanceForce() {
    const dragMagnitude = -(this.rollResist * this.velocity.length() + this.airResist * this.velocity.length() * this.velocity.length());
    return new THREE.Vector3(dragMagnitude, 0, 0);
  }

  waterResistanceForce() {
    const dragMagnitude = -this.calculateWaterResistance();
    const forwardDirection = new THREE.Vector3(1, 0, 0);
    forwardDirection.applyEuler(this.rotation);
    const waterResistanceForce = forwardDirection.multiplyScalar(dragMagnitude);

    // Ensure water resistance does not cause backward motion
    if (this.velocity.dot(waterResistanceForce) < 0) {
      return new THREE.Vector3(0, 0, 0);
    }

    return waterResistanceForce;
  }


  calculateWaterResistance() {
    //old value : 0.1
     // Adjust as needed
    const speed = this.velocity.length(); // Speed of the boat
    
    const dragMagnitude = 0.5 * this.fluidDensity * this.waterDragCoefficient * this.frontalArea * speed * speed;
    return dragMagnitude;
  }

  buoyancyForce() {
    const dynamicSubmergedVolume = this.getDynamicSubmergedVolume();
    const buoyancyForce = this.fluidDensity * dynamicSubmergedVolume * this.gravity;
    return new THREE.Vector3(0, buoyancyForce, 0);
  }

  weightForce() {
    let weightForce = this.mass * this.gravity;

    if (this.mass < 5000) {
      weightForce = 49050; // Assuming a default weight if mass is less than 5000 kg
    }

    return new THREE.Vector3(0, -weightForce, 0);
  }


  // Method to set the boat model
  setModel(model) {
    this.model = model;
    this.boundingBox.setFromObject(model); // Initialize bounding box based on model

    // Add helper to visualize bounding box
    // this.boxHelper = new THREE.BoxHelper(model, 0x00ff00);
    // model.add(this.boxHelper);
  }

  // Method to check for collisions with other bounding boxes
  checkCollisions(obstacleBoundingBox,cube1) {
    if (this.boundingBox.intersectsBox(cube1)) {
      console.log("Collision detected!");
      // Handle collision response here
      // For example, stop the boat or apply a collision force
      this.inputThrottle = 0;
      this.velocity.set(0, 0, 0); // Stop the boat
      this.vLength = 0;
      this.acceleration.set(0, 0, 0);
      if (this.acceleration.length != 0) {
        this.acceleration.set(0, 0, 0);
      }
      this.angularVelocity.set(0, 0, 0);
      this.angularAcceleration.set(0, 0, 0);
      
      // You can also apply a collision force or response as needed
    }
    if (this.boundingBox.intersectsBox(obstacleBoundingBox)) {
      console.log("Collision detected!");
      // Handle collision response here
      // For example, stop the boat or apply a collision force
      this.velocity.set(0, 0, 0); // Stop the boat
      // You can also apply a collision force or response as needed
    }
  }
}

export default Boat;






























// import * as THREE from 'three';
// import "./style.css";
// import * as dat from "dat.gui";
// import Vector3 from "./Library";
// import Diriction from "./Directions";
// import GMath from "./GMath";

// class Boat {
//   constructor() {
//     this.position = new THREE.Vector3(); // position of the boat
//     this.velocity = new THREE.Vector3(); // velocity of the boat
//     this.acceleration = new THREE.Vector3(); // acceleration of the boat

//     this.rotation = new THREE.Vector3(); // rotation of the boat (Euler angles)
//     this.angularVelocity = new THREE.Vector3(); // angular velocity
//     this.angularAcceleration = new THREE.Vector3(); // angular acceleration

//     this.mass = 5000.0;
//     this.engineForce = 500.0;
//     this.airResist = 2.5;
//     this.rollResist = 1.0;
//     this.gravity = 9.81;
//     this.vLength = 0.0;
//     this.aLength = 0.0;

//     this.throttle = 0;
//     this.inputBrake = 0;
//     this.inputThrottle = 0;
//     this.inputSteering = 0; // For rotation control

//     this.fluidDensity = 1000; // Density of water in kg/m³
//     this.submergedVolume = 5; // Submerged volume in cubic meters (can be dynamic)

//     // Moments of inertia (simplified assumption)
//     this.inertia = new THREE.Vector3(5000, 5000, 5000); // Adjust as needed

//     // Damping coefficients
//     this.linearDamping = 0.9; // Linear damping factor
//     this.angularDamping = 0.3; // Damping coefficient for angular velocity

//     // Add event listeners
//     document.addEventListener('keydown', this.handleKeyDown.bind(this));
//     document.addEventListener('keyup', this.handleKeyUp.bind(this));

//      // Initialize GUI
//      this.initGUI();
//   }


//   initGUI() {
//     const gui = new dat.GUI();

//     // Add variables to GUI
//     gui.add(this, 'mass', 4090, 5050).name('Boat mass');
//     gui.add(this, 'engineForce', 0, 2000).name('Engine Force');
//     gui.add(this, 'airResist', 0, 10).name('Air Resistance');
//     gui.add(this, 'rollResist', 0, 10).name('Roll Resistance');
//     gui.add(this, 'linearDamping', 0, 0.9).name('Linear Damping');
//     gui.add(this, 'angularDamping', 0, 1).name('Angular Damping');

//     // Display read-only variables
//     gui.add(this, 'vLength', 0, 3).name('Velocity Length').listen();
//     gui.add(this, 'aLength', 0, 0.3).name('Acceleration Length').listen();
//     gui.add(this.position, 'x').name('Position X').listen();
//     gui.add(this.position, 'y').name('Position Y').listen();
//     gui.add(this.position, 'z').name('Position Z').listen();
//     gui.add(this.rotation, 'x').name('Rotation X').listen();
//     gui.add(this.rotation, 'y').name('Rotation Y').listen();
//     gui.add(this.rotation, 'z').name('Rotation Z').listen();
//   }


//   handleKeyDown(event) {
//     switch (event.key) {
//       case 'w':
//         this.inputThrottle = Math.min(this.inputThrottle + 0.01, 1);
//         break;
//       case 's':
//         this.inputBrake = Math.min(this.inputBrake + 0.01, 0.4);
//         break;
//       case 'd':
//         if (this.vLength > 0) {
//           this.inputSteering = Math.max(this.inputSteering - 0.001, -1);
//         }
//         break;
//       case 'a':
//         if (this.vLength > 0) {
//           this.inputSteering = Math.min(this.inputSteering + 0.001, 1);
//         }
//         break;
//     }
//   }

//   handleKeyUp(event) {
//     switch (event.key) {
//       case 'w':
//         this.inputThrottle = 0;
//         break;
//       case 's':
//         this.inputBrake = 0;
//         break;
//       case 'd':
//       case 'a':
//         this.inputSteering = 0;
//         break;
//     }
//   }

//   setupGUI() {
//     const folder1 = this.gui.addFolder('Position');
//     folder1.add(this.position, 'x').listen();
//     folder1.add(this.position, 'y').listen();
//     folder1.add(this.position, 'z').listen();

//     const folder2 = this.gui.addFolder('Velocity');
//     folder2.add(this.velocity, 'x').listen();
//     folder2.add(this.velocity, 'y').listen();
//     folder2.add(this.velocity, 'z').listen();

//     const folder3 = this.gui.addFolder('Acceleration');
//     folder3.add(this.acceleration, 'x').listen();
//     folder3.add(this.acceleration, 'y').listen();
//     folder3.add(this.acceleration, 'z').listen();

//     const folder4 = this.gui.addFolder('Rotation');
//     folder4.add(this.rotation, 'x').listen();
//     folder4.add(this.rotation, 'y').listen();
//     folder4.add(this.rotation, 'z').listen();

//     const folder5 = this.gui.addFolder('Angular Velocity');
//     folder5.add(this.angularVelocity, 'x').listen();
//     folder5.add(this.angularVelocity, 'y').listen();
//     folder5.add(this.angularVelocity, 'z').listen();

//     const folder6 = this.gui.addFolder('Angular Acceleration');
//     folder6.add(this.angularAcceleration, 'x').listen();
//     folder6.add(this.angularAcceleration, 'y').listen();
//     folder6.add(this.angularAcceleration, 'z').listen();

//     this.gui.add(this, 'inputThrottle', 0, 1).name('Throttle').listen();
//     this.gui.add(this, 'inputSteering', -1, 1).name('Steering').listen();
//     this.gui.add(this, 'vLength',0,1).name('Velocity').listen();
//     this.gui.add(this, 'aLength',0,0.1).name('Acceleration').listen();
//   }



//   update() {
//     // Total Force and Torque
//     const totalF = this.totalForce();
//     const totalT = this.totalTorque();

//     // Linear acceleration
//     this.acceleration.copy(totalF).divideScalar(this.mass);

//     this.aLength = this.acceleration.length();
//     // Linear velocity
//     this.velocity.add(this.acceleration.clone().multiplyScalar(1));

//     this.vLength = this.velocity.length();

//     // Apply linear damping
//     this.velocity.multiplyScalar(this.linearDamping);

//     // Position
//     this.position.add(this.velocity.clone().multiplyScalar(1));

//     // Angular acceleration
//     this.angularAcceleration.copy(totalT).divide(this.inertia);

//     // Angular velocity
//     this.angularVelocity.add(this.angularAcceleration.clone().multiplyScalar(1));

//     // Apply angular damping
//     this.angularVelocity.multiplyScalar(1 - this.angularDamping);

//     // Rotation (Euler angles)
//     this.rotation.add(this.angularVelocity.clone().multiplyScalar(1));

//     // Stop the boat when it's nearly stationary
//     if (this.vLength < 0.01 && this.inputThrottle === 0) {
//       this.velocity.set(0, 0, 0);
//       this.acceleration.set(0, 0, 0);
//     }
//   }

//   getDynamicSubmergedVolume() {
//     const pitchAngle = this.getPitchAngle();
//     const baseSubmergedVolume = this.submergedVolume; // Base volume when the boat is level
//     return baseSubmergedVolume * Math.cos(pitchAngle);
//   }

//   getPitchAngle() {
//     return this.rotation.x; // Assuming the rotation.x represents the pitch angle in radians
//   }

//   totalForce() {
//     let tf = new THREE.Vector3();
//     tf.add(this.airResistanceForce());
//     tf.add(this.waterResistanceForce()); // Add water resistance force
//     tf.add(this.propulsionForce());
//     tf.add(this.buoyancyForce());
//     tf.add(this.weightForce());
//     return tf;
//   }

//   totalTorque() {
//     let tt = new THREE.Vector3();
//     tt.add(this.propulsionTorque());
//     tt.add(this.resistanceTorque());
//     return tt;
//   }

//   propulsionForce() {
//     const throttleForce = this.inputThrottle * this.engineForce;
//     const resistanceForce = this.calculateWaterResistance();
//     const propulsionForceMagnitude = throttleForce - resistanceForce;

//     // Calculate the forward direction based on the boat's rotation
//     const forwardDirection = new THREE.Vector3(1, 0, 0);
//     const euler = new THREE.Euler(this.rotation.x, this.rotation.y, this.rotation.z);
//     forwardDirection.applyEuler(euler);
//     const propulsionForce = forwardDirection.multiplyScalar(propulsionForceMagnitude);

//     return propulsionForce;
//   }

//   propulsionTorque() {
//     // Simplified torque based on steering input
//     const steeringTorque = this.inputSteering * this.engineForce;
//     return new THREE.Vector3(0, steeringTorque, 0); // Assuming yaw rotation around Y-axis
//   }

//   resistanceTorque() {
//     // Damping torque based on angular velocity
//     const dampingTorque = this.angularVelocity.clone().multiplyScalar(-this.angularDamping);
//     return dampingTorque;
//   }

//   calculateWaterResistance() {
//     const waterDragCoefficient = 0.1; // Adjust as needed
//     const speed = this.velocity.length(); // Speed of the boat
//     const frontalArea = 10; // Adjust as needed (cross-sectional area of boat facing the direction of motion)
//     const dragMagnitude = 0.5 * this.fluidDensity * waterDragCoefficient * frontalArea * speed * speed;
//     return dragMagnitude;
//   }

//   airResistanceForce() {
//     const dragMagnitude = -(this.rollResist * this.velocity.length() + this.airResist * this.velocity.length() * this.velocity.length());
//     return new THREE.Vector3(dragMagnitude, 0, 0);
//   }

//   waterResistanceForce() {
//     const dragMagnitude = -this.calculateWaterResistance();
//     const forwardDirection = new THREE.Vector3(1, 0, 0);
//     const euler = new THREE.Euler(this.rotation.x, this.rotation.y, this.rotation.z);
//     forwardDirection.applyEuler(euler);
//     const waterResistanceForce = forwardDirection.multiplyScalar(dragMagnitude);

//     // Ensure water resistance does not cause backward motion
//     if (this.velocity.dot(waterResistanceForce) < 0) {
//       return new THREE.Vector3(0, 0, 0);
//     }

//     return waterResistanceForce;
//   }

//   buoyancyForce() {
//     const dynamicSubmergedVolume = this.getDynamicSubmergedVolume();
//     const buoyancyForce = this.fluidDensity * dynamicSubmergedVolume * this.gravity;
//     return new THREE.Vector3(0, buoyancyForce, 0);
//   }

//   weightForce() {
//     const weightForce = this.mass * this.gravity;

//         if (this.mass < 5000) {
//       weightForce = 49050; // Assuming a default weight if mass is less than 5000 kg
//     }

//     return new THREE.Vector3(0, -weightForce, 0);
//   }
// }

// export default Boat;


































// class Boat {
//   constructor() {
//     this.position = new THREE.Vector3(); // position of the boat
//     this.velocity = new THREE.Vector3(); // velocity of the boat
//     this.acceleration = new THREE.Vector3(); // acceleration of the boat

//     this.rotation = new THREE.Vector3(); // rotation of the boat (Euler angles)
//     this.angularVelocity = new THREE.Vector3(); // angular velocity
//     this.angularAcceleration = new THREE.Vector3(); // angular acceleration

//     this.mass = 5000.0;
//     this.engineForce = 500.0;
//     this.airResist = 2.5;
//     this.rollResist = 1.0;
//     this.gravity = 9.81;
//     this.vLength = 0.0;
//     this.aLength = 0.0;

//     this.throttle = 0;
//     this.inputBrake = 0;
//     this.inputThrottle = 0;
//     this.inputSteering = 0; // For rotation control

//     this.fluidDensity = 1000; // Density of water in kg/m³
//     this.submergedVolume = 5; // Submerged volume in cubic meters (can be dynamic)

//     // Moments of inertia (simplified assumption)
//     this.inertia = new THREE.Vector3(5000, 5000, 5000); // Adjust as needed

//     // Damping coefficient for angular velocity
//     this.angularDamping = 0.1; // Adjust as needed

//     // Add event listeners
//     document.addEventListener('keydown', this.handleKeyDown.bind(this));
//     document.addEventListener('keyup', this.handleKeyUp.bind(this));
//   }

//   handleKeyDown(event) {
//     switch (event.key) {
//       case 'w':
//         this.inputThrottle = Math.min(this.inputThrottle + 0.01, 1);
//         break;
//       case 's':
//         this.inputBrake = Math.min(this.inputBrake + 0.01, 0.4);
//         break;
//             case 'd':
//         if (this.vLength > 0) {
//         this.inputSteering = Math.max(this.inputSteering - 0.001, -1);
//         }
//         break;
//       case 'a':
//         if (this.vLength > 0) {
//         this.inputSteering = Math.min(this.inputSteering + 0.001, 1);
//         }
//         break;
//     }
//   }

//   handleKeyUp(event) {
//     switch (event.key) {
//       case 'w':
//         this.inputThrottle = 0;
//         break;
//       case 's':
//         this.inputBrake = 0;
//         break;
//       case 'd':
//         this.inputSteering = 0;
//       case 'a':
//         this.inputSteering = 0;
//         break;
//     }
//   }

//   update() {
//     // Total Force and Torque
//     const totalF = this.totalForce();
//     const totalT = this.totalTorque();

//     // Linear acceleration
//     this.acceleration.copy(totalF).divideScalar(this.mass);

//     this.aLength = this.acceleration.length();
//     // Linear velocity
//     this.velocity.add(this.acceleration.clone().multiplyScalar(1));

//     this.vLength = this.velocity.length();

//     // Position
//     this.position.add(this.velocity.clone().multiplyScalar(1));

//     // Angular acceleration
//     this.angularAcceleration.copy(totalT).divide(this.inertia);

//     // Angular velocity
//     this.angularVelocity.add(this.angularAcceleration.clone().multiplyScalar(1));

//     // Rotation (Euler angles)
//     this.rotation.add(this.angularVelocity.clone().multiplyScalar(1));

//     // Braking
//     if (Math.abs(this.vLength) < 0.1 && this.inputThrottle === 0) {
//       this.velocity.set(0, 0, 0);
//       this.acceleration.set(0, 0, 0);
//     }
//   }

//   getDynamicSubmergedVolume() {
//     const pitchAngle = this.getPitchAngle();
//     const baseSubmergedVolume = this.submergedVolume; // Base volume when the boat is level
//     return baseSubmergedVolume * Math.cos(pitchAngle);
//   }

//   getPitchAngle() {
//     return this.rotation.x; // Assuming the rotation.x represents the pitch angle in radians
//   }

//   totalForce() {
//     let tf = new THREE.Vector3();
//     tf.add(this.airResistanceForce());
//     tf.add(this.propulsionForce());
//     tf.add(this.buoyancyForce());
//     tf.add(this.weightForce());
//     return tf;
//   }

//   totalTorque() {
//     let tt = new THREE.Vector3();
//     tt.add(this.propulsionTorque());
//     tt.add(this.resistanceTorque());
//     return tt;
//   }

//   propulsionForce() {
//     const throttleForce = this.inputThrottle * this.engineForce;
//     const resistanceForce = this.calculateWaterResistance();
//     const propulsionForceMagnitude = throttleForce - resistanceForce;

//     // Calculate the forward direction based on the boat's rotation
//     const forwardDirection = new THREE.Vector3(1, 0, 0);
//     const euler = new THREE.Euler(this.rotation.x, this.rotation.y, this.rotation.z);
//     forwardDirection.applyEuler(euler);
//     const propulsionForce = forwardDirection.multiplyScalar(propulsionForceMagnitude);

//     return propulsionForce;
//   }

//   propulsionTorque() {
//     // Simplified torque based on steering input
//     const steeringTorque = this.inputSteering * this.engineForce;
//     return new THREE.Vector3(0, steeringTorque, 0); // Assuming yaw rotation around Y-axis
//   }

//   resistanceTorque() {
//     // Damping torque based on angular velocity
//     const dampingTorque = this.angularVelocity.clone().multiplyScalar(-this.angularDamping);
//     return dampingTorque;
//   }

//   calculateWaterResistance() {
//     const waterDragCoefficient = 0.1; // Adjust as needed
//     const speed = this.velocity.length(); // Speed of the boat
//     const frontalArea = 10; // Adjust as needed (cross-sectional area of boat facing the direction of motion)
//     const dragMagnitude = 0.5 * this.fluidDensity * waterDragCoefficient * frontalArea * speed * speed;
    
//       return dragMagnitude;
    
    
//   }

//   airResistanceForce() {
//     const dragMagnitude = -(this.rollResist * this.velocity.length() + this.airResist * this.velocity.length() * this.velocity.length());
//     return new THREE.Vector3(dragMagnitude, 0, 0);
//   }

//   buoyancyForce() {
//     const dynamicSubmergedVolume = this.getDynamicSubmergedVolume();
//     const buoyancyForce = this.fluidDensity * dynamicSubmergedVolume * this.gravity;
//     return new THREE.Vector3(0, buoyancyForce, 0);
//   }

//   weightForce() {
//     const weightForce = this.mass * this.gravity;
//     return new THREE.Vector3(0, -weightForce, 0);
//   }
// }

// export default Boat;











// class Boat {
//   constructor() {
//     this.position = new THREE.Vector3(); // position of the boat
//     this.velocity = new THREE.Vector3(); // velocity of the boat
//     this.acceleration = new THREE.Vector3(); // acceleration of the boat

//     this.rotation = new THREE.Vector3(); // rotation of the boat (Euler angles)
//     this.angularVelocity = new THREE.Vector3(); // angular velocity
//     this.angularAcceleration = new THREE.Vector3(); // angular acceleration

//     this.mass = 5000.0;
//     this.engineForce = 500.0;
//     this.airResist = 2.5;
//     this.rollResist = 1.0;
//     this.gravity = 9.81;
//     this.vLength = 0.0;

//     this.throttle = 0;
//     this.inputBrake = 0;
//     this.inputThrottle = 0;
//     this.inputSteering = 0; // For rotation control

//     this.fluidDensity = 1000; // Density of water in kg/m³
//     this.submergedVolume = 5; // Submerged volume in cubic meters (can be dynamic)

//     // Moments of inertia (simplified assumption)
//     this.inertia = new THREE.Vector3(5000, 5000, 5000); // Adjust as needed

//     // Add event listeners
//     document.addEventListener('keydown', this.handleKeyDown.bind(this));
//     document.addEventListener('keyup', this.handleKeyUp.bind(this));
//   }

//   handleKeyDown(event) {
//     switch (event.key) {
//       case 'w':
//         this.inputThrottle = Math.min(this.inputThrottle + 0.01, 1);
//         break;
//       case 's':
//         this.inputBrake = Math.min(this.inputBrake + 0.01, 0.4);
//         break;
//       case 'd':
//         if (this.vLength > 0) {
//         this.inputSteering = Math.max(this.inputSteering - 0.001, -1);
//         }
//         break;
//       case 'a':
//         if (this.vLength > 0) {
//         this.inputSteering = Math.min(this.inputSteering + 0.001, 1);
//         }
//         break;
//     }
//   }

//   handleKeyUp(event) {
//     switch (event.key) {
//       case 'w':
//         this.inputThrottle = 0;
//         break;
//       case 's':
//         this.inputBrake = 0;
//         break;
//       case 'd':
//         this.inputSteering = 0;
//       case 'a':
//         this.inputSteering = 0;
//         break;
//     }
//   }

//   update() {
//     // Total Force and Torque
//     const totalF = this.totalForce();
//     const totalT = this.totalTorque();

//     // Linear acceleration
//     this.acceleration.copy(totalF).divideScalar(this.mass);

//     // Linear velocity
//     this.velocity.add(this.acceleration.clone().multiplyScalar(1));

//     this.vLength = this.velocity.length();

//     // Position
//     this.position.add(this.velocity.clone().multiplyScalar(1));

//     // Angular acceleration
//     this.angularAcceleration.copy(totalT).divide(this.inertia);

//     // Angular velocity
//     this.angularVelocity.add(this.angularAcceleration.clone().multiplyScalar(1));

//     // Rotation (Euler angles)
//     this.rotation.add(this.angularVelocity.clone().multiplyScalar(1));

//     // Braking
//     if (Math.abs(this.vLength) < 0.1 && this.inputThrottle === 0) {
//       this.velocity.set(0, 0, 0);
//       this.acceleration.set(0, 0, 0);
//     }
//   }

//   getDynamicSubmergedVolume() {
//     const pitchAngle = this.getPitchAngle();
//     const baseSubmergedVolume = this.submergedVolume; // Base volume when the boat is level
//     return baseSubmergedVolume * Math.cos(pitchAngle);
//   }

//   getPitchAngle() {
//     return this.rotation.x; // Assuming the rotation.x represents the pitch angle in radians
//   }

//   totalForce() {
//     let tf = new THREE.Vector3();
//     tf.add(this.airResistanceForce());
//     tf.add(this.propulsionForce());
//     tf.add(this.buoyancyForce());
//     tf.add(this.weightForce());
//     return tf;
//   }

//   totalTorque() {
//     let tt = new THREE.Vector3();
//     tt.add(this.propulsionTorque());
//     tt.add(this.resistanceTorque());
//     return tt;
//   }

//   propulsionForce() {
//     const throttleForce = this.inputThrottle * this.engineForce;
//     const resistanceForce = this.calculateWaterResistance();
//     const propulsionForceMagnitude = throttleForce - resistanceForce;

//     // Calculate the forward direction based on the boat's rotation
//     const forwardDirection = new THREE.Vector3(1, 0, 0);
//     const euler = new THREE.Euler(this.rotation.x, this.rotation.y, this.rotation.z);
//     forwardDirection.applyEuler(euler);
//     const propulsionForce = forwardDirection.multiplyScalar(propulsionForceMagnitude);

//     return propulsionForce;
//   }

//   propulsionTorque() {
//     // Simplified torque based on steering input
//     const steeringTorque = this.inputSteering * this.engineForce;
//     return new THREE.Vector3(0, steeringTorque, 0); // Assuming yaw rotation around Y-axis
    
//   }
//   //   resistanceTorque() {
//   //   // Simplified torque based on angular velocity
//   //   const resistanceTorque = -this.angularVelocity.clone().multiplyScalar(this.rollResist);
//   //   return new THREE.Vector3(0, resistanceTorque, 0);
    
//   // }

//   calculateWaterResistance() {
//     const waterDragCoefficient = 0.1; // Adjust as needed
//     const speed = this.velocity.length(); // Speed of the boat
//     const frontalArea = 3; // Adjust as needed (cross-sectional area of boat facing the direction of motion)
//     const dragMagnitude = 0.5 * this.fluidDensity * waterDragCoefficient * frontalArea * speed * speed;
//     return dragMagnitude;
//   }

//   airResistanceForce() {
//     const dragMagnitude = -(this.rollResist * this.velocity.length() + this.airResist * this.velocity.length() * this.velocity.length());
//     return new THREE.Vector3(dragMagnitude, 0, 0);
//   }

//   buoyancyForce() {
//     const dynamicSubmergedVolume = this.getDynamicSubmergedVolume();
//     const buoyancyForce = this.fluidDensity * dynamicSubmergedVolume * this.gravity;
//     return new THREE.Vector3(0, buoyancyForce, 0);
//   }

//   weightForce() {
//     const weightForce = this.mass * this.gravity;
//     return new THREE.Vector3(0, -weightForce, 0);
//   }
// }

// export default Boat;













// class Boat {
//   constructor() {
//     this.position = new THREE.Vector3(); // position of the boat
//     this.velocity = new THREE.Vector3(); // velocity of the boat
//     this.acceleration = new THREE.Vector3(); // acceleration of the boat

//     this.rotation = new THREE.Vector3(); // rotation of the boat (Euler angles)
//     this.angularVelocity = new THREE.Vector3(); // angular velocity
//     this.angularAcceleration = new THREE.Vector3(); // angular acceleration

//     this.mass = 5000.0;
//     this.engineForce = 500.0;
//     this.airResist = 2.5;
//     this.rollResist = 1.0;
//     this.gravity = 9.81;
//     this.vLength = 0.0;

//     this.throttle = 0;
//     this.inputBrake = 0;
//     this.inputThrottle = 0;
//     this.inputSteering = 0; // For rotation control

//     this.fluidDensity = 1000; // Density of water in kg/m³
//     this.submergedVolume = 5; // Submerged volume in cubic meters (can be dynamic)

//     // Moments of inertia (simplified assumption)
//     this.inertia = new THREE.Vector3(5000, 5000, 5000); // Adjust as needed

//     // Add event listeners
//     document.addEventListener('keydown', this.handleKeyDown.bind(this));
//     document.addEventListener('keyup', this.handleKeyUp.bind(this));
//   }

//   handleKeyDown(event) {
//     switch (event.key) {
//       case 'w':
//         this.inputThrottle = Math.min(this.inputThrottle + 0.01, 1);
//         break;
//       case 's':
//         this.inputBrake = Math.min(this.inputBrake + 0.01, 0.4);
//         break;
//       case 'd':
//         this.inputSteering = Math.min(this.inputSteering + 0.001, 1);
//         this.inputThrottle = Math.min(this.inputThrottle + 0.01, 1);
//         break;
//       case 'a':
//         this.inputSteering = Math.max(this.inputSteering - 0.001, -1);
//         break;
//     }
//   }

//   handleKeyUp(event) {
//     switch (event.key) {
//       case 'w':
//         this.inputThrottle = 0;
//         break;
//       case 's':
//         this.inputBrake = 0;
//         break;
//       case 'd':
//       case 'a':
//         this.inputSteering = 0;
//         break;
//     }
//   }

//   update() {
//     // Total Force and Torque
//     const totalF = this.totalForce();
//     const totalT = this.totalTorque();

//     // Linear acceleration
//     this.acceleration.copy(totalF).divideScalar(this.mass);

//     // Linear velocity
//     this.velocity.add(this.acceleration.clone().multiplyScalar(1));

//     this.vLength = this.velocity.length();

//     // Position
//     this.position.add(this.velocity.clone().multiplyScalar(1));

//     // Angular acceleration
//     this.angularAcceleration.copy(totalT).divide(this.inertia);

//     // Angular velocity
//     this.angularVelocity.add(this.angularAcceleration.clone().multiplyScalar(1));

//     // Rotation (Euler angles)
//     this.rotation.add(this.angularVelocity.clone().multiplyScalar(1));

//     // Braking
//     if (Math.abs(this.vLength) < 0.1 && this.inputThrottle === 0) {
//       this.velocity.set(0, 0, 0);
//       this.acceleration.set(0, 0, 0);
//     }
//   }

//   getDynamicSubmergedVolume() {
//     const pitchAngle = this.getPitchAngle();
//     const baseSubmergedVolume = this.submergedVolume; // Base volume when the boat is level
//     return baseSubmergedVolume * Math.cos(pitchAngle);
//   }

//   getPitchAngle() {
//     return this.rotation.x; // Assuming the rotation.x represents the pitch angle in radians
//   }

//   totalForce() {
//     let tf = new THREE.Vector3();
//     tf.add(this.airResistanceForce());
//     tf.add(this.propulsionForce());
//     tf.add(this.buoyancyForce());
//     tf.add(this.weightForce());
//     return tf;
//   }

//   totalTorque() {
//     let tt = new THREE.Vector3();
//     tt.add(this.propulsionTorque());
//     // tt.add(this.resistanceTorque());
//     return tt;
//   }

//   propulsionForce() {
//     const throttleForce = this.inputThrottle * this.engineForce;
//     const resistanceForce = this.calculateWaterResistance();
//     const propulsionForce = throttleForce - resistanceForce;
//     return new THREE.Vector3(propulsionForce, 0, 0);
//   }

//   propulsionTorque() {
//     // Simplified torque based on steering input
//     const steeringTorque = this.inputSteering * this.engineForce;
//     return new THREE.Vector3(0, steeringTorque, 0); // Assuming yaw rotation around Y-axis
//   }

//   calculateWaterResistance() {
//     const waterDragCoefficient = 0.1; // Adjust as needed
//     const speed = this.velocity.length(); // Speed of the boat
//     const frontalArea = 3; // Adjust as needed (cross-sectional area of boat facing the direction of motion)
//     const dragMagnitude = 0.5 * this.fluidDensity * waterDragCoefficient * frontalArea * speed * speed;
//     return dragMagnitude;
//   }

//   airResistanceForce() {
//     const dragMagnitude = -(this.rollResist * this.velocity.length() + this.airResist * this.velocity.length() * this.velocity.length());
//     return new THREE.Vector3(dragMagnitude, 0, 0);
//   }

//   // resistanceTorque() {
//   //   // Simplified torque based on angular velocity
//   //   const resistanceTorque = -this.angularVelocity.clone().multiplyScalar(this.rollResist);
//   //   return new THREE.Vector3(0, resistanceTorque, 0);
    
//   // }

//   buoyancyForce() {
//     const dynamicSubmergedVolume = this.getDynamicSubmergedVolume();
//     const buoyancyForce = this.fluidDensity * dynamicSubmergedVolume * this.gravity;
//     return new THREE.Vector3(0, buoyancyForce, 0);
//   }

//   weightForce() {
//     const weightForce = this.mass * this.gravity;
//     return new THREE.Vector3(0, -weightForce, 0);
//   }
// }

// export default Boat;














// class Boat {
//   constructor() {
//     this.position = new THREE.Vector3(); // position of the boat
//     this.velocity = new THREE.Vector3(); // velocity of the boat
//     this.acceleration = new THREE.Vector3(); // acceleration of the boat
//     this.rotation = new THREE.Euler(); // rotation of the boat

//     this.mass = 5000.0;
//     this.engineForce = 500.0;

//     this.airResist = 2.5;
//     this.rollResist = 8.0;
//     this.gravity = 9.81;
//     this.vLength = 0.0;

//     this.throttle = 0;
//     this.InputBrake = 0;
//     this.InputThrottle = 0;

//     this.fluidDensity = 1000; // Density of water in kg/m³
//     this.submergedVolume = 5; // Submerged volume in cubic meters (can be dynamic)

//     this.angularVelocity = new THREE.Vector3(); // Angular velocity
//     this.angularAcceleration = new THREE.Vector3(); // Angular acceleration
//     this.torque = new THREE.Vector3(); // Torque

//     // Control
//     document.addEventListener('keydown', (event) => {
//       switch (event.key) {
//         case 'd':
//           this.torque.z = -0.05; // Apply right torque
//           break;
//         case 'a':
//           this.torque.z = 0.05; // Apply left torque
//           break;
//         case 'w':
//           if (this.InputThrottle <= 1) {
//             this.InputThrottle += 0.05;
//           }
//           break;
//         case 's':
//           if (this.InputBrake <= 0.4) {
//             this.InputBrake += 0.01;
//           }
//           break;
//       }
//     });

//     document.addEventListener('keyup', (event) => {
//       switch (event.key) {
//         case 'd':
//         case 'a':
//           this.torque.z = 0; // Stop applying torque when key is released
//           break;
//         case 'w':
//           this.InputThrottle = 0;
//           break;
//         case 's':
//           this.InputBrake = 0;
//           break;
//       }
//     });
//   }

//   update() {
//     // Total Force 
//     const totalF = this.totalForce();

//     // Linear acceleration
//     this.acceleration.copy(totalF).divideScalar(this.mass);

//     // Linear velocity
//     this.velocity.add(this.acceleration.clone().multiplyScalar(1));

//     this.vLength = this.velocity.length();

//     // Position
//     this.position.add(this.velocity.clone().multiplyScalar(1));

//     // Angular acceleration
//     this.angularAcceleration.copy(this.torque).divideScalar(this.mass);

//     // Angular velocity
//     this.angularVelocity.add(this.angularAcceleration.clone().multiplyScalar(1));

//     // Rotation
//     this.rotation.x += this.angularVelocity.x;
//     this.rotation.y += this.angularVelocity.y;
//     this.rotation.z += this.angularVelocity.z;

    
//     // Braking
//     if (Math.abs(this.vLength) < 0.1 && this.InputThrottle === 0) {
//       this.velocity.set(0, 0, 0);
//       this.acceleration.set(0, 0, 0);
//     }
//   }

//   getDynamicSubmergedVolume() {
//     const pitchAngle = this.getPitchAngle();
//     const baseSubmergedVolume = 5; // Base volume when the boat is level
//     return baseSubmergedVolume * Math.cos(pitchAngle);
//   }

//   getPitchAngle() {
//     return this.rotation.x; // Assuming the rotation.x represents the pitch angle in radians
//   }

//   totalForce() {
//     let tf = new THREE.Vector3();
//     tf.add(this.airResistanceForce());
//     tf.add(this.propulsionForce());
//     tf.add(this.buoyancyForce());
//     tf.add(this.weightForce());
//     return tf;
//   }

//   propulsionForce() {
//     const throttleForce = this.InputThrottle * this.engineForce;
//     const resistanceForce = this.calculateWaterResistance();
//     const propulsionForce = throttleForce - resistanceForce;
//     return new THREE.Vector3(propulsionForce, 0, 0);
//   }

//   calculateWaterResistance() {
//     const waterDensity = 1000; // Density of water in kg/m³
//     const waterDragCoefficient = 0.1; // Adjust as needed
//     const speed = this.velocity.length(); // Speed of the boat
//     const frontalArea = 3; // Adjust as needed (cross-sectional area of boat facing the direction of motion)
//     const dragMagnitude = 0.5 * waterDensity * waterDragCoefficient * frontalArea * speed * speed;
//     return dragMagnitude;
//   }

//   airResistanceForce() {
//     const dragMagnitude = -(this.rollResist * this.velocity.length() + this.airResist * this.velocity.length() * this.velocity.length());
//     return new THREE.Vector3(dragMagnitude, 0, 0);
//   }

//   buoyancyForce() {
//     const dynamicSubmergedVolume = this.getDynamicSubmergedVolume();
//     const buoyancyForce = this.fluidDensity * dynamicSubmergedVolume * this.gravity;
//     return new THREE.Vector3(0, buoyancyForce, 0);
//   }

//   weightForce() {
//     let weightForce = this.mass * this.gravity;

//     if (this.mass < 5000) {
//       weightForce = 49050; // Assuming a default weight if mass is less than 5000 kg
//     }

//     return new THREE.Vector3(0, -weightForce, 0);
//   }
// }

// export default Boat;






// class Boat {
//   constructor() {
//     this.position = new THREE.Vector3(); // position of the boat
//     this.velocity = new THREE.Vector3(); // velocity of the boat
//     this.acceleration = new THREE.Vector3(); // acceleration of the boat
//     this.rotation = new THREE.Vector3(); // rotation of the boat

//     this.mass = 5000.0;
//     this.engineForce = 500.0;
    
//     this.airResist = 2.5;
//     this.rollResist = 8.0;
//     this.gravity = 9.81;
//     this.vLength = 0.0;

//     this.throttle = 0;
//     this.InputBrake = 0;
//     this.InputThrottle = 0;

//     this.fluidDensity = 1000; // Density of water in kg/m³
//     this.submergedVolume = 5; // Submerged volume in cubic meters (can be dynamic)

//     // control

//     document.addEventListener('keydown', (event) => {
//       if (event.key === 'd'){
//         if (this.InputThrottle <= 1){
//           this.InputThrottle += 0.01;
//         }
//       }
    
//       if (event.key === 'a'){
//         if (this.InputBrake <= 0.4){
//           this.InputBrake += 0.01;
//         }
//       }
//     });


//     document.addEventListener('keydown', (event) => {
//       if (event.key === 'w'){
//         if (this.InputThrottle <= 1){
//           this.InputThrottle += 0.05;
//         }
//       }
    
//       if (event.key === 's'){
//         if (this.InputBrake <= 0.4){
//           this.InputBrake += 0.01;
//         }
//       }
//     });

//     document.addEventListener('keyup',(event) => {
//       if (event.key === 'w'){
//         this.InputThrottle = 0;
//       }
//       if (event.key === 's'){
//         this.InputBrake = 0;
//       }
//     });
    
//   }

//   update() {
//     // Total Force 
//     const totalF = this.totalForce();

//     // Linear acceleration
//     this.acceleration.copy(totalF).divideScalar(this.mass);

//     // Linear velocity
//     this.velocity.add(this.acceleration.clone().multiplyScalar(1));

//     this.vLength = this.velocity.length();

//     // Position
//     this.position.add(this.velocity.clone().multiplyScalar(1));

//     // Rotation
//     // Implement rotation handling if necessary

//     // Braking
//     if (Math.abs(this.vLength) < 0.1 && this.throttle === 0) {
//       this.velocity.set(0, 0, 0);
//       this.acceleration.set(0, 0, 0);
//     }
//   }

//   getDynamicSubmergedVolume() {
//     const pitchAngle = this.getPitchAngle();
//     const baseSubmergedVolume = 5; // Base volume when the boat is level
//     return baseSubmergedVolume * Math.cos(pitchAngle);
//   }

//   getPitchAngle() {
//     return this.rotation.x; // Assuming the rotation.x represents the pitch angle in radians
//   }

//   totalForce() {
//     let tf = new THREE.Vector3();
//     tf.add(this.airResistanceForce());
//     tf.add(this.propulsionForce());
//     tf.add(this.buoyancyForce());
//     tf.add(this.weightForce());
//     return tf;
//   }

//   propulsionForce() {
//     const throttleForce = this.InputThrottle * this.engineForce;
//     const resistanceForce = this.calculateWaterResistance();
//     const propulsionForce = throttleForce - resistanceForce;
//     return new THREE.Vector3(propulsionForce, 0, 0);
//   }

//   calculateWaterResistance() {
//     const waterDensity = 1000; // Density of water in kg/m³
//     const waterDragCoefficient = 0.1; // Adjust as needed
//     const speed = this.velocity.length(); // Speed of the boat
//     const frontalArea = 3; // Adjust as needed (cross-sectional area of boat facing the direction of motion)
//     const dragMagnitude = 0.5 * waterDensity * waterDragCoefficient * frontalArea * speed * speed;
//     return dragMagnitude;
//   }

//   airResistanceForce() {
//     const dragMagnitude = -(this.rollResist * this.velocity.length() + this.airResist * this.velocity.length() * this.velocity.length());
//     return new THREE.Vector3(dragMagnitude, 0, 0);
//   }

//   buoyancyForce() {
//     const dynamicSubmergedVolume = this.getDynamicSubmergedVolume();
//     const buoyancyForce = this.fluidDensity * dynamicSubmergedVolume * this.gravity;
//     return new THREE.Vector3(0, buoyancyForce, 0);
//   }

//   weightForce() {
//     let weightForce = this.mass * this.gravity;

//     if (this.mass < 5000) {
//       weightForce = 49050; // Assuming a default weight if mass is less than 5000 kg
//     }

//     return new THREE.Vector3(0, -weightForce, 0);
//   }
// }

// export default Boat;









// import "./style.css";
// import * as dat from "dat.gui";
// import Vector3 from "./Library";
// import Diriction from "./Directions";
// import GMath from "./GMath";

// class Boat {
//   constructor() {
//     this.position = new Vector3(); // position of the boat
//     this.velocity = new Vector3(); // velocity of the boat
//     this.acceleration = new Vector3(); // acceleration of the boat
//     this.rotation = new Vector3(); // rotation of the boat

//     this.mass = 5000.0;
//     this.engineForce = 4000.0;
//     this.brakeForce = 6000.0;
//     this.ebrakeForce = this.brakeForce / 2.5;
//     this.airResist = 2.5;
//     this.rollResist = 8.0;
//     this.gravity = 9.81;
//     this.vLength = 0.0;

//     this.throttle = 0;
//     this.InputBrake = 0;
//     this.InputThrottle = 0;

//     this.fluidDensity = 1000; // Density of water in kg/m³
//     this.submergedVolume = 5; // Submerged volume in cubic meters (can be dynamic)
    

    
    
//     // control
//     document.addEventListener('keydown', (event) => {
//       if (event.key === 'w'){
//         if (this.InputThrottle <= 1){
//           this.InputThrottle += 0.01;
//         }
//       }
    
//       if (event.key === 's'){
//         if (this.InputBrake <= 0.4){
//           this.InputBrake += 0.01;
//         }
//       }
//     });

//     document.addEventListener('keyup',(event) => {
//       if (event.key === 'w'){
//         this.InputThrottle = 0;
//       }
//       if (event.key === 's'){
//         this.InputBrake = 0;
//       }
//     });
    
//   }

//   update() {
    
//     // Total Force 
//     const totalF = this.totalForce();

//     // Linear acceleration
//     this.acceleration = totalF.divideScalar(this.mass);

//     // Linear velocity
//     this.velocity = this.velocity.addVector(
//       this.acceleration.clone().multiplyScalar(1)
//     );

//     this.vLength = this.velocity.length();

//     // Position
//     this.position = this.position.addVector(
//       this.velocity.clone().multiplyScalar(1)
//     );

//     // Break
//     if (Math.abs(this.vLength) < 0.1 && this.throttle === 0) {
//       this.velocity.x = this.velocity.y = this.velocity.z = this.vLength = 0;
//       this.acceleration.x = this.acceleration.y = this.acceleration.z = 0;
//     }
    

//   }

//   getDynamicSubmergedVolume() {
//     const pitchAngle = this.getPitchAngle();
//     const baseSubmergedVolume = 5; // Base volume when the boat is level
//     return baseSubmergedVolume * Math.cos(pitchAngle);
//   }

//   getPitchAngle() {
//     return this.rotation.x; // Assuming the rotation.x represents the pitch angle in radians
//   }

//   totalForce() {
//     let tf = new Vector3();
//     tf = tf.addVector(this.dragForce());
//     tf = tf.addVector(this.tractionForce());
//     tf = tf.addVector(this.buoyancyForce());
//     tf = tf.addVector(this.weightForce());
//     return tf;
//   }

//   tractionForce() {
//     const brake = this.InputBrake * this.brakeForce;
//     this.throttle = this.InputThrottle * this.engineForce;
//     const tractionForce = this.throttle - (brake * GMath.sign(this.vLength));
//     return new Vector3(tractionForce, 0, 0);
//   }

//   dragForce() {
//     const dragMagnitude = -(this.rollResist * this.velocity.length() - this.airResist * this.velocity.length() * Math.abs(this.velocity.length()));
//     return new Vector3(dragMagnitude, 0, 0);
//   }

//   //1000*5*9.81 = 49050
//   buoyancyForce() {
    
//     const dynamicSubmergedVolume = this.getDynamicSubmergedVolume();
//     const buoyancyForce = this.fluidDensity * dynamicSubmergedVolume * this.gravity;
    
//     return new Vector3(0, buoyancyForce, 0);
//   }

//   // 5000 *9.81 = 49050
//   weightForce() {
//     var weightForce = this.mass * this.gravity;

//     if (this.mass < 5000) {
//       weightForce = 49050;
//     }

//     return new Vector3(0, -weightForce, 0);
//   }
  
// }



// export default Boat;
