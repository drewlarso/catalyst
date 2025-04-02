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
                case 'sphere':
                    data = createSphere()
                    break
                default:
                    throw new Error(`Geometry of type ${type} doesnt exist!`)
            }
            this.buffers[type] = this.createBuffers(data)
        }

        return new Entity(this.catalyst, type).setShader('default')
    }

    async createOBJ(key, url) {
        const data = await this.loadOBJ(url)
        this.buffers[key] = this.createBuffers(data)
        return new Entity(this.catalyst, key).setShader('default')
    }

    async loadOBJ(url) {
        const vertices = []
        const indices = []
        const uvs = []
        const normals = []

        const tempVertices = []
        const tempUVs = []
        const tempNormals = []

        const indexMap = {}

        try {
            const response = await fetch(url)
            const data = await response.text()

            const lines = data.split('\n')
            for (const line of lines) {
                const parts = line.trim().split(/\s+/)
                if (parts.length === 0) continue

                const type = parts[0]

                if (type === 'v') {
                    // Vertex positions
                    tempVertices.push([
                        parseFloat(parts[1]),
                        parseFloat(parts[2]),
                        parseFloat(parts[3]),
                    ])
                } else if (type === 'vt') {
                    // Texture coordinates
                    tempUVs.push([parseFloat(parts[1]), parseFloat(parts[2])])
                } else if (type === 'vn') {
                    // Vertex normals
                    tempNormals.push([
                        parseFloat(parts[1]),
                        parseFloat(parts[2]),
                        parseFloat(parts[3]),
                    ])
                } else if (type === 'f') {
                    // Faces
                    const faceVertices = []

                    for (let i = 1; i < parts.length; i++) {
                        const key = parts[i]
                        if (indexMap[key] === undefined) {
                            const indices = key.split('/')
                            const vertexIndex = parseInt(indices[0]) - 1
                            const uvIndex = indices[1]
                                ? parseInt(indices[1]) - 1
                                : -1
                            const normalIndex = indices[2]
                                ? parseInt(indices[2]) - 1
                                : -1

                            // Add vertex position
                            const vertex = tempVertices[vertexIndex]
                            vertices.push(...vertex)

                            // Add texture coordinates if available
                            if (uvIndex >= 0) {
                                const uv = tempUVs[uvIndex]
                                uvs.push(...uv)
                            }

                            // Add normals if available
                            if (normalIndex >= 0) {
                                const normal = tempNormals[normalIndex]
                                normals.push(...normal)
                            }

                            const newIndex = vertices.length / 3 - 1
                            indexMap[key] = newIndex
                            faceVertices.push(indexMap[key])
                        } else {
                            faceVertices.push(indexMap[key])
                        }
                    }

                    for (let i = 1; i < faceVertices.length - 1; i++) {
                        indices.push(
                            faceVertices[0],
                            faceVertices[i],
                            faceVertices[i + 1]
                        )
                    }
                }
            }

            return { vertices, indices, uvs, normals }
        } catch (error) {
            console.error('Error loading OBJ file:', error)
            throw error
        }
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

function createSphere(density = 16) {
    const vertices = []
    const normals = []
    const uvs = []
    const indices = []

    for (let y = 0; y <= density; y++) {
        const v = y / density
        const phi = v * Math.PI
        for (let x = 0; x <= density; x++) {
            const u = x / density
            const theta = u * 2 * Math.PI

            const vX = Math.cos(theta) * Math.sin(phi)
            const vY = Math.cos(phi)
            const vZ = Math.sin(theta) * Math.sin(phi)

            vertices.push(vX, vY, vZ)
            normals.push(vX, vY, vZ)
            uvs.push(u, v)
        }
    }

    for (let y = 0; y < density; y++) {
        for (let x = 0; x < density; x++) {
            const first = y * (density + 1) + x
            const second = first + density + 1

            indices.push(first, second, first + 1)
            indices.push(second, second + 1, first + 1)
        }
    }

    return { vertices, indices, uvs, normals }
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
