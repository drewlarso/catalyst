export default class Textures {
    constructor(catalyst) {
        this.catalyst = catalyst
        this.gl = catalyst.gl
        this.shaderProgram = catalyst.shaders.activeShader

        this.textures = new Map()
    }

    load(key, url) {
        const texture = this.gl.createTexture()
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture)

        const level = 0
        const internalFormat = this.gl.RGBA
        const width = 1
        const height = 1
        const border = 0
        const srcFormat = this.gl.RGBA
        const srcType = this.gl.UNSIGNED_BYTE
        const pixel = new Uint8Array([0, 0, 255, 255])
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            level,
            internalFormat,
            width,
            height,
            border,
            srcFormat,
            srcType,
            pixel
        )

        const image = new Image()
        image.onload = () => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
            this.gl.texImage2D(
                this.gl.TEXTURE_2D,
                level,
                internalFormat,
                srcFormat,
                srcType,
                image
            )

            if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
                this.gl.generateMipmap(this.gl.TEXTURE_2D)
            } else {
                this.gl.texParameteri(
                    this.gl.TEXTURE_2D,
                    this.gl.TEXTURE_WRAP_S,
                    this.gl.CLAMP_TO_EDGE
                )
                this.gl.texParameteri(
                    this.gl.TEXTURE_2D,
                    this.gl.TEXTURE_WRAP_T,
                    this.gl.CLAMP_TO_EDGE
                )
                this.gl.texParameteri(
                    this.gl.TEXTURE_2D,
                    this.gl.TEXTURE_MIN_FILTER,
                    this.gl.LINEAR
                )
            }
        }
        image.src = url

        this.textures.set(key, texture)
    }

    isPowerOf2(value) {
        return (value & (value - 1)) === 0
    }
}
