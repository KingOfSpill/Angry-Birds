'use strict';

Physijs.scripts.worker = 'Libs/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

window.onload = init;

var renderer;
var scene;
var camera;
var aspectRatio = 1.75;
var slingshot
var sun;
var baseLight
var bird;

var mouseDownPos;
var speed = 10;

function init(){

	initScene();
	initLights();
	initCamera();
	initRenderer();

	requestAnimationFrame( render );

}

function initScene(){

	scene = new Physijs.Scene();
	scene.setGravity( new THREE.Vector3(0,-100,0) );

	var groundMaterial = Physijs.createMaterial(
	    new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('Textures/Grass.png') }),
	    0.8,
	    0.8
	);

	var destroyFallingObject = function(other_object, relative_velocity, relative_rotation, contact_normal){

		if( other_object.name == "Falling" ){
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

	var destroyDestructibleObject = function( other_object, relative_velocity, relative_rotation, contact_normal ) {
    	
		if( other_object.name == "Destructible" ){
			remove(other_object);
		}

	}

	bird = new BIRD.createBird( 0xFF0000, scene, 0, 20, 6000 );
	bird.mesh.addEventListener( 'collision', destroyDestructibleObject);

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
	const w = document.body.clientWidth - 5;
	const h = window.innerHeight - 5;
    renderer.setSize(w, h);
    camera.camera.aspect = w / h;
    camera.camera.updateProjectionMatrix();
}; 

window.addEventListener("resize", resize);
window.addEventListener("mousedown", function(e){ handleMouseDown(e); } );

function handleMouseDown(event){

	mouseDownPos = new THREE.Vector2( event.clientX, event.clientY );

	window.addEventListener("mousemove", handleMouseMovement);
	window.addEventListener("mouseup", handleMouseUp);

}

var handleMouseMovement = function( e ){

	slingshot.updateIndicator((mouseDownPos.x - e.clientX)/(document.body.clientWidth), (mouseDownPos.y - e.clientY)/(window.innerHeight));

}

var handleMouseUp = function( e ){

	/*bird.mesh.setLinearVelocity(
		new THREE.Vector3(
			0,
			speed * (e.clientY - mouseDownPos.y),
			speed * (e.clientX - mouseDownPos.x)
		)
	);*/

	slingshot.resetIndicator();

	window.removeEventListener("mousemove", handleMouseMovement);
	window.removeEventListener("mouseup", handleMouseUp);

}

function initCamera(){

	camera = new BIRD.BirdCamera( 2000, new THREE.PerspectiveCamera( 45, aspectRatio, 0.1, 10000 ), bird.mesh );
	camera.camera.lookAt( scene.position );

}

function render(){

	//bird.mesh.setLinearVelocity( new THREE.Vector3( 0, bird.mesh.getLinearVelocity().y, bird.mesh.getLinearVelocity().z ) );

	scene.simulate();

	camera.updateCamera();

	renderer.render( scene, camera.camera );

	requestAnimationFrame( render );

}