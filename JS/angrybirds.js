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

	var groundMaterial = Physijs.createMaterial(
	    new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('Textures/Grass.png') }),
	    1,
	    0.0
	);

	var destroyFallingObject = function(other_object, relative_velocity, relative_rotation, contact_normal){

		if( other_object.name == "Falling" ){
			updateScore(100);
			remove(other_object);
		}

	}

	var floor = new Physijs.BoxMesh( new THREE.BoxGeometry(2000,4000,15000), groundMaterial, 0 );
	floor.position.x = -600;
	floor.position.y = -2000;
	floor.receiveShadow = true;
	floor.name = "ground";
	floor.addEventListener( 'collision', destroyFallingObject);
	scene.add(floor);

	var leftSide = new Physijs.BoxMesh( new THREE.BoxGeometry(2000,4000,4000), groundMaterial, 0 );
	leftSide.position.z = 10000;
	leftSide.position.x = -600;
	leftSide.rotation.x = -Math.PI / 4;
	leftSide.receiveShadow = true;
	leftSide.name = "ground";
	leftSide.addEventListener( 'collision', destroyFallingObject);
	scene.add(leftSide);

	var rightSide = new Physijs.BoxMesh( new THREE.BoxGeometry(2000,4000,4000), groundMaterial, 0 );
	rightSide.position.z = -10000;
	rightSide.position.x = -600;
	rightSide.rotation.x = Math.PI / 4;
	rightSide.receiveShadow = true;
	rightSide.name = "ground";
	rightSide.addEventListener( 'collision', destroyFallingObject);
	scene.add(rightSide);

	var target =  new TARGET.createDestructibleTarget(0, 0x0000FF, 0, new THREE.Vector3(100,200,20), new THREE.Vector3(0,100,5600), scene );
	var target2 = new TARGET.createDestructibleTarget(0, 0x0000FF, 0, new THREE.Vector3(100,200,20), new THREE.Vector3(0,100,5400), scene );
	var target3 = new TARGET.createDestructibleTarget(0, 0x0000FF, 0, new THREE.Vector3(100,20,220), new THREE.Vector3(0,210,5500), scene );
	var target4 = new TARGET.createDestructibleTarget(0, 0x0000FF, 0, new THREE.Vector3(100,200,20), new THREE.Vector3(0,320,5400), scene );
	var target5 = new TARGET.createDestructibleTarget(0, 0x0000FF, 0, new THREE.Vector3(100,420,20), new THREE.Vector3(0,210,5200), scene );
	var target6 = new TARGET.createDestructibleTarget(0, 0x0000FF, 0, new THREE.Vector3(100,20,220), new THREE.Vector3(0,420,5300), scene );
	var falling = new TARGET.createFallingTarget(0xFFFF00, 0, 35, new THREE.Vector3(0,280,5500), scene );
	var falling2 = new TARGET.createFallingTarget(0xFFFF00, 0, 35, new THREE.Vector3(0,490,5300), scene );

	slingshot = new SLINGSHOT.createSlingshot(scene, new THREE.Vector3(0,100,6100));

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

	slingshot.resetIndicator();

	window.removeEventListener("mousemove", handleMouseMovement);
	window.removeEventListener("mouseup", handleMouseUp);

}

function initCamera(){

	camera = new BIRD.BirdCamera( 2000, new THREE.PerspectiveCamera( 45, 1, 0.1, 10000 ), slingshot.handleMesh );
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