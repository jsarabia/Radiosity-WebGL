function divideCornellBoxFaces(modelData,nDivs)
{
	var meshes = modelData.meshes;
	for (var meshId=0; meshId < meshes.length; meshId++){
		var meshVpositions = meshes[meshId].vertexPositions;
		var nVertices = meshVpositions.length/3;
		var meshVnormals = meshes[meshId].vertexNormals;
		var meshIndices = meshes[meshId].indices;
		var newMeshVpositions=[];
		var newMeshVnormals=[];
		var newMeshIndices=[];
		// take each quad and subdivide into n*m quads
		//console.log("Mesh["+meshId+"]");
		var meshIndex=0
		for (var i=0; i < nVertices; i+=4){
			var quad = new Array(4);
			for (var j=0; j<4; j++){
				quad[j] = [
					meshVpositions[(i+j)*3+0],
					meshVpositions[(i+j)*3+1],
					meshVpositions[(i+j)*3+2]
				];
				//console.log(quad[j].join());
			}
			// assumes same normal for all vertices of the quad
			var normal = [
				meshVnormals[i*3+0],
				meshVnormals[i*3+1],
				meshVnormals[i*3+2]
			];
			// create vertex grid
			var vertexGrid = new Array(nDivs+1);//rows
			for (var m=0; m<=nDivs; m++)vertexGrid[m]=new Array(nDivs+1);
			// create the first row of the vertex grid.
			// and create the last row of the vertex grid.
			var dHoriz1 = [
				(quad[1][0]-quad[0][0])/nDivs,
				(quad[1][1]-quad[0][1])/nDivs,
				(quad[1][2]-quad[0][2])/nDivs
			];
			var dHoriz2 = [
				(quad[2][0]-quad[3][0])/nDivs,
				(quad[2][1]-quad[3][1])/nDivs,
				(quad[2][2]-quad[3][2])/nDivs
			];
			for (var n=0; n<=nDivs; n++){ 
				vertexGrid[0][n] =  [
					quad[0][0]+n*dHoriz1[0],
					quad[0][1]+n*dHoriz1[1],
					quad[0][2]+n*dHoriz1[2]
				];
				vertexGrid[nDivs][n] =  [
					quad[3][0]+n*dHoriz2[0],
					quad[3][1]+n*dHoriz2[1],
					quad[3][2]+n*dHoriz2[2]
				];		
				// create intermediate rows for the vertex grid.
				var dVert = [
					(vertexGrid[nDivs][n][0]-vertexGrid[0][n][0])/nDivs,
					(vertexGrid[nDivs][n][1]-vertexGrid[0][n][1])/nDivs,
					(vertexGrid[nDivs][n][2]-vertexGrid[0][n][2])/nDivs
				];
				for (var m=1; m<nDivs; m++){
					vertexGrid[m][n] = [
						vertexGrid[0][n][0]+m*dVert[0],
						vertexGrid[0][n][1]+m*dVert[1],
						vertexGrid[0][n][2]+m*dVert[2]
					];
				}
			}
			// create new mesh positions, normals, indices from the grid
			for (var m=0; m<nDivs; m++){ // vertical subdivisions
				for (var n=0; n<nDivs; n++){ // horizontal subdivisions
				/*
					var k;
					for (k=0; k<3; k++)newMeshVpositions.push(vertexGrid[m][n][k]);
					for (k=0; k<3; k++)newMeshVpositions.push(vertexGrid[m][n+1][k]);
					for (k=0; k<3; k++)newMeshVpositions.push(vertexGrid[m+1][n+1][k]);
					for (k=0; k<3; k++)newMeshVpositions.push(vertexGrid[m+1][n][k]);
					for (k=0; k<3; k++)newMeshVnormals.push(normal[k]);
					for (k=0; k<3; k++)newMeshVnormals.push(normal[k]);
					for (k=0; k<3; k++)newMeshVnormals.push(normal[k]);
					for (k=0; k<3; k++)newMeshVnormals.push(normal[k]);
				*/
					//newMeshIndices.push(meshIndex+3);newMeshIndices.push(meshIndex+0);newMeshIndices.push(meshIndex+1);
					newMeshIndices.push(meshIndex+(m+1)*(nDivs+1)+n);newMeshIndices.push(meshIndex+m*(nDivs+1)+n);newMeshIndices.push(meshIndex+m*(nDivs+1)+n+1);
					newMeshIndices.push(meshIndex+m*(nDivs+1)+n+1);newMeshIndices.push(meshIndex+(m+1)*(nDivs+1)+n+1);newMeshIndices.push(meshIndex+(m+1)*(nDivs+1)+n);
					//newMeshIndices.push(meshIndex+1);newMeshIndices.push(meshIndex+2);newMeshIndices.push(meshIndex+3);
				}
			}
			for (var m=0; m<=nDivs; m++){ // vertical subdivisions
				for (var n=0; n<=nDivs; n++,meshIndex++){ // horizontal subdivisions
					var k;
					for (k=0; k<3; k++)newMeshVpositions.push(vertexGrid[m][n][k]);
					for (k=0; k<3; k++)newMeshVnormals.push(normal[k]);
				}
			}
		}
		//console.log(newMeshIndices);console.log(newMeshVnormals);
		meshes[meshId].vertexPositions=newMeshVpositions;
		meshes[meshId].vertexNormals=newMeshVnormals;
		meshes[meshId].indices=newMeshIndices;
	}
}