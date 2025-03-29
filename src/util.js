export default class Vector3 {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }

    add(other) {
        return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z)
    }

    asArray() {
        return [this.x, this.y, this.z]
    }
}
