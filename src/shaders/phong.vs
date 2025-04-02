precision highp float;

attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uNormalMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uProjectionViewMatrix;

varying vec2 vTextureCoord;
varying vec3 vLighting;

void main() {
    gl_Position = uProjectionViewMatrix * uModelMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;

    vec3 ambientLight = vec3(0.2);
    vec3 directionalLightColor = vec3(1.0);
    vec3 directionalVector = normalize(vec3(0.85, 0.6, 0.75));

    vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

    float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);
}