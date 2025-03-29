export default class Shaders {
    constructor(catalyst) {
        this.gl = catalyst.gl
        this.shaders = {}
        this.activeShader = null
    }

    async load(name, vsURL, fsURL) {
        const vsSource = await (await fetch(vsURL)).text()
        const fsSource = await (await fetch(fsURL)).text()

        const program = this.initShaderProgram(vsSource, fsSource)
        this.shaders[name] = program
    }

    use(name) {
        if (!this.shaders[name])
            throw new Error(`Shader ${name} does not exist!`)

        this.activeShader = this.shaders[name]
        this.gl.useProgram(this.activeShader)
    }

    initShaderProgram(vsSource, fsSource) {
        const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource)
        const fragmentShader = this.loadShader(
            this.gl.FRAGMENT_SHADER,
            fsSource
        )

        const shaderProgram = this.gl.createProgram()
        this.gl.attachShader(shaderProgram, vertexShader)
        this.gl.attachShader(shaderProgram, fragmentShader)
        this.gl.linkProgram(shaderProgram)

        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS))
            throw new Error(
                `Unable to init shader program: ${this.gl.getProgramInfoLog(
                    shaderProgram
                )}`
            )

        return shaderProgram
    }

    loadShader(type, source) {
        const shader = this.gl.createShader(type)
        this.gl.shaderSource(shader, source)
        this.gl.compileShader(shader)
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            throw new Error(
                `Error when compiling shaders: ${this.gl.getShaderInfoLog(
                    shader
                )}`
            )
        }
        return shader
    }
}
