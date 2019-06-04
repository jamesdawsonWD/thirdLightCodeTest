export class Vector {
    constructor(
        public x: number,
        public y: number) {
        this.x = x || 0;
        this.y = y || 0;
    }

    public set(x: number, y: number) {
        this.x = x || 0;
        this.y = y || 0;
        return this;
    };
    public add(v: Vector): Vector {
        this.x += v.x;
        this.y += v.y;
        return this;
    };
    public sub(v: Vector): Vector {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    };
    public scale(s: number): Vector {
        this.x *= s;
        this.y *= s;
        return this;
    };
    public length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    public lengthSq() {
        return this.x * this.x + this.y * this.y;
    };
    public normalise(): Vector {
        const m = Math.sqrt(this.x * this.x + this.y * this.y);
        if (m) {
            this.x /= m;
            this.y /= m;
        }
        return this;
    };
    public angle() {
        return Math.atan2(this.y, this.x);
    };
    public angleTo(v: Vector) {
        const dx = v.x - this.x,
            dy = v.y - this.y;
        return Math.atan2(dy, dx);
    };
    public distanceTo(v: Vector) {
        const dx = v.x - this.x,
            dy = v.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    public distanceSq(v: Vector) {
        const dx = v.x - this.x,
            dy = v.y - this.y;
        return dx * dx + dy * dy;
    };
    public lerp(v: Vector, t: number): Vector {
        this.x += (v.x - this.x) * t;
        this.y += (v.y - this.y) * t;
        return this;
    };
    public clone(): Vector {
        return new Vector(this.x, this.y);
    }
    public toString(): string {
        return '(x:' + this.x + ', y:' + this.y + ')';
    }
}
