/*function radCam(c, u, a, d){

	var diagonal = Math.sqrt(Math.pow((d.max[0]-d.min[0]),2)+Math.pow((d.max[1]-d.min[1]),2)+Math.pow((d.max[2]-d.min[2]),2));
	var fov = 90;
	var near = diagonal*.01;
	var far = diagonal*10;
	var at = a;
	var eye = c;
	var up = u;
*/

function radCam(gl,d,modelUp) // Compute a camera from model's bounding box dimensions
{
	var center = [(d.min[0]+d.max[0])/2,(d.min[1]+d.max[1])/2,(d.min[2]+d.max[2])/2];
	var diagonal = Math.sqrt(Math.pow((d.max[0]-d.min[0]),2)+Math.pow((d.max[1]-d.min[1]),2)+Math.pow((d.max[2]-d.min[2]),2));
	//console.log(center+" "+diagonal);
	
	var name = "auto";
	var at = center;
	var eye = [center[0], center[1]+diagonal*0.5, center[2]+diagonal*1.5];
	var up = [modelUp[0],modelUp[1],modelUp[2]];
	var near = diagonal*.01;
	var far = diagonal*10;
	var FOV = 90;


	this.setAt=function(a){
		at = a;
	}
	this.setUp=function(u){
		var n = 1/Math.sqrt(u[0]*u[0] + u[1]*u[1] + u[2]*u[2]);
		var temp = [u[0],u[1],u[2]];
		//normalize the incoming vector before assigning it to up
		temp[0] *= n;
		temp[1] *= n;
		temp[2] *= n;
 		up = temp;
	}
	this.setEye=function(e){
		eye = e;
	}
	
	this.getViewMatrix=function(e){
		if (e==undefined) e = eye;
		var a = [];

		a[0] = at[0] + e[0];
		a[1] = at[1] + e[1];
		a[2] = at[2] + e[2];
	//	console.log(a);
		return new Matrix4().setLookAt(e[0],e[1],e[2],a[0],a[1],a[2],up[0],up[1],up[2]);
	};
	this.getRotatedViewMatrix=function(angle){
		return this.getViewMatrix(this.getRotatedCameraPosition(angle));
	};
	this.getProjMatrix=function(){
		return new Matrix4().setPerspective(FOV, gl.canvas.width / gl.canvas.height, near , far);
	};
	
	
}

