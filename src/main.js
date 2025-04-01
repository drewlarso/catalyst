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
    await catalyst.shaders.load(
        'phong',
        'src/shaders/phong.vs',
        'src/shaders/phong.fs'
    )

    catalyst.textures.load('debug', 'public/debug.png')
    catalyst.textures.load('inverted', 'public/inverted.png')

    objects.cube = catalyst.geometry
        .create('cube')
        .setShader('phong')
        .setLighted(true)
        .setTexture('debug')
    objects.cube1 = catalyst.geometry
        .create('cube')
        .setShader('phong')
        .setLighted(true)
        .setTexture('inverted')
        .setPosition(1, -1, 1)
        .setScale(2, 1.1, 1.5)
    // objects.plane = catalyst.geometry
    //     .createCustom('customPlane', {
    //         vertices: [0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0],
    //         indices: [0, 1, 2, 0, 2, 3],
    //         uvs: [0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
    //     })
    //     .setShader('textured')
    //     .setTexture('debug')
    //     .setScale(5, 5, 5)
    //     .setPosition(-5, -5, 0)

    catalyst.camera.position = new Vector3(3, 3, 3)
}

debugScene.update = (dt) => {
    objects.cube.rotation.z += dt
    objects.cube.position.z = Math.sin(objects.cube.rotation.z)
}

catalyst.start()
