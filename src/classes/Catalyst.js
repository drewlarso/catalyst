import Camera from './Camera.js'
import Geometry from './Geometry.js'
import Scene from './Scene.js'
import Shaders from './Shaders.js'
import Textures from './Textures.js'

export default class Catalyst {
    constructor() {
        this.canvas = document.querySelector('canvas')
        this.gl = this.canvas.getContext('webgl')
        if (!this.gl) throw new Error("WebGL couldn't be loaded!")
        this.gl.enable(this.gl.DEPTH_TEST)
        this.gl.depthFunc(this.gl.LESS)

        this.shaders = new Shaders(this)
        this.geometry = new Geometry(this)
        this.textures = new Textures(this)
        this.camera = new Camera(this)
        this.scene = new Scene(this)

        this.load = async () => {}
        this.update = (dt) => {}
        this.draw = () => {}
    }

    async start() {
        this.gl.clearColor(0.2, 0.1, 0.4, 1.0)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
        addEventListener('resize', this.resize.bind(this))
        this.resize()

        await this.shaders.load(
            'default',
            'src/shaders/debug.vs',
            'src/shaders/debug.fs'
        )
        this.shaders.use('default')

        await this.scene.load()
        this.render()
    }

    resize() {
        this.canvas.width = this.canvas.clientWidth
        this.canvas.height = this.canvas.clientHeight
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    }

    render() {
        let previous = 0
        const renderLoop = (timestamp) => {
            const dt = (timestamp - previous) / 1000
            previous = timestamp

            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
            this.scene.update(dt)
            this.scene.draw()

            requestAnimationFrame(renderLoop)
        }
        requestAnimationFrame(renderLoop)
    }
}
