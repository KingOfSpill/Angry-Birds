var BIRD = { REVISION: '2' };

BIRD.createBird = function ( color, scene, x, y, z ){

	const birdMaterial = Physijs.createMaterial(
	    new THREE.MeshLambertMaterial({ color: color, map: THREE.ImageUtils.loadTexture('Textures/test.jpg') }),
	    0.8,
	    0.8
	);

	this.mesh = new Physijs.SphereMesh(
		new THREE.SphereGeometry( 15 ),
		birdMaterial,
		200
	);
	this.mesh.position.x = x;
	this.mesh.position.y = y;
	this.mesh.position.z = z;
	this.mesh.castShadow = true;
	scene.add( this.mesh );

}

BIRD.BirdCamera = function ( inRadius, inCamera, parent ){

	this.radius = inRadius;
	this.horizontalAngle = 0;
	this.maxHorizontalAngle = Math.PI / 2;
	this.verticalAngle = 10;

	this.rotSpeed = 0.02;

	this.camera = inCamera;
	this.parent = parent;

	//parent.add( this.camera );

	this.camera.position.x = this.parent.position.x + this.radius/Math.sqrt(2);
	this.camera.position.y = this.parent.position.y + this.radius/Math.sqrt(2);
	this.camera.position.z = this.parent.position.z + this.radius/Math.sqrt(2);

	this.updateCamera = function(){

		this.horizontalAngle = -this.parent.getLinearVelocity().z/3600;
		this.horizontalAngle = this.horizontalAngle % 360;

		THREE.Math.clamp( this.horizontalAngle, -this.maxHorizontalAngle, this.maxHorizontalAngle );

		// Want to smooth transition using averages because the 
		this.camera.position.x *= 3;
		this.camera.position.x += this.parent.position.x + (this.radius * Math.cos(this.horizontalAngle));
		this.camera.position.x /= 4;

		this.camera.position.z *= 3;
		this.camera.position.z += this.parent.position.z + (this.radius * Math.sin(this.horizontalAngle));
		this.camera.position.z /= 4;

		this.camera.lookAt( new THREE.Vector3(this.parent.position.x, 0, this.parent.position.z) );

	}

	this.setParent = function( newParent ){
		this.parent = newParent;
	}

}