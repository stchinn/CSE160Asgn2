class Cone{
    constructor(){
        this.type='cone';
        this.color = [239/255, 239/255, 240/255, 1.0];
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

        let [x, y] = [0.0, 0.0];
        let size = 10.0;
        var d = size / 200.0;

        let v = [];
        let segments = 30;
        let angleStep = 360 / segments;
        let height = 0.2;
        
        for (var angle = 0; angle < 360; angle=angle+angleStep) {
            let centerPt = [x, y];
            let angle1=angle;
            let angle2=angle+angleStep;
            let vec1=[Math.cos(angle1*Math.PI/180)*d, Math.sin(angle1*Math.PI/180)*d];
            let vec2=[Math.cos(angle2*Math.PI/180)*d, Math.sin(angle2*Math.PI/180)*d];
            let pt1 = [centerPt[0]+vec1[0], centerPt[1]+vec1[1]];
            let pt2 = [centerPt[0]+vec2[0], centerPt[1]+vec2[1]];

            v.push([x, 0, y, pt1[0], 0, pt1[1], pt2[0], 0, pt2[1]]);
            v.push([x, height, y, pt1[0], 0, pt1[1], pt2[0], 0, pt2[1]]);
        }
        this.vertices = new Float32Array(v.length);

        for (var i = 0; i < v.length; i++) {
            drawTriangle3D(v[i]);
        }
    }
}

