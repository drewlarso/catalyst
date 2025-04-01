precision highp float;

uniform sampler2D uSampler;

varying vec2 vTextureCoord;
varying vec3 vLighting;

void main() {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
    gl_FragColor = vec4(gl_FragColor.rgb * vLighting, gl_FragColor.a);
}