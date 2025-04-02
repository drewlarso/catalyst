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
    catalyst.textures.load('skybox', 'public/skybox.png')
    catalyst.textures.load('mimikyu', 'public/mimikyu.png')
    catalyst.textures.load('thwomp', 'public/thwomp.png')
    catalyst.textures.load('insect', 'public/insect.png')

    objects.skybox = (
        await catalyst.geometry.createGLTF('skybox', 'public/skybox.gltf')
    )
        .setShader('textured')
        .setTexture('skybox')
        .setRotation(Math.PI / 2, 0, 0)

    objects.mimikyu = (
        await catalyst.geometry.createGLTF('mimikyu', 'public/mimikyu.gltf')
    )
        .setShader('phong')
        .setLighted(true)
        .setTexture('mimikyu')
        .setRotation(0, Math.PI, 0)
        .setScale(0.75, 0.75, 0.75)

    objects.thwomp = (
        await catalyst.geometry.createGLTF('thwomp', 'public/thwomp.gltf')
    )
        .setShader('phong')
        .setLighted(true)
        .setTexture('thwomp')
        .setRotation(0, Math.PI, 0)
        .setScale(0.75, 0.75, 0.75)
        .setPosition(8, -15, 0)

    objects.insect = (
        await catalyst.geometry.createGLTF('insect', 'public/insect.gltf')
    )
        .setShader('phong')
        .setLighted(true)
        .setTexture('insect')
        .setRotation(0, Math.PI, Math.PI / 2)
        .setScale(2, 2, 2)
        .setPosition(-10, 5, 0)

    catalyst.camera.position = new Vector3(8, 10, 8)
    catalyst.camera.lookAt = new Vector3(0, 0, 4)
}

debugScene.update = (dt) => {
    objects.mimikyu.rotation.z += dt
    objects.thwomp.position.z = Math.sin(objects.mimikyu.rotation.z * 2)
    objects.thwomp.rotation.z -= dt / 2
}

catalyst.start()
