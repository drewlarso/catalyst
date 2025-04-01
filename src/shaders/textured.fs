precision mediump float;

uniform sampler2D uSampler;

varying vec2 vTextureCoord;

void main() {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
    // gl_FragColor = vec4(vTextureCoord.xyx, 1.0);
}