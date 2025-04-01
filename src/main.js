import Catalyst from './classes/Catalyst.js'
import Scene from './classes/Scene.js'
import Vector3 from './util.js'

const catalyst = new Catalyst()
const debugScene = new Scene(catalyst)
catalyst.scene = debugScene

const objects = debugScene.objects

debugScene.load = async () => {
    await catalyst.shaders.load(
        'textured',
        'src/shaders/textured.vs',
        'src/shaders/textured.fs'
    )

    objects.cube = catalyst.geometry.create('cube')
    console.log(objects)

    catalyst.camera.position = new Vector3(10, 3, 5)
}

debugScene.update = (dt) => {
    objects.cube.rotation.z += dt * 5
    objects.cube.position.z = Math.sin(objects.cube.rotation.z)
}

catalyst.start()
