import Catalyst from './classes/Catalyst.js'
import Vector3 from './util.js'

const catalyst = new Catalyst()
const scene = {}

catalyst.load = async () => {
    await catalyst.shaders.load(
        'textured',
        'src/shaders/textured.vs',
        'src/shaders/textured.fs'
    )

    scene.cube = catalyst.geometry.create('cube').setPosition(1, 3, 5)
    scene.cube1 = catalyst.geometry.create('cube', 'textured')
    scene.triangle2 = catalyst.geometry.create('triangle').setPosition(5, -3, 3)

    catalyst.camera.position = new Vector3(10, 3, 5)
}

catalyst.update = (dt) => {
    scene.cube1.rotation.x += dt
    scene.cube1.rotation.y += dt
    scene.cube1.rotation.z += dt
}

catalyst.draw = () => {
    for (const obj in scene) if (scene[obj].draw) scene[obj].draw()
}

catalyst.start()
