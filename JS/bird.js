var BIRD = { REVISION: '1' };

BIRD.bird = function ( color ){

	this.color = color;

}

BIRD.BirdCamera = function ( inRadius, inCamera, parent ){

	this.radius = inRadius;
	this.horizontalAngle = 0;
	this.verticalAngle = 35;

	this.rotSpeed = 0.02;

	this.camera = inCamera;
	this.parent = parent;

	parent.add( this.camera );

	this.camera.position.x = this.radius/Math.sqrt(2);
	this.camera.position.y = this.radius/Math.sqrt(2);
	this.camera.position.z = this.radius/Math.sqrt(2);

	this.updateCamera = function(){

		this.horizontalAngle = -this.parent.getLinearVelocity().z/360;
		this.horizontalAngle = this.horizontalAngle % 360;

		this.camera.position.x = this.radius * Math.cos(this.horizontalAngle);
		this.camera.position.z = this.radius * Math.sin(this.horizontalAngle);

		this.camera.lookAt(new THREE.Vector3(0,0,0));

	}

}