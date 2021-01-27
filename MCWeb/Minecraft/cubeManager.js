// Desarrollado por Jorge Aharon López Aguilar, Jesús Omar Cuenca Espino, y Jesús Perea Villegas.
// Developed by Jorge Aharon López Aguilar, Jesús Omar Cuenca Espino, and Jesús Perea Villegas.

let CLICKED, face;
let antonyms = {
  front: "back",
  back: "front",
  left: "right",
  right: "left",
  top: "bottom",
  bottom: "top",
};

// Returns the coordinates needed to place a new cube given the clicked face.
function getNewCubeCoordinates(cubeToAdd, clickedFace) {
  if (clickedFace.equals(new THREE.Vector3(0, 0, 1))) {
    // Front
    return [
      cubeToAdd.position.x,
      cubeToAdd.position.y,
      cubeToAdd.position.z + Block.BLOCK_SIZE,
      "front",
      "back",
    ];
  } else if (clickedFace.equals(new THREE.Vector3(-1, 0, 0))) {
    // Left
    return [
      cubeToAdd.position.x - Block.BLOCK_SIZE,
      cubeToAdd.position.y,
      cubeToAdd.position.z,
      "left",
      "right",
    ];
  } else if (clickedFace.equals(new THREE.Vector3(0, -1, 0))) {
    // Bottom
    return [
      cubeToAdd.position.x,
      cubeToAdd.position.y - Block.BLOCK_SIZE,
      cubeToAdd.position.z,
      "bottom",
      "top",
    ];
  } else if (clickedFace.equals(new THREE.Vector3(0, 1, 0))) {
    // Top
    return [
      cubeToAdd.position.x,
      cubeToAdd.position.y + Block.BLOCK_SIZE,
      cubeToAdd.position.z,
      "top",
      "bottom",
    ];
  } else if (clickedFace.equals(new THREE.Vector3(1, 0, 0))) {
    // Right
    return [
      cubeToAdd.position.x + Block.BLOCK_SIZE,
      cubeToAdd.position.y,
      cubeToAdd.position.z,
      "right",
      "left",
    ];
  } else if (clickedFace.equals(new THREE.Vector3(0, 0, -1))) {
    // Back
    return [
      cubeToAdd.position.x,
      cubeToAdd.position.y,
      cubeToAdd.position.z - Block.BLOCK_SIZE,
      "back",
      "front",
    ];
  } else {
    // Error
    //("Error", clickedFace);
  }
}

function addCubeHelper(newCube, positions) {
  try{
    newCube.position.set(positions[0], positions[1], positions[2]);
    var halfExtents = new CANNON.Vec3(1, 1, 1);
    var boxBody = new CANNON.Body({ mass: 0, material: boxMaterial });
    boxBody.addShape(boxShape);
    boxBody.position.set(positions[0], positions[1], positions[2]);
    newCube.body = boxBody;
    world.add(newCube.body)
    scene.add(newCube);
  }catch(err){
    //No object to add
  }
}

// Adds a new cube to the scene and to the Cannon world.
function addCube(cubeToAdd, clickedFace, cubeToAddName) {
  if (!controls.enabled) return;
  let positions = getNewCubeCoordinates(cubeToAdd, clickedFace);
  cubeToAddName += "Cube"
  player.removeCubeFromInventory(camera,cubeToAddName);
  switch (cubeToAddName) {
    case "dirtCube":
      addCubeHelper(new DirtBlock({x:0,y:0,z:0}), positions);
      break;
    case "stoneCube":
      addCubeHelper(new StoneBlock({x:0,y:0,z:0}), positions);
      break;
    case "diamondCube":
      addCubeHelper(new DiamondBlock({x:0,y:0,z:0}), positions);
      break;
    case "goldCube":
      addCubeHelper(new GoldBlock({x:0,y:0,z:0}), positions);
      break;
    case "grassCube":
      addCubeHelper(new GrassBlock({x:0,y:0,z:0}), positions);
      break;
    case "woodCube":
      addCubeHelper(new WoodBlock({x:0,y:0,z:0}), positions);
      break;
    case "ironCube":
      addCubeHelper(new IronBlock({x:0,y:0,z:0}), positions);
      break;
    case "leafCube":
      addCubeHelper(new LeafBlock({x:0,y:0,z:0}), positions);
      break;
    default:
      // Do nothing...
      break;
  }
}

// Removes the threeJS cube and the CannonJS cube.
function removeCube(cubeToRemove) {
  if (!controls.enabled || cubeToRemove instanceof BedRock) return;
  try{
    world.remove(cubeToRemove.body);
    scene.remove(cubeToRemove);
    player.addCubeToInventory(cubeToRemove);
    cubeToRemove.level.remove(cubeToRemove);
  }catch(err){
    //No object to remove
  }
}

// Raycast used to add and remove cubes.
function rayCastForCubeManager() {
  let ray = new THREE.Vector2();
  ray.x = 0;
  ray.y = 0;

  // find intersections
  raycaster.setFromCamera(ray, camera);

  let intersects = raycaster.intersectObjects(scene.children,true);

  if (intersects.length > 0 && (intersects[0].distance > 2.8 || event.button == 0)) {
    CLICKED = intersects[0].object; //intersects[intersects.length - 1].object;
    face = intersects[0].face.normal;
    switch (event.button) {
      case 0: // left
        removeCube(CLICKED);
        break;
      case 1: // middle
        break;
      case 2: // right
        addCube(CLICKED, face, player.handElement.name);
        break;
    }
    
  } else {
    if (CLICKED)
      

      CLICKED = null;
  }
}
