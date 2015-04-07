"use strict";


function RenderableModel(gl,model, pathname){

	
	function Drawable(attribLocations, vArrays, nVertices, indexArray, drawMode){
	  // Create a buffer object
	  var vertexBuffers=[];
	  var nElements=[];
	  var nAttributes = attribLocations.length;

	  var verts = [];
	  var c = 0;
	  for (var i = 0;i<indexArray.length; i++){
	  		verts[c] = vArrays[0][indexArray[i]*3];
			verts[c+1] = vArrays[0][(indexArray[i]*3)+1];
			verts[c+2] = vArrays[0][(indexArray[i]*3)+2];

	  		c+=3;
	  }
	  vArrays[0] = verts;
	  //vArrays[1] = verts;

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
		gl.useProgram(program);
		for (var i=0; i<nAttributes; i++){
		  if (vertexBuffers[i]){
			  gl.enableVertexAttribArray(attribLocations[i]);
			  // Bind the buffer object to target
			  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[i]);
			  // Assign the buffer object to a_Position variable
			  gl.vertexAttribPointer(attribLocations[i], nElements[i], gl.FLOAT, false, 0, 0);
		  }
		  
		  else{
			  gl.disableVertexAttribArray(attribLocations[i]); 
			  gl.vertexAttrib3f(attribLocations[i],1,1,1);
			  //console.log("Missing "+attribLocations[i]);
		  }
		}
		
//		if (indexBuffer){
//			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
//			gl.drawElements(drawMode, indexArray.length, gl.UNSIGNED_SHORT, 0);
//		}
//		else{
//			gl.drawArrays(drawMode, 0, vArrays[0].length/3);
//		}
		gl.drawArrays(drawMode, 0, vArrays[0].length/3);

	  }
	}



	var VSHADER_SOURCE =
		'attribute vec3 position;\n' +
		'attribute vec3 color;\n' +
		//'attribute vec3 normal;\n' +
		//'uniform mat4 mvpT;'+
		'uniform mat4 modelT, viewT, projT;'+
		'varying vec3 fcolor, fpos;'+
		'void main() {\n' +
		//'  gl_Position = modelT*vec4(position,1.0);\n' +
		'	gl_Position = projT*viewT*modelT*vec4(position,1.0);\n' +
		'	fcolor = color;\n'+
		'	fpos = (modelT*vec4(position, 1.0)).xyz;'+
		'}\n';

	// Fragment shader program
	var FSHADER_SOURCE =
		'precision mediump float;' +
		'uniform float exposure;'+
		'varying vec3 fcolor, fpos;' +

		'void main() {\n' + 
			'gl_FragColor = vec4(exposure*fcolor.x, exposure*fcolor.y, exposure*fcolor.z, 1.0);'+
		'}\n';


	var program = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
	if (!program) {
		alert('Failed to create program');
		return false;
	}
	gl.useProgram(program);
	//else console.log('Shader Program was successfully created.');
	var a_Position = gl.getAttribLocation(program, 'position');		  
	var a_Color = gl.getAttribLocation(program, 'color');

	var a_Locations = [a_Position,a_Color];
	
	// Get the location/address of the uniform variable inside the shader program.
	var mmLoc = gl.getUniformLocation(program,"modelT");
	var vmLoc = gl.getUniformLocation(program,"viewT");
	var pmLoc = gl.getUniformLocation(program,"projT");
	var exposureLoc = gl.getUniformLocation(program, "exposure");
	
	
	var drawables=[];
	var modelTransformations=[];
	var nDrawables=0;
	var nNodes = (model.nodes)?model.nodes.length:1;
	var drawMode=(model.drawMode)?gl[model.drawMode]:gl.TRIANGLES;

	for (var i= 0; i<nNodes; i++){
		var nMeshes = (model.nodes)?(model.nodes[i].meshIndices.length):(model.meshes.length);
		for (var j=0; j<nMeshes;j++){
			var index = (model.nodes)?model.nodes[i].meshIndices[j]:j;
			var mesh = model.meshes[index];
			
				drawables[nDrawables] = new Drawable(
				a_Locations,[mesh.vertexPositions, mesh.vertexColors],
				mesh.vertexPositions.length/3,
				mesh.indices, drawMode
			);
			
			var m = new Matrix4();
			if (model.nodes)m.elements=new Float32Array(model.nodes[i].modelMatrix);
			modelTransformations[nDrawables] = m;
			
			nDrawables++;
		}
	}
	// Get the location/address of the vertex attribute inside the shader program.
	this.draw = function (pMatrix,vMatrix,mMatrix)
	{
		gl.useProgram(program);
		gl.uniform1f(exposureLoc, exposure);	
				
		gl.uniformMatrix4fv(pmLoc, false, pMatrix.elements);
		gl.uniformMatrix4fv(vmLoc, false, vMatrix.elements);
		

		for (var i= 0; i<nDrawables; i++){
			gl.uniformMatrix4fv(mmLoc, false, 
				(mMatrix)?(new Matrix4(mMatrix).multiply(modelTransformations[i])).elements
						:modelTransformations[i].elements);

			drawables[i].draw();
		}
	}
	this.getBounds=function() // Computes Model bounding box
	{		
		var xmin, xmax, ymin, ymax, zmin, zmax;
		var firstvertex = true;
		var nNodes = (model.nodes)?model.nodes.length:1;
		for (var k=0; k<nNodes; k++){
			var m = new Matrix4();
			if (model.nodes)m.elements=new Float32Array(model.nodes[k].modelMatrix);
			//console.log(model.nodes[k].modelMatrix);
			var nMeshes = (model.nodes)?model.nodes[k].meshIndices.length:model.meshes.length;
			for (var n = 0; n < nMeshes; n++){
				var index = (model.nodes)?model.nodes[k].meshIndices[n]:n;
				var mesh = model.meshes[index];
				for(var i=0;i<mesh.vertexPositions.length; i+=3){
					var vertex = m.multiplyVector4(new Vector4([mesh.vertexPositions[i],mesh.vertexPositions[i+1],mesh.vertexPositions[i+2],1])).elements;

					if (firstvertex){
						xmin = xmax = vertex[0];
						ymin = ymax = vertex[1];
						zmin = zmax = vertex[2];
						firstvertex = false;
					}
					else{
						if (vertex[0] < xmin) xmin = vertex[0];
						else if (vertex[0] > xmax) xmax = vertex[0];
						if (vertex[1] < ymin) ymin = vertex[1];
						else if (vertex[1] > ymax) ymax = vertex[1];
						if (vertex[2] < zmin) zmin = vertex[2];
						else if (vertex[2] > zmax) zmax = vertex[2];
					}
				}
			}
		}
		var dim= {};
		dim.min = [xmin,ymin,zmin];
		dim.max = [xmax,ymax,zmax];
		//console.log(dim);
		return dim;
	}
}
