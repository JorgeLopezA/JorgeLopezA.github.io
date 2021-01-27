// Desarrollado por Jorge Aharon López Aguilar, Jesús Omar Cuenca Espino, y Jesús Perea Villegas.
// Developed by Jorge Aharon López Aguilar, Jesús Omar Cuenca Espino, and Jesús Perea Villegas.

let blocksMap = {};
let block_levels = {};
let block_levels_blueprints = {};
let level_keys = null;


// const BLOCK_SIZE = 2;
const DEPTH_TILL_ROCK = 2;

const MAX_DEPTH = 10;
const LENGTH_OF_THE_WORLD = 10;
const LIMIT_OF_LAND = Math.floor(LENGTH_OF_THE_WORLD*9/10);
const MAX_SIZE_OF_MOUNTAIN = 3;//blocks
const DEPTH_TO_RENDER = 2;
// let playerPositionY = -8;

/**
 * Adds the positional key ot the correct type of blocks in the Block Map.
 * @param {String} blockType Type of block to add to the BlocksMap.
 * @param {String} key Positional key that holds the ifnromation about the coordinates of the block.
 */
function addKey(blockType,key){
    let blocks = blocksMap[blockType];
    if(blocks === undefined)
        blocksMap[blockType] = {};
    blocksMap[blockType][key] = 'a';
}

/**
 * Generates the key of the coordinates in order to save less information for the 
 * blocks map.
 * @param {number} x X coordinate
 * @param {number} y Y coordinate
 * @param {number} z Z coordinate
 */
function getPositionKey(x, y, z) {
  return x.toString() + "x" + y.toString() + "x" + z.toString();
}

/**
 * Extracts the coordinates from the key sent to it.
 * @param {String} key The positional key that holds the coordinates of the block.
 */
function decriptKey(key){
    let values = key.split('x');
    let result = {};
    result.x = parseInt(values[0]);
    result.y = parseInt(values[1]);
    result.z = parseInt(values[2]);
    return result
}

/**
 * Creates the trees on semi-random heights & ther respective leaves around the top.
 * @param {Map<String,number>} position Coordinates where to position the tree stump.
 * @param {*} threejsObj 
 */
function createTree(position, threejsObj) {
    const STANDARD_TREE_HEIGHT = 4;
    const MAX_TREE_HEIGHT = 3;//blocks
    let size = Math.floor(Math.random()*MAX_TREE_HEIGHT)+STANDARD_TREE_HEIGHT;//non Zero
    //Add the Wood
    for (let x = 0; x < size; x++) {
        position.y++;
        let woodBlock = new WoodBlock(position);
        let key = getPositionKey(position.x, position.y, position.z);
        addKey("wood", key);
        // threejsObj.add(woodBlock);
        woodBlock.level = threejsObj;
        addToWorldLevel(woodBlock,threejsObj);
    }
    //Add the leaves
    position.y--;
    const HEIGHT_OF_LEAVES = 3;
    const WIDTH_LEAVES_CHANGE = 2;
    let WIDTH_OF_LEAVES = 5;
    for(let h = 0;h<HEIGHT_OF_LEAVES;h++){//y
        let depth = position.z-Math.floor(WIDTH_OF_LEAVES/2);
        let width = position.x-Math.floor(WIDTH_OF_LEAVES/2);
        for(let w = 0;w<WIDTH_OF_LEAVES;w++){//x
            for(let d = 0;d<WIDTH_OF_LEAVES;d++){//z
                if(!((w == 0 || w == WIDTH_OF_LEAVES-1) && (d == 0 || d == WIDTH_OF_LEAVES-1))){
                    let tempPosition = {y:position.y,x:width+w,z:depth+d};
                    let key = getPositionKey(tempPosition.x,tempPosition.y,tempPosition.z);
                    let bool = true;
                    if(blocksMap.leaf != undefined){
                        bool = blocksMap.leaf[key] == undefined;
                    }
                    if(blocksMap.wood[key] == undefined && bool){
                        let block = new LeafBlock(tempPosition);
                        addKey("leaf",key);
                        // threejsObj.add(block);
                        block.level = threejsObj;
                        addToWorldLevel(block,threejsObj);
                    }
                }
            }
        }
        position.y++;
        if((h+1)%WIDTH_LEAVES_CHANGE == 0)
            WIDTH_OF_LEAVES -= 2;
    }
    //Add the last leaf
    let block = new LeafBlock(position);
    addKey("leaf",getPositionKey(position.x,position.y,position.z));
    // threejsObj.add(block);
    block.level = threejsObj;
    addToWorldLevel(block,threejsObj);
}

/**
 * Creates the trees of the world according to where the grass blocks where positioned.
 * @param {number} number 
 * @param {*} threejsObj 
 */
function createTrees(number, threejsObj) {
  let grassBlocks = Object.keys(blocksMap.grass);
  for (let x = 0; x < number; x++) {
    let randomBlock = Math.floor(Math.random() * grassBlocks.length);
    let key = grassBlocks[randomBlock];
    let values = decriptKey(key);
    createTree(values, threejsObj);
  }
}

/**
 * Get the z Coordinate for the upper half of an ellipsoid given the rest of the values.
 * @param {number} x X coordinate
 * @param {number} z Z coordinate
 * @param {number} a Radios for the X coordinate
 * @param {number} b Radius for the Y Coordinate
 * @param {number} c Radius for the Z Coordinate
 */
function upperHalfEllipsoidFormula(x,z,a,b,c){
    let A = Math.pow(x/a,2);
    let B = Math.pow(z/c,2);
    let C = Math.sqrt(1 - A - B);
    return Math.floor(b*C);
}

/**
 * Crea la montaña de tierra antes de ponerle pasto encima
 * @param {String} pivot 
 * @param {*} threejsObj 
 */
function createMountain(pivot,threejsObj){
    let a = Math.ceil(Math.random()*MAX_SIZE_OF_MOUNTAIN  +2)+1;//Non Zero numbers.
    let b = Math.floor(Math.random()*MAX_SIZE_OF_MOUNTAIN +3)+1;//Non Zero numbers.
    let c = Math.ceil(Math.random()*MAX_SIZE_OF_MOUNTAIN  +3)+1;//Non Zero numbers.
    pivot = decriptKey(pivot);
    const type_Of_Block = "dirt";
    for(let w = -a;w<a+1;w++){//x
        for(let d = -b;d< b+1;d++){//z
            let width = pivot.x - w;
            let depth = pivot.z - d;
            let H = upperHalfEllipsoidFormula(w,d,a,b,c)+1;
            if(H != NaN){
                for(let height = 0;height<H;height++){//y
                    let key = getPositionKey(width,height,depth);
                    let position = {x:width,y:height,z:depth};
                    if(blocksMap.dirt[key] == undefined && Math.abs(width)<LIMIT_OF_LAND && Math.abs(depth)<LIMIT_OF_LAND){
                        let dirtBlock = new DirtBlock(position);
                        // threejsObj.add(dirtBlock);
                        dirtBlock.level = threejsObj;
                        addToWorldLevel(dirtBlock,threejsObj);
                        addKey(type_Of_Block,key);
                    }
                }
            }
        }
    }
}

/**
 * Gets the key of the Block that is above the block given to it as a param.
 * @param {String} key 
 */
function keyOfBlockAbove(key){
    const values = key.split('x');
    let newY = parseInt(values[1]) + 1;
    return values[0]+'x'+newY.toString()+'x'+values[2];
}

/**
 * Recursive function to get the key of the next empty block on top of a certain block.
 * @returns {String} Returns the String key of the next empty block.
 * @param {String} key key of the block that it is currently under evaluation.
 * @param {String} type Type of the block that should be checked.
 */
function makeTopLayer(key,type){
    if(blocksMap[type][key]!==undefined){
        return makeTopLayer(keyOfBlockAbove(key),type);
    }
    return key;
}

/**
 * Calls the create the mountain function multiple times and selects the pivots.
 * @param {number} number 
 * @param {*} threejsObj 
 */
function createMountains(number,threejsObj){
    let pivots = [];
    const dirtBlocks = blocksMap.dirt;
    const dirtBlocksKeys = Object.keys(dirtBlocks);
    for(let x = 0;x<number;x++){
        let randomNumber = Math.floor(Math.random()*dirtBlocksKeys.length);
        let pivot = makeTopLayer(dirtBlocksKeys[randomNumber],"dirt");
        pivots.push(pivot);
    }
    pivots.forEach(pivot => {
        createMountain(pivot,threejsObj);
    });
}

/**
 * Creates the Grass Blocks and places the trees in the world.
 * @param {*} threejsObj 
 */
function createVegetation(threejsObj){
  let dirtBlocks = blocksMap.dirt;
  blocksMap.grass = {};
  let grassBlocks = blocksMap.grass;
  Object.keys(dirtBlocks).forEach(block => {
    const upperBlock = keyOfBlockAbove(block);
    if(dirtBlocks[upperBlock] === undefined && grassBlocks[upperBlock] === undefined){
      const position = decriptKey(upperBlock);
      let block = new GrassBlock(position);
      // threejsObj.add(block);
      block.level = threejsObj;
      addToWorldLevel(block,threejsObj);
      addKey("grass",upperBlock);
    }
  });

  createTrees(3,threejsObj);
}

/**
 * Creates all the upper layer blocks, where the dirt, mountains and trees will be.
 * @param {*} scene The scene where the Blocks will be displayed.
 */
function createUpperWorld(scene){
  let UPPER_WORLD_LAYER = new THREE.Object3D;
  /*------------------------------Create the water and dirt Layer---------------------------------------*/
  for(let depth = -DEPTH_TILL_ROCK+1;depth<1;depth++){//y
      for(let width = -LENGTH_OF_THE_WORLD;width<LENGTH_OF_THE_WORLD+1;width++){//x
          for(let edge = -LENGTH_OF_THE_WORLD;edge<LENGTH_OF_THE_WORLD+1;edge++){//z
              let key = getPositionKey(width,depth,edge);
              let position = {x:width,y:depth,z:edge};
              let type = "";
              let block = null;
              if(Math.abs(width)<LIMIT_OF_LAND && Math.abs(edge)<LIMIT_OF_LAND){
                  if(depth!=0){
                      block = new DirtBlock(position)
                      type = "dirt";
                  }
              }
              else{
                  if(depth == 0){
                      block = new AquaBlock(position);
                      type = "aqua";
                  }
              }
              if(block!=null){
                  // UPPER_WORLD_LAYER.add(block);
                  block.level = UPPER_WORLD_LAYER;
                  addToWorldLevel(block,UPPER_WORLD_LAYER);
                  addKey(type,key);
              }
          }
      }
  }

  /*------------------------------Create the mountains and grass layer---------------------------------*/
  createMountains(1,UPPER_WORLD_LAYER);
  createVegetation(UPPER_WORLD_LAYER);
  UPPER_WORLD_LAYER.name = "Mundo Superior";
  block_levels[0] = UPPER_WORLD_LAYER;
  scene.add(UPPER_WORLD_LAYER);
}

/**
 * Creates all the lower layers of the world where the minerals and caves will be.
 * @param {*} scene The scene where the blocks will be displayed.
 */
function createUnderWorld(scene){
    const NUMBER_OF_CAVES = 1;
    blocksMap.air = {};
    /*--------------------------------------Crear las cuevas------------------------------------*/
    for(let cave = 0;cave < NUMBER_OF_CAVES;cave++){
        let a = Math.ceil(Math.random()*MAX_SIZE_OF_MOUNTAIN    +3)+1;//Non Zero numbers.
        let b = Math.floor(Math.random()*MAX_SIZE_OF_MOUNTAIN   +3)+1;//Non Zero numbers.
        let c = Math.ceil(Math.random()*MAX_SIZE_OF_MOUNTAIN    +3)+1;//Non Zero numbers.
        let x = Math.floor(Math.random()*LIMIT_OF_LAND)*((Math.random()<.5) ? -1:1);
        let y = -(Math.floor(Math.random()*MAX_DEPTH)+DEPTH_TILL_ROCK);
        let z = Math.floor(Math.random()*LIMIT_OF_LAND)*((Math.random()<.5) ? -1:1);
        for(let w = -a;w<a+1;w++){//x
            for(let d = -c;d<c+1;d++){//z
                let H = upperHalfEllipsoidFormula(w,d,a,b,c);
                for(let h = -H;h<H+1;h++){//y
                    let key = getPositionKey(x+w,y+h,z+d);
                    addKey("air",key);
                }
            }
        }
    }
    /*--------------------------------------Crear los minerales respetando las cuevas---------------*/
    for(let d = -DEPTH_TILL_ROCK;d>=-(MAX_DEPTH-1);d--){//y //Tiene un menos 1 porque hay que dejar el espacio para el bedrock
      let level = {};
      for(let e = -LIMIT_OF_LAND;e<LIMIT_OF_LAND;e++){//z
          for(let w = -LIMIT_OF_LAND;w<LIMIT_OF_LAND;w++){//x
              let key = getPositionKey(w,d,e);
              if(blocksMap.air[key] === undefined){
                  let position = {x:w,y:d,z:e};
                  let randomBlock = getRandomUndergroundBlock(position);
                  level[key] = randomBlock;
              }
          }
      }
      block_levels_blueprints[d] = level;
    }
    //Add the immediate first layer of stone to the world.
    addLevelToScene(scene,-DEPTH_TILL_ROCK);
    //Add Bed Rock One big chunk
    let bedRock = new BedRock({x:0,y:-MAX_DEPTH,z:0},LIMIT_OF_LAND*2);
    addToWorld(bedRock);
    blocksMap = null;
}

/**
 * Gets a random block depending on probability for a 
 * random block of a mineral.
 * @returns {String} Returns the type of block to place there.
 * @param {Map<String,number>} position 
 */
function getRandomUndergroundBlock(position) {
  const depth = position.y;
  let chances = BLOCK_CHANCE.diamond * 100 * (depth - DEPTH_TILL_ROCK); //chances de que salga este mineral;
  let randomChance = Math.random() * 100;
  let selected = false;
  let type = "stone";
  if (randomChance <= chances) {
    type = "diamond";
    selected = true;
  }
  for (let mineral in BLOCK_CHANCE) {
    //por cada mineral
    if (!selected) {
      chances = BLOCK_CHANCE[mineral] * 100; //chances de que salga este mineral;
      randomChance = Math.random() * 100;
      if (randomChance <= chances) {
        type = mineral;
        selected = true;
      }
    }
  }
  return type;
}

/**
 * Read the function name dude.
 * @param {*} scene 
 */
function createWorld(scene) {
    createUpperWorld(scene);
    createUnderWorld(scene);
    level_keys = Object.keys(block_levels);
    blocksMap = null;
    // renderRightCubes(0);
    console.log("World Built!");
    console.log("Developed by: Jorge Aharon López Aguilar, Jesús Omar Cuenca Espino, and Jesús Perea Villegas.")
}

/**
 * According to the position of the player the code will only render for the camera to see
 * what is in the immediate vecinity of the player.
 * @param {double} playerPositionY Y position of the player
 */
async function renderRightCubes(playerPositionY){
  const height_factor = 3;
  level_keys.forEach((levelNumber)=>{
    if(playerPositionY+DEPTH_TO_RENDER+height_factor>levelNumber && levelNumber>playerPositionY-DEPTH_TO_RENDER-height_factor){
      block_levels[levelNumber].visible = true;
    } else {
      block_levels[levelNumber].visible = false;
    }
  });
}

/**
 * 
 * @param {*} scene 
 * @param {Number} levelID numero de piso a crear
 */
async function addLevelToScene(scene,levelID){
  if(block_levels_blueprints[levelID] == null || block_levels_blueprints[levelID] == undefined){
    return null;
  }
  let levelThreeObj = new THREE.Object3D;
  const levelObj = block_levels_blueprints[levelID];
  const keys = Object.keys(levelObj);
  //console.log(keys.length);
  keys.forEach((positionKey)=>{
    const position  = decriptKey(positionKey);
    let block     = createBlock(levelObj[positionKey],position);
    block.level = levelThreeObj;
    addToWorldLevel(block,levelThreeObj);
  });
  levelThreeObj.name = "World layer "+levelID.toString();
  block_levels[levelID]             = levelThreeObj;
  block_levels_blueprints[levelID]  = null;
  scene.add(levelThreeObj);
  //console.log("The level "+levelID.toString()+" has been created");
}

/**
 * Return the Block created and in place.
 * @param {String} type Type of Block
 * @param {Map<String,number>} position The position of said cube.
 */
function createBlock(type,position){
  let block = null;
  switch (type) {
    case "gold":
      block = new GoldBlock(position);
      break;
    case "diamond":
      block = new DiamondBlock(position);
      break;
    case "iron":
      block = new IronBlock(position);
      break;
    default:
      block = new StoneBlock(position);
      break;
  }
  return block;
}

/**
 * Adds the block to the world in a physics way (CANNON),
 * And adds the block to the level that it belongs to (render).
 * @param {Block} block Block to add
 * @param {THREE.Object3D} level The level to add the block to.
 */
function addToWorldLevel(block,level){
  level.add(block);
  if(block.body != undefined){
    world.add(block.body);
  }
}