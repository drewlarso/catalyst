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

    async createGLTF(key, url) {
        const data = await this.loadGLTF(url)
        this.buffers[key] = this.createBuffers(data)
        return new Entity(this.catalyst, key).setShader('default')
    }

    async loadGLTF(url) {
        try {
            const response = await fetch(url)
            const data = await response.json()
            const buffers = await this.parseGLTFBuffers(data)
            const meshData = this.parseMeshes(data, buffers)
            return meshData
        } catch (error) {
            throw error
        }
    }

    async parseGLTFBuffers(data) {
        const buffers = await Promise.all(
            data.buffers.map(async (buffer) => {
                const response = await fetch(`public/${buffer.uri}`)
                const arrayBuffer = await response.arrayBuffer()
                return arrayBuffer
            })
        )

        return buffers
    }

    parseMeshes(gltf, buffers) {
        const bufferViews = gltf.bufferViews || []
        const accessors = gltf.accessors || []
        const meshes = []

        gltf.meshes.forEach((mesh) => {
            mesh.primitives.forEach((primitive) => {
                const vertices = this.extractAccessorData(
                    accessors[primitive.attributes.POSITION],
                    3,
                    buffers,
                    bufferViews
                )

                const indices =
                    primitive.indices !== undefined
                        ? this.extractAccessorData(
                              accessors[primitive.indices],
                              1,
                              buffers,
                              bufferViews
                          )
                        : []

                const uvs =
                    primitive.attributes.TEXCOORD_0 !== undefined
                        ? this.extractAccessorData(
                              accessors[primitive.attributes.TEXCOORD_0],
                              2,
                              buffers,
                              bufferViews
                          )
                        : []

                const normals =
                    primitive.attributes.NORMAL !== undefined
                        ? this.extractAccessorData(
                              accessors[primitive.attributes.NORMAL],
                              3,
                              buffers,
                              bufferViews
                          )
                        : []

                meshes.push({ vertices, indices, uvs, normals })
            })
        })

        const combinedMesh = meshes.reduce(
            (acc, mesh) => {
                acc.vertices.push(...mesh.vertices)
                acc.indices.push(
                    ...mesh.indices.map((i) => i + acc.vertexOffset)
                )
                acc.uvs.push(...mesh.uvs)
                acc.normals.push(...mesh.normals)
                acc.vertexOffset += mesh.vertices.length / 3
                return acc
            },
            { vertices: [], indices: [], uvs: [], normals: [], vertexOffset: 0 }
        )

        return {
            vertices: combinedMesh.vertices,
            indices: combinedMesh.indices,
            uvs: combinedMesh.uvs,
            normals: combinedMesh.normals,
        }
    }

    extractAccessorData(accessor, components, buffers, bufferViews) {
        const bufferView = bufferViews[accessor.bufferView]
        const buffer = buffers[bufferView.buffer]
        const byteOffset =
            (bufferView.byteOffset || 0) + (accessor.byteOffset || 0)

        let typedArray
        switch (accessor.componentType) {
            case 5120:
                typedArray = Int8Array
                break
            case 5121:
                typedArray = Uint8Array
                break
            case 5122:
                typedArray = Int16Array
                break
            case 5123:
                typedArray = Uint16Array
                break
            case 5125:
                typedArray = Uint32Array
                break
            case 5126:
                typedArray = Float32Array
                break
            default:
                throw new Error('Unsupported component type')
        }

        const dataView = new typedArray(
            buffer,
            byteOffset,
            accessor.count * components
        )

        return Array.from(dataView)
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
