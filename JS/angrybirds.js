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

var ambientNoise;
var music;
var breakNoise;
var poof;

var mute = false;

var mouseDownPos;
var speed = 1000;

var score = 0;
var scoreText;

var scorePopups = [];

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
	    0.1
	);

	var floorGeometry = new THREE.BoxGeometry(2000,4000,18000);
	floorGeometry.faceVertexUvs[0][4] = [groundTop[0], groundTop[1], groundTop[3]];
	floorGeometry.faceVertexUvs[0][5] = [groundTop[1], groundTop[2], groundTop[3]];

	floorGeometry.faceVertexUvs[0][0] = [groundSide[0], groundSide[1], groundSide[3]];
	floorGeometry.faceVertexUvs[0][1] = [groundSide[1], groundSide[2], groundSide[3]];

	var floor = new Physijs.BoxMesh( floorGeometry, groundMaterial, 0 );
	floor.position.x = -600;
	floor.position.y = -2000;
	floor.receiveShadow = true;
	floor.name = "ground";
	floor.addEventListener( 'collision', destroyFallingObject, true);
	scene.add(floor);

	var sideGeometry = new THREE.BoxGeometry(2100,4000,4000);
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
	leftSide.addEventListener( 'collision', destroyFallingObject, true);
	scene.add(leftSide);

	var rightSide = new Physijs.BoxMesh( sideGeometry, groundMaterial, 0 );
	rightSide.position.z = -10000;
	rightSide.position.x = -600;
	rightSide.rotation.x = Math.PI / 4;
	rightSide.receiveShadow = true;
	rightSide.name = "ground";
	rightSide.addEventListener( 'collision', destroyFallingObject, true);
	scene.add(rightSide);

	generateTargets( -5000, 5400 );

	slingshot = new SLINGSHOT.createSlingshot(scene, new THREE.Vector3(0,100,6100));

}

// This disables the slingshot until the scene has loaded
var simulationStarted = function() {

	scene.removeEventListener( 'update', simulationStarted);
	window.addEventListener("mousedown", function(e){ handleMouseDown(e); } );
    	
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
	instructions.innerHTML = "Controls:<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + 
							 "Aim: Click & Drag<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + 
							 "(Anywhere on screen)<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
							 "Fire: Release<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + 
							 "Mute: M<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
							 "Press F5 To Generate<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;New Level";
	document.body.appendChild(instructions);

	var name = document.createElement('div');
	name.style.position = 'absolute';
	name.style.width = 20 + '%';
	//name.style.height = 20 + '%';
	name.style.color = "white";
	name.style.fontSize = 1 + 'vw';
	name.style.bottom = 1 + '%';
	name.style.left = 1 + '%';
	name.innerHTML = "By: Grant Goodman";
	document.body.appendChild(name);

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

function initCamera(){

	camera = new BIRD.BirdCamera( 3500, new THREE.PerspectiveCamera( 45, 1, 0.1, 10000 ), slingshot.handleMesh );
	camera.camera.lookAt( scene.position );

}

function initRenderer(){

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0xAAAAFF, 1.0 );
	
	renderer.shadowMapEnabled = true;

	resize();

	document.body.appendChild( renderer.domElement );

}

function initAudio(){

	// Found at https://freesound.org/people/devlab/sounds/170515/
	ambientNoise = new Audio('Sounds/ambient_forest.wav');
	ambientNoise.loop = true;
	ambientNoise.play();

	// Found at https://freesound.org/people/frankum/sounds/393520/
	music = new Audio('Sounds/guitar_loop.mp3');
	music.loop = true;
	music.play();

	// Found at https://freesound.org/people/kevinkace/sounds/66777/
	breakNoise = new Audio('Sounds/wood_break.wav');

	// Found at https://freesound.org/people/Planman/sounds/208111/
	poof = new Audio('Sounds/poof.wav');

	window.addEventListener('keydown', function(event) {
		if(event.keyCode == 77){
			mute = !mute;
			if(mute){
				ambientNoise.pause();
				music.pause();
			}else{
				ambientNoise.play();
				music.play();
			}
		}
	}, false);

}

function render(){

	if( bird != null )
		if( bird.timeToDelete() )
			deleteBird();

	for(var i = 0; i < scorePopups.length; i++){

		scorePopups[i].position.y += 3;

	}

	scene.simulate();

	camera.updateCamera();

	renderer.render( scene, camera.camera );

	requestAnimationFrame( render );

}

function newScorePopup( textContent, position ){

	var textGeometry = new THREE.TextGeometry( textContent, {
		size: 100,
		height: 30,
		curveSegments: 2
	});

	textGeometry.computeBoundingBox();
	var offset = -0.5 * ( textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x );

	var text = new THREE.Mesh( textGeometry, new THREE.MeshLambertMaterial({color: 0xFFFFFF}) );
	text.position.x = offset + position.x;
	text.position.y = position.y;
	text.position.z = position.z;
	text.rotation.y = Math.PI/2;
	//text.rotation.x = camera.camera.rotation.x;
	text.castShadow = true;
	scene.add( text );

	scorePopups.push(text);

	setTimeout(
		function(){
			scene.remove(text);
			scorePopups.splice(scorePopups.indexOf(text),1);
		},
		3000
	);

	return text;

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

	if( camera.parent.name == "slingshot" ){
		mouseDownPos = new THREE.Vector2( event.clientX, event.clientY );
		if(!mute)
			slingshot.stretch.play();


		window.addEventListener("mousemove", handleMouseMovement);
		window.addEventListener("mouseup", handleMouseUp);
	}

}

var handleMouseMovement = function( e ){

	slingshot.updateIndicator((mouseDownPos.x - e.clientX)/(document.body.clientWidth), (mouseDownPos.y - e.clientY)/(window.innerHeight));

}

var handleMouseUp = function( e ){

	if( (e.clientX - mouseDownPos.x)/(window.innerHeight) < 0 ){
		bird = new BIRD.createBird( 0xFF0000, scene, new THREE.Vector3(0,400,6100) );
		bird.mesh.addEventListener( 'collision', destroyDestructibleObject, true);
		camera.setParent( bird.mesh );

		bird.mesh.setLinearVelocity(
			new THREE.Vector3(
				0,
				speed * (e.clientY - mouseDownPos.y)/(document.body.clientHeight),
				speed * (e.clientX - mouseDownPos.x)/(document.body.clientWidth)
			)
		);

	}

	slingshot.resetIndicator(mute);

	window.removeEventListener("mousemove", handleMouseMovement);
	window.removeEventListener("mouseup", handleMouseUp);

}

function generateTargets(minZ,maxZ){

	var curZ = minZ;

	while( curZ < maxZ ){

		switch( Math.floor(Math.random()*2) ){
			case 0:
				var size = Math.floor(Math.random()*8);
				generateStepStair( size, curZ-(size*150), 0 );
				curZ += (size+1)*300;
				break;
			case 1:
				var size = Math.floor(Math.random()*8);
				generateStairStep( size, curZ, 0 );
				curZ += (size+1)*300;
				break;
		}
	}


}

function generateStairStep(numSteps, z, lastY){

	var leftLeg = new TARGET.createDestructibleTarget(0xB69B4C, new THREE.Vector3(100,200,20), new THREE.Vector3(0,lastY+100,z+100), scene );
	var rightLeg = new TARGET.createDestructibleTarget(0xB69B4C, new THREE.Vector3(100,(lastY+200),20), new THREE.Vector3(0,(lastY+200)/2,z-100), scene );
	var top = new TARGET.createDestructibleTarget(0xB69B4C, new THREE.Vector3(100,20,220), new THREE.Vector3(0,lastY+200,z), scene );

	if( Math.random() < 0.5 )
		var falling = new TARGET.createFallingTarget(0xFFFF00, 35, new THREE.Vector3(0,lastY+245,z), scene );

	if( numSteps > 1 )
		generateStairStep( numSteps - 1, z - 200, lastY + 220 );

}

function generateStepStair(numSteps, z, lastY){

	var leftLeg = new TARGET.createDestructibleTarget(0xB69B4C, new THREE.Vector3(100,200,20), new THREE.Vector3(0,lastY+100,z-100), scene );
	var rightLeg = new TARGET.createDestructibleTarget(0xB69B4C, new THREE.Vector3(100,(lastY+200),20), new THREE.Vector3(0,(lastY+200)/2,z+100), scene );
	var top = new TARGET.createDestructibleTarget(0xB69B4C, new THREE.Vector3(100,20,220), new THREE.Vector3(0,lastY+200,z), scene );

	if( Math.random() < 0.5 )
		var falling = new TARGET.createFallingTarget(0xFFFF00, 35, new THREE.Vector3(0,lastY+245,z), scene );

	if( numSteps > 1 )
		generateStepStair( numSteps - 1, z + 200, lastY + 220 );

}

function updateScore(amount){

	score += amount;
	scoreText.innerHTML = "Score: " + score;

}

var destroyFallingObject = function(other_object, relative_velocity, relative_rotation, contact_normal){

	if( other_object.name == "Falling" ){
		if(!mute)
			poof.play();
		newScorePopup(100,other_object.position);
		updateScore(100);
		remove(other_object);
	}

}

var destroyDestructibleObject = function( other_object, relative_velocity, relative_rotation, contact_normal ) {

	if( other_object.name == "Destructible" ){

		if(!mute){
			breakNoise.play();
		}

		newScorePopup(50,bird.mesh.position);
		if( bird.destroyedObject() ){
			deleteBird();
		}
		updateScore(50);
		remove(other_object);
	}

}

function deleteBird(){

	scene.remove(bird.mesh);
	bird = null;
	camera.setParent( slingshot.handleMesh );

}

function remove(name){

	scene.remove( name );

}