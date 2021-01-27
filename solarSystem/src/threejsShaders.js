// let renderer = null,

let renderOrbits = false;

scene = null,
    camera = null,
    sphereGroup = null,
    sphere = null,
    uniforms = null,
    clouds = null,
    sphereNormalMapped = null;

let sunRadius = 140;

let sunGroup = new THREE.Object3D;
let figureGroup = new THREE.Object3D;
let earthGroup = new THREE.Object3D;
let marsGroup = new THREE.Object3D;
let jupiterGroup = new THREE.Object3D;
let saturnGroup = new THREE.Object3D;


let mercuryMapUrl = "../images/mercury1.jpg";
let mercuryBumpUrl = "../images/mercury2.jpg";
let venusUrl = "../images/venus1.jpg";
let venusBumpUrl = "../images/venus2.jpg";


let earthMapUrl = "../images/earth_atmos_2048.jpg";
let earthMap = null;
let earthNormalMapUrl = "../images/earth_normal_2048.jpg";
let earthNormalMap = null;
let earthSpecularMap = null;
let earthSpecularMapUrl = "../images/earth_specular_spec_1k.jpg";

let moonUrl = "../images/moon_1024.jpg";
let moonBumpUrl = "../images/moon_bump.jpg";

let marsUrl = "../images/mars11.jpg";
let marsBumpUrl = "../images/mars2.jpg";

let mmoonUrl1 = "../images/marsmoon.jpg";
let mmoonBumpUrl1 = "../images/marsmoon1.jpg";
let mmoonUrl2 = "../images/marsmoon11.jpg";
let mmoonBumpUrl2 = "../images/marsmoon2.jpg";

let jupiterUrl = "../images/jupiter1.jpg";

let saturnUrl = "../images/saturn1.jpg";

let saturnRingUrl = "../images/sR.png";
let saturnRingTransparencyUrl = "../images/saturnringpattern.jpg";

let uranusUrl = "../images/uranus.jpg";

let neptuneUrl = "../images/neptune.jpg";

let plutoUrl = "../images/pluto.jpg";
let plutoBumpUrl = "../images/pluto2.jpg";




let duration = 15000; // ms
let currentTime = Date.now();

function animate() {
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;

    uniforms.time.value += fract;

    mercury.rotation.y += angle / 2;
    venus.rotation.y -= angle / 2;

    figureGroup.rotation.y -= angle / 40;

    earthGroup.rotation.y += angle / 3;
    moonTextured.rotation.y += angle / 2;
    marsGroup.rotation.y += angle / 2;
    mmoonTextured1.rotation.y += angle / 2;
    mmoonTextured1.rotation.x += angle / 2;
    mmoonTextured2.rotation.y += angle / 2;
    mmoonTextured2.rotation.z += angle / 2;

    //jupiter.rotation.y += angle / 4;
    jupiterGroup.rotation.y += angle / 4;
    jMoon1.rotation.y += angle / 2;
    jMoon2.rotation.y += angle / 3;
    jMoon3.rotation.y += angle / 3;
    jMoon3.rotation.x += angle / 3;
    jMoon4.rotation.z += angle / 3;

    saturn.rotation.y += angle / 6;

    uranus.rotation.x += angle / 2;

    neptune.rotation.y += angle / 8;

    pluto.rotation.y += angle / 2;

    /*figureGroup.children.forEach(children => {
        children.children.forEach(moon => {
            rotateAboutPoint( moon, new THREE.Vector3(0,1,0), new THREE.Vector3( 0,1,0 ), angle, false )
        });
    });*/



    controls.update();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

}

function run() {
    requestAnimationFrame(function () { run(); });

    // Render the scene
    renderer.render(scene, camera);

    animate();
}

function createScene(canvas) {
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height); // Set width and height of the viewport.
    //renderer.setSize(750, 500);

    // Create a new Three.js scene
    scene = new THREE.Scene();

    const loader = new THREE.TextureLoader();
    const bgTexture = loader.load("../images/universe.jpg");
    scene.background = bgTexture;

    // scene.background = new THREE.Color(0.5, 0.5, 0.5);
    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 150000);
    var controls = new THREE.OrbitControls(camera, renderer.domElement);

    //camera.position.set(0, 10, 1500);
    camera.position.set( -155.25181170561723, 64.17236667860023, -438.83439246695144);
    controls.update();

    //camera.position.z = 10;
    scene.add(camera);

    // Add a directional light to show off the object
    var light = new THREE.PointLight(0xffffff, 1, 1000000);
    light.position.set(0, 0, 0);
    scene.add(light);

    // var targetObject1 = new THREE.Object3D();
    // targetObject1.position.set(1000, 0, 0)
    // scene.add(targetObject1);

    // light.target = targetObject1;

    // Position the light out from the scene, pointing at the origin
    //light.position.set(-1000, 0, 0);



    // Sun ======================================================================================================
    let GLOWMAP = new THREE.TextureLoader().load("../images/sun.jpg");
    //let NOISEMAP = new THREE.TextureLoader().load("../images/noisy-texture.png");
    uniforms = {
        time: { type: "f", value: 0.1 },
        //noiseTexture: { type: "t", value: NOISEMAP },
        glowTexture: { type: "t", value: GLOWMAP }
    };

    //uniforms.noiseTexture.value.wrapS = uniforms.noiseTexture.value.wrapT = THREE.RepeatWrapping;
    uniforms.glowTexture.value.wrapS = uniforms.glowTexture.value.wrapT = THREE.RepeatWrapping;

    let material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent,
        transparent: true,
    });

    // Create the sphere geometry
    geometry = new THREE.SphereGeometry(sunRadius, 20, 20);

    // And put the geometry and material together into a mesh
    sun = new THREE.Mesh(geometry, material);

    sunGroup.add(sun);
    sunGroup.add(figureGroup);

    // ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


    //Mercury =================================================================================================================

    let mercuryTexture = new THREE.TextureLoader().load(mercuryMapUrl);
    let mercuryBumpMap = new THREE.TextureLoader().load(mercuryBumpUrl);
    let mercuryBumpy = new THREE.MeshPhongMaterial({ map: mercuryTexture, bumpMap: mercuryBumpMap, bumpScale: 0.02 });

    mercuryGeometry = new THREE.SphereGeometry(4.8, 20, 20);

    // And put the geometry and material together into a mesh
    mercury = new THREE.Mesh(mercuryGeometry, mercuryBumpy);

    mercury.position.set(57.9 + sunRadius, 0, 0);

    figureGroup.add(mercury);

    createOrbit(57.9 + sunRadius);

    // ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


    //Venus =================================================================================================================

    let venusTexture = new THREE.TextureLoader().load(venusUrl);
    let VenusBumpMap = new THREE.TextureLoader().load(venusBumpUrl);

    VenusBumpy = new THREE.MeshPhongMaterial({ map: venusTexture, bumpMap: VenusBumpMap, bumpScale: 0.05 });



    venusGeometry = new THREE.SphereGeometry(12.104, 20, 20);

    // And put the geometry and material together into a mesh
    venus = new THREE.Mesh(venusGeometry, VenusBumpy);

    venus.position.set(-163, 0, 187.174);

    figureGroup.add(venus);

    createOrbit(248.2);


    // ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



    //Earth =================================================================================================================
    earthMap = new THREE.TextureLoader().load(earthMapUrl);
    earthNormalMap = new THREE.TextureLoader().load(earthNormalMapUrl);
    earthSpecularMap = new THREE.TextureLoader().load(earthSpecularMapUrl);
    earthPhong = new THREE.MeshPhongMaterial({ map: earthMap });
    earthPhongNormal = new THREE.MeshPhongMaterial({ map: earthMap, normalMap: earthNormalMap, specularMap: earthSpecularMap });

    // Create the sphere geometry
    geometry = new THREE.SphereGeometry(12.756, 20, 20);

    // And put the geometry and material together into a mesh
    earth = new THREE.Mesh(geometry, earthPhong);
    earth.visible = false;

    // And put the geometry and material together into a mesh
    earth = new THREE.Mesh(geometry, earthPhongNormal);

    earthGroup.position.set(-149.6 - sunRadius, 0, 0);
    //earth.position.set(249.6, 0, 0);


    earthGroup.add(earth);
    figureGroup.add(earthGroup);

    createOrbit(sunRadius + 149.6);


    // Moon ===========================

    // Load the texture and the bumps.
    let moonTexture = new THREE.TextureLoader().load(moonUrl);
    let moonBumpMap = new THREE.TextureLoader().load(moonBumpUrl);

    // Combine the texture and the bumps
    moonBumpy = new THREE.MeshPhongMaterial({ map: moonTexture, bumpMap: moonBumpMap, bumpScale: 0.03 });

    // Create the sphere geometry
    moonGeometry = new THREE.SphereGeometry(1, 20, 20);

    // And put the geometry and the bumpy material together into a mesh
    moonTextured = new THREE.Mesh(moonGeometry, moonBumpy);

    moonTextured.position.set(0, 0, 30);

    earthGroup.add(moonTextured);



    // -------------------------------------------------------------------------

    // Mars =====================================================================================================

    let marsTexture = new THREE.TextureLoader().load(marsUrl);
    let marsBumpMap = new THREE.TextureLoader().load(marsBumpUrl);

    marsBumpy = new THREE.MeshPhongMaterial({ map: marsTexture, bumpMap: marsBumpMap, bumpScale: 0.55 });

    marsGeometry = new THREE.SphereGeometry(6.787, 20, 20);

    // And put the geometry and material together into a mesh
    mars = new THREE.Mesh(marsGeometry, marsBumpy);
    mars.visible = true;

    //mars.position.set(227.9 + sunRadius, 0, 0);

    marsGroup.position.set(167 + sunRadius, 0, 202.735);

    marsGroup.add(mars);
    figureGroup.add(marsGroup);

    createOrbit(sunRadius + 227.9);


    //MarsMoons ====================================================================

    // Load the texture and the bumps.
    let mmoon1Texture = new THREE.TextureLoader().load(mmoonUrl1);
    let mmoonBumpMap1 = new THREE.TextureLoader().load(mmoonBumpUrl1);

    // Combine the texture and the bumps
    mmoonBumpy1 = new THREE.MeshPhongMaterial({ map: mmoon1Texture, bumpMap: mmoonBumpMap1, bumpScale: 0.03 });

    // Create the sphere geometry
    mmoonGeometry1 = new THREE.SphereGeometry(0.5, 10, 8);

    // And put the geometry and the bumpy material together into a mesh
    mmoonTextured1 = new THREE.Mesh(mmoonGeometry1, mmoonBumpy1);

    mmoonTextured1.position.set(0, 0, -15);

    // ---------

    let mmoon2Texture = new THREE.TextureLoader().load(mmoonUrl2);
    let mmoonBumpMap2 = new THREE.TextureLoader().load(mmoonBumpUrl2);

    // Combine the texture and the bumps
    mmoonBumpy2 = new THREE.MeshPhongMaterial({ map: mmoon2Texture, bumpMap: mmoonBumpMap2, bumpScale: 0.03 });

    // Create the sphere geometry
    mmoonGeometry2 = new THREE.SphereGeometry(0.3, 4, 5);

    // And put the geometry and the bumpy material together into a mesh
    mmoonTextured2 = new THREE.Mesh(mmoonGeometry2, mmoonBumpy2);

    mmoonTextured2.position.set(0, 0, 10);

    marsGroup.add(mmoonTextured1);
    marsGroup.add(mmoonTextured2);

    // ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


    //AsteroidBelt ====================================================================

    asteroidGeometry = new THREE.SphereGeometry(0.5, 4, 5);

    radius = 440;
    xCoord = 440;
    n = xCoord;
    for (var i = 0; i < 89; i++) {
        asteroid = new THREE.Mesh(asteroidGeometry, mmoonBumpy2);
        random = Math.floor(Math.random() * 11) - 5;
        coord = Math.sqrt(Math.pow(radius, 2) - Math.pow(n, 2));
        asteroid.position.set(n, random, coord.toFixed(3));
        figureGroup.add(asteroid);


        asteroid = new THREE.Mesh(asteroidGeometry, mmoonBumpy2);
        coord = Math.sqrt(Math.pow(radius, 2) - Math.pow(n, 2));
        random = Math.floor(Math.random() * 11) - 5;
        asteroid.position.set(n, random, coord.toFixed(3) * -1);
        figureGroup.add(asteroid);

        //console.log(n + ", 0, " + coord.toFixed(3));
        n -= 10;
    }

    radius = 443;
    xCoord = 443;
    n = xCoord;
    for (var i = 0; i < 118; i++) {
        asteroid = new THREE.Mesh(asteroidGeometry, mmoonBumpy2);
        random = Math.floor(Math.random() * 11) - 5;
        coord = Math.sqrt(Math.pow(radius, 2) - Math.pow(n, 2));
        asteroid.position.set(n, random, coord.toFixed(3));
        figureGroup.add(asteroid);


        asteroid = new THREE.Mesh(asteroidGeometry, mmoonBumpy2);
        coord = Math.sqrt(Math.pow(radius, 2) - Math.pow(n, 2));
        random = Math.floor(Math.random() * 11) - 5;
        asteroid.position.set(n, random, coord.toFixed(3) * -1);
        figureGroup.add(asteroid);

        // console.log(n + ", 0, " + coord.toFixed(3));
        n -= 5;
    }

    radius = 446;
    xCoord = 446;
    n = xCoord;
    for (var i = 0; i < 112; i++) {
        asteroid = new THREE.Mesh(asteroidGeometry, mmoonBumpy2);
        random = Math.floor(Math.random() * 11) - 5;
        coord = Math.sqrt(Math.pow(radius, 2) - Math.pow(n, 2));
        asteroid.position.set(n, random, coord.toFixed(3));
        figureGroup.add(asteroid);


        asteroid = new THREE.Mesh(asteroidGeometry, mmoonBumpy2);
        coord = Math.sqrt(Math.pow(radius, 2) - Math.pow(n, 2));
        random = Math.floor(Math.random() * 11) - 5;
        asteroid.position.set(n, random, coord.toFixed(3) * -1);
        figureGroup.add(asteroid);

        //console.log(n + ", 0, " + coord.toFixed(3));
        n -= 8;
    }

    asteroid = new THREE.Mesh(asteroidGeometry, mmoonBumpy2);
    asteroid.position.set(439.5, 0, 20.970);
    figureGroup.add(asteroid);

    asteroid = new THREE.Mesh(asteroidGeometry, mmoonBumpy2);
    asteroid.position.set(438, 0, 41.905);
    figureGroup.add(asteroid);

    asteroid = new THREE.Mesh(asteroidGeometry, mmoonBumpy2);
    asteroid.position.set(436, 0, 59.195);
    figureGroup.add(asteroid);

    asteroid = new THREE.Mesh(asteroidGeometry, mmoonBumpy2);
    asteroid.position.set(435, 0, 66.144);
    figureGroup.add(asteroid);


    asteroid = new THREE.Mesh(asteroidGeometry, mmoonBumpy2);
    asteroid.position.set(439.5, 0, -20.970);
    figureGroup.add(asteroid);

    asteroid = new THREE.Mesh(asteroidGeometry, mmoonBumpy2);
    asteroid.position.set(438, 0, -41.905);
    figureGroup.add(asteroid);

    asteroid = new THREE.Mesh(asteroidGeometry, mmoonBumpy2);
    asteroid.position.set(436, 0, -59.195);
    figureGroup.add(asteroid);

    asteroid = new THREE.Mesh(asteroidGeometry, mmoonBumpy2);
    asteroid.position.set(435, 0, -66.144);
    figureGroup.add(asteroid);

    asteroid = new THREE.Mesh(asteroidGeometry, mmoonBumpy2);
    asteroid.position.set(-439.5, 0, 20.970);
    figureGroup.add(asteroid);

    asteroid = new THREE.Mesh(asteroidGeometry, mmoonBumpy2);
    asteroid.position.set(-438, 0, 41.905);
    figureGroup.add(asteroid);

    asteroid = new THREE.Mesh(asteroidGeometry, mmoonBumpy2);
    asteroid.position.set(-436, 0, 59.195);
    figureGroup.add(asteroid);

    asteroid = new THREE.Mesh(asteroidGeometry, mmoonBumpy2);
    asteroid.position.set(-435, 0, 66.144);
    figureGroup.add(asteroid);


    asteroid = new THREE.Mesh(asteroidGeometry, mmoonBumpy2);
    asteroid.position.set(-439.5, 0, -20.970);
    figureGroup.add(asteroid);

    asteroid = new THREE.Mesh(asteroidGeometry, mmoonBumpy2);
    asteroid.position.set(-438, 0, -41.905);
    figureGroup.add(asteroid);

    asteroid = new THREE.Mesh(asteroidGeometry, mmoonBumpy2);
    asteroid.position.set(-436, 0, -59.195);
    figureGroup.add(asteroid);

    asteroid = new THREE.Mesh(asteroidGeometry, mmoonBumpy2);
    asteroid.position.set(-435, 0, -66.144);
    figureGroup.add(asteroid);


    // ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    // Jupiter =================================================================================

    let jupiterTexture = new THREE.TextureLoader().load(jupiterUrl);
    var jupiterMaterial = new THREE.MeshPhongMaterial({ map: jupiterTexture });

    jupiterGeometry = new THREE.SphereGeometry(75, 40, 40);

    jupiter = new THREE.Mesh(jupiterGeometry, jupiterMaterial);


    //jupiter.position.set(sunRadius + 778.3, 0, 0);
    jupiterGroup.position.set(-730, 0, -557.113);

    createOrbit(sunRadius + 778.3);

    jupiterGroup.add(jupiter);
    figureGroup.add(jupiterGroup);

    // Jupiter Moons

    // Load the texture and the bumps.
    let jmoonTexture = new THREE.TextureLoader().load(mmoonUrl1);
    let jmoonBumpMap = new THREE.TextureLoader().load(mmoonBumpUrl1);

    // Combine the texture and the bumps
    jmoonBumpy = new THREE.MeshPhongMaterial({ map: jmoonTexture, bumpMap: jmoonBumpMap, bumpScale: 0.03 });

    // Create the sphere geometry
    jmoonGeometry = new THREE.SphereGeometry(2, 20, 20);

    // And put the geometry and the bumpy material together into a mesh
    jMoon1 = new THREE.Mesh(jmoonGeometry, jmoonBumpy);

    jMoon1.position.set(0, 0, -90);

    // ---------

    jMoon2 = new THREE.Mesh(jmoonGeometry, jmoonBumpy);
    jMoon2.position.set(0, 0, 120);

    jMoon3 = new THREE.Mesh(jmoonGeometry, jmoonBumpy);
    jMoon3.position.set(120, 50, 150);

    jMoon4 = new THREE.Mesh(jmoonGeometry, jmoonBumpy);
    jMoon4.position.set(100, -20, 0);

    jupiterGroup.add(jMoon1);
    jupiterGroup.add(jMoon2);
    jupiterGroup.add(jMoon3);
    jupiterGroup.add(jMoon4);


    // ---------------------------------------------------------------------------------------------------------------------------------------------------------

    // Saturn ===============================================================================
    let saturnTexture = new THREE.TextureLoader().load(saturnUrl);
    let saturnMaterial = new THREE.MeshPhongMaterial({ map: saturnTexture });

    saturnGeometry = new THREE.SphereGeometry(60, 20, 20);

    saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);

    let saturnRingTexture = new THREE.TextureLoader().load(saturnRingUrl);
    let saturnRingTransparencyMap = new THREE.TextureLoader().load(saturnRingTransparencyUrl);
    let saturnRingMaterial = new THREE.MeshPhongMaterial({ map: saturnRingTexture, alphaMap: saturnRingTransparencyMap, transparent: true });
    let saturnRingGeometry = new THREE.RingGeometry(80, 120, 30, 30);
    saturnRings = new THREE.Mesh(saturnRingGeometry, saturnRingMaterial);
    saturnRings.lookAt(-0.5, 1, 0);

    //saturn.position.set(sunRadius + 1427, 0, 0);
    //saturn.position.set(1467, 0, -550.818);

    saturnGroup.position.set(1467, 0, -550.818);
    saturnGroup.add(saturn);
    saturnGroup.add(saturnRings);
    figureGroup.add(saturnGroup);

    createOrbit(sunRadius + 1427);



    // ---------------------------------------------------------------------------------------------------------------------------

    // Uranus ===============================================================================
    let uranusTexture = new THREE.TextureLoader().load(uranusUrl);
    var uranusMaterial = new THREE.MeshPhongMaterial({ map: uranusTexture });

    uranusGeometry = new THREE.SphereGeometry(40, 20, 20);

    uranus = new THREE.Mesh(uranusGeometry, uranusMaterial);

    // uranus.position.set(sunRadius + 2871, 0, 0);
    uranus.position.set(0, 0, -sunRadius - 2871);

    figureGroup.add(uranus);

    createOrbit(sunRadius + 2871);



    // ---------------------------------------------------------------------------------------------------------------------------

    // Neptune ===============================================================================
    let neptuneTexture = new THREE.TextureLoader().load(neptuneUrl);
    var neptuneMaterial = new THREE.MeshPhongMaterial({ map: neptuneTexture });

    neptuneGeometry = new THREE.SphereGeometry(40, 20, 20);

    neptune = new THREE.Mesh(neptuneGeometry, neptuneMaterial);

    neptune.position.set(sunRadius + 4497, 0, 0);

    figureGroup.add(neptune);

    createOrbit(sunRadius + 4497);

    // ---------------------------------------------------------------------------------------------------------------------------


    // Pluto ===============================================================================
    let plutoTexture = new THREE.TextureLoader().load(plutoUrl);
    let plutoBumpMap = new THREE.TextureLoader().load(plutoBumpUrl);

    // Combine the texture and the bumps
    plutoBumpy = new THREE.MeshPhongMaterial({ map: plutoTexture, bumpMap: plutoBumpMap, bumpScale: 0.03 });

    // Create the sphere geometry
    plutoGeometry = new THREE.SphereGeometry(3, 20, 20);

    // And put the geometry and the bumpy material together into a mesh
    pluto = new THREE.Mesh(plutoGeometry, plutoBumpy);

    pluto.position.set(sunRadius + 5913, 0, 0);

    figureGroup.add(pluto);

    createOrbit(sunRadius + 5913);

    // ---------------------------------------------------------------------------------------------------------------------------

    scene.add(sunGroup);

}

function rotateAboutPoint(obj, point, axis, theta, pointIsWorld) {
    pointIsWorld = (pointIsWorld === undefined) ? false : pointIsWorld;

    if (pointIsWorld) {
        obj.parent.localToWorld(obj.position); // compensate for world coordinate
    }

    obj.position.sub(point); // remove the offset
    obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
    obj.position.add(point); // re-add the offset

    if (pointIsWorld) {
        obj.parent.worldToLocal(obj.position); // undo world coordinates compensation
    }

    obj.rotateOnAxis(axis, theta); // rotate the OBJECT
}

function circlePoints(radius, frac) {
    xCoords = [];
    zCoords = [];
    let newX = radius;
    xCoords[0] = radius

    let number = 360 / frac;

    for (var i = 0; i <= number; i++) {
        xCoords[i] = newX;
        newX = newX - frac;
        unformattedCoord = Math.sqrt(Math.pow(radius, 2) - Math.pow(newX, 2));
        zCoords[i] = unformattedCoord.toFixed(4);
    }

}


function createOrbit(orbitSize) {
    if (renderOrbits) {
        // var geometry = new THREE.CircleGeometry(startPoint.distanceTo(endPoint), 128);
        var geometry = new THREE.CircleGeometry(orbitSize, 10000);
        geometry.vertices.shift();
        geometry.rotateX(-Math.PI / 2);
        var material = new THREE.LineBasicMaterial({ color: 'rgb(255,255,255,10)' });
        var mesh = new THREE.Line(geometry, material);
        figureGroup.add(mesh);
    }
}