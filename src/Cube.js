class Cube{
    constructor(){
        this.type='cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -5;
    }

    // Render this shape
    render() {
        // Pass the position of a point to a_Position variable
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of cube
        drawTriangle3DUV([ 0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0 ], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([ 0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0 ], [0,0, 0,1, 1,1]);

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

        // Top of cube
        drawTriangle3DUV([ 0.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0 ], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([ 0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0 ], [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.85, rgba[1] * 0.85, rgba[2] * 0.85, rgba[3]);

        // Right of cube
        drawTriangle3DUV([ 1.0, 0.0, 0.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0 ], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([ 1.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 1.0 ], [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.85, rgba[1] * 0.85, rgba[2] * 0.85, rgba[3]);

        // Left of cube
        drawTriangle3DUV([ 0.0, 0.0, 1.0,  0.0, 1.0, 0.0,  0.0, 0.0, 0.0 ], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([ 0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 0.0 ], [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

        // Bottom of cube
        drawTriangle3DUV([ 0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 0.0, 0.0 ], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([ 0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  1.0, 0.0, 1.0 ], [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Back of cube
        drawTriangle3DUV([ 1.0, 0.0, 1.0,  0.0, 1.0, 1.0,  0.0, 0.0, 1.0 ], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([ 1.0, 0.0, 1.0,  1.0, 1.0, 1.0,  0.0, 1.0, 1.0 ], [0,0, 0,1, 1,1]);
    }

    // Render this shape
    renderfast() {
        // Pass the position of a point to a_Position variable
        var rgba = this.color;

        // Pass the texture number
        // gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        var allverts=[];

        // Front of cube
        allverts = allverts.concat([ 0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0 ], [0,0, 1,1, 1,0]);
        allverts = allverts.concat([ 0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0 ], [0,0, 0,1, 1,1]);

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

        // Top of cube
        allverts = allverts.concat([ 0.0, 1.0, 0.0,  1.0, 1.0, 1.0,  1.0, 1.0, 0.0 ], [0,0, 1,1, 1,0]);
        allverts = allverts.concat([ 0.0, 1.0, 0.0,  0.0, 1.0, 1.0,  1.0, 1.0, 1.0 ], [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.85, rgba[1] * 0.85, rgba[2] * 0.85, rgba[3]);

        // Right of cube
        allverts = allverts.concat([ 1.0, 0.0, 0.0,  1.0, 1.0, 1.0,  1.0, 0.0, 1.0 ], [0,0, 1,1, 1,0]);
        allverts = allverts.concat([ 1.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 1.0 ], [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.85, rgba[1] * 0.85, rgba[2] * 0.85, rgba[3]);

        // Left of cube
        allverts = allverts.concat([ 0.0, 0.0, 1.0,  0.0, 1.0, 0.0,  0.0, 0.0, 0.0 ], [0,0, 1,1, 1,0]);
        allverts = allverts.concat([ 0.0, 0.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 0.0 ], [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

        // Bottom of cube
        allverts = allverts.concat([ 0.0, 0.0, 0.0,  1.0, 0.0, 1.0,  1.0, 0.0, 0.0 ], [0,0, 1,1, 1,0]);
        allverts = allverts.concat([ 0.0, 0.0, 0.0,  0.0, 0.0, 1.0,  1.0, 0.0, 1.0 ], [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Back of cube
        allverts = allverts.concat([ 1.0, 0.0, 1.0,  0.0, 1.0, 1.0,  0.0, 0.0, 1.0 ], [0,0, 1,1, 1,0]);
        allverts = allverts.concat([ 1.0, 0.0, 1.0,  1.0, 1.0, 1.0,  0.0, 1.0, 1.0 ], [0,0, 0,1, 1,1]);

        drawTriangle3D(allverts);
    }
}

