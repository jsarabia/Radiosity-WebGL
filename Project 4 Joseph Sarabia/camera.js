function Camera(gl,d,modelUp) // Compute a camera from model's bounding box dimensions
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
	var FOV = 30;
	
	this.setAt=function(a){
		at = a;
	}
	this.setUp=function(u){
		up = u;
	}
	this.setEye=function(e){
		eye = e;
	}
	
	
	this.decFOV=function(){
		if(FOV>0)
		FOV-=.5;
	}
	
	this.incFOV=function(){
		if(FOV<90)
		FOV+=.5;
	};
	
	this.getDiag=function(){
		return diagonal;
	}
	
	this.getEye=function(){
		return eye;
	}
	
	this.dolly=function(view, delta){
		
		
		
		//addMessage(view[2]);
		//console.log(viewMatrix);
		var newview = new Matrix4().translate(-view.elements[2] * delta, -view.elements[6] * delta, -view.elements[10]* delta);
		var newEye = newview.multiplyVector4(new Vector4([eye[0],eye[1],eye[2],1])).elements;
		//console.log(eye);
		eye = newEye;
		
		
		var newAt = newview.multiplyVector4(new Vector4([at[0],at[1],at[2],1])).elements;
		//console.log(eye);
		at = newAt;
		
	}
	this.truck=function(view, delta){
		
		var newview = new Matrix4().translate(-view.elements[0] * delta, -view.elements[4] * delta, -view.elements[8] * delta);
		//var newEye = new Vector3(view.mu
		var newEye = newview.multiplyVector4(new Vector4([eye[0],eye[1],eye[2],1])).elements;
		//console.log(eye);
		eye = newEye;
		
		
		var newAt = newview.multiplyVector4(new Vector4([at[0],at[1],at[2],1])).elements;
		//console.log(eye);
		at = newAt;

	}
	
	this.pedestal=function(view, delta){
		
		var newview = new Matrix4().translate(-view.elements[1] * delta, -view.elements[5] * delta, -view.elements[9] * delta);
		//var newEye = new Vector3(view.mu
		var newEye = newview.multiplyVector4(new Vector4([eye[0],eye[1],eye[2],1])).elements;
		//console.log(eye);
		eye = newEye;
		
		
		var newAt = newview.multiplyVector4(new Vector4([at[0],at[1],at[2],1])).elements;
		//console.log(eye);
		at = newAt;

	
	}
	
	this.tilt=function(view, angle){
		

		//view.translate(eye[0],eye[1],eye[2]).rotate(angle, view.elements[0], view.elements[4], view.elements[8]).translate(-eye[0],-eye[1],-eye[2]);
		var newview = new Matrix4().translate(eye[0],eye[1],eye[2]);
		newview.rotate(angle, view.elements[0], view.elements[4], view.elements[8]);
		newview.translate(-eye[0],-eye[1],-eye[2]);
		//console.log(newview);	
		
		var newAt = newview.multiplyVector4(new Vector4([at[0], at[1], at[2], 1])).elements;
 
		at = newAt;
 
	}
	
	this.pan=function(view, angle){
		
		var newview = new Matrix4().translate(eye[0],eye[1],eye[2]);
		newview.rotate(angle, view.elements[1], view.elements[5], view.elements[9]);
		newview.translate(-eye[0],-eye[1],-eye[2]);
			
		
		var newAt = newview.multiplyVector4(new Vector4([at[0], at[1], at[2], 1])).elements;
		
		at = newAt;
 
	}
	
	

	this.getRotatedCameraPosition= function(angle){
		var m = new Matrix4().setTranslate(at[0],at[1],at[2]).rotate(angle,up[0],up[1],up[2]).translate(-at[0],-at[1],-at[2]);
		var e = m.multiplyVector4(new Vector4([eye[0],eye[1],eye[2],1])).elements;
		return [e[0],e[1],e[2]];
	};
	this.getViewMatrix=function(e){
		if (e==undefined) e = eye;
		return new Matrix4().setLookAt(e[0],e[1],e[2],at[0],at[1],at[2],up[0],up[1],up[2]);
	};
	this.getRotatedViewMatrix=function(angle){
		return this.getViewMatrix(this.getRotatedCameraPosition(angle));
	};
	this.getProjMatrix=function(){
		return new Matrix4().setPerspective(FOV, gl.canvas.width / gl.canvas.height, near , far);
	};
}
