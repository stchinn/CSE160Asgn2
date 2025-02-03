class Pyramid{
    constructor(){
        this.type='pyramid';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        //this.size = 5.0;
        //this.segments = 10;
        this.matrix = new Matrix4();
    }

    // Render this shape
    render() {
        // Pass the position of a point to a_Position variable
        var rgba = this.color;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Bottom of pyramid
        drawTriangle3D([ 0.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1/2, 0.0, Math.sqrt(3) / 2.0 ]);

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

        // Side1 of pyramid
        drawTriangle3D([ 0.0, 2.0, 0.0,  1.0, 0.0, 0.0,  1/2, 0.0, Math.sqrt(3) / 2.0 ]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.85, rgba[1] * 0.85, rgba[2] * 0.85, rgba[3]);

        // Side2 of pyramid
        drawTriangle3D([ 0.0, 2.0, 0.0,  0.0, 0.0, 0.0,  1/2, 0.0, Math.sqrt(3) / 2.0 ]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.85, rgba[1] * 0.85, rgba[2] * 0.85, rgba[3]);

        // Side3 of pyramid
        drawTriangle3D([ 0.0, 2.0, 0.0,  0.0, 0.0, 0.0,  1.0, 0.0, 0.0 ]);
    }
}

