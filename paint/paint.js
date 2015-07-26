/*
 * John Martinez
 * Program 2: Painting with the mouse
 * 7/26/2015
 */
"use strict";

var canvas;
var gl;

var maxNumVertices  = 1000;
var index = 0;
var curves = [];
var redraw = false;
var currColor = vec3(0, 0, 0);//color current curve should be drawn in
var currPointCount = 0;//how many points the curve that is being drawn has
var startPos = index;//where the curve should start in vertex
var currWidth = 1;//current line width
//Every curve is represented by this
function Curve(offset, width, numPoints)
{
    this.offset = offset;//offset in vertex buffer
    this.numPoints = numPoints;//number of vertices in curve
    this.width = width;//line width
}

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    canvas.addEventListener("mousedown", function(event){
      redraw = true;

    });

    canvas.addEventListener("mouseup", function(event){
      redraw = false;
      //released mouse button so make new curve
      curves.push(new Curve(startPos, currWidth, currPointCount));
      currPointCount = 0;
      startPos = index;
    });
    canvas.addEventListener("mousemove", function(event){

        if(redraw) {
          gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
          var t = vec2(2*event.clientX/canvas.width-1, 2*(canvas.height-event.clientY)/canvas.height-1);
        gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof['vec2'], flatten(t));


        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof['vec3'], flatten(currColor));
        index++;
        currPointCount++;
      }

    } );


    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, maxNumVertices * sizeof['vec2'], gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, maxNumVertices * sizeof['vec3'], gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    render();
}


function render() {

    gl.clear(gl.COLOR_BUFFER_BIT);
    //draw each curve individually
    for(var i = 0; i < curves.length; i++)
    {
        gl.lineWidth(curves[i].width);
        gl.drawArrays(gl.LINE_STRIP, curves[i].offset, curves[i].numPoints);
    }

    window.requestAnimFrame(render);

}

function changeRGB()
{
    var r = parseInt(document.getElementById('Rslider').value);
    var g = parseInt(document.getElementById('Gslider').value);
    var b = parseInt(document.getElementById('Bslider').value);
    currColor = vec3(r/255, g/255, b/255);
}

function changeWidth()
{
    currWidth = parseInt(document.getElementById('widthslider').value);
}
