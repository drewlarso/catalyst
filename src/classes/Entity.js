import Vector3 from '../util.js'

export default class Entity {
    constructor(catalyst, type) {
        this.catalyst = catalyst
        this.type = type
        this.position = new Vector3(0, 0, 0)
        this.rotation = new Vector3(0, 0, 0)
        this.scale = new Vector3(1, 1, 1)

        this.modelMatrix = mat4.create()
        this.texture = null
        this.lighted = false
    }

    setLighted(value) {
        this.lighted = value
        return this
    }

    setShader(key) {
        this.shader = key
        return this
    }

    setTexture(key) {
        this.texture = this.catalyst.textures.textures.get(key)
        return this
    }

    setPosition(x = undefined, y = undefined, z = undefined) {
        if (x !== undefined) this.position.x = x
        if (y !== undefined) this.position.y = y
        if (z !== undefined) this.position.z = z

        return this
    }
    setScale(x = undefined, y = undefined, z = undefined) {
        if (x !== undefined) this.scale.x = x
        if (y !== undefined) this.scale.y = y
        if (z !== undefined) this.scale.z = z

        return this
    }
    setRotation(x = undefined, y = undefined, z = undefined) {
        if (x !== undefined) this.rotation.x = x
        if (y !== undefined) this.rotation.y = y
        if (z !== undefined) this.rotation.z = z

        return this
    }

    draw() {
        this.catalyst.shaders.use(this.shader)
        const buffers = this.catalyst.geometry.buffers[this.type]

        this.setUniforms()
        this.setBuffers()

        if (this.texture) {
            this.catalyst.gl.activeTexture(this.catalyst.gl.TEXTURE0)
            this.catalyst.gl.bindTexture(
                this.catalyst.gl.TEXTURE_2D,
                this.texture
            )
            const samplerLocation = this.catalyst.gl.getUniformLocation(
                this.catalyst.shaders.activeShader,
                'uSampler'
            )
            this.catalyst.gl.uniform1i(samplerLocation, 0)
        }

        if (buffers.indexBuffer) {
            this.catalyst.gl.bindBuffer(
                this.catalyst.gl.ELEMENT_ARRAY_BUFFER,
                buffers.indexBuffer
            )
            this.catalyst.gl.drawElements(
                this.catalyst.gl.TRIANGLES,
                buffers.vertexCount,
                this.catalyst.gl.UNSIGNED_SHORT,
                0
            )
        } else {
            this.catalyst.gl.drawArrays(
                this.catalyst.gl.TRIANGLES,
                0,
                buffers.vertexBuffer.length / 3
            )
        }
    }

    setUniforms() {
        mat4.identity(this.modelMatrix)
        mat4.translate(this.modelMatrix, this.modelMatrix, [
            this.position.x,
            this.position.y,
            this.position.z,
        ])
        mat4.rotateX(this.modelMatrix, this.modelMatrix, this.rotation.x)
        mat4.rotateY(this.modelMatrix, this.modelMatrix, this.rotation.y)
        mat4.rotateZ(this.modelMatrix, this.modelMatrix, this.rotation.z)
        mat4.scale(this.modelMatrix, this.modelMatrix, [
            this.scale.x,
            this.scale.y,
            this.scale.z,
        ])

        const modelMatrixLocation = this.catalyst.gl.getUniformLocation(
            this.catalyst.shaders.activeShader,
            'uModelMatrix'
        )
        this.catalyst.gl.uniformMatrix4fv(
            modelMatrixLocation,
            false,
            this.modelMatrix
        )

        if (this.lighted) {
            const normalMatrix = mat4.create()
            mat4.invert(normalMatrix, this.modelMatrix)
            mat4.transpose(normalMatrix, normalMatrix)
            const normalMatrixLocation = this.catalyst.gl.getUniformLocation(
                this.catalyst.shaders.activeShader,
                'uNormalMatrix'
            )
            this.catalyst.gl.uniformMatrix4fv(
                normalMatrixLocation,
                false,
                normalMatrix
            )
        }

        this.catalyst.camera.update()
    }

    setBuffers() {
        const buffers = this.catalyst.geometry.buffers[this.type]

        if (buffers.vertexBuffer) {
            this.catalyst.gl.bindBuffer(
                this.catalyst.gl.ARRAY_BUFFER,
                buffers.vertexBuffer
            )

            this.enableAttribute('aVertexPosition', 3, this.catalyst.gl.FLOAT)
        }

        if (buffers.indexBuffer) {
            this.catalyst.gl.bindBuffer(
                this.catalyst.gl.ELEMENT_ARRAY_BUFFER,
                buffers.indexBuffer
            )
        }

        if (buffers.uvBuffer) {
            this.catalyst.gl.bindBuffer(
                this.catalyst.gl.ARRAY_BUFFER,
                buffers.uvBuffer
            )
            this.enableAttribute('aTextureCoord', 2, this.catalyst.gl.FLOAT)
        }

        if (this.lighted) {
            if (buffers.normalBuffer) {
                this.catalyst.gl.bindBuffer(
                    this.catalyst.gl.ARRAY_BUFFER,
                    buffers.normalBuffer
                )

                this.enableAttribute('aVertexNormal', 3, this.catalyst.gl.FLOAT)
            }
        }
    }

    enableAttribute(name, elements, type) {
        const location = this.catalyst.gl.getAttribLocation(
            this.catalyst.shaders.activeShader,
            name
        )
        this.catalyst.gl.vertexAttribPointer(
            location,
            elements,
            type,
            this.catalyst.gl.FALSE,
            0,
            0
        )
        this.catalyst.gl.enableVertexAttribArray(location)
    }
}
