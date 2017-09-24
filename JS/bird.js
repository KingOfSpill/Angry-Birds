var BIRD = { REVISION: '2' };

BIRD.createBird = function ( color, scene, position){

	const birdMaterial = Physijs.createMaterial(
	    new THREE.MeshLambertMaterial({ color: color, map: THREE.ImageUtils.loadTexture('Textures/test.jpg') }),
	    1,
	    0
	);

	this.numDestroyed = 0;
	this.destroyedObject = function(){

		this.numDestroyed += 1;
		if(this.numDestroyed >= 2)
			return true;

		return false;

	}

	this.ticksExisting = 0;
	this.timeToDelete = function(){

		this.ticksExisting += 1;

		if(this.mesh.position.y < -10)
			return true;

		if(this.ticksExisting > 20*60)
			return true;

		return false;
	}

	this.mesh = new Physijs.SphereMesh(
		new THREE.SphereGeometry( 15 ),
		birdMaterial,
		200
	);
	this.mesh.name = "bird";
	this.mesh.position = position;
	this.mesh.castShadow = true;
	scene.add( this.mesh );

}

BIRD.BirdCamera = function ( inRadius, inCamera, parent ){

	this.minRadius = inRadius;
	this.radius = inRadius;
	this.horizontalAngle = 0;
	this.maxHorizontalAngle = Math.PI / 2;
	this.verticalAngle = 10;

	this.rotSpeed = 0.02;

	this.camera = inCamera;
	this.camera.far = 30000;
	this.parent = parent;

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
		if( this.parent.name != "slingshot" )
			this.camera.position.z += this.parent.position.z + (this.radius * Math.sin(this.horizontalAngle));
		else
			this.camera.position.z += this.parent.position.z - document.body.clientWidth*1.75;
		this.camera.position.z /= 4;

		if( (this.parent.position.y) * 2 * Math.sqrt(2) > this.minRadius ){
			this.radius = (this.parent.position.y) * 2 * Math.sqrt(2);
		}else{
			this.radius = this.minRadius;
		}

		if( this.parent.name != "slingshot" )
			this.camera.lookAt( new THREE.Vector3(this.parent.position.x, 0 , this.parent.position.z) );
		else
			this.camera.lookAt( new THREE.Vector3(this.parent.position.x, 0 , this.parent.position.z-document.body.clientWidth*1.75) );

	}

	this.setParent = function( newParent ){
		this.parent = newParent;
	}

}