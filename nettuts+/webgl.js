/* Practice in Webgl
 * Dec. 30, 2013
 * Lesson from nettuts.com google it.
 */

// Global variable, webgl holder
var GL;

var Texture;    // Our finished texture
var TextureImage;   // hold the texture image

function Ready(){
    GL = new WebGL("GLCanvas", "FragmentShader", "VertexShader");
    TextureImage = new Image();
    TextureImage.onload = function() {
        Texture = GL.LoadTextures(TextureImage);
        // GL.Draw(Cube, Texture);
        setInterval(Update, 33);
    };
    TextureImage.src = "Texture.jpg";
};

function Update() {
    GL.GL.clear(16384 | 256);
    GL.Draw(Cube, Texture);
};

function WebGL(CID, FSID, VSID) {
    var canvas = document.getElementById(CID);
    if (!canvas.getContext("webgl") && !canvas.getContext("experimental-webgl")) {
        alert("Your Browser Does not support WebGL");
    }
    else {
        this.GL = (canvas.getContext("webgl")) ? canvas.getContext("webgl") : canvas.getContext("experimental-webgl");
        this.GL.clearColor(1.0, 1.0, 1.0, 1.0); // this is the color
        this.GL.enable(this.GL.DEPTH_TEST);     // enable depth testing
        this.GL.depthFunc(this.GL.LEQUAL);      // set perspective view
        this.AspectRatio = canvas.width / canvas.height;

        // Then, load shaders here
        var FShader = document.getElementById(FSID);
        var VShader = document.getElementById(VSID);

        if (!FShader || !VShader) {
            alert("Error, Could not find Shaders");
        }
        else {
            // Load and compile the fragment shader
            var Code = LoadShader(FShader);
            FShader = this.GL.createShader(this.GL.FRAGMENT_SHADER);
            this.GL.shaderSource(FShader, Code);
            this.GL.compileShader(FShader);

            // Load and compile vertex shader
            Code = LoadShader(VShader);
            VShader = this.GL.createShader(this.GL.VERTEX_SHADER);
            this.GL.shaderSource(VShader, Code);
            this.GL.compileShader(VShader);

            // Create the Shader Program
            this.ShaderProgram = this.GL.createProgram();
            this.GL.attachShader(this.ShaderProgram, FShader);
            this.GL.attachShader(this.ShaderProgram, VShader);
            this.GL.linkProgram(this.ShaderProgram);
            this.GL.useProgram(this.ShaderProgram);

            // Link vertex position Attribute from Shader
            this.VertexPosition = this.GL.getAttribLocation(this.ShaderProgram, "VertexPosition");
            this.GL.enableVertexAttribArray(this.VertexPosition);

            // Link Texture Coordinate attribute from shader
            this.VertexTexture = this.GL.getAttribLocation(this.ShaderProgram, "TextureCoord");
            this.GL.enableVertexAttribArray(this.VertexTexture);

        }
        this.Draw = function(Object, Texture) {
            var VertexBuffer = this.GL.createBuffer();  // creates a new buffer

            // Bind it as the current buffer
            this.GL.bindBuffer(this.GL.ARRAY_BUFFER, VertexBuffer);

            // Fill it with data
            this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(Object.Vertices), this.GL.STATIC_DRAW);

            // Connect Buffer to shader's attributes
            this.GL.vertexAttribPointer(this.VertexPosition, 3, this.GL.FLOAT, false, 0, 0);

            // Repeat for the next two
            var TextureBuffer = this.GL.createBuffer();
            this.GL.bindBuffer(this.GL.ARRAY_BUFFER, TextureBuffer);
            this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(Object.Texture), this.GL.STATIC_DRAW);
            this.GL.vertexAttribPointer(this.VertexTexture, 2, this.GL.FLOAT, false, 0, 0);

            var TriangleBuffer = this.GL.createBuffer();
            this.GL.bindBuffer(this.GL.ELEMENT_ARRAY_BUFFER, TriangleBuffer);
            this.GL.bufferData(this.GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(Object.Triangles), this.GL.STATIC_DRAW);
            // Generate the perspective matrix
            var PerspectiveMatrix = MakePerspective(45, this.AspectRatio, 1, 10000.0);

            var TransformationMatrix = MakeTransform(Object);

            // Set Slot 0, as the active texture
            this.GL.activeTexture(this.GL.TEXTURE0);

            // Load in the Texture in memory
            this.GL.bindTexture(this.GL.TEXTURE_2D, Texture);

            // Update the Texture Sampler in the fragment shader to use slot 0
            this.GL.uniform1i(this.GL.getUniformLocation(this.ShaderProgram, "uSampler"), 0);

            // Set the perspective and the Transformation matrices
            var pmatrix = this.GL.getUniformLocation(this.ShaderProgram, "PerspectiveMatrix");
            this.GL.uniformMatrix4fv(pmatrix, false, new Float32Array(PerspectiveMatrix));

            var tmatrix = this.GL.getUniformLocation(this.ShaderProgram, "TransformationMatrix");
            this.GL.uniformMatrix4fv(tmatrix, false, new Float32Array(TransformationMatrix));

            // Draw the triangles
            this.GL.drawElements(this.GL.TRIANGLES, Object.Triangles.length, this.GL.UNSIGNED_SHORT, 0);
        };

        this.LoadTextures = function(image) {
            // Create a new texture and assign it as the active one
            var tempTexture = this.GL.createTexture();
            this.GL.bindTexture(this.GL.TEXTURE_2D, tempTexture);
            this.GL.pixelStorei(this.GL.UNPACK_FLIP_Y_WEBGL, true); // Optional
            // Load in the image
            this.GL.texImage2D(this.GL.TEXTURE_2D, 0, this.GL.RGBA, this.GL.RGBA, this.GL.UNSIGNED_BYTE, image);

            // Setup Scaling Properties
            this.GL.texParameteri(this.GL.TEXTURE_2D, this.TEXTURE_MAG_FILTER, this.GL.LINEAR);
            this.GL.texParameteri(this.GL.TEXTURE_2D, this.TEXTURE_MIN_FILTER, this.GL.LINEAR_MIPMAP_NEAREST);
            this.GL.generateMipmap(this.GL.TEXTURE_2D);

            // Unbind the texture and return it
            this.GL.bindTexture(this.GL.TEXTURE_2D, null);
            return tempTexture;
        };
    }
};

function LoadShader(Script) {
    var Code = "";
    var currentChild = Script.firstChild;

    while(currentChild) {
        if (currentChild.nodeType == currentChild.TEXT_NODE) {
            Code += currentChild.textContent;
        }
        currentChild = currentChild.nextSibling;
    }

    return Code;
};

function MakePerspective(FOV, AspectRatio, Closest, Farthest) {
    var YLimit = Closest * Math.tan(FOV * Math.PI/360);
    var A = -(Farthest + Closest) / (Farthest - Closest);
    var B = -2 * Farthest * Closest / (Farthest - Closest);
    var C = (2 * Closest) / ((YLimit * AspectRatio) * 2);
    var D = (2 * Closest) / (YLimit * 2);

    return [
        C,0,0,0,
        0,D,0,0,
        0,0,A,-1,
        0,0,B,0
    ];
};

function MakeTransform(Object) {
    var y = Object.Rotation * (Math.PI / 180.0);
	var A = Math.cos(y);
	var B = -1 * Math.sin(y);
	var C = Math.sin(y);
	var D = Math.cos(y);
	Object.Rotation += .3;
    return [
        A, 0, B, 0,
        0, 1, 0, 0,
        C, 0, D, 0,
        0, 0, -6, 1
    ];
};
