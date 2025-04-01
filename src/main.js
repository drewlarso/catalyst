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
    catalyst.textures.load('debug', 'public/debug.png')
    catalyst.textures.load('inverted', 'public/inverted.png')

    objects.cube = catalyst.geometry.create('cube').setPosition(5, 0, 0)
    objects.plane = catalyst.geometry
        .createCustom('customPlane', {
            vertices: [0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0],
            indices: [0, 1, 2, 0, 2, 3],
            uvs: [0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
        })
        .setShader('textured')
        .setTexture('debug')
        .setScale(5, 5, 5)
        .setPosition(-5, -5, 0)
    objects.plane1 = catalyst.geometry
        .createCustom('customPlane', {
            vertices: [0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0],
            indices: [0, 1, 2, 0, 2, 3],
            uvs: [0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
        })
        .setShader('textured')
        .setTexture('inverted')
        .setScale(5, 5, 5)
        .setPosition(0, 0, 0)

    catalyst.camera.position = new Vector3(3, 3, 5)
}

debugScene.update = (dt) => {
    objects.cube.rotation.z += dt * 5
    objects.cube.position.z = Math.sin(objects.cube.rotation.z)
}

catalyst.start()
