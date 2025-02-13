// Based on ColoredPoints.js (c) 2012 Matsuda
// Vertex Shader Program
// Used chat gpt to help debug and get a basic idea before writing code (helped a lot for click rotate)
// Grabbed stats from example lab code

var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }`

var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
        // gl_FragColor = vec4(v_UV, 1.0, 1.0);
    }`

// Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize Shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of a_UV
    a_Position = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of u_FragColor variable
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    // Get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    // Get the storage location u_ViewMatrix
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    // Set an initial value for this matrix to identify
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Globals related to UI elements
let g_globalXAngle=0;
let g_globalYAngle=0;
let g_globalZAngle=0;

// Set up actions for the HTML UI elements
function addActionsForHTMLUI() {

    // Button Events
    

    // Slider Events


    // Camera angle slider event
    document.getElementById('xAngleSlide').addEventListener('mousemove', function() { g_globalXAngle = this.value; renderScene(); });
    document.getElementById('yAngleSlide').addEventListener('mousemove', function() { g_globalYAngle = this.value; renderScene(); });
}

// fps tracker
var stats = new Stats();
stats.dom.style.left = "auto";
stats.dom.style.right = "0";
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

function main() {

    // Set up canvas and gl variables
    setupWebGL();
    // Set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();
    // Set up actions for the HTML UI elements
    addActionsForHTMLUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };
    canvas.onmouseup = click;
    canvas.onmouseout = click;

    // Set the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    requestAnimationFrame(tick);
}

var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now()/1000.0 - g_startTime;

// called by browser repeatedly whenever its time
function tick() {
    stats.begin();
    // Save the current time
    g_seconds = performance.now()/1000.0 - g_startTime;

    // Draw Everything
    renderScene();
    
    stats.end();
    // Tell the browser to update again when it has time
    requestAnimationFrame(tick);
}

let dragOn = false;
let previousMousePosition = { x: 0, y: 0 };

function click(ev) {
    if (ev.type === 'mousedown') {
        dragOn = true;
        previousMousePosition = { x: ev.clientX, y: ev.clientY };
    } else if (ev.type === 'mousemove' && dragOn) {
        var xRotate = ev.clientX - previousMousePosition.x;
        var yRotate = ev.clientY - previousMousePosition.y;

        // console.log("x:" + xRotate, "y:" + yRotate);
        rotateScene(xRotate, yRotate);

        // Update the previous mouse position for the next move
        previousMousePosition = { x: ev.clientX, y: ev.clientY };
    } else if (ev.type === 'mouseup' || ev.type === 'mouseout') {
        dragOn = false;
    }
}

let rotateSensitivity = 0.8;
let globalx = 0;
let globaly = 0;

function rotateScene(x, y) {
    globalx += x;
    globaly += y
}

// Draw every shape that is supposed to be in the canvas
function renderScene() {

    // Check the time at the start of this function
    var startTime = performance.now();

    // Pass the matrix to u_ModelMatrix attribute
    var u_globalRotMat = new Matrix4().rotate(g_globalXAngle, 0, 1, 0);
    u_globalRotMat = u_globalRotMat.rotate(-g_globalYAngle, 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, u_globalRotMat.elements);

    // trying to rotate with mouse
    // var u_MouseRotMat = new Matrix4().rotate(-globalx * rotateSensitivity, 0, 1, 0);
    // u_MouseRotMat = u_MouseRotMat.rotate(-globaly * rotateSensitivity, 1, 0, 0);
    // gl.uniformMatrix4fv(u_MouseRotateMatrix, false, u_MouseRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the body cube
    var body = new Cube();
    body.color = [180/255, 160/255, 118/255, 1.0];
    body.matrix.translate(-0.2, -0.25, -0.25);
    body.matrix.scale(0.3, 0.2, 0.6);
    body.render();

    // Check the time at the end of the function, and show on web page
    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot");
}

// Send the text of a HTML element
function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlID) {
        console.log('Failed to get ' + htmlID + ' from HTML');
        return;
    }
    htmlElm.innerHTML = text;
}