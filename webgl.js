/* Practice in Webgl
 * Dec. 30, 2013
 * Lesson from nettuts.com google it.
 */

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
    }
};
