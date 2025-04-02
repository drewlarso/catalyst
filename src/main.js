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
    catalyst.textures.load('meowth', 'public/meowth.png')

    // objects.sphere = catalyst.geometry
    //     .create('sphere')
    //     .setShader('phong')
    //     .setLighted(true)
    //     .setTexture('inverted')

    objects.meowth = (
        await catalyst.geometry.createOBJ('meowth', 'public/meowth.obj')
    )
        .setTexture('cipher')
        .setShader('phong')
        .setLighted(true)
        .setScale(0.25, 0.25, 0.25)
        .setPosition(0, 0, 0)
        .setRotation(Math.PI / 2, 0, 0)

    catalyst.camera.position = new Vector3(3, -3, 3)
}

debugScene.update = (dt) => {
    objects.meowth.rotation.y += dt
}

catalyst.start()
