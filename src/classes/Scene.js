export default class Scene {
    constructor(catalyst) {
        this.catalyst = catalyst

        this.objects = {}
    }

    async load() {}

    update(dt) {}

    draw() {
        for (const obj in this.objects)
            if (this.objects[obj].draw) this.objects[obj].draw()
    }

    add(obj) {
        this.objects.push(obj)
    }
}
