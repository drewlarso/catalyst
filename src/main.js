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
    catalyst.textures.load('spamton', 'public/spamton.png')

    // objects.sphere = catalyst.geometry
    //     .create('sphere')
    //     .setShader('phong')
    //     .setLighted(true)
    //     .setTexture('inverted')

    objects.spamton = (
        await catalyst.geometry.createGLTF(
            'spamton',
            'public/spamton_idle.gltf'
        )
    )
        .setShader('phong')
        .setLighted(true)
        .setTexture('spamton')
        .setRotation(Math.PI / 2, 0, 0)
        .setScale(2, 2, 2)
        .setPosition(0, 0, -2)

    catalyst.camera.position = new Vector3(3, -3, 2)
}

debugScene.update = (dt) => {
    objects.spamton.rotation.y += dt
}

catalyst.start()
