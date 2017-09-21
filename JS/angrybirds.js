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

function PivotCamera( inRadius, inCamera, parent ){

	this.radius = inRadius;
	this.horizontalAngle = 45;
	this.verticalAngle = 45;

	this.rotSpeed = 0.02;

	this.camera = inCamera;

	parent.add( this.camera );

	this.camera.position.x = this.radius/Math.sqrt(2);
	this.camera.position.y = this.radius/Math.sqrt(2);
	this.camera.position.z = this.radius/Math.sqrt(2);

	this.updateCamera = function(){

		if( Key.isDown(Key.UPARROW) ){

			this.camera.position.y += 1;
			
			if( this.camera.position.y < 10 )
				this.radius -= this.rotSpeed;
			else if( this.camera.position.y > 10 )
				this.radius += this.rotSpeed;

			this.camera.position.x = this.radius * Math.cos(this.horizontalAngle);
			this.camera.position.z = this.radius * Math.sin(this.horizontalAngle);

			this.camera.lookAt(scene.position);

		}else if( Key.isDown(Key.DOWNARROW) ){

			this.camera.position.y -= 1;

			if( this.camera.position.y > 10 )
				this.radius -= this.rotSpeed;
			else if( this.camera.position.y < 10 )
				this.radius += this.rotSpeed;

			this.camera.position.x = this.radius * Math.cos(this.horizontalAngle);
			this.camera.position.z = this.radius * Math.sin(this.horizontalAngle);

			this.camera.lookAt(scene.position);

		}

		if( Key.isDown(Key.LEFTARROW) ){

			this.horizontalAngle += this.rotSpeed;
			this.horizontalAngle = this.horizontalAngle % 360;

			this.camera.position.x = this.radius * Math.cos(this.horizontalAngle);
			this.camera.position.z = this.radius * Math.sin(this.horizontalAngle);

			this.camera.lookAt(scene.position);

		}else if( Key.isDown(Key.RIGHTARROW) ){

			this.horizontalAngle -= this.rotSpeed;
			this.horizontalAngle = this.horizontalAngle % 360;

			this.camera.position.x = this.radius * Math.cos(this.horizontalAngle);
			this.camera.position.z = this.radius * Math.sin(this.horizontalAngle);

			this.camera.lookAt(scene.position);

		}


	}

}

function init(){

	initScene();
	initLights();
	initRenderer();
	initCamera();

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

	if( window.innerWidth > window.innerHeight )
		renderer.setSize( window.innerHeight*aspectRatio*.9, window.innerHeight*.9 );
	else
		renderer.setSize( window.innerWidth*.9, window.innerWidth*(1/aspectRatio)*.9 );

	
	renderer.shadowMapEnabled = true;

	document.body.appendChild( renderer.domElement );

}

function initCamera(){

	camera = new PivotCamera( 145, new THREE.PerspectiveCamera( 45, aspectRatio, 0.1, 10000 ), box );
	camera.camera.lookAt( scene.position );

}

function render(){

	scene.simulate();

	if( Key.isDown(Key.W) )
		box.setLinearVelocity( box.getLinearVelocity().add( new THREE.Vector3(0,Vspeed,0) ) );

	if( Key.isDown(Key.A) )
		box.setLinearVelocity( box.getLinearVelocity().add( new THREE.Vector3(0,0,Hspeed) ) );
	else if( Key.isDown(Key.D) )
		box.setLinearVelocity( box.getLinearVelocity().add( new THREE.Vector3(0,0,-Hspeed) ) );

	box.setAngularVelocity( new THREE.Vector3( 0, 0, 0 ) );

	camera.updateCamera();

	renderer.render( scene, camera.camera );

	requestAnimationFrame( render );

}