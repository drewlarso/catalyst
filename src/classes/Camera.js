import Vector3 from '../util.js'

export default class Camera {
    constructor(catalyst) {
        this.catalyst = catalyst
        this.position = new Vector3(0, 0, 0)
        this.lookAt = new Vector3(0, 0, 0)
        this.upDirection = new Vector3(0, 0, 1)
    }

    update(dt) {
        const projectionViewMatrix = mat4.create()
        mat4.perspective(
            projectionViewMatrix,
            Math.PI / 2,
            this.catalyst.canvas.width / this.catalyst.canvas.height,
            0.1,
            100
        )

        const lookAtMatrix = mat4.create()
        mat4.lookAt(
            lookAtMatrix,
            this.position.asArray(),
            this.lookAt.asArray(),
            this.upDirection.asArray()
        )
        mat4.multiply(projectionViewMatrix, projectionViewMatrix, lookAtMatrix)

        this.catalyst.gl.uniformMatrix4fv(
            this.catalyst.gl.getUniformLocation(
                this.catalyst.shaders.activeShader,
                'uProjectionViewMatrix'
            ),
            false,
            projectionViewMatrix
        )
    }
}
