var lineGraph = (function linegraph3d(){
	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

	var renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	
	var world = new THREE.Group();
	var graphs = [];

	scene.add(world);
	
	var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
	scene.add( light );

	var lineData = [];
	var index = 0;
	
	var segmentWidth = 1;
	var segmentDepth = 10;
	var zNear = segmentDepth / 2;
	var zFar = -zNear;
	
	var data = null;
	
	var colors = [0, 0x0000aa, 0xaaaa00, 0xaa0000, 0x00aa00];

	var transparent = true;
	var opacity = 0.9;
	
	function shapeSides(component, x, y1, y2, zOffset, color){
		var shape =  new THREE.Shape();
		shape.moveTo(x, 0);
		shape.lineTo(x, y1);
		shape.lineTo(x + segmentWidth, y2);
		shape.lineTo(x + segmentWidth, 0);

		var geometry = new THREE.ShapeGeometry( shape );
		var material = new THREE.MeshLambertMaterial({
			color: color,
			side: THREE.DoubleSide,
			transparent: transparent,
			opacity: opacity
		});
		var side1 = new THREE.Mesh(geometry, material);
//		var side2 = side1.clone();
		
		component.add(side1);
//		component.add(side2);
		
		side1.position.z = zNear + zOffset * segmentDepth;
//		side2.position.z = zFar + zOffset * segmentDepth;
	}
	
	function shapeTop(component, x, y1, y2, zOffset, color){
		var hyp = Math.sqrt(Math.pow(segmentWidth, 2) + Math.pow(y1-y2, 2));
		
		var angle = Math.asin((y2-y1 / segmentWidth) / hyp);
		
		var geometry = new THREE.PlaneGeometry( hyp, zNear-zFar );
		var material = new THREE.MeshLambertMaterial({
			color: color,
			side: THREE.DoubleSide,
			transparent: transparent,
			opacity: opacity
		});
		var top = new THREE.Mesh(geometry, material);
		
		top.rotateX(Math.PI/2);
		top.rotateY(angle);

		top.position.y = Math.abs(y1-y2) / 2 + Math.min(y1, y2);
		top.position.x = x + segmentWidth / 2;
		top.position.z = zOffset * segmentDepth;
		
		component.add(top);
	}
	
	function addComponent(x, y1, y2, z, set, graph){

		var color = colors[set];
		var component = new THREE.Group();
		graph.add(component);
		
		y1 = Math.max(y1, 0.1);
		y2 = Math.max(y2, 0.1);
		
		shapeSides(component, x, y1, y2, z, color);
		shapeTop(component, x, y1, y2, z, color)
	}
	
	function addData(index, set, x, graph){

		var xpos = x != false ? x : index;
		var zpos = 0;
		var dataPoint = data[set][index];
		var next = typeof data[set][index + 1] == 'undefined' ? data[set][1] : data[set][index + 1];
/*		if(set == 3)
		console.log(index + ' ' + dataPoint + ' ' + next)*/
		addComponent(xpos, dataPoint, next, zpos, set, graph);
	}
	
	
	
	

	
	function addFloor(){
		var geometry = new THREE.PlaneGeometry( graphEnd*1.5, segmentDepth*1.5*graphs.length );
		var material = new THREE.MeshLambertMaterial({
			color: 0x999999,
			side: THREE.DoubleSide
		});
		var floor = new THREE.Mesh(geometry, material);
		
		var center = graphEnd / 2;
		
		floor.position.x = center;
		floor.position.z = segmentDepth*graphs.length - segmentDepth*1.5;

		floor.rotateX(Math.PI/2);
		
		world.add(floor);
	}
	
	var line;
	
	function initLine(length){
		var material = new THREE.LineBasicMaterial({
			color: 0xaaaaaa
		});

		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( 0, 0, 0 ),
			new THREE.Vector3( length, 0, 0 )
		);

		line = new THREE.Line( geometry, material );
		
	}
	
	
	
	
	function addLine(x, y, z){
		var lineCopy = line.clone();
		
		lineCopy.position.x = x;
		lineCopy.position.y = y;
		lineCopy.position.z = z;
		
		world.add( lineCopy );
	}
	

	
	
	
	
	
	var graphEnd;
	var graphIndex;
	
	function launch(d){
		data = d;
		var newGraph;
		var limit = data[0].length / 2;

		
		
		for(var j = 0; j < 2 ; j++){
			newGraph = new THREE.Group();
			
			for(var i = 0; i < limit; i++){
				addData(i, j+3, false, newGraph);
			}
			
			newGraph.position.z = segmentDepth*j;
			
			graphs.push(newGraph);
			world.add(newGraph);
			
			
		}

		graphEnd = graphIndex = i;
		
		world.position.x = -limit / 2;
		
		cameraControls(world, camera)
		
		addFloor();
		
		initLine(graphEnd);
		
		

		graphs.forEach(function(d, i){
			addLine(0, 10, i*segmentDepth);
			addLine(0, 20, i*segmentDepth);
			addLine(0, 30, i*segmentDepth);	
		});
		
//		referenceSphere();

		
		render();
	}
	
	
	
	function referenceSphere(){
		var geometry = new THREE.SphereGeometry( 1, 32, 32 );
		var material = new THREE.MeshLambertMaterial( {color: 0xffff00} );
		var sphere = new THREE.Mesh( geometry, material );
		scene.add( sphere );
	}

	
	var moveAccumulator = 0;
	var accumulatorMax = 100;
	var start = 0, end = 0;
	
	var render = function () {
		requestAnimationFrame( render );

		
		end = performance.now() - start;
		moveAccumulator += end;
		start = performance.now();
		
		
		if(moveAccumulator > accumulatorMax){
			moveAccumulator %= accumulatorMax;
			
			var reset = false;
			
			graphs.forEach(function(graph, i){
				var set = i+3;

				graph.remove(graph.children[0]);

				addData(graphIndex, set, graphEnd, graph);
				
				if(typeof data[set][graphIndex + 1] == 'undefined'){
					reset = true;
				}
				graph.children.forEach(function(d){
					d.position.x -= segmentWidth;
				});
			});
			
			if(reset){
				graphIndex = 0;
			}
			
			graphIndex++;
		}
		
		graphs.forEach(function(graph, i){
			graph.position.x = -moveAccumulator/accumulatorMax;
		});
		
		
		renderer.render(scene, camera);
	};

	load();
	
	return {
		launch: launch
	}
})()

function load(){

	//http://stackoverflow.com/questions/7431268/how-to-read-data-from-csv-file-using-javascript
	
	$.ajax({
		type: "GET",
		url: "multiTimeline.csv",
		dataType: "text",
		success: function(data){processData(data)},
		error: function(){alert('Error loading data')}
	});
	
	function processData(data){
		var allTextLines = data.split(/\r\n|\n/);
		var headers = allTextLines[0].split(',');
		var lines = [];
		for(var i = 0; i < headers.length; i++){
			lines.push([]);
		}
		
		for(var i = 1; i < allTextLines.length; i++){
			var line = allTextLines[i].split(',');
			
			if(line.length == headers.length){
				for(var j = 0; j < line.length; j++){
					lines[j][i] = line[j];
				}
			}
		}
		lineGraph.launch(lines);
	}
}
