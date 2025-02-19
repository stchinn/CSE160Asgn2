// Based on ColoredPoints.js (c) 2012 Matsuda
// Vertex Shader Program
// Grabbed stats from example lab code
// Used chatgpt for debugging, also to help for canvas events

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
        v_UV = a_UV;
    }`

var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform int u_whichTexture;
    void main() {

        if (u_whichTexture == -2) {             // use color
            gl_FragColor = u_FragColor;        
        } else if (u_whichTexture == -1) {      // use UV debug color
            gl_FragColor = vec4(v_UV, 1.0, 1.0);
        } else if (u_whichTexture == 0) {       // use texture0
            gl_FragColor = texture2D(u_Sampler0, v_UV);
        } else if (u_whichTexture == 1) {       // use texture1
            gl_FragColor = texture2D(u_Sampler1, v_UV);
        } else if (u_whichTexture == 2) {       // use texture2
            gl_FragColor = texture2D(u_Sampler2, v_UV);
        } else {                                // Error, push redish
            gl_FragColor = vec4(1,0.2,0.2,1);
        }
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
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_whichTexture;

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
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
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

    // Get the storage location u_ProjectionMatrix
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    // Get the storage location u_Sampler0
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return;
    }

    // Get the storage location u_Sampler1
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return;
    }

    // Get the storage location u_Sampler2
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
        console.log('Failed to get the storage location of u_Sampler2');
        return;
    }

    // Get the storage location u_whichTexture
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
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

}

function initTextures() {
    // image 0
    var image = new Image(); // Create the image object
    image.onerror = function() {
        console.log("Failed to load image.");
    }
    // Register the event handler to be called on loading an image
    image.onload = function(){ sendTextureToGLSL(image, 0); };
    // Tell the browser to load an image
    image.src = 'dirt.jpg';

    // image 1
    var image1 = new Image(); // Create the image object
    image1.onerror = function() { console.log("Failed to load image."); }
    image1.onload = function(){ sendTextureToGLSL(image1, 1); };
    image1.src = 'wood.jpg';

    // image 2
    var image2 = new Image(); // Create the image object
    image2.onerror = function() { console.log("Failed to load image."); }
    image2.onload = function(){ sendTextureToGLSL(image2, 2); };
    image2.src = 'leaf.jpg';

    return true;
}

function sendTextureToGLSL(image, chooseTexture) {
    var texture = gl.createTexture(); // create a texture object
    if (!texture) {
        console.log("Failed to create texture object");
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's axis
    // Enable texture unit0
    if (chooseTexture === 0) {
        gl.activeTexture(gl.TEXTURE0);
    } else if (chooseTexture === 1) {
        gl.activeTexture(gl.TEXTURE1);
    } else if (chooseTexture === 2) {
        gl.activeTexture(gl.TEXTURE2);
    }    
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);


    if (chooseTexture === 0) {
        // Set the texture unit 0 to the sampler
        gl.uniform1i(u_Sampler0, 0);
    } else if (chooseTexture === 1) {
        gl.uniform1i(u_Sampler1, 1);
    } else if (chooseTexture === 2) {
        gl.uniform1i(u_Sampler2, 2);
    }

    // gl.clear(gl.COLOR_BUFFER_BIT); // clear canvas
    console.log(`Finished loading texture ${chooseTexture}`);
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

    // Register function (event handler) to be called
    //canvas.onmousedown = click;
    // canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };
    // canvas.onmouseup = click;
    // canvas.onmouseout = click;
    document.addEventListener('mousemove', rotateCamera);
    document.addEventListener('keydown', keyPress);
    document.addEventListener('keyup', keyPress);
    initTextures(gl, 0);

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

let pause = -1;

// rotate camera
function rotateAngle(angle) {
    let d_x = g_at[0] - g_eye[0];
    let d_z = g_at[2] - g_eye[2];

    let theta = Math.atan2(d_z, d_x);
    theta += angle;

    let r = Math.sqrt(d_x * d_x + d_z * d_z); // distance from eye to at

    let new_x = r * Math.cos(theta);
    let new_z = r * Math.sin(theta);

    g_at = [g_eye[0] + new_x, g_at[1], g_eye[2] + new_z];
}

// rotate Camera for mouse based on last position
function rotateCamera(ev) {
    if (pause === 1) {return;}

    let dx = ev.movementX;
    let dy = ev.movementY;

    const rotationSpeed = 0.002; // mouse sensitivity

    // d = at - eye
    let d_x = g_at[0] - g_eye[0];
    let d_y = g_at[1] - g_eye[1];
    let d_z = g_at[2] - g_eye[2];

    // Convert to spherical coordinates
    let r = Math.sqrt(d_x * d_x + d_y * d_y + d_z * d_z); // Total radius
    let theta = Math.atan2(d_z, d_x); // Horizontal angle
    let phi = Math.asin(d_y / r); // Vertical angle

    theta += dx * rotationSpeed; // horizontal rotation
    phi -= dy * rotationSpeed; // vertical rotation

    // limit vertical rotation
    const maxPhi = Math.PI / 2.2;
    const minPhi = -Math.PI / 2.2;
    phi = Math.max(minPhi, Math.min(maxPhi, phi));

    // convert back to Cartesian coordinates
    let new_x = r * Math.cos(phi) * Math.cos(theta);
    let new_y = r * Math.sin(phi);
    let new_z = r * Math.cos(phi) * Math.sin(theta);

    // updates camera
    g_at = [g_eye[0] + new_x, g_eye[1] + new_y, g_eye[2] + new_z];

    // console.log("Camera Rotated: ", g_at);
}

let keysPressed = {};

function keyPress(ev) {
    let forward = new Vector3(g_at).sub(new Vector3(g_eye)).normalize();
    let left = Vector3.cross(forward, new Vector3(g_up)).normalize();
    const speed = 0.5;

    // Update key state based on key down or up events
    if (ev.type === 'keydown') {
        keysPressed[ev.key] = true;
    } else if (ev.type === 'keyup') {
        keysPressed[ev.key] = false;
    }

    if (keysPressed['Escape']) {
        pause *= -1;
    }

    if (pause === 1) {return;}

    // Move forward (w or ArrowUp)
    if (keysPressed['w'] || keysPressed['ArrowUp']) {
        g_eye = [g_eye[0] + forward.elements[0] * speed, g_eye[1], g_eye[2] + forward.elements[2] * speed];
        g_at  = [g_at[0] + forward.elements[0] * speed, g_at[1], g_at[2] + forward.elements[2] * speed];
        //console.log("Moving forward", forward);
    }

    // Move backward (s or ArrowDown)
    if (keysPressed['s'] || keysPressed['ArrowDown']) {
        g_eye = [g_eye[0] - forward.elements[0] * speed, g_eye[1], g_eye[2] - forward.elements[2] * speed];
        g_at  = [g_at[0] - forward.elements[0] * speed, g_at[1], g_at[2] - forward.elements[2] * speed];
        //console.log("Moving backward", forward);
    }

    // Move left (a or ArrowLeft)
    if (keysPressed['a'] || keysPressed['ArrowLeft']) {
        g_eye = [g_eye[0] - left.elements[0] * speed, g_eye[1], g_eye[2] - left.elements[2] * speed];
        g_at  = [g_at[0] - left.elements[0] * speed, g_at[1], g_at[2] - left.elements[2] * speed];
        //console.log("Moving left", left);
    }

    // Move right (d or ArrowRight)
    if (keysPressed['d'] || keysPressed['ArrowRight']) {
        g_eye = [g_eye[0] + left.elements[0] * speed, g_eye[1], g_eye[2] + left.elements[2] * speed];
        g_at  = [g_at[0] + left.elements[0] * speed, g_at[1], g_at[2] + left.elements[2] * speed];
        //console.log("Moving right", left);
    }

    // Rotate left (q)
    if (keysPressed['q']) {
        rotateAngle(-speed * 0.1);
    }

    // Rotate right (e)
    if (keysPressed['e']) {
        rotateAngle(speed * 0.1);
    }

    // Move up (Spacebar)
    if (keysPressed[' ']) { // Space key
        g_eye[1] += speed;
        g_at[1] += speed;
    }

    // Move down (Shift key)
    if (keysPressed['Shift']) { // Shift key
        g_eye[1] -= speed;
        g_at[1] -= speed;
    }
}

// function placeBlockInFront() {
//     // Calculate the direction vector from g_eye to g_at
//     var dir = new Vector3(g_at[0] - g_eye[0], g_at[1] - g_eye[1], g_at[2] - g_eye[2]);
    
//     // Normalize the direction vector
//     dir.normalize();
    
//     // Multiply the direction by the block distance to place the block in front
//     var blockPosition = new Vector3(g_eye[0] + dir.x * 1, 
//                                     g_eye[1] + dir.y * 1, 
//                                     g_eye[2] + dir.z * 1);
    
//     // Create the block (cube) at the calculated position
//     var body = new Cube();
//     body.color = [1.0, 1.0, 1.0, 1.0]; // White color for the block
//     body.textureNum = 2; // Texture for the block (assuming texture 2)
//     body.matrix.translate(blockPosition.x, blockPosition.y, blockPosition.z); // Position the block
//     body.render(); // Render the block

//     // Reset the model matrix to its identity for the next render
//     body.matrix.setIdentity();
// }

// function click(ev) {
//     placeBlockInFront();
// }

let rotateSensitivity = 0.8;
let globalx = 0;
let globaly = 0;

function rotateScene(x, y) {
    globalx += x;
    globaly += y
}

var g_map=[
    [1,1,1,1,1,0,1,1],
    [1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,1],
    [0,0,0,1,1,0,0,1],
    [1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,0,1],
    [1,0,1,0,0,0,0,1],
]

function drawMap(y_position) {
    var body = new Cube();
    for (x=0;x<8;x++) {
        for (y=0;y<8;y++) {
            if (g_map[x%8][y%8] == 1) {
                body.color = [1.0,1.0,1.0,1.0];
                body.textureNum = 0;
                body.matrix.translate(x-4, y_position, y-4);
                body.render();
                body.matrix.setIdentity();
            }
        }
    }
}

var g_map2=[
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
]

function drawMap2(y_position, x_translate, y_translate) {
    var body = new Cube();
    for (x=0;x<8;x++) {
        for (y=0;y<8;y++) {
            if (g_map2[x%8][y%8] == 1) {
                body.color = [1.0,1.0,1.0,1.0];
                body.textureNum = 1;
                body.matrix.translate(x-x_translate, y_position, y-y_translate);
                body.render();
                body.matrix.setIdentity();
            }
        }
    }
}

var g_map3=[
    [0,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0],
]

function drawMap3(y_position, x_translate, y_translate) {
    var body = new Cube();
    for (x=0;x<8;x++) {
        for (y=0;y<8;y++) {
            if (g_map3[x%8][y%8] == 1) {
                body.color = [1.0,1.0,1.0,1.0];
                body.textureNum = 2;
                body.matrix.translate(x-x_translate, y_position, y-y_translate);
                body.render();
                body.matrix.setIdentity();
            }
        }
    }
}


var g_map4=[
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
]

function drawMap4(y_position, x_translate, y_translate) {
    var body = new Cube();
    for (x=0;x<8;x++) {
        for (y=0;y<8;y++) {
            if (g_map4[x%8][y%8] == 1) {
                body.color = [1.0,1.0,1.0,1.0];
                body.textureNum = 2;
                body.matrix.translate(x-x_translate, y_position, y-y_translate);
                body.render();
                body.matrix.setIdentity();
            }
        }
    }
}

var g_map5=[
    [0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0],
]

function drawMap5(y_position, x_translate, y_translate) {
    var body = new Cube();
    for (x=0;x<8;x++) {
        for (y=0;y<8;y++) {
            if (g_map5[x%8][y%8] == 1) {
                body.color = [1.0,1.0,1.0,1.0];
                body.textureNum = 2;
                body.matrix.translate(x-x_translate, y_position, y-y_translate);
                body.render();
                body.matrix.setIdentity();
            }
        }
    }
}

function drawMap6(y_position, x_translate, y_translate) {
    var body = new Cube();
    for (x=0;x<8;x++) {
        for (y=0;y<8;y++) {
            if (g_map2[x%8][y%8] == 1) {
                body.color = [1.0,1.0,1.0,1.0];
                body.textureNum = 2;
                body.matrix.translate(x-x_translate, y_position, y-y_translate);
                body.render();
                body.matrix.setIdentity();
            }
        }
    }
}

function drawTree(x, y) {
    // tree trunk
    drawMap2(-0.75, x, y);
    drawMap2(0.2501, x, y);
    // layer1
    drawMap4(1.25, x, y);
    drawMap4(2.25, x, y);
    drawMap3(3.25, x, y);
    drawMap6(4.25, x, y);
}

let randomPairs = generateUniquePairs();

function generateUniquePairs() {
    let pairs = [];
    let xValues = [];
    let yValues = [];

    while (pairs.length < 10) {
        // Generate random x and y values
        let x = Math.floor(Math.random() * 101) - 50;
        let y = Math.floor(Math.random() * 101) - 50;

        // Check if the x and y values are within 8 of any existing value
        if (xValues.every(otherX => Math.abs(x - otherX) >= 8) && yValues.every(otherY => Math.abs(y - otherY) >= 8)) {
            pairs.push([x, y]);
            xValues.push(x);
            yValues.push(y);
        }
    }

    return pairs;
}

function drawForest() {
    // Draw trees at each of the random coordinates
    randomPairs.forEach(pair => {
        let x = pair[0];
        let y = pair[1];
        drawTree(x, y);
    });
}

var g_eye=[0,0,3];
var g_at=[0,0,-100];
var g_up=[0,1,0];

// Draw every shape that is supposed to be in the canvas
function renderScene() {

    // Check the time at the start of this function
    var startTime = performance.now();

    // Pass the projection Matrix
    var projMat = new Matrix4();
    projMat.setPerspective(50, 1*canvas.width/canvas.height, 0.1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    // Pass the view Matrix
    var viewMat = new Matrix4();
    viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0], g_at[1], g_at[2], g_up[0], g_up[1], g_up[2]); // (eye, at, up)
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    // Pass the matrix to u_ModelMatrix attribute
    var u_globalRotMat = new Matrix4().rotate(g_globalXAngle, 0, 1, 0);
    u_globalRotMat = u_globalRotMat.rotate(-g_globalYAngle, 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, u_globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the floor
    var floor = new Cube();
    floor.color = [0.5, 0.5, 0.5, 1.0];
    floor.textureNum = -2;
    floor.matrix.translate(0, -0.75, 0.0);
    floor.matrix.scale(100, 0, 100);
    floor.matrix.translate(-0.5, 0, -0.5);
    floor.render();

    // Draw the sky
    var floor = new SkyCube();
    floor.color = [135/255, 206/255, 235/255, 1.0];
    floor.textureNum = -2;
    floor.matrix.scale(100, 125, 100);
    floor.matrix.translate(-0.5, -0.5, -0.5);
    floor.render();

    // Draw the body cube
    var body = new Cube();
    body.color = [180/255, 160/255, 118/255, 1.0];
    body.textureNum = -1;
    body.matrix.translate(-6.0, -0.25, -0.25);
    body.matrix.scale(0.3, 0.2, 0.6);
    body.render();

    var body2 = new Cube();
    body2.color = [180/255, 160/255, 118/255, 1.0];
    body.textureNum = -2;
    body2.matrix.translate(-6.0, 0.0, -0.25);
    body2.matrix.scale(0.3, 0.5, 0.2);
    body2.render();

    drawMap(-0.75);
    drawMap(0.25);

    drawForest();

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