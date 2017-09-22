'use strict';

Physijs.scripts.worker = 'Libs/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

window.onload = init;

var renderer;
var scene;
var camera;
var aspectRatio = 1.75;
var sun;
var baseLight
var box;
var Vspeed = 1;
var Hspeed = 1;

function init(){

	initScene();
	initLights();
	initCamera();
	initRenderer();

	requestAnimationFrame( render );

}

function initScene(){

	scene = new Physijs.Scene;

	var ground = new Physijs.BoxMesh( 
			new THREE.BoxGeometry(1500,2,1500),
			new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('Textures/Grass.png') }),
			0
		);
	ground.position.y = -10;
	ground.castShadow = true;
	scene.add(ground);

	box = new Physijs.BoxMesh(
			new THREE.BoxGeometry( 15, 15, 15 ),
			new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('Textures/test.jpg') }),
			5
		);
	box.position.y = 20;
	box.castShadow = true;
	scene.add( box );

}

function initLights(){

	baseLight = new THREE.AmbientLight();
	baseLight.intensity = 0.0005;
	scene.add(baseLight);

	sun = new THREE.DirectionalLight(0xFFFFFF);
	sun.position = new THREE.Vector3( 1, 1, 1 );
	sun.intensity = 0.2;
	sun.shadowCameraNear = 1;
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

function initCamera(){

	camera = new BIRD.BirdCamera( 400, new THREE.PerspectiveCamera( 45, aspectRatio, 0.1, 10000 ), box );
	camera.camera.lookAt( scene.position );

}

function render(){

	box.setAngularVelocity( new THREE.Vector3( 0, 0, 0 ) );

	scene.simulate();

	if( Key.isDown(Key.W) )
		box.setLinearVelocity( box.getLinearVelocity().add( new THREE.Vector3(0,Vspeed,0) ) );

	if( Key.isDown(Key.A) )
		box.setLinearVelocity( box.getLinearVelocity().add( new THREE.Vector3(0,0,Hspeed) ) );
	else if( Key.isDown(Key.D) )
		box.setLinearVelocity( box.getLinearVelocity().add( new THREE.Vector3(0,0,-Hspeed) ) );

	camera.updateCamera();

	renderer.render( scene, camera.camera );

	requestAnimationFrame( render );

}