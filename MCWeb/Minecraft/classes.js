// Desarrollado por Jorge Aharon López Aguilar, Jesús Omar Cuenca Espino, y Jesús Perea Villegas.
// Developed by Jorge Aharon López Aguilar, Jesús Omar Cuenca Espino, and Jesús Perea Villegas.

// Ore spawning chances.
const BLOCK_CHANCE = {
  //Tiene que ir en orden descendiente en cuanto a rareza
  iron: 0.05,
  gold: 0.005,
  diamond: 0.0025,
};

// Size of the cubes
const BOX_SIZE = 1;
const BOX_BODY_SIZE = BOX_SIZE * 0.8;

const STANDARD_BOX_GEOMETRY = new THREE.BoxGeometry(
  BOX_SIZE,
  BOX_SIZE,
  BOX_SIZE
);

// Cannon.js geometry used for all blocks.
const boxMaterial = new CANNON.Material({ friction: 0, restitution: 0 });
const boxShape = new CANNON.Box(
  new CANNON.Vec3(BOX_BODY_SIZE, BOX_BODY_SIZE, BOX_BODY_SIZE)
);

// Three js geometry used for all blocks.
class Block extends THREE.Mesh {
  static BLOCK_SIZE = 1;
  static BASIC_COLOR = 0xfffffff;

  constructor(coordinates, material) {
    super(STANDARD_BOX_GEOMETRY, material);
    this.position.x = coordinates.x;
    this.position.y = coordinates.y;
    this.position.z = coordinates.z;
    this.body = new CANNON.Body({ mass: 0, material: boxMaterial });
    this.body.addShape(boxShape);
    this.body.position.set(this.position.x, this.position.y, this.position.z);
    this.faces = {
      front: undefined,
      back: undefined,
      left: undefined,
      right: undefined,
      top: undefined,
      bottom: undefined,
    };
  }
  getPosition() {
    return this.position;
  }
}

// Classes used for creating new blocks of a given type.
class WoodBlock extends Block {
  static WOOD_COLOR = 0x3f301d;
  constructor(coordinates) {
    super(coordinates, materialArray["wood"]);
    this.name = "woodCube";
    this.castShadow = true;
    this.receiveShadow = true;
  }
}

// Classes used for creating new blocks of a given type.
class DirtBlock extends Block {
  static DIRT_COLOR = 0x804010;
  constructor(coordinates) {
    super(coordinates, materialArray["dirt"]);
    this.name = "dirtCube";
    this.castShadow = true;
    this.receiveShadow = true;
  }
}

// Classes used for creating new blocks of a given type.
class GrassBlock extends Block {
  static GRASS_COLOR = 0x6ea600;

  constructor(coordinates) {
    super(coordinates, materialArray["grass"]);
    this.name = "grassCube";
    this.castShadow = true;
    this.receiveShadow = true;
  }
}

// Classes used for creating new blocks of a given type.
class AquaBlock extends THREE.Mesh {
  static AQUA_COLOR = 0x00ffff;

  constructor(coordinates) {
    // let _AQUA_MATERIAL = new THREE.MeshPhongMaterial({
    //   color: AquaBlock.AQUA_COLOR,
    //   transparent: true,
    //   opacity: 0.5,
    // });
    // let _AQUA_MATERIAL = materialArray.water;
    super(STANDARD_BOX_GEOMETRY, materialArray.water);
    this.position.x = coordinates.x;
    this.position.y = coordinates.y;
    this.position.z = coordinates.z;
  }
}

// Classes used for creating new blocks of a given type.
class StoneBlock extends Block {
  static Stone_COLOR = 0x877f7d;

  constructor(coordinates) {
    super(coordinates, materialArray["stone"]);
    this.name = "stoneCube";
    // this.castShadow = true;
    // this.receiveShadow = true;
  }
}

// Classes used for creating new blocks of a given type.
class LeafBlock extends Block {
  static LEAF_COLOR = 0x234f1e;

  constructor(coordinates) {
    super(coordinates, materialArray["leaf"]);
    this.name = "leafCube";
    this.castShadow = true;
    this.receiveShadow = true;
  }
}

// Classes used for creating new blocks of a given type.
class DiamondBlock extends Block {
  static DIAMOND_COLOR = 0xb9f2ff;

  constructor(coordinates) {
    super(coordinates, materialArray["diamond"]);
    this.name = "diamondCube";
    // this.castShadow = true;
    // this.receiveShadow = true;
  }
}

// Classes used for creating new blocks of a given type.
class GoldBlock extends Block {
  static GOLD_COLOR = 0xd4af37;

  constructor(coordinates) {
    super(coordinates, materialArray["gold"]);
    this.name = "goldCube";
    // this.castShadow = true;
    // this.receiveShadow = true;
  }
}

// Classes used for creating new blocks of a given type.
class IronBlock extends Block {
  static IRON_COLOR = 0xa44322;

  constructor(coordinates) {
    super(coordinates, materialArray["iron"]);
    this.name = "ironCube";
    // this.castShadow = true;
    // this.receiveShadow = true;
  }
}

// Class used for creating the bedrock at the bottom of the world.
class BedRock extends THREE.Mesh {
  constructor(coordinates, length) {
    let geometry = new THREE.BoxGeometry(length, 1, length);
    super(geometry, materialArray.bedrock);
    this.position.x = coordinates.x;
    this.position.y = coordinates.y;
    this.position.z = coordinates.z;
    let newLength = length * .8;
    let bedrockShape = new CANNON.Box( new CANNON.Vec3(newLength, 1, newLength));
    this.body = new CANNON.Body({ mass: 0, material: boxMaterial });
    this.body.addShape(bedrockShape);
    this.body.position.set(this.position.x, this.position.y, this.position.z);
    this.faces = {
      front: undefined,
      back: undefined,
      left: undefined,
      right: undefined,
      top: undefined,
      bottom: undefined,
    };
  }
}

// Class used for creating a player.
class Player {
  constructor(speed) {
    this.inventory = {
      1: undefined,
      2: undefined,
      3: undefined,
      4: undefined,
      5: undefined,
      6: undefined,
      7: undefined,
      8: undefined,
      9: undefined,
    };
    this.speed = speed;
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.MeshBasicMaterial({ color: "red" })
    );
    this.mesh.name = "handBlock";
    this.hand = new THREE.Mesh(
      new THREE.BoxBufferGeometry(0.2, 0.25, 0.3),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("../images/hand.jpeg"),
      })
    );
    // this.hand.name = "Mano";
    this.handElement = this.hand;
  }

  // Adds the mined cube to the players inventory and keeps track of the number of cubes available.
  addCubeToInventory(cube) {
    let isInInventory = false;
    let indexUndefined = 1;
    let indexFound = 0;
    for(let cubo in this.inventory){
      indexFound += 1;
      if (this.inventory[cubo] && this.inventory[cubo].name === cube.name) {
        this.inventory[cubo].count += 1;
        isInInventory = true;
        break;
      }
    }

    if (!isInInventory) {
      for (let cubo in this.inventory) {
        if (this.inventory[cubo]) {
          indexUndefined += 1;
        }else{
          break;
        }
      }
      this.inventory[indexUndefined] = {
        name: cube.name,
        count: 1,
      };
      // Add Block to the inventory HUD.
      let div = document.getElementById(`inventory${indexUndefined}`);
      let newDiv = document.createElement("img");
      newDiv.src = simpleTextures[cube.name];
      newDiv.style.width = "7%";
      newDiv.style.position = 'absolute';
      newDiv.style.zIndex = "99";
      newDiv.style.padding = "8px";
      newDiv.style.marginLeft = "5px";
      let numberDiv = document.createElement("div");
      numberDiv.id = `inventorynumber${indexUndefined}`
      numberDiv.textContent = 1
      numberDiv.style.position = 'absolute';
      numberDiv.style.zIndex = "100";
      numberDiv.style.marginLeft = "5vw";
      numberDiv.style.marginTop = "50px",
      div.appendChild(newDiv)
      div.appendChild(numberDiv)
    }else{
      //Add one to the number in the object
      let numberDiv = document.getElementById(`inventorynumber${indexFound}`);
      let number = parseInt(numberDiv.textContent);
      numberDiv.textContent = number + 1;
    }
  }

  // Removes cube from inventory and updates number of cubes in the inventory.
  removeCubeFromInventory(camera,cubeName) {
    for(let cube in this.inventory){
      if(this.inventory[cube] && this.inventory[cube].name === cubeName){
        this.inventory[cube].count -= 1
        if(this.inventory[cube].count === 0){
          this.inventory[cube] = undefined;
          camera.remove(this.handElement);
          this.setHand(camera)
          //Delete from inventory
          let div = document.getElementById(`inventory${cube}`);
          div.innerHTML = '';
        }else{
          //Rest one to number in inventory
          let numberDiv = document.getElementById(`inventorynumber${cube}`);
          let number = parseInt(numberDiv.textContent);
          numberDiv.textContent = number - 1;
        }
      }
    }
  }

  // Creates the player's hand.
  setHand(camera) {
    if (this.handElement.name === "Mano") return;
    camera.remove(this.handElement);
    this.handElement = this.hand;
    this.handElement.name = "Mano";
    camera.add(this.handElement);
    this.handElement.position.set(
      camera.position.x + 0.3,
      camera.position.y - 0.2,
      camera.position.z - 0.5
    );
    this.handElement.rotation.x = Math.PI / 4;
    this.handElement.rotation.z = Math.PI / 180;
    initAnimation(0, Math.PI / 4);
  }

  // Puts an element on the player's hand.
  setElementOnHand(camera, cubeName) {
    cubeName = cubeName.replace("Cube", "");
    if (this.handElement.name === cubeName) return;
    this.mesh.material = materialArray[cubeName];
    camera.remove(this.handElement);
    this.handElement = this.mesh;
    this.handElement.name = cubeName;
    camera.add(this.handElement);
    this.handElement.position.set(
      camera.position.x + 0.8,
      camera.position.y - 0.6,
      camera.position.z - 1.0
    );
    this.handElement.rotation.y = Math.PI / 4;
    this.handElement.rotation.z = Math.PI / 180;
    initAnimation(- Math.PI / 4, 0);
  }
}

