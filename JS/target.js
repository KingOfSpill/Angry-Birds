var TARGET = { REVISION: '1' };
var numTargets = 0;

TARGET.createDestructibleTarget = function( color, size, position, scene ){

	numTargets += 1;

	const targetMaterial = Physijs.createMaterial(
	    new THREE.MeshLambertMaterial({ color: color, map: THREE.ImageUtils.loadTexture('Textures/birb.png') }),
	    1,
	    0.1
	);

	this.mesh = new Physijs.BoxMesh(
		new THREE.BoxGeometry( size.x, size.y, size.z ),
		targetMaterial,
		200
	);
	this.mesh.name = "Destructible";
	this.mesh.position = position;

	scene.add( this.mesh );

}

TARGET.createFallingTarget = function( color, size, position, scene ){

	numTargets += 1;

	const targetMaterial = Physijs.createMaterial(
	    new THREE.MeshLambertMaterial({ color: color, map: THREE.ImageUtils.loadTexture('Textures/birb.png') }),
	    1,
	    0.1
	);

	this.mesh = new Physijs.SphereMesh(
		new THREE.SphereGeometry( size ),
		targetMaterial,
		200
	);
	this.mesh.name = "Falling";
	this.mesh.position = position;

	scene.add( this.mesh );

}