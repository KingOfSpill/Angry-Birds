var TARGET = { REVISION: '1' };
var numTargets = 0;

TARGET.createDestructibleTarget = function( destructionVelocity, color, score, size, position, scene ){

	numTargets += 1;

	const targetMaterial = Physijs.createMaterial(
	    new THREE.MeshLambertMaterial({ color: color, map: THREE.ImageUtils.loadTexture('Textures/birb.png') }),
	    0.8,
	    0.0
	);

	this.destructionVelocity = destructionVelocity;
	this.score = score;

	this.mesh = new Physijs.BoxMesh(
		new THREE.BoxGeometry( size.x, size.y, size.z ),
		targetMaterial,
		200
	);
	this.mesh.name = numTargets.toString();
	this.mesh.position = position;

	scene.add( this.mesh );

}

TARGET.createFallingTarget = function( color, score, size, position, scene ){

	numTargets += 1;

	const targetMaterial = Physijs.createMaterial(
	    new THREE.MeshLambertMaterial({ color: color, map: THREE.ImageUtils.loadTexture('Textures/birb.png') }),
	    0.8,
	    0.0
	);

	this.destructionVelocity = destructionVelocity;
	this.score = score;

	this.mesh = new Physijs.BoxMesh(
		new THREE.BoxGeometry( size.x, size.y, size.z ),
		targetMaterial,
		200
	);
	this.mesh.name = numTargets.toString();
	this.mesh.position = position;

	scene.add( this.mesh );

}