//Joseph Sarabia
//Project 4

			var iterations = 100;
			var subdivisions = 3;
			
			var object = null; 
			var canvas = null;
			var gl = null;
			var messageField = null;
			var model = null;
			var camera = null;
			var cam = null;
			var projMatrix = null;
			var viewMatrix = [];
			var angle = 0;
			var panangle = 0;
			var filepath = null;
			var lastdir = 0;
			var exposure = .5;
			var radiosity = null;
			var tri = null;
			
			
			
			var file = "model/Cornell-Box/models/";
			function addMessage(message){
				var st = "-"+message + "\n";
				messageField.value += st;
			}

			
			
			
			
			function parseJSON(jsonFile)
			{
				
				var	xhttp = new XMLHttpRequest();
				xhttp.open("GET", jsonFile, false);
				xhttp.overrideMimeType("application/json");
				xhttp.send(null);	
				var Doc = xhttp.responseText;
				
				
				return JSON.parse(Doc);
			}
			
			function init(){
				
				function setupMenu(){
					var menuItemList = ["Cube","Teapot","Skull"]; 
					var m = document.getElementById("menu");
					var option;
					for (var i=0; i<menuItemList.length;i++){
						option=document.createElement("option");
						option.text = menuItemList[i];
						m.add(option);
					}
					
				}
				function setupMessageArea() {
					messageField = document.getElementById("messageArea");
					document.getElementById("messageClear").setAttribute("onclick","messageField.value='';");
					addMessage("Welcome! Initializing environment");
				}
				//setupMenu();
				setupMessageArea();
				
				canvas = document.getElementById("myCanvas");
				addMessage(((canvas)?"Canvas acquired":"Error: Can not acquire canvas"));

			}
			function setupWebGL() { 
				//gl = canvas.getContext("webgl")
				//	||canvas.getContext("experimental-webgl");
				gl =  canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});
				
				addMessage("GL Context acquired");
				
				if (!gl.getExtension("OES_texture_float")) { alert("This project requires the OES_texture_float extension. Must use a different hardware."); return; }
				model = new RenderableModel(gl, object, file);
				camera = new Camera(gl,model.getBounds(),[0,1,0]);
				cam = new radCam(gl,model.getBounds(),[0,1,0]);
				
				projMatrix = camera.getProjMatrix();
				viewMatrix = camera.getRotatedViewMatrix(0);
				gl.clearColor(0,0,0,1);
				gl.enable(gl.DEPTH_TEST);
				
			}
			object = parseJSON("model/Cornell-Box/models/model.json");
			
			//computeRadiosity(gl,object);
			
			
			divideCornellBoxFaces(object,subdivisions);
			console.log("length is" +object.meshes[0].vertexPositions.length);
				function exposureSlider(value){
					
					exposure = .2 * parseInt(value, 15);
					
				}

			
				function menuHandler(){
					var option = document.getElementById("menu").selectedIndex;
					var ending;
					ending = "model.json";
					if(option == "0")
						file = "model/House/models/";
					if(option == "1")
						file = "model/Shrine/models/";
					if(option == "2")
						file = "model/House_of_parliament/models/";
					if(option == "3")
						file = "model/DijonPalais/models/";
					if(option == "4")
						file = "model/Crytek/models/";
					if(option == "5")
						file = "model/Teapot/models/";
					if(option == "6")
						file = "model/Skull/models/";
					if(option == "7")
						file = "model/Cornell-Box/models/";
					addMessage("opening file " + file);
					object = parseJSON(file+ ending);
					
					camera = new Camera(gl,model.getBounds(),[0,1,0]);
					projMatrix = camera.getProjMatrix();
					
					draw();
				}
				
				function menu2Handler(value){
					var option = parseInt(value, 10);
					if(option == 0){
						mirrorON = 1;
						diffON = 0;
					}
					if(option == 1){
						mirrorON = 0;
						diffON = 1;
					}
					if(option == 2){
						mirrorON = 1;
						diffON = 1;
					}
				}
				
				var first = 0;
				function draw(){
					//menuHandler();
				
					gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

					//viewMatrix = camera.getViewMatrix();
					/*var max = 0;
					for(var i = 1; i < radiosity.triangles.length;i++){
						if(radiosity.triangles[i].unshotMag > radiosity.triangles[max].unshotMag)
							max = i;
					}
				*/
				//console.log(radiosity.triangles[max].normal);console.log(radiosity.triangles[max].normal);console.log(radiosity.triangles[max].tangent);
				
					//cam = new radCam(radiosity.triangles[max].center, radiosity.triangles[max].normal, radiosity.triangles[max].bitangent, model.getBounds());
					
					
					
					viewMatrix = camera.getViewMatrix();
					projMatrix = camera.getProjMatrix();
					model.draw(projMatrix, viewMatrix, null);


					//radiosity.draw(projMatrix, viewMatrix, null);
					//console.log("ending emission");
					//formFactors(radiosity.draw(projMatrix, viewMatrix, null), max,true);
						//formFactor([0,0,0], max, true);
					window.requestAnimationFrame(draw);

				}
		function formFactor(x, y, z){}

		function getNextSide(u, t){
			var mag = 1/Math.sqrt(u[0] * u[0] + u[1]*u[1] + u[2]*u[2]);
			u[0] *= mag;
			u[1] *= mag;
			u[2] *= mag;

			mag = 1/Math.sqrt(t[0] * t[0] + t[1]*t[1] + t[2]*t[2]);
			t[0] *= mag;
			t[1] *= mag;
			t[2] *= mag;

			var vec = new Float32Array([u[1] * t[2] - u[2] * t[1], 
		    u[2] * t[0] - u[0] * t[2], 
		    u[0] * t[1] - u[1] * t[0]]);
			
			return vec;
		}
		
		function genRadiosity(){
			gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
			//main iteration loop
			//for(var s = 0; s < 50; s++){
				//shoot all triangles
				//this loop determines number of iterations
				for(var i = 0; i < iterations; i++){
					//1 added to meshID right before draw, so subtract to get correct meshID	
					var max = -1; 
					//find the max
					for(var j = 0; j < radiosity.triangles.length; j++){
						
						//if we haven't picked a first candidate
						if(max == -1  && radiosity.triangles[j].unshotMag > 0)
							max = j;
						//else find the highest value

						else if((max > -1) && (radiosity.triangles[j].unshotMag > radiosity.triangles[max].unshotMag))
							max = j;

					}
					//if there's something to shoot
					if(max > -1){

						var tan = new Float32Array(radiosity.triangles[max].tangent);
						var norm = new Float32Array(radiosity.triangles[max].normal);
						//console.log("mag is " +radiosity.triangles[max].unshotMag);
						gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

						//make a camera
						cam.setAt(tan);
						cam.setUp(radiosity.triangles[max].normal);
						cam.setEye(radiosity.triangles[max].center);	
						viewMatrix = cam.getViewMatrix();
						projMatrix = cam.getProjMatrix();
						//draw the first face
						formFactors(radiosity.draw(projMatrix, viewMatrix, null), max,1);
						gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
						
						//make a cam
						tan = [-tan[0],-tan[1],-tan[2]];
						cam.setAt(tan);
						cam.setUp(radiosity.triangles[max].normal);
						cam.setEye(radiosity.triangles[max].center);	
						viewMatrix = cam.getViewMatrix();
						projMatrix = cam.getProjMatrix();
						//draw the second face
						formFactors(radiosity.draw(projMatrix, viewMatrix, null), max,1);
						gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
						
						//make a cam
						tan = new Float32Array(radiosity.triangles[max].bitangent);;
						cam.setAt(tan);
						cam.setUp(radiosity.triangles[max].normal);
						cam.setEye(radiosity.triangles[max].center);	
						viewMatrix = cam.getViewMatrix();
						projMatrix = cam.getProjMatrix();				
						//draw the third face
						formFactors(radiosity.draw(projMatrix, viewMatrix, null), max,1);
						gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
						

						//make a cam
						tan = [-tan[0],-tan[1],-tan[2]];
						cam.setAt(tan);
						cam.setUp(radiosity.triangles[max].normal);
						cam.setEye(radiosity.triangles[max].center);	
						viewMatrix = cam.getViewMatrix();
						projMatrix = cam.getProjMatrix();					
						//draw the fourth face
						formFactors(radiosity.draw(projMatrix, viewMatrix, null), max,1);
						gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
						

						//make a cam
						cam.setAt(norm);
						cam.setUp(tan);
						cam.setEye(radiosity.triangles[max].center);	
						viewMatrix = cam.getViewMatrix();
						projMatrix = cam.getProjMatrix();
						//draw the last face
						formFactors(radiosity.draw(projMatrix, viewMatrix, null), max,0);
						gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

						radiosity.triangles[max].unshot[0] = 0;
						radiosity.triangles[max].unshot[1] = 0;
						radiosity.triangles[max].unshot[2] = 0;
						radiosity.triangles[max].unshotMag = 0;	
					}
					
				
				}
			
			//}
			
			
		}		


	function mapColor(){
		//loop through all meshes
		for(var i = 0; i < object.meshes.length; i++){
			object.meshes[i].vertexColors = [];
			var count = 0;
			var ID = 0;
			for(var j = 0; j < object.meshes[i].indices.length; j+=3){
				var temp = {};
				temp.triID = ID;
				temp.meshID = i;
				var place = getEmission(temp);
			
				var color = [];
				color[0] = radiosity.triangles[place].emission[0];
				color[1] = radiosity.triangles[place].emission[1];
				color[2] = radiosity.triangles[place].emission[2];

				//console.log("vertex is" + object.meshes[i].vertexPositions[(object.meshes[i].indices[j])*3] );
				//console.log("vertex from triangles is is " + radiosity.triangles[place].vertex0[0]);

				object.meshes[i].vertexColors[(j*3)] = color[0];
				object.meshes[i].vertexColors[(j*3)+1] = color[1];
				object.meshes[i].vertexColors[(j*3)+2] = color[2];

				object.meshes[i].vertexColors[(j*3)+3] = color[0];
				object.meshes[i].vertexColors[(j*3)+4] = color[1];
				object.meshes[i].vertexColors[(j*3)+5] = color[2];

				object.meshes[i].vertexColors[(j*3)+6] = color[0];
				object.meshes[i].vertexColors[(j*3)+7] = color[1];
				object.meshes[i].vertexColors[(j*3)+8] = color[2];

			//	if(count == 8){
			//		count = 0;
					ID++;
			//	}
			//	else count++;

				//object.meshes[i].vertexColors[(j*3)] = radiosity.triangles[j].emission[0] * 100;
				//object.meshes[i].vertexColors[(j*3)+1] = radiosity.triangles[j].emission[1] * 100;
				//object.meshes[i].vertexColors[(j*3)+2] = radiosity.triangles[j].emission[2] * 100;
			}
			
		}

	}

	function getEmission(t){

		var index = 0;
		for(var i = 0 ; i < t.meshID;i++){
			index += object.meshes[i].indices.length/3;
		}
		index += t.triID;
		return index;

/*		var index = -1;
		for(var i = 0; i < radiosity.triangles.length; i++){
			if(t.meshID == radiosity.triangles[i].meshID)
				if(t.triID == radiosity.triangles[i].triID)
					index = i;
		}
		if(index == -1)
			console.log("not found");
		return index;*/
	}

	function formFactors(pix, shooterIndex, isSide){
			//var radiosity.triangles = radiosity.triangles;

			//index of the shooter triangle in the radiosity.triangles array
			/*var shooterIndex = 0;
			for(var i = 0; i<radiosity.triangles.length; i++){
				if(radiosity.triangles[i].meshID == meshID){
					if(radiosity.triangles[i].triID == ID){
						shooterIndex = i;
					}
				}
			}*/

			//isSide = 0;

			var z = 0, y = 0;
			var yCount = 0, zCount = 0;
			for(var i = 0;i<pix.length;i+=4){
			
				if(pix[i] > 0){

					pix[i] -= 1;
					var trid = (pix[i+1] * 255) + pix[i+2];
					//meshid from pixel array

					recID = {};
					recID.meshID = pix[i];
					recID.triID = trid;
					var recIndex = getEmission(recID);

					var refl = object.materials[object.meshes[pix[i]].materialIndex].diffuseReflectance;
					
					/*var recIndex = 0;
					for(var j = 0; j<radiosity.triangles.length; j++){
						if(radiosity.triangles[j].meshID == pix[i]){
							if(radiosity.triangles[j].triID == trid){
								recIndex = j;
							}
						}
					}*/

					var rad = [];
					var pixelFF = 0;
					//z = zCount;
					//y = yCount;
					z = Math.abs(256-zCount);
					y =Math.abs(256-yCount);
					if(isSide == 1){

						
						
						

						//pixel ff formula, 4/canvas width*height
						//pixelFF = ((z*(2/512)) / (Math.PI * Math.pow( (1 + (z*z *(4/262144)) + (y*y*(4/262144)) ),2) )    ) * (4/(512*512));
						
						pixelFF = ((z*(2/512)) / (Math.PI * Math.pow( (1 + (y*y *(4/262144)) + (z*z*(4/262144)) ),2) )    ) * (4/(512*512));
						//pixelFF = ((y) / (Math.PI * Math.pow( (1 + (z*z) + (y*y) ),2) )    ) * (4/(512*512));
						
					}
					else {
						//pixelFF = (1 / (Math.PI * Math.pow( (1 + (z*z*(4/262144)) + (y*y*(4/262144)) ),2) )    ) * (4/(512*512));
						pixelFF = (1 / (Math.PI * Math.pow( (1 + (y*y*(4/262144)) + (z*z*(4/262144)) ),2) )    ) * (4/(512*512));
						//pixelFF = (1 / (Math.PI * Math.pow( (1 + (z*z) + (y*y) ),2) )  ) * (4/(512*512));
					}
					//if(radiosity.triangles[shooterIndex].area > 1)
					//	alert(pixelFF);
					if(radiosity.triangles[recIndex].area <= 0)
						alert("hey");
					//alert(refl[0]);
					rad[0] = refl[0] * radiosity.triangles[shooterIndex].unshot[0] * pixelFF * Math.abs((radiosity.triangles[shooterIndex].area/radiosity.triangles[recIndex].area));
					rad[1] = refl[1] * radiosity.triangles[shooterIndex].unshot[1] * pixelFF * Math.abs((radiosity.triangles[shooterIndex].area/radiosity.triangles[recIndex].area));
					rad[2] = refl[2] * radiosity.triangles[shooterIndex].unshot[2] * pixelFF * Math.abs((radiosity.triangles[shooterIndex].area/radiosity.triangles[recIndex].area));

					if(rad[0] < 0)
						alert("yeah it's negative");

					radiosity.triangles[recIndex].emission[0] += rad[0];
					radiosity.triangles[recIndex].emission[1] += rad[1];
					radiosity.triangles[recIndex].emission[2] += rad[2];

					radiosity.triangles[recIndex].unshot[0] += rad[0];
					radiosity.triangles[recIndex].unshot[1] += rad[1];
					radiosity.triangles[recIndex].unshot[2] += rad[2];

					radiosity.triangles[recIndex].unshotMag = Math.sqrt(radiosity.triangles[recIndex].unshot[0] * radiosity.triangles[recIndex].unshot[0] +
						radiosity.triangles[recIndex].unshot[1] * radiosity.triangles[recIndex].unshot[1] +
						radiosity.triangles[recIndex].unshot[2] * radiosity.triangles[recIndex].unshot[2]);	


				}

				yCount++;
				if(yCount == 512){
					zCount++; yCount= 0;
				}	

			}


					

			
		}				
			
			function mainFunction(){
				//alert("hey");
				init();
				setupWebGL();

				
				//console.log(radiosity);
				radiosity = new radiosity(gl, object);	
				radiosity.triangles = radiosity.idTriangles(object);	
				

				
				
				
				document.addEventListener('keydown', function(event) {
			   
			    //zoom in with Q
			    if(event.keyCode == 81) {
			    	camera.decFOV();			      
			        projMatrix = camera.getProjMatrix();
			    }
			    
			    //zoom out with E
			    else if(event.keyCode == 69) {			
			    	camera.incFOV();			      
			        projMatrix = camera.getProjMatrix();
			    }			 
			    
			    //Dolly Forwards with W
			    else if(event.keyCode == 87) {

			    	camera.dolly(viewMatrix,camera.getDiag()*.05);
			    	//projMatrix = camera.getProjMatrix();
			    }
			    //Dolly Backwards with S
			    else if(event.keyCode == 83) {
			        
			    	camera.dolly(viewMatrix,camera.getDiag()*-.05);
			    	//projMatrix = camera.getProjMatrix();
			    }
			    
			    //Truck Right with D
			    else if(event.keyCode == 65) {
			        
			    	camera.truck(viewMatrix,camera.getDiag()*.01);
			    	//projMatrix = camera.getProjMatrix();
			    }
			    //Truck Left with A
			    else if(event.keyCode == 68) {
			        
			    	camera.truck(viewMatrix,camera.getDiag()*-.01);
			    	//projMatrix = camera.getProjMatrix();
			    }
			    //Pedestal Up with R
			    else if(event.keyCode == 82) {


			    	camera.pedestal(viewMatrix,camera.getDiag()*-.01);
			    	//projMatrix = camera.getProjMatrix();
			    }
			    //Pedestal Down with F
			    else if(event.keyCode == 70) {
			        
			    	camera.pedestal(viewMatrix,camera.getDiag()*.01);
			    	//projMatrix = camera.getProjMatrix();
			    }
			    //Tilt Up with I
			    else if(event.keyCode == 75) {
			    	//if(lastdir != 0)
			    	//	angle = 1;
			    	
			    	if(angle > -30){
			    		angle--;
			    		camera.tilt(viewMatrix, -2);
			    	//projMatrix = camera.getProjMatrix();
			    	}

					//lastdir = 0;
			    	//if ((angle > 5) && (angle < 355)) angle = 5;
			    	//if (angle > 360) angle = 0;
			    	
			    	//projMatrix = camera.getProjMatrix();

			    }
			    //Tilt Down with K
			    else if(event.keyCode == 73) {		
			    	
		    		//if(lastdir != 1)
		    		//	angle = 360;
		    		//if(angle > -30)
		    		//angle--;

			    	//angle-=1;
			    	//lastdir = 1;
			    	//if ((angle < 355) && (angle > 5)) angle = 355;
			    	//if (angle < 0) angle = 360;
			    	if(angle < 30){
			    		angle++;
			    		camera.tilt(viewMatrix, 2);
			    	}

			    }
			    
			    //Pan left with J
			    else if(event.keyCode == 74) {
			    	panangle++; if (panangle > 360) panangle -= 360;
		    		viewMatrix = camera.pan(viewMatrix, 5);
		    		//projMatrix = camera.getProjMatrix();

			    }
			    //Pan Right with L
			    else if(event.keyCode == 76) {
			    	panangle--; if (panangle < 0) panangle += 360;
			    		viewMatrix = camera.pan(viewMatrix, -5);
			    		//projMatrix = camera.getProjMatrix();
			    	
	
			    }


			  //  draw();
			    
			});

				//var angle=0;
				
				



				genRadiosity();
				mapColor();

				/*for(var y = 0; y< radiosity.triangles.length; y++){
						console.log(radiosity.triangles[y].emission);
					}*/
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);
				gl.bindRenderbuffer(gl.RENDERBUFFER, null);
				gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
			    gl.bindTexture(gl.TEXTURE_2D, null);
    			gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
				model = new RenderableModel(gl, object, file);
				draw();
				return 1;
				
			}
