function cameraControls(world, camera){
	
	var theta = 0; // camera's horizontal plane coordinate = starting coordinate
	var phi = 3*Math.PI/8; // camera's vertical plane coordinate = starting coordinate
	var radius = 100; // camera's distance

	var cameraRotateModifer = 1;
	var cameraMoveModifier = .001;
	
	var worldPos = world.position;
	var cameraFocus = new THREE.Vector3(0, 0, 0);
	
	var move = false;
	
	// Firefox 1.0+
	var isFirefox = typeof InstallTrigger !== 'undefined';

	// Internet Explorer 6-11
	var isIE = /*@cc_on!@*/false || !!document.documentMode;

	// Edge 20+
	var isEdge = !this.isIE && !!window.StyleMedia;

	// Chrome 1+
	var isChrome = !!window.chrome && !!window.chrome.webstore;
	
	function init(){
		
		document.addEventListener('contextmenu', function(ev) {
			ev.preventDefault();
			return false;
		}, false);

		document.addEventListener("mousedown", function(event){
			move = true;
		}, false);

		document.addEventListener("mouseup", function(event){
			move = false;
		}, false);
		
		document.addEventListener("mousemove", function(event){

			if(move){
				if(isChrome && event.which == 1 ||
					((isEdge || isFirefox) && event.buttons == 1)){
						
					cameraRotate(event.movementX * 0.2, event.movementY * 0.2);
				}
				else if(isChrome && event.which == 3 ||
						((isEdge || isFirefox) && event.buttons == 2)){

					worldMove(event.movementX, -event.movementY);
				}
			}
		}, false);

		document.addEventListener( 'wheel', function(event){
			
			if(event.deltaY < 0)
				radius /= 1.1;
			else if(event.deltaY > 0)
				radius *= 1.1;
			
			cameraApply();

		}, false );
		
		cameraApply();
	}
	
	
	// rotation in degrees
	function cameraRotate(x, y){
		// theta is horizontally around the sphere
		// phi is up and down
		theta += cameraRotateModifer * x *2*Math.PI/360;
		phi -= cameraRotateModifer * y * 2*Math.PI/360;
		
		// keep 0 < theta < 2*pi
		theta = ( theta % ( 2 * Math.PI ) + 2 * Math.PI ) % ( 2 * Math.PI );
		
		// spherical coordinate restriction: 0 < phi < PI
		if(phi >= Math.PI)
			phi = Math.PI;
		else if(phi < 2 * Math.PI/360)
			phi = 2 * Math.PI/360;
		
		cameraApply();
	}

	function cameraApply(){
		// convert (x, y) mouse movement to webgl spherical coordinates (z, x, y)
		var z =  radius * Math.sin(phi) * Math.cos(-theta);
		var x =  radius * Math.sin(phi) * Math.sin(-theta);
		var y =  radius * Math.cos(phi);
		
		camera.position.set(x, y, z);
		camera.lookAt(cameraFocus);
	}
	

	
	function worldMove(z, x){
		var _theta = phi > Math.PI/2 ? theta : -theta;
		var rotate = -theta + Math.PI/2;

		x *= phi > Math.PI/2 ? -1 : 1;
		
		// 2-d rotation matrix, camera pos movement -> world pos movement
		var zDelta = z * Math.cos(rotate) - x * Math.sin(rotate);
		var xDelta = z * Math.sin(rotate) + x * Math.cos(rotate);
		
		zDelta *= radius * cameraMoveModifier;
		xDelta *= radius * cameraMoveModifier;
		
		worldPos.z += zDelta;
		worldPos.x += xDelta;

		worldApply();
	}
	
	function worldApply(){
		world.position.set(worldPos.x, worldPos.y, worldPos.z);
	}
	
	init();
}