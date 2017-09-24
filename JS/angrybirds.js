'use strict';

Physijs.scripts.worker = 'Libs/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

window.onload = init;

var renderer;
var scene;
var camera;
var slingshot
var sun;
var baseLight
var bird;

var hudRenderer;
var hudCamera;

var ambientNoise;
var music;

var mouseDownPos;
var speed = 1000;

var score = 0;
var scoreText;

// This disables the slingshot until the scene has loaded
var simulationStarted = function() {

	scene.removeEventListener( 'update', simulationStarted);
	window.addEventListener("mousedown", function(e){ handleMouseDown(e); } );
    	
}

function init(){

	initScene();

	scene.addEventListener( 'update', simulationStarted);

	initHud();

	initLights();
	initCamera();
	initRenderer();
	initAudio();

	requestAnimationFrame( render );

}

function initScene(){

	scene = new Physijs.Scene();
	scene.setGravity( new THREE.Vector3(0,-100,0) );

	var groundTop = [new THREE.Vector2(0,1), new THREE.Vector2(1,1), new THREE.Vector2(1,0.5), new THREE.Vector2(0,0.5)];
	var groundSide = [new THREE.Vector2(1,0.5), new THREE.Vector2(1,0), new THREE.Vector2(0,0), new THREE.Vector2(0,0.5)];

	var texture = THREE.ImageUtils.loadTexture('Textures/Grass.png');

	var groundMaterial = Physijs.createMaterial(
	    new THREE.MeshLambertMaterial({ map: texture }),
	    1,
	    0.0
	);

	var destroyFallingObject = function(other_object, relative_velocity, relative_rotation, contact_normal){

		if( other_object.name == "Falling" ){
			updateScore(100);
			remove(other_object);
		}

	}

	var floorGeometry = new THREE.BoxGeometry(2000,4000,15000);
	floorGeometry.faceVertexUvs[0][4] = [groundTop[0], groundTop[1], groundTop[3]];
	floorGeometry.faceVertexUvs[0][5] = [groundTop[1], groundTop[2], groundTop[3]];

	floorGeometry.faceVertexUvs[0][0] = [groundSide[0], groundSide[1], groundSide[3]];
	floorGeometry.faceVertexUvs[0][1] = [groundSide[1], groundSide[2], groundSide[3]];

	var floor = new Physijs.BoxMesh( floorGeometry, groundMaterial, 0 );
	floor.position.x = -600;
	floor.position.y = -2000;
	floor.receiveShadow = true;
	floor.name = "ground";
	floor.addEventListener( 'collision', destroyFallingObject);
	scene.add(floor);

	var sideGeometry = new THREE.BoxGeometry(2000,4000,4000);
	sideGeometry.faceVertexUvs[0][4] = [groundTop[0], groundTop[1], groundTop[3]];
	sideGeometry.faceVertexUvs[0][5] = [groundTop[1], groundTop[2], groundTop[3]];

	sideGeometry.faceVertexUvs[0][0] = [groundSide[0], groundSide[1], groundSide[3]];
	sideGeometry.faceVertexUvs[0][1] = [groundSide[1], groundSide[2], groundSide[3]];

	var leftSide = new Physijs.BoxMesh( sideGeometry, groundMaterial, 0 );
	leftSide.position.z = 10000;
	leftSide.position.x = -600;
	leftSide.rotation.x = -Math.PI / 4;
	leftSide.receiveShadow = true;
	leftSide.name = "ground";
	leftSide.addEventListener( 'collision', destroyFallingObject);
	scene.add(leftSide);

	var rightSide = new Physijs.BoxMesh( sideGeometry, groundMaterial, 0 );
	rightSide.position.z = -10000;
	rightSide.position.x = -600;
	rightSide.rotation.x = Math.PI / 4;
	rightSide.receiveShadow = true;
	rightSide.name = "ground";
	rightSide.addEventListener( 'collision', destroyFallingObject);
	scene.add(rightSide);

	generateStairStep( Math.floor(Math.random()*10), 5400, 0 );

	/*var target =  
	var target2 = new TARGET.createDestructibleTarget(0xB69B4C, new THREE.Vector3(100,200,20), new THREE.Vector3(0,100,5400), scene );
	var target3 = new TARGET.createDestructibleTarget(0xB69B4C, new THREE.Vector3(100,20,220), new THREE.Vector3(0,210,5500), scene );
	var target4 = new TARGET.createDestructibleTarget(0xB69B4C, new THREE.Vector3(100,200,20), new THREE.Vector3(0,320,5400), scene );
	var target5 = new TARGET.createDestructibleTarget(0xB69B4C, new THREE.Vector3(100,420,20), new THREE.Vector3(0,210,5200), scene );
	var target6 = new TARGET.createDestructibleTarget(0xB69B4C, new THREE.Vector3(100,20,220), new THREE.Vector3(0,420,5300), scene );
	var falling = new TARGET.createFallingTarget(0x44FF00, 35, new THREE.Vector3(0,280,5500), scene );
	var falling2 = new TARGET.createFallingTarget(0x44FF00, 35, new THREE.Vector3(0,490,5300), scene );*/

	slingshot = new SLINGSHOT.createSlingshot(scene, new THREE.Vector3(0,100,6100));

}

function generateStairStep(numSteps, z, lastY){

	var leftLeg = new TARGET.createDestructibleTarget(0xB69B4C, new THREE.Vector3(100,200,20), new THREE.Vector3(0,lastY+100,z+100), scene );
	var rightLeg = new TARGET.createDestructibleTarget(0xB69B4C, new THREE.Vector3(100,(lastY+200),20), new THREE.Vector3(0,(lastY+200)/2,z-100), scene );
	var top = new TARGET.createDestructibleTarget(0xB69B4C, new THREE.Vector3(100,20,220), new THREE.Vector3(0,lastY+200,z), scene );

	if( Math.random() < 0.3 )
		var falling = new TARGET.createFallingTarget(0x44FF00, 35, new THREE.Vector3(0,lastY+245,z), scene );

	if( numSteps > 1 )
		generateStairStep( numSteps - 1, z - 200, lastY + 220 );

}

function initHud(){

	scoreText = document.createElement('div');
	scoreText.style.position = 'absolute';
	scoreText.style.width = 20 + '%';
	scoreText.style.height = 20 + '%';
	scoreText.style.color = "white";
	scoreText.style.fontSize = 3 + 'vw';
	scoreText.style.top = 5 + '%';
	scoreText.style.left = 5 + '%';
	updateScore(0);
	document.body.appendChild(scoreText);

	var instructions = document.createElement('div');
	instructions.style.position = 'absolute';
	instructions.style.width = 20 + '%';
	instructions.style.height = 20 + '%';
	instructions.style.color = "white";
	instructions.style.fontSize = 2 + 'vw';
	instructions.style.top = 5 + '%';
	instructions.style.right = 5 + '%';
	instructions.innerHTML = "Controls:<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Click & Drag With<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Mouse To Wind Up<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;& Release To Fire";
	document.body.appendChild(instructions);

}

function updateScore(amount){

	score += amount;
	scoreText.innerHTML = "Score: " + score;

}

var destroyDestructibleObject = function( other_object, relative_velocity, relative_rotation, contact_normal ) {

	if( other_object.name == "Destructible" ){
		if( bird.destroyedObject() ){
			deleteBird();
		}
		updateScore(50);
		remove(other_object);
	}

}

function deleteBird(){

	scene.remove(bird.mesh);
	bird.mesh.removeEventListener('collision', destroyDestructibleObject);
	bird = null;
	camera.setParent( slingshot.handleMesh );

}

function remove(name){

	scene.remove( name );

}

function initLights(){

	baseLight = new THREE.AmbientLight(0x555555);
	baseLight.intensity = 1;
	scene.add(baseLight);

	sun = new THREE.DirectionalLight(0xFFFFFF);
	sun.position = new THREE.Vector3( 1, 1, 0 );
	sun.intensity = 1;
	sun.shadowCameraNear = 0.1;
	sun.shadowCameraFar = 1000;
	sun.castShadow = true;
	scene.add(sun);

}

function initRenderer(){

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0xAAAAFF, 1.0 );
	
	renderer.shadowMapEnabled = true;

	resize();

	document.body.appendChild( renderer.domElement );

}

function resize() {
	const w = document.body.clientWidth;
	const h = document.body.clientHeight;
    renderer.setSize(w, h);
    camera.camera.aspect = w / h;
    camera.camera.updateProjectionMatrix();
}; 

window.addEventListener("resize", resize);

function handleMouseDown(event){

	mouseDownPos = new THREE.Vector2( event.clientX, event.clientY );
	slingshot.stretch.play();


	window.addEventListener("mousemove", handleMouseMovement);
	window.addEventListener("mouseup", handleMouseUp);

}

var handleMouseMovement = function( e ){

	slingshot.updateIndicator((mouseDownPos.x - e.clientX)/(document.body.clientWidth), (mouseDownPos.y - e.clientY)/(window.innerHeight));

}

var handleMouseUp = function( e ){

	if( (e.clientX - mouseDownPos.x)/(window.innerHeight) < 0 ){
		bird = new BIRD.createBird( 0xFF0000, scene, new THREE.Vector3(0,400,6100) );
		bird.mesh.addEventListener( 'collision', destroyDestructibleObject);
		camera.setParent( bird.mesh );

		bird.mesh.setLinearVelocity(
			new THREE.Vector3(
				0,
				speed * (e.clientY - mouseDownPos.y)/(document.body.clientWidth),
				speed * (e.clientX - mouseDownPos.x)/(window.innerHeight)
			)
		);

		setTimeout(
			function(){
				deleteBird();
			},
			20000
		);
	}

	slingshot.resetIndicator();

	window.removeEventListener("mousemove", handleMouseMovement);
	window.removeEventListener("mouseup", handleMouseUp);

}

function initCamera(){

	camera = new BIRD.BirdCamera( 3500, new THREE.PerspectiveCamera( 45, 1, 0.1, 10000 ), slingshot.handleMesh );
	camera.camera.lookAt( scene.position );

}

function initAudio(){

	ambientNoise = new Audio('Sounds/ambient_forest.wav');
	ambientNoise.loop = true;
	ambientNoise.play();

	music = new Audio('Sounds/guitar_loop.mp3');
	music.loop = true;
	music.play();

}

function render(){

	scene.simulate();

	camera.updateCamera();

	renderer.render( scene, camera.camera );

	requestAnimationFrame( render );

}