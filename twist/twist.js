/*
 * Program 1 JS file
 * John Martinez
 * 7/18/2015
 */
'use strict';

var canvas;
var gl;
var theta = 0.0;
var thetaLoc;
var points = [];
var colors = [];
var numSubdivides = 1;
var numTris = 0;//used as index into a color palette

function init()
{
	var canvas = document.getElementById('gl-canvas');
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl)
	{
		alert('WebGL is not available')
	}
	gl.clearColor(0.5, 0.5, 0.5, 1.0);
	var program = initShaders(gl, 'vertex-shader', 'fragment-shader');
	gl.useProgram(program);

	//first init corners of triangle
	var vertices = [
		vec3(-.5, -.5,0.0),
		vec3(0, .5, 0.0),
		vec3(.5, -.5, 0.0)
		];
	points = [];
	colors = [];
	numTris = 0;
	divideTriangle(vertices[0], vertices[1], vertices[2], numSubdivides);
	//load colors onto GPU
	var cbuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

	//associate shader vars with our data buffer
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);

	//load vertices onto GPU
	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

	//associate shader vars with our data buffer
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
	//configure webgl
	gl.viewport(0, 0, canvas.width, canvas.height);

	thetaLoc = gl.getUniformLocation(program, 'theta');
	render();
}

//put a new triangle into array that will go into GPU buffer
//also give each triangle a color
function triangle(a, b, c)
{
	var baseColors = [
    	vec3( 1.0, 0.0, 0.0),  // red
    	vec3( 0.0, 0.0, 0.0),  // black
    	vec3( 1.0, 1.0, 0.0),  // yellow
    	vec3( 0.0, 1.0, 0.0),  // green
    	vec3( 0.0, 0.0, 1.0),  // blue
    	vec3( 1.0, 0.0, 1.0),  // magenta
    	vec3( 0.0, 1.0, 1.0)   // cyan
	];
	points.push(a, b, c);
	var ndx = numTris % baseColors.length;
	colors.push(baseColors[ndx],baseColors[ndx],baseColors[ndx]);
	numTris++;
}

function divideTriangle(a, b, c, count)
{
	if (count === 0)
	{
		triangle(a, b, c);
		return;
	}
	//bisect the sides
	var ab = mix(a, b, 0.5);
	var ac = mix(a, c, 0.5);
	var bc = mix(b, c, 0.5);

	count--;
	//3 new triangles
	divideTriangle(a, ab, ac, count);
	divideTriangle(c, ac, bc, count);
	divideTriangle(b, bc, ab, count);
	//add the middle triangle
	divideTriangle(ab, bc, ac, count);
}

function render()
{
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.uniform1f(thetaLoc, theta);
	gl.drawArrays(gl.TRIANGLES, 0, points.length);
	window.requestAnimFrame(init);
}

//Function to update theta and number of subdivides
function changeVals()
{
		var t = parseFloat(document.getElementById('thetabox').value);
		if (isNaN(t))
		{
	    		alert('Theta must be a number.');
	    		return;
    		}
		theta = radians(t);
		numSubdivides = parseInt(document.getElementById('divslider').value);

}

window.onload = init;
