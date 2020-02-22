import * as BABYLON from 'babylonjs';

class Mandelbulb {
    private size: number;
    private n_iter: number;
    private m: number;
    private threshold: number = 1000**30;

    constructor(size: number, n_iter: number, m: number) {
        this.size = size;
        this.n_iter = n_iter;
        this.m = m;
    }

    do_mandelbulb(c: BABYLON.Vector3): boolean {
        let v = c.clone();
        for (let i = 0; i < this.n_iter; i++) {
            const r = v.length();
            const phi = Math.atan2(v.y, v.x);
            const theta = Math.atan2(Math.sqrt(v.x**2 + v.y**2), v.z);
            const vr = Math.pow(r, this.m);
            const vx = Math.sin(this.m * theta) * Math.cos(this.m * phi);
            const vy = Math.sin(this.m * theta) * Math.sin(this.m * phi);
            const vz = Math.cos(this.m * theta);
            v = (new BABYLON.Vector3(vx * vr, vy * vr, vz * vr)).add(c);
            if (v.length() > this.threshold) {
                return false;
            }
        }
        return true;
    }

    i_to_vec(i: number): BABYLON.Vector3 {
        const harf = Math.floor(this.size/2);
        let x = i % this.size - harf;
        let y = Math.floor((i / this.size) % this.size) - harf;
        let z = Math.floor(i / (this.size**2)) - harf;
        return new BABYLON.Vector3(x, y, z);
    }

    render(scene: BABYLON.Scene): void {
        let count = 0;
        for (let i = 0; i < this.size**3; i++) {
            const vec = this.i_to_vec(i);
            if (this.do_mandelbulb(vec)) {
                const x = BABYLON.MeshBuilder.CreateBox("box", {}, scene);
                x.position = vec;
                count += 1
            }
        }
        console.log(count);
    }
}

class Game {
    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.FreeCamera;
    private _light: BABYLON.Light;

    constructor(canvasElement: string) {
        this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this._engine = new BABYLON.Engine(this._canvas, true);
    }

    createScene(): void {
        this._scene = new BABYLON.Scene(this._engine);

        this._camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(-100, -100, -100), this._scene);
        this._camera.setTarget(BABYLON.Vector3.Zero());
        this._camera.attachControl(this._canvas, false);

        this._light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this._scene);

        (new Mandelbulb(201, 3, 8)).render(this._scene);
    }

    doRender(): void {
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    let game = new Game('renderCanvas');
    game.createScene();
    game.doRender();
});
