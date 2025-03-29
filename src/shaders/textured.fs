precision mediump float;

varying vec2 vTextureCoord;

void main() {
    gl_FragColor = vec4(vTextureCoord.xyx, 1.0);
}