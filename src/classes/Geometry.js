import Entity from './Entity.js'

export default class Geometry {
    constructor(catalyst) {
        this.catalyst = catalyst

        this.buffers = {}
    }

    create(type) {
        if (!this.buffers[type]) {
            let data
            switch (type) {
                case 'cube':
                    data = createCube()
                    break
                case 'triangle':
                    data = createTriangle()
                    break
                default:
                    throw new Error(`Geometry of type ${type} doesnt exist!`)
            }
            this.buffers[type] = this.createBuffers(data)
        }

        return new Entity(this.catalyst, type).setShader('default')
    }

    createCustom(name, data) {
        this.buffers[name] = this.createBuffers(data)
        return new Entity(this.catalyst, name).setShader('default')
    }

    createBuffers(data) {
        const gl = this.catalyst.gl

        const vertexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(data.vertices),
            gl.STATIC_DRAW
        )

        const indexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(data.indices),
            gl.STATIC_DRAW
        )

        let uvBuffer = undefined
        if (data.uvs) {
            uvBuffer = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer)
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array(data.uvs),
                gl.STATIC_DRAW
            )
        }

        let normalBuffer = undefined
        if (data.normals) {
            normalBuffer = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array(data.normals),
                gl.STATIC_DRAW
            )
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, null)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

        return {
            vertexBuffer,
            indexBuffer,
            uvBuffer,
            normalBuffer,
            vertexCount: data.indices.length,
        }
    }
}

function createCube() {
    return {
        vertices: [
            // Front face
            -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
            // Back face
            -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
            // Top face
            -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
            // Bottom face
            -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
            // Right face
            1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
            // Left face
            -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
        ],
        indices: [
            0,
            1,
            2,
            0,
            2,
            3, // front
            4,
            5,
            6,
            4,
            6,
            7, // back
            8,
            9,
            10,
            8,
            10,
            11, // top
            12,
            13,
            14,
            12,
            14,
            15, // bottom
            16,
            17,
            18,
            16,
            18,
            19, // right
            20,
            21,
            22,
            20,
            22,
            23, // left
        ],
        uvs: [
            // Front
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            // Back
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            // Top
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            // Bottom
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            // Right
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            // Left
            0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        ],
        normals: [
            // Front
            0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
            // Back
            0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
            // Top
            0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
            // Bottom
            0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
            // Right
            1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
            // Left
            -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        ],
    }
}

function createTriangle() {
    return {
        vertices: [-1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 0.0, 1.0, 0.0],
        indices: [0, 1, 2],
    }
}
