precision mediump float;

varying vec2 vTextureCoord;

void main() {
    gl_FragColor = vec4(vTextureCoord.xy, 1.0, 1.0);
}