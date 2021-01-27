// Desarrollado por Jorge Aharon López Aguilar, Jesús Omar Cuenca Espino, y Jesús Perea Villegas.
// Developed by Jorge Aharon López Aguilar, Jesús Omar Cuenca Espino, and Jesús Perea Villegas.

var PointerLockControls = function (camera, cannonBody) {
  var eyeYPos = 2; // eyes are 2 units above the ground.
  var velocityFactor = 0.2;
  var jumpVelocity = 30;
  var scope = this;

  var pitchObject = new THREE.Object3D();
  pitchObject.add(camera);

  var yawObject = new THREE.Object3D();
  yawObject.position.y = eyeYPos; // Updtaes the camera position in the player body.
  yawObject.add(pitchObject);

  var quat = new THREE.Quaternion();

  var moveForward = false;
  var moveBackward = false;
  var moveLeft = false;
  var moveRight = false;

  var canJump = false;

  var contactNormal = new CANNON.Vec3(); // Normal in the contact, pointing *out* of whatever the player touched
  var upAxis = new CANNON.Vec3(0, 1, 0);
  cannonBody.addEventListener("collide", function (e) {
    var contact = e.contact;

    // contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
    // We do not yet know which one is which! Let's check.
    if (contact.bi.id == cannonBody.id)
      // bi is the player body, flip the contact normal
      contact.ni.negate(contactNormal);
    else contactNormal.copy(contact.ni); // bi is something else. Keep the normal as it is

    // If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
    if (contactNormal.dot(upAxis) > 0.5)
      // Use a "good" threshold value between 0 and 1 here!
      canJump = true;
  });

  var velocity = cannonBody.velocity;

  var PI_2 = Math.PI / 2;

  //PointerLock.
  var onMouseMove = function (event) {
    if (scope.enabled === false) return;

    var movementX =
      event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY =
      event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    yawObject.rotation.y -= movementX * 0.002;
    pitchObject.rotation.x -= movementY * 0.002;

    pitchObject.rotation.x = Math.max(
      -PI_2,
      Math.min(PI_2, pitchObject.rotation.x)
    );
  };

  var onKeyDown = function (event) {
    switch (event.keyCode) {
      case 38: // up
      case 87: // w
        moveForward = true;
        break;

      case 37: // left
      case 65: // a
        moveLeft = true;
        break;

      case 40: // down
      case 83: // s
        moveBackward = true;
        break;

      case 39: // right
      case 68: // d
        moveRight = true;
        break;

      case 32: // space
        if (canJump === true) {
          velocity.y = jumpVelocity;
        }
        canJump = false;
        break;
    }
  };

  var onKeyUp = function (event) {
    switch (event.keyCode) {
      case 38: // up
      case 87: // w
        moveForward = false;
        break;

      case 37: // left
      case 65: // a
        moveLeft = false;
        break;

      case 40: // down
      case 83: // a
        moveBackward = false;
        break;

      case 39: // right
      case 68: // d
        moveRight = false;
        break;
    }
  };

  document.addEventListener("mousemove", onMouseMove, false);
  document.addEventListener("keydown", onKeyDown, false);
  document.addEventListener("keyup", onKeyUp, false);

  this.enabled = false;

  this.getObject = function () {
    return yawObject;
  };

  this.getDirection = function (targetVec) {
    targetVec.set(0, 0, -1);
    quat.multiplyVector3(targetVec);
  };

  // Moves the camera to the Cannon.js object position and adds velocity to the object if the run key is down
  var inputVelocity = new THREE.Vector3();
  var euler = new THREE.Euler();
  this.update = function (delta) {
    if (scope.enabled === false) return;

    delta *= 0.3; //0.1;

    inputVelocity.set(0, 0, 0);

    if (moveForward) {
      inputVelocity.z = -velocityFactor * delta;
    }
    if (moveBackward) {
      inputVelocity.z = velocityFactor * delta;
    }

    if (moveLeft) {
      inputVelocity.x = -velocityFactor * delta;
    }
    if (moveRight) {
      inputVelocity.x = velocityFactor * delta;
    }

    // Convert velocity to world coordinates
    euler.x = pitchObject.rotation.x;
    euler.y = yawObject.rotation.y;
    euler.order = "XYZ";
    quat.setFromEuler(euler);
    inputVelocity.applyQuaternion(quat);
    // quat.multiplyVector3( inputVelocity );

    // Add to the object
    velocity.x += inputVelocity.x;
    velocity.z += inputVelocity.z;

    yawObject.position.copy(cannonBody.position);
    yawObject.position.y += 1;

    // player.handElement.position.set(yawObject.x + 1, yawObject.y - 2.5, yawObject.z + 6);
  };
};

//########################
// code start

var playerShape,
  playerBody,
  world,
  physicsMaterial,
  helper,
  camera,
  scene,
  renderer,
  directionalLight = null,
  spotLight = null,
  ambientLight = null,
  pointLight = null,
  raycaster = null;
var geometry, material, mesh;
var controls,
  time = Date.now();

var handAnimator;
const animationDuration = 5;

var sword, axe, pickAxe;

//Water Shaders
var clock, uniforms;

let player = new Player();

let materialArray = {};

var blocker = document.getElementById("blocker");
var instructions = document.getElementById("instructions");

var havePointerLock =
  "pointerLockElement" in document ||
  "mozPointerLockElement" in document ||
  "webkitPointerLockElement" in document;

if (havePointerLock) {
  var element = document.body;

  var pointerlockchange = function (event) {
    if (
      document.pointerLockElement === element ||
      document.mozPointerLockElement === element ||
      document.webkitPointerLockElement === element
    ) {
      controls.enabled = true;
      let divTarget = document.createElement("div");
      divTarget.style.width = "5px";
      divTarget.style.height = "5px";
      divTarget.style.background = "red";
      divTarget.style.position = "absolute";
      divTarget.style.top = "0";
      divTarget.style.left = "0";
      divTarget.style.right = "0";
      divTarget.style.bottom = "0";
      divTarget.style.margin = "auto";
      divTarget.style.zIndex = "99";
      document.getElementById("container").appendChild(divTarget);

      blocker.style.display = "none";
    } else {
      controls.enabled = false;

      blocker.style.display = "-webkit-box";
      blocker.style.display = "-moz-box";
      blocker.style.display = "box";

      instructions.style.display = "";
    }
  };

  var pointerlockerror = function (event) {
    instructions.style.display = "";
  };

  // Hook pointer lock state change events
  document.addEventListener("pointerlockchange", pointerlockchange, false);
  document.addEventListener("mozpointerlockchange", pointerlockchange, false);
  document.addEventListener(
    "webkitpointerlockchange",
    pointerlockchange,
    false
  );

  document.addEventListener("pointerlockerror", pointerlockerror, false);
  document.addEventListener("mozpointerlockerror", pointerlockerror, false);
  document.addEventListener("webkitpointerlockerror", pointerlockerror, false);

  instructions.addEventListener(
    "click",
    function (event) {
      // Ask the browser to lock the pointer
      element.requestPointerLock =
        element.requestPointerLock ||
        element.mozRequestPointerLock ||
        element.webkitRequestPointerLock;

      if (/Firefox/i.test(navigator.userAgent)) {
        var fullscreenchange = function (event) {
          if (
            document.fullscreenElement === element ||
            document.mozFullscreenElement === element ||
            document.mozFullScreenElement === element
          ) {
            document.removeEventListener("fullscreenchange", fullscreenchange);
            document.removeEventListener(
              "mozfullscreenchange",
              fullscreenchange
            );

            element.requestPointerLock();
          }
        };

        document.addEventListener("fullscreenchange", fullscreenchange, false);
        document.addEventListener(
          "mozfullscreenchange",
          fullscreenchange,
          false
        );

        element.requestFullscreen =
          element.requestFullscreen ||
          element.mozRequestFullscreen ||
          element.mozRequestFullScreen ||
          element.webkitRequestFullscreen;

        element.requestFullscreen();
      } else {
        element.requestPointerLock();
      }
    },
    false
  );
} else {
  instructions.innerHTML =
    "Your browser doesn't seem to support Pointer Lock API";
}

let SHADOW_MAP_WIDTH = 512,
  SHADOW_MAP_HEIGHT = 512;

// Creates the cannon AKA the physics world.
function initCannon() {
  // Setup our world
  world = new CANNON.World();
  world.quatNormalizeSkip = 0;
  world.quatNormalizeFast = false;

  helper = new CannonHelper();

  var solver = new CANNON.GSSolver();

  //world.defaultContactMaterial.contactEquationStiffness = 1e9;
  //world.defaultContactMaterial.contactEquationRelaxation = 4;

  solver.iterations = 7;
  solver.tolerance = 0.1;
  var split = true;
  if (split) world.solver = new CANNON.SplitSolver(solver);
  else world.solver = solver;

  world.gravity.set(0, -80, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  createPlayer();
}

// Create the crosshair in the middle of the screen.
function createCrosshair() {
  let divTarget = document.createElement("div");
  divTarget.style.zIndex = "98";
  divTarget.style.width = "5px";
  divTarget.style.height = "30px";
  divTarget.style.background = "white";
  divTarget.style.position = "absolute";
  divTarget.style.top = "0";
  divTarget.style.left = "0";
  divTarget.style.right = "0";
  divTarget.style.bottom = "0";
  divTarget.style.margin = "auto";
  divTarget.style.zIndex = "99";
  let divTarget2 = document.createElement("div");
  divTarget.style.zIndex = "99";
  divTarget2.style.width = "30px";
  divTarget2.style.height = "5px";
  divTarget2.style.background = "white";
  divTarget2.style.position = "absolute";
  divTarget2.style.top = "0";
  divTarget2.style.left = "0";
  divTarget2.style.right = "0";
  divTarget2.style.bottom = "0";
  divTarget2.style.margin = "auto";
  divTarget2.style.zIndex = "99";
  document.getElementById("body").appendChild(divTarget);
  document.getElementById("body").appendChild(divTarget2);
}

// Creates the Inventory HUD.
function createInventory() {
  let divTarget = document.createElement("div");
  divTarget.style.width = "60vw";
  divTarget.style.zIndex = "99";
  // divTarget.style.border = "2px solid white";
  divTarget.style.height = "75px";
  divTarget.style.position = "absolute";
  divTarget.style.marginLeft = "265px";
  divTarget.style.marginTop = "47%";
  divTarget.style.whiteSpace = "nowrap";
  for (let index = 0; index < 10; index++) {
    let tempDiv = document.createElement("div");
    tempDiv.style.border = "2px solid white";
    tempDiv.style.height = "75px";
    tempDiv.style.width = "6vw";
    tempDiv.style.display = "inline-block";
    tempDiv.id = `inventory${index + 1}`;
    divTarget.appendChild(tempDiv);
  }
  document.getElementById("body").appendChild(divTarget);
}

function createHub() {
  createCrosshair();
  createInventory();
}

function init() {
  clock = new THREE.Clock();
  createHub();
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x39d5fc); //0xd6d6d6
  raycaster = new THREE.Raycaster();
  raycaster.near = 0;
  raycaster.far = 11.0;

  root = new THREE.Object3D();
  spotLight = new THREE.SpotLight(0xffffff, 1);
  spotLight.position.set(10, 15, 30);
  spotLight.target.position.set(0, 0, 0);
  root.add(spotLight);
  spotLight.castShadow = true;
  spotLight.shadow.camera.near = 1;
  spotLight.shadow.camera.far = 500;
  spotLight.shadow.camera.fov = 45;
  spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
  spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
  ambientLight = new THREE.AmbientLight(0xbbbbbb, 0.3);
  root.add(ambientLight);
  scene.add(root);

  controls = new PointerLockControls(camera, playerBody);
  scene.add(controls.getObject());

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.setClearColor(scene.fog.color, 1);

  document.body.appendChild(renderer.domElement);

  window.addEventListener("resize", onWindowResize, false);

  // Create the World
  createWorld(scene);

  document.addEventListener("mousedown", onDocumentMouseDown);
  document.addEventListener("keydown", onKeyDown);
  // player.setHand(controls.getObject(), scene);
  player.setHand(camera);
  createSun();
}

renderer = new THREE.WebGLRenderer({ canvas: controls, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
function createSun() {
  var sunGeometry = new THREE.BoxGeometry(1, 1, 0.1);

  let cube = new THREE.Mesh(
    sunGeometry,
    // The box will have a lambert material that has the emissive property, which means that it will emit light. There will be no other light source in the scene.
    new THREE.MeshLambertMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1,
    })
  );

  cube.position.set(10, 15, 30);
  scene.add(cube);

  addEffects();
}

// Params for the post processing effects.
let params = {
  exposure: 0.55,
  bloomStrength: 0.55,
  bloomRadius: 0.0000000001,
};

function addEffects() {
  // First, we need to create an effect composer: instead of rendering to the WebGLRenderer, we render using the composer.
  composer = new THREE.EffectComposer(renderer);

  // The effect composer works as a chain of post-processing passes. These are responsible for applying all the visual effects to a scene. They are processed in order of their addition. The first pass is usually a Render pass, so that the first element of the chain is the rendered scene.
  const renderPass = new THREE.RenderPass(scene, camera);

  // There are several passes available. Here we are using the UnrealBloomPass.
  bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.5,
    0.2,
    1
  );
  bloomPass.threshold = 0;
  bloomPass.strength = params.bloomStrength;
  //bloomPass.radius = params.bloomRadius;

  renderer.toneMappingExposure = Math.pow(params.exposure, 1.0);

  // After the passes are configured, we add them in the order we want them.
  composer.addPass(renderPass);
  composer.addPass(bloomPass);
}

function createPlayer() {
  var mass = 1;
  playerShape = new CANNON.Box(new CANNON.Vec3(0.1, 0.5, 0.1)); // Cuboid shape.
  playerMaterial = new CANNON.Material({ friction: 0, restitution: 0 });
  playerBody = new CANNON.Body({ mass: mass, material: playerMaterial });
  playerBody.addShape(playerShape);
  playerBody.rotation = false;
  playerBody.position.set(5, 3, 0);
  playerBody.angularDamping = 1; // Prevents the player body from rotating and tipping over.
  playerBody.linearDamping = 0.9999;
  world.add(playerBody);
}

// Helper function used to add a new Cannon object to the scene.
function addToWorld(block) {
  world.add(block.body);
  scene.add(block);
}

async function loadGLTF(gltfURL, position, rotation, object) {
  // Instantiate a loader
  let loader = new THREE.GLTFLoader();

  // Load a glTF resource
  await loader.load(
    // resource URL
    gltfURL,
    // called when the resource is loaded
    function (gltf) {
      //Resizing the gltf--------------
      let bbox = new THREE.Box3().setFromObject(gltf.scene);
      let cent = bbox.getCenter(new THREE.Vector3());
      let size = bbox.getSize(new THREE.Vector3());
      //Rescale the object to normalized space
      const maxAxis = Math.max(size.x, size.y, size.z);
      gltf.scene.scale.multiplyScalar(1.0 / maxAxis);
      bbox.setFromObject(gltf.scene);
      bbox.getCenter(cent);
      bbox.getSize(size);
      gltf.scene.position.x = position.x;
      gltf.scene.position.y = position.y;
      gltf.scene.position.z = position.z;
      if (rotation !== undefined) {
        gltf.scene.rotation.x = rotation.x !== undefined ? rotation.x : 0;
        gltf.scene.rotation.y = rotation.y !== undefined ? rotation.y : 0;
        gltf.scene.rotation.z = rotation.z !== undefined ? rotation.z : 0;
      }
      object = gltf.scene;
      scene.add(object);
      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Group
      gltf.scenes; // Array<THREE.Group>
      gltf.cameras; // Array<THREE.Camera>
      gltf.asset; // Object
    },
    // called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    // called when loading has errors
    function (error) {
      console.log("An error happened");
    }
  );
}

async function getTools() {
  const pickAxeURL = "../Assets/pickAxe.gltf";
  const axeURL = "../Assets/axe.gltf";
  const swordURL = "../Assets/sword.gltf";
  await loadGLTF(pickAxeURL, { x: 0, y: 1, z: 0 }, { z: Math.PI / 2 }, pickAxe); //PickAxe
  await loadGLTF(axeURL, { x: 0, y: 1, z: -1 }, { z: Math.PI / 2 }, axe); //Axe
  await loadGLTF(
    swordURL,
    { x: 0, y: 1, z: 1 },
    { z: Math.PI / 2, x: Math.PI / 2 },
    sword
  ); //Sword
}
function initAnimation(init, finish) {
  handAnimator = new KF.KeyFrameAnimator();
  handAnimator.init({
    interps: [
      {
        keys: [0, 0.5, 1],
        values: [{ x: finish }, { x: init }, { x: finish }],
        target: player.handElement.rotation,
        // target:object
      },
    ],
    easing: TWEEN.Easing.Linear.None,
    duration: 0.5 * 1000,
    loop: false,
  });
}

let simpleTextures = {};
// Loads the textures needed.
function loadMaterials() {
  simpleTextures.stoneCube = "../images/stoneCube.png";
  simpleTextures.dirtCube = "../images/dirtCube.png";
  simpleTextures.diamondCube = "../images/diamondCube.png";
  simpleTextures.goldCube = "../images/goldCube.png";
  simpleTextures.grassCube = "../images/grass.png";
  simpleTextures.woodCube = "../images/woodSide.png";
  simpleTextures.leafCube = "../images/leaf.png";
  simpleTextures.ironCube = "../images/iron.png";

  let loader = new THREE.TextureLoader();

  // getTools();

  //For the water shaders
  uniforms = {
    time: { value: 1.0 },
    uvScale: { value: new THREE.Vector2(2.0, 1) },
    texture1: { value: loader.load("../images/water.jpg") },
    texture2: { value: loader.load("../images/water_shade.jpg") },
  };
  uniforms["texture1"].value.wrapS = uniforms["texture1"].value.wrapT =
    THREE.RepeatWrapping;
  uniforms["texture2"].value.wrapS = uniforms["texture2"].value.wrapT =
    THREE.RepeatWrapping;

  materialArray.water = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById("waterVertexShader").textContent,
    fragmentShader: document.getElementById("waterFragmentShader").textContent,
  });

  // Loads all the required textures.
  let dirtTexture = loader.load("../images/dirtCube.png");
  let stoneTexture = loader.load("../images/stoneCube.png");
  let diamonTexture = loader.load("../images/diamondCube.png");
  let goldTexture = loader.load("../images/goldCube.png");
  let grassTextures = [
    loader.load("../images/dirtSide.jpg"),
    loader.load("../images/grass.png"),
    loader.load("../images/dirtCube.png"),
  ];
  let woodTextures = [
    loader.load("../images/woodSide.png"),
    loader.load("../images/woodTop.png"),
  ];
  let leafTexture = loader.load("../images/leaf.png");
  let ironTexture = loader.load("../images/iron.png");
  let bedRockTexture = loader.load("../images/bedrock.png");
  bedRockTexture.wrapS = bedRockTexture.wrapT = THREE.RepeatWrapping;
  const SIZE_TO_REPEAT = 8; // The bigger the number, the more repetitions.
  bedRockTexture.repeat.set(SIZE_TO_REPEAT, SIZE_TO_REPEAT);
  materialArray.bedrock = new THREE.MeshPhongMaterial({ map: bedRockTexture });
  materialArray.dirt = new THREE.MeshPhongMaterial({ map: dirtTexture });
  materialArray.stone = new THREE.MeshPhongMaterial({ map: stoneTexture });
  materialArray.diamond = new THREE.MeshPhongMaterial({ map: diamonTexture });
  materialArray.gold = new THREE.MeshPhongMaterial({ map: goldTexture });
  materialArray.grass = [
    new THREE.MeshPhongMaterial({
      map: grassTextures[0],
    }), // Right
    new THREE.MeshPhongMaterial({
      map: grassTextures[0],
    }), // Left
    new THREE.MeshPhongMaterial({
      map: grassTextures[1],
    }), // Top
    new THREE.MeshPhongMaterial({
      map: grassTextures[2],
    }), // Bottom
    new THREE.MeshPhongMaterial({
      map: grassTextures[0],
    }), // Front
    new THREE.MeshPhongMaterial({
      map: grassTextures[0],
    }), // Back
  ];
  materialArray.wood = [
    new THREE.MeshPhongMaterial({
      map: woodTextures[0],
    }), // Right
    new THREE.MeshPhongMaterial({
      map: woodTextures[0],
    }), // Left
    new THREE.MeshPhongMaterial({
      map: woodTextures[1],
    }), // Top
    new THREE.MeshPhongMaterial({
      map: woodTextures[1],
    }), // Bottom
    new THREE.MeshPhongMaterial({
      map: woodTextures[0],
    }), // Front
    new THREE.MeshPhongMaterial({
      map: woodTextures[0],
    }), // Back
  ];
  materialArray.leaf = new THREE.MeshPhongMaterial({
    color: LeafBlock.LEAF_COLOR,
    transparent: true,
    map: leafTexture,
  });
  materialArray.iron = new THREE.MeshPhongMaterial({ map: ironTexture });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

var dt = 1 / 60;
var lastYPosition = 0;
var nextLevelToCreate = -DEPTH_TILL_ROCK - 1;
var setPosition = false;

function animate() {
  requestAnimationFrame(animate);
  if (controls.enabled) {
    world.step(dt);
    let yPosition = Math.floor(controls.getObject().position.y) - 2;
    // console.log([yPosition,nextLevelToCreate]);
    if (yPosition - 1 === nextLevelToCreate) {
      addLevelToScene(scene, nextLevelToCreate);
      nextLevelToCreate -= 1;
    }
    if (Math.floor(yPosition) > 0) {
      renderRightCubes(0);
    } else if (Math.abs(lastYPosition - yPosition) > 2) {
      lastYPosition = yPosition;
      renderRightCubes(lastYPosition);
    }
    KF.update();
  }


  controls.update(Date.now() - time);
  //renderer.render(scene, camera);
  //render();
  time = Date.now();

  let delta = 5 * clock.getDelta();

  uniforms["time"].value += 0.2 * delta;

  //renderer.render(scene, camera);
  composer.render();
}

function onDocumentMouseDown(event) {
  event.preventDefault();
  handAnimator.start();
  rayCastForCubeManager();
}

// Inventory HUD
function onKeyDown(event) {
  switch (event.keyCode) {
    case 49:
    case 97:
      if (player.inventory[1]) {
        player.setElementOnHand(camera, player.inventory[1].name);
      } else {
        player.setHand(camera);
      }
      break;
    case 50:
    case 98:
      if (player.inventory[2]) {
        player.setElementOnHand(camera, player.inventory[2].name);
      }
      break;
    case 51:
    case 99:
      if (player.inventory[3]) {
        player.setElementOnHand(camera, player.inventory[3].name);
      }
      break;
    case 52:
    case 100:
      if (player.inventory[4]) {
        player.setElementOnHand(camera, player.inventory[4].name);
      }
      break;
    case 53:
    case 101:
      if (player.inventory[5]) {
        player.setElementOnHand(camera, player.inventory[5].name);
      }
      break;
    case 54:
    case 102:
      if (player.inventory[6]) {
        player.setElementOnHand(camera, player.inventory[6].name);
      }
      break;
    case 55:
    case 103:
      if (player.inventory[7]) {
        player.setElementOnHand(camera, player.inventory[7].name);
      }
      break;
    case 56:
    case 104:
      if (player.inventory[8]) {
        player.setElementOnHand(camera, player.inventory[8].name);
      }
      break;
    case 57:
    case 105:
      if (player.inventory[9]) {
        player.setElementOnHand(camera, player.inventory[9].name);
      }
      break;
  }
}

window.addEventListener("click", function (e) {});
