var SLINGSHOT = { REVISION: '1' };

SLINGSHOT.createSlingshot = function ( scene, position ){

	const slingshotMaterial = Physijs.createMaterial(
	    new THREE.MeshLambertMaterial({ color: 0xE2B279, map: THREE.ImageUtils.loadTexture('Textures/birb.png') }),
	    0.8,
	    0.0
	);

	this.handleMesh = new Physijs.CylinderMesh(
		new THREE.CylinderGeometry( 10, 10, 200, 10 ),
		slingshotMaterial,
		0
	);
	this.handleMesh.position = position;


	this.yLeftMesh = new Physijs.CylinderMesh(
		new THREE.CylinderGeometry( 10, 10, 200, 10 ),
		slingshotMaterial,
		0
	);
	this.handleMesh.add(this.yLeftMesh);
	this.yLeftMesh.rotation.z = -Math.PI/4;
	this.yLeftMesh.position.y = 100 + (200/(2*Math.sqrt(2)));
	this.yLeftMesh.position.x = (200/(2*Math.sqrt(2)));

	this.yRightMesh = new Physijs.CylinderMesh(
		new THREE.CylinderGeometry( 10, 10, 200, 10 ),
		slingshotMaterial,
		0
	);
	this.handleMesh.add(this.yRightMesh);
	this.yRightMesh.rotation.z = Math.PI/4;

	// I'm using the trick here that hypotenuse/sqrt(2) is the length of the other two sides in a 45-45-90 triangle
	this.yRightMesh.position.y = 100 + (200/(2*Math.sqrt(2)));
	this.yRightMesh.position.x = -(200/(2*Math.sqrt(2)));


	const indicatorMaterial = new THREE.MeshLambertMaterial({color: 0xFF0000});

	this.indicatorMeshLeft = new THREE.Mesh(
		new THREE.CylinderGeometry( 10, 10, 200, 10 ),
		indicatorMaterial
	)

	this.handleMesh.add( this.indicatorMeshLeft );
	this.indicatorMeshLeft.rotation.x = Math.PI/2;
	this.indicatorMeshLeft.rotation.z = Math.PI/4;
	this.indicatorMeshLeft.position.x = (200/(2*Math.sqrt(2)));
	this.indicatorMeshLeft.position.y = 100 + 200/Math.sqrt(2);
	this.indicatorMeshLeft.position.z = 100/Math.sqrt(2);

	this.indicatorMeshRight = new THREE.Mesh(
		new THREE.CylinderGeometry( 10, 10, 200, 10 ),
		indicatorMaterial
	)

	this.handleMesh.add( this.indicatorMeshRight );
	this.indicatorMeshRight.rotation.x = Math.PI/2;
	this.indicatorMeshRight.rotation.z = -Math.PI/4;
	this.indicatorMeshRight.position.x = -(200/(2*Math.sqrt(2)));
	this.indicatorMeshRight.position.y = 100 + 200/Math.sqrt(2);
	this.indicatorMeshRight.position.z = 100/Math.sqrt(2);

	// Found at https://freesound.org/people/potsunen/sounds/343454/
	this.snap = new Audio('Sounds/snap.wav');
	// Found at https://freesound.org/people/Anthousai/sounds/399008/
	this.stretch = new Audio('Sounds/stretch.wav');
	this.stretch.loop = true;

	this.updateIndicator = function(scaleX,scaleY){

		if( scaleX > 1 )
			scaleX = 1;
		else if( scaleX < 0 )
			scaleX = 0;

		if( scaleY > 1 )
			scaleY = 1;
		else if( scaleY <-1 )
			scaleY = -1;

		var angle = Math.PI/(2 + 2 * Math.abs(scaleX) );
		var verticalAngle = Math.PI/2 - (scaleY * Math.PI/4);

		if(scaleX < 0){
			angle *= -1;
			//verticalAngle *= -1;
		}

		while(verticalAngle < 0)
			verticalAngle += 2*Math.PI;

		while( angle < 0 )
			angle += 2 * Math.PI;

		var adjustedScale = (Math.cos(angle) * (1- 1/Math.sqrt(2))) + (1/Math.sqrt(2));
		var positionScale = Math.cos(angle);

		if(scaleX < 0){
			positionScale *= -1;
		}

		//var verticalAngle = Math.PI/2 - (scaleY*Math.PI/2);

		this.indicatorMeshLeft.scale.y = adjustedScale;
		this.indicatorMeshRight.scale.y = adjustedScale;

		this.indicatorMeshLeft.rotation.z = angle;
		this.indicatorMeshRight.rotation.z = -angle;
			
		this.indicatorMeshLeft.position.z = positionScale*100/Math.sqrt(2);
		this.indicatorMeshRight.position.z = positionScale*100/Math.sqrt(2);

		this.indicatorMeshLeft.rotation.x = verticalAngle;
		this.indicatorMeshRight.rotation.x = verticalAngle;


		this.indicatorMeshLeft.position.y = (100 + 200/Math.sqrt(2)) + Math.cos(verticalAngle)*100/Math.sqrt(2);
		this.indicatorMeshRight.position.y = (100 + 200/Math.sqrt(2)) + Math.cos(verticalAngle)*100/Math.sqrt(2);
	}

	this.resetIndicator = function(){

		this.stretch.pause();
		this.snap.play();
		this.updateIndicator(0,0);

	}

	this.updateIndicator(0,0)


	scene.add(this.handleMesh);

}

//window.addEventListener("mousedown", function(e){ handleMouseDown(e); } );

SLINGSHOT.handleMouseDown = function(event){

	mouseDownPos = new THREE.Vector2( event.clientX, event.clientY );

	window.addEventListener("mousemove", function(e){ handleMouseMovement(e); });
	window.addEventListener("mouseup", function(e){ handleMouseUp(e); });

}

SLINGSHOT.handleMouseMovement = function( event ){

	

}

SLINGSHOT.handleMouseUp = function( event ){

	bird.mesh.setLinearVelocity(
		new THREE.Vector3(
			0,
			speed * (event.clientY - mouseDownPos.y),
			speed * (event.clientX - mouseDownPos.x)
		)
	);

	window.removeEventListener("mousemove", handleMouseMovement);
	window.removeEventListener("mouseup", handleMouseUp);

}