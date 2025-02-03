// Based on ColoredPoints.js (c) 2012 Matsuda
// Vertex Shader Program
// Used chat gpt to help debug and get a basic idea before writing code (helped a lot for click rotate)
// Grabbed stats from example lab code

var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_MouseRotateMatrix;
    void main() {
        gl_Position = u_MouseRotateMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }`

var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }`

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_MouseRotateMatrix;

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

    // Get the storage location u_MouseRotateMatrix
    u_MouseRotateMatrix = gl.getUniformLocation(gl.program, 'u_MouseRotateMatrix');
    if (!u_MouseRotateMatrix) {
        console.log('Failed to get the storage location of u_MouseRotateMatrix');
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
let g_tailAngle=0;
let g_2ndTailAngle=0;
let g_3rdTailAngle=0;
let g_4thTailAngle=0;
let g_Animation=false;
let g_1stLegAngle=0;
let g_2ndLegAngle=0;

// Set up actions for the HTML UI elements
function addActionsForHTMLUI() {

    // Button Events
    document.getElementById('AnimationOnButton').onclick = function() { g_Animation=true };
    document.getElementById('AnimationOffButton').onclick = function() { g_Animation=false };
    

    // Slider Events
    document.getElementById('4thTailSlide').addEventListener('mousemove', function() { g_4thTailAngle = this.value; renderScene(); });
    document.getElementById('3rdTailSlide').addEventListener('mousemove', function() { g_3rdTailAngle = this.value; renderScene(); });
    document.getElementById('2ndTailSlide').addEventListener('mousemove', function() { g_2ndTailAngle = this.value; renderScene(); });
    document.getElementById('tailBaseSlide').addEventListener('mousemove', function() { g_tailAngle = this.value; renderScene(); });

    // Camera angle slider event
    document.getElementById('xAngleSlide').addEventListener('mousemove', function() { g_globalXAngle = this.value; renderScene(); });
    document.getElementById('yAngleSlide').addEventListener('mousemove', function() { g_globalYAngle = this.value; renderScene(); });
}

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
    //console.log(g_seconds);

    // Update animation angles
    updateAnimationAngle();

    // Draw Everything
    renderScene();
    
    stats.end();
    // Tell the browser to update again when it has time
    requestAnimationFrame(tick);
}

// Updates the angle of everything if currently animated
function updateAnimationAngle() {
    if (g_Animation) {
        // tail animation
        g_tailAngle = (10*Math.sin(g_seconds));
        g_2ndTailAngle = (2.5*Math.sin(g_seconds));
        g_3rdTailAngle = (2.5*Math.sin(g_seconds));
        g_4thTailAngle = (2.5*Math.sin(g_seconds));
        g_5thTailAngle = (2.5*Math.sin(g_seconds));

        // leg animation
        g_1stLegAngle = (5*Math.sin(g_seconds * 8));
        g_2ndLegAngle = (-5*Math.sin(g_seconds * 8));
    }
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
    var u_MouseRotMat = new Matrix4().rotate(-globalx * rotateSensitivity, 0, 1, 0);
    u_MouseRotMat = u_MouseRotMat.rotate(-globaly * rotateSensitivity, 1, 0, 0);
    gl.uniformMatrix4fv(u_MouseRotateMatrix, false, u_MouseRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the body cube
    var body = new Cube();
    body.color = [221/255, 212/255, 165/255, 1.0];
    body.matrix.translate(-0.2, -0.25, -0.25);
    body.matrix.scale(0.3, 0.2, 0.6);
    body.render();

    // Draw the tail cube
    var tail = new Cube();
    tail.color = [201/255, 192/255, 145/255, 1.0];
    tail.matrix.translate(-0.175, -0.175, 0.3);
    tail.matrix.rotate(-25, 1, 0, 0);
    tail.matrix.rotate(g_tailAngle, 1, 0, 0);
    var tailCoordinates = new Matrix4(tail.matrix);
    tail.matrix.scale(0.25, 0.1, 0.35);
    tail.render();

    // Draw the 2nd tail cube
    var tail2 = new Cube();
    tail2.color = [211/255, 202/255, 155/255, 1.0];
    tail2.matrix = tailCoordinates;
    tail2.matrix.translate(0.0165, 0.025, 0.35);
    tail2.matrix.rotate(-40, 1, 0, 0);
    tail2.matrix.rotate(g_2ndTailAngle, 1, 0, 0);
    var tail2Coordinates = new Matrix4(tail2.matrix);
    tail2.matrix.scale(0.225, 0.08, 0.3);
    tail2.render();

    // Draw the 3rd tail cube
    var tail3 = new Cube();
    tail3.color = [211/255, 202/255, 155/255, 1.0];
    tail3.matrix = tail2Coordinates;
    tail3.matrix.translate(0.0165, -0.01, 0.3);
    tail3.matrix.rotate(-40, 1, 0, 0);
    tail3.matrix.rotate(g_3rdTailAngle, 1, 0, 0);
    var tail3Coordinates = new Matrix4(tail3.matrix);
    tail3.matrix.scale(0.2, 0.08, 0.25);
    tail3.render();

    // Draw the 4th tail cube
    var tail4 = new Cube();
    tail4.color = [211/255, 202/255, 155/255, 1.0];
    tail4.matrix = tail3Coordinates;
    tail4.matrix.translate(0.019, -0.01, 0.2);
    tail4.matrix.rotate(-40, 1, 0, 0);
    tail4.matrix.rotate(g_4thTailAngle, 1, 0, 0);
    var tail4Coordinates = new Matrix4(tail4.matrix);
    tail4.matrix.scale(0.15, 0.06, 0.2);
    tail4.render();

    // Draw the 5th tail cube
    var tail5 = new Cube();
    tail5.color = [211/255, 202/255, 155/255, 1.0];
    tail5.matrix = tail4Coordinates;
    tail5.matrix.translate(0.0165, -0.01, 0.2);
    var tail5Coordinates = new Matrix4(tail4.matrix);
    tail5.matrix.scale(0.125, 0.125, 0.125);
    tail5.render();

    // Draw stinger didnt finish
    // var stinger = new Pyramid();
    // stinger.color = [111/255, 102/255, 55/255, 1.0];
    // stinger.matrix = tail5Coordinates;
    // stinger.matrix.translate(0.017, -0.02, 0.2);
    // stinger.matrix.rotate(45, 1, 0, 0);
    // // stinger.matrix.scale(0.5, 0.5, 0.5);
    // stinger.render();

    // Draw the left claw
    var claw2 = new Cube();
    claw2.color = [201/255, 192/255, 145/255, 1.0];
    claw2.matrix.translate(-0.35, -0.25, -0.45);
    claw2.matrix.scale(0.2, 0.1, 0.3);
    claw2.render();

    // Draw the right claw
    var claw1 = new Cube();
    claw1.color = [201/255, 192/255, 145/255, 1.0];
    claw1.matrix.translate(0, -0.25, -0.45);
    claw1.matrix.scale(0.2, 0.1, 0.3);
    claw1.render();

    // Draw a left leg
    var leg = new Cube();
    leg.color = [221/255, 212/255, 165/255, 1.0];
    leg.matrix.setTranslate(0.0, -0.15, 0.0);
    leg.matrix.rotate(-15, 0.0, 0.0, 1.0);
    leg.matrix.rotate(g_2ndLegAngle, 0.0, 0.0, 1.0);
    //leg.matrix.rotate(g_1stLegAngle, 0.0, 1.0, 0.0);
    leg.matrix.scale(0.4, 0.08, 0.08);
    leg.render();

    var leg2 = new Cube();
    leg2.color = [221/255, 212/255, 165/255, 1.0];
    leg2.matrix.setTranslate(0.0, -0.15, 0.0);
    leg2.matrix.rotate(-15, 0.0, 0.0, 1.0);
    leg2.matrix.rotate(g_1stLegAngle, 0.0, 0.0, 1.0);
    leg2.matrix.rotate(-25, 0.0, 1.0, 0.0);
    leg2.matrix.scale(0.4, 0.08, 0.08);
    leg2.render();

    var leg3 = new Cube();
    leg3.color = [221/255, 212/255, 165/255, 1.0];
    leg3.matrix.setTranslate(0.0, -0.15, 0.0);
    leg3.matrix.rotate(-15, 0.0, 0.0, 1.0);
    leg3.matrix.rotate(g_1stLegAngle, 0.0, 0.0, 1.0);
    leg3.matrix.rotate(25, 0.0, 1.0, 0.0);
    leg3.matrix.scale(0.4, 0.08, 0.08);
    leg3.render();



    var lleg = new Cube();
    lleg.color = [221/255, 212/255, 165/255, 1.0];
    lleg.matrix.setTranslate(0.0, -0.15, 0.0);
    lleg.matrix.translate(-0.1, 0.0, 0.1);
    lleg.matrix.rotate(180, 0.0, 1.0, 0.0);
    lleg.matrix.rotate(-15, 0.0, 0.0, 1.0); // z angle 
    lleg.matrix.rotate(g_1stLegAngle, 0.0, 0.0, 1.0);
    lleg.matrix.scale(0.4, 0.08, 0.08);
    lleg.render();

    var lleg2 = new Cube();
    lleg2.color = [221/255, 212/255, 165/255, 1.0];
    lleg2.matrix.setTranslate(0.0, -0.15, 0.0);
    lleg2.matrix.translate(-0.1, 0.0, 0.1);
    lleg2.matrix.rotate(180, 0.0, 1.0, 0.0);
    lleg2.matrix.rotate(-15, 0.0, 0.0, 1.0);
    lleg2.matrix.rotate(g_2ndLegAngle, 0.0, 0.0, 1.0);
    lleg2.matrix.rotate(-25, 0.0, 1.0, 0.0);
    lleg2.matrix.scale(0.4, 0.08, 0.08);
    lleg2.render();

    var lleg3 = new Cube();
    lleg3.color = [221/255, 212/255, 165/255, 1.0];
    lleg3.matrix.setTranslate(0.0, -0.15, 0.0);
    lleg3.matrix.translate(-0.1, 0.0, 0.1);
    lleg3.matrix.rotate(180, 0.0, 1.0, 0.0);
    lleg3.matrix.rotate(-15, 0.0, 0.0, 1.0);
    lleg3.matrix.rotate(g_2ndLegAngle, 0.0, 0.0, 1.0);
    lleg3.matrix.rotate(25, 0.0, 1.0, 0.0);
    lleg3.matrix.scale(0.4, 0.08, 0.08);
    lleg3.render();

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