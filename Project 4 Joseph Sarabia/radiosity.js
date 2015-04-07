function radiosity(gl, model){



	//var triangles = idTriangles(model);


	var fb;
    var tex;

        fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

        tex = gl.createTexture();
        
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
   		gl.generateMipmap(gl.TEXTURE_2D);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        var renderbuffer = gl.createRenderbuffer();
	    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 512, 512);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
    	


	//function idTriangles() = this.idTriangles;

	this.idTriangles = function(model){
		var triangles = [];
		var tcount = 0;
		for(var i = 0; i < model.meshes.length; i++){
			
			var count = 0;
			for(var j = 0; j < model.meshes[i].indices.length; j+=3){
				var triangle = {};
				triangle.meshID = i;
				triangle.triID = count;
				triangle.index = [model.meshes[i].indices[j],model.meshes[i].indices[j+1],model.meshes[i].indices[j+2]];
				triangle.vertex0 = new Float32Array([model.meshes[i].vertexPositions[triangle.index[0]*3], model.meshes[i].vertexPositions[(triangle.index[0]*3)+1], model.meshes[i].vertexPositions[(triangle.index[0]*3)+2]]);
				triangle.vertex1 = new Float32Array([model.meshes[i].vertexPositions[triangle.index[1]*3], model.meshes[i].vertexPositions[(triangle.index[1]*3)+1], model.meshes[i].vertexPositions[(triangle.index[1]*3)+2]]);
				triangle.vertex2 = new Float32Array([model.meshes[i].vertexPositions[triangle.index[2]*3], model.meshes[i].vertexPositions[(triangle.index[2]*3)+1], model.meshes[i].vertexPositions[(triangle.index[2]*3)+2]]);
				triangle.tangent = new Float32Array([triangle.vertex1[0]-triangle.vertex0[0], triangle.vertex1[1]-triangle.vertex0[1],triangle.vertex1[2]-triangle.vertex0[2]]);
				//var mag = Math.sqrt(triangle.tangent[0] * triangle.tangent[0] + triangle.tangent[1] * triangle.tangent[1] + triangle.tangent[2] * triangle.tangent[2]);
				//triangle.tangent[0] /= mag;
				//triangle.tangent[1] /= mag;
				//triangle.tangent[2] /= mag;
				triangle.tangent2 = new Float32Array([triangle.vertex2[0]-triangle.vertex0[0], triangle.vertex2[1]-triangle.vertex0[1],triangle.vertex2[2]-triangle.vertex0[2]]);
				mag = Math.sqrt(triangle.tangent2[0] * triangle.tangent2[0] + triangle.tangent2[1] * triangle.tangent2[1] + triangle.tangent2[2] * triangle.tangent2[2]);
				//triangle.tangent2[0] /= mag;
				//triangle.tangent2[1] /= mag;
				//triangle.tangent2[2] /= mag;			
				triangle.normal = new Float32Array([model.meshes[i].vertexNormals[triangle.index[0]*3], model.meshes[i].vertexNormals[(triangle.index[0]*3)+1], model.meshes[i].vertexNormals[(triangle.index[0]*3)+2]]);
				triangle.cross = Cross(triangle.tangent,triangle.tangent2);
				mag = Math.sqrt(triangle.cross[0] * triangle.cross[0] + triangle.cross[1] * triangle.cross[1] + triangle.cross[2] * triangle.cross[2]);
				triangle.area = mag / 2;

				triangle.bitangent = Cross(triangle.normal, triangle.tangent);
				triangle.center = new Float32Array([(triangle.vertex0[0]+triangle.vertex1[0]+triangle.vertex2[0])/3,
													(triangle.vertex0[1]+triangle.vertex1[1]+triangle.vertex2[1])/3,
													(triangle.vertex0[2]+triangle.vertex1[2]+triangle.vertex2[2])/3]);	
				//triangle.unshot = true;
				triangle.emission = new Float32Array(model.materials[model.meshes[i].materialIndex].emissionColor);
				//console.log(model.materials[model.meshes[i].materialIndex].emissionColor);
				triangle.unshot = new Float32Array(model.materials[model.meshes[i].materialIndex].emissionColor);
				triangle.unshotMag = Math.sqrt(triangle.unshot[0]*triangle.unshot[0] + triangle.unshot[1]*triangle.unshot[1] + triangle.unshot[2]*triangle.unshot[2]);
				count++;
				triangles[tcount] = triangle;
				tcount++;
			}
		}
		return triangles;
	}
	
	function Cross(a, b){
		var vec = new Float32Array([a[1] * b[2] - a[2] * b[1], 
		    a[2] * b[0] - a[0] * b[2], 
		    a[0] * b[1] - a[1] * b[0]]);
		return vec;
	}
	
	function Drawable(attribLocations, vArrays, nVertices, indexArray, drawMode, meshID){
		  
		  var vertexBuffers=[];
		  var nElements=[];
		  var nAttributes = attribLocations.length;

		  var ids = [];
		  var c = 0;
		  for (var i = 0;i<indexArray.length/3; i++){
		  		ids[c] = meshID+1;
		  		ids[c+1] = Math.floor(i / 255);
				ids[c+2] = i - (255 * Math.floor(i / 255));
				
		  		ids[c+3] = meshID+1;
		  		ids[c+4] = Math.floor(i / 255);
				ids[c+5] = i - (255 * Math.floor(i / 255));;
				
		  		ids[c+6] = meshID+1;
		  		ids[c+7] = Math.floor(i / 255);
				ids[c+8] = i - (255 * Math.floor(i / 255));;
				
		  		c+=9;
		  }

		  vArrays[1] = ids;
		  //console.log(vArrays[1]);
		  
		  var verts = [];
		  c = 0;
		  for (var i = 0;i<indexArray.length; i++){
		  		verts[c] = vArrays[0][indexArray[i]*3];
				verts[c+1] = vArrays[0][(indexArray[i]*3)+1];
				verts[c+2] = vArrays[0][(indexArray[i]*3)+2];

		  		c+=3;
		  }
		  vArrays[0] = verts;
		  
		  //alert(vArrays[0]);
		  
		  //console.log(vArrays[1].length);

		  //for (var i=0; i<2; i++){
		  for (var i=0; i<nAttributes; i++){
			  if (vArrays[i]){
				  vertexBuffers[i] = gl.createBuffer();
				  if (!vertexBuffers[i]) {
					//console.log('Failed to create the buffer object');
					return null;
				  }
				  // Bind the buffer object to an ARRAY_BUFFER target
				  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[i]);
				  // Write date into the buffer object
				  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vArrays[i]), gl.STATIC_DRAW);
				  //console.log("varrays is " + vArrays[2].length);
				  nElements[i] = vArrays[i].length/nVertices;
				  nElements[1] = 3;
				  nElements[0] = 3;
			  }
			  else{
				  vertexBuffers[i]=null;
			  }
		  }

		  var indexBuffer=null;
		  if (indexArray){

			indexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);
		  }
		  
			
		  
		  this.draw = function (){
		  
			gl.useProgram(radProg);
			//gl.clear(COLOR_BUFFER_BIT);
			for (var i=0; i<nAttributes; i++){
			  if (vertexBuffers[i]){
				  gl.enableVertexAttribArray(attribLocations[i]);
				  // Bind the buffer object to target
				  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[i]);
				  // Assign the buffer object to a_Position variable
				  //if(i == 2)
					 // console.log("nelems is "+ nElements[i] + "I is " + i);
				  gl.vertexAttribPointer(attribLocations[i], nElements[i], gl.FLOAT, false, 0, 0);
			  }
			  
			  else{
				  gl.disableVertexAttribArray(attribLocations[i]); 
				  gl.vertexAttrib3f(attribLocations[i],1,1,1);
				  //console.log("Missing "+attribLocations[i]);
			  }
			}
			
			
			
			/*if (indexBuffer){
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
				gl.drawElements(drawMode, indexArray.length, gl.UNSIGNED_SHORT, 0);
				//console.log("gettin here");
			}
			else{*/
			
			//if(fb)
			//	alert("yeah");
			

			
				gl.drawArrays(drawMode, 0, vArrays[0].length/3);
				
//			}
		  }
		}

	var VSHADER_SOURCE =
		'attribute vec3 position;\n' +
		'attribute vec3 triID;'+
		'varying vec3 ID, fpos;'+
		'uniform mat4 modelT, viewT, projT;'+
		'void main() {\n' +
		'	ID = (triID);'+
		'	gl_Position = projT*viewT*modelT*vec4(position,1.0);\n' +	
		'	fpos = normalize(gl_Position.xyz);' +
		'}\n';

	// Fragment shader program
	var FSHADER_SOURCE =
		'precision mediump float;' +
		'varying vec3 ID, fpos;'+

		'void main() {\n' + 
			//'vec2 color = normalize(ID);'+
			'gl_FragColor = vec4(ID.x/255.0, ID.y/255.0, ID.z/255.0, 1.0);'+
		'}\n';
	var radProg = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
	if (!radProg) {
		alert('Failed to create program');
		return false;
	}
	gl.useProgram(radProg);
	
 	var a_Position = gl.getAttribLocation(radProg, 'position');		  
	var a_triLoc = gl.getAttribLocation(radProg, 'triID');
	var a_Locations = [a_Position, a_triLoc];

	var mmLoc = gl.getUniformLocation(radProg,"modelT");
	var vmLoc = gl.getUniformLocation(radProg,"viewT");
	var pmLoc = gl.getUniformLocation(radProg,"projT");
	
	var drawables=[];
	var modelTransformations=[];
	var nDrawables=0;
	var nNodes = (model.nodes)?model.nodes.length:1;
	var drawMode=(model.drawMode)?gl[model.drawMode]:gl.TRIANGLES;
	var num = 0;
	for (var i= 0; i<nNodes; i++){
		var nMeshes = (model.nodes)?(model.nodes[i].meshIndices.length):(model.meshes.length);
		for (var j=0; j<nMeshes;j++){
			var index = (model.nodes)?model.nodes[i].meshIndices[j]:j;
			var mesh = model.meshes[index];
						
			drawables[nDrawables] = new Drawable(
				a_Locations,[mesh.vertexPositions, [1,1,1]],
				mesh.vertexPositions.length/3,
				//null is where indices used to be
				mesh.indices, drawMode, num
			);
			num++;
			var m = new Matrix4();
			if (model.nodes)m.elements=new Float32Array(model.nodes[i].modelMatrix);
			modelTransformations[nDrawables] = m;
			
			nDrawables++;
		}
	}
	
	this.draw = function (pMatrix,vMatrix,mMatrix)
	{
		gl.useProgram(radProg);
		gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
			
		       
	
       gl.bindTexture(gl.TEXTURE_2D, tex);
		
		gl.uniformMatrix4fv(pmLoc, false, pMatrix.elements);
		gl.uniformMatrix4fv(vmLoc, false, vMatrix.elements);
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		for (var i= 0; i<nDrawables; i++){
			gl.uniformMatrix4fv(mmLoc, false, 
				(mMatrix)?(new Matrix4(mMatrix).multiply(modelTransformations[i])).elements
						:modelTransformations[i].elements);

			drawables[i].draw();

		}
		
			//if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
					var pixels = new Uint8Array(512 * 512 * 4);
					//gl.viewport(0, 0, 512, 512);
					gl.readPixels(0, 0, 512, 512, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
					console.log("printing meshIDs");
					//for(var i = 0; i<pixels.length;i+=4){
					//	console.log(pixels[i]);
					//}
					return pixels;
			//}
	}
	
	
	
}