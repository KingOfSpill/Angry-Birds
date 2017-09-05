var renderer;
var scene;
var camera;
var cubeRed;
var cubeWhite;
var cubeBlue;
var zoomingIn = true;

function init(){

	initScene();
	initRenderer();
	initCamera();

	document.body.appendChild( renderer.domElement );
	render();

}

function initScene(){

	var dist = 5;

	scene = new THREE.Scene();

	cubeRed = new THREE.Mesh( new THREE.CubeGeometry( 3, 3, 3 ), new THREE.MeshLambertMaterial({color: 0xff218e}) );
	cubeRed.position.x = -dist;
	cubeRed.position.z = dist;
	cubeRed.castShadow = true;
	scene.add( cubeRed );

	cubeWhite = new THREE.Mesh( new THREE.CubeGeometry( 3, 3, 3 ), new THREE.MeshLambertMaterial({color: 0xfcd800}) );
	cubeWhite.castShadow = true;
	scene.add( cubeWhite );

	cubeBlue = new THREE.Mesh( new THREE.CubeGeometry( 3, 3, 3 ), new THREE.MeshLambertMaterial({color: 0x0194fc}) );
	cubeBlue.castShadow = true;
	cubeBlue.position.x = dist;
	cubeBlue.position.z = -dist;
	scene.add( cubeBlue );

	var spotLight = new THREE.SpotLight( 0xffffff );
	spotLight.position.set ( 10, 10, 20 );
	spotLight.shadowCameraNear = 20;
	spotLight.shadowCameraFar = 50;
	spotLight.castShadow = true;
	scene.add( spotLight );

}

function initRenderer(){

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0x000000, 1.0 );
	renderer.setSize( window.innerWidth*.9, window.innerHeight*.9 );
	renderer.shadowMap.enabled = true;

}

function initCamera(){

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000 );
	camera.position.x = 15;
	camera.position.y = 15;
	camera.position.z = 15;
	camera.lookAt( scene.position );

}

function render(){

	cubeRed.rotation.x += 0.02;
	cubeRed.rotation.y += 0.0225;
	cubeRed.rotation.z += 0.0175;

	cubeWhite.rotation.x += 0.02;
	cubeWhite.rotation.y += 0.0225;
	cubeWhite.rotation.z += 0.0175;

	cubeBlue.rotation.x += 0.02;
	cubeBlue.rotation.y += 0.0225;
	cubeBlue.rotation.z += 0.0175;

	camera.fov += 2;

	renderer.render( scene, camera );
	requestAnimationFrame( render );

}

window.onload = init;