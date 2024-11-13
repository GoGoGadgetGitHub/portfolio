import * as THREE from 'three';
import saturnRingTexture from '../assets/saturn_ring.png'
import neptuneRingTexture from '../assets/uranus_ring.png' 
import { RENDERER, SCENE, CAMERA, SUN_RADIUS, CONTROLS } from "./constants"


export class Planet{
    constructor(name ,radius, distanceFromSun, orbitSpeed, rotationSpeed, hasRing, cameraDistanceFromPlanet, texture){
        this.name = name;
        this.radius = radius;
        this.distanceFromSun = distanceFromSun;
        this.orbitSpeed = orbitSpeed;
        this.rotationSpeed = rotationSpeed;
        this.hasRing = hasRing;
        this.texture = texture;
        this.cameraDistanceFromPlanet = cameraDistanceFromPlanet;
        this.moons = {};
        this.orbitParentObject = new THREE.Object3D();
        
        this.geo = new THREE.SphereGeometry(radius, 200, 200);
        this.mat = new THREE.MeshStandardMaterial();        
        this.mat.map= new THREE.TextureLoader().load(this.texture);
     
        this.orbitParentObject.position.set(0,0,0);
        SCENE.add(this.orbitParentObject);
        this.mesh = new THREE.Mesh(this.geo, this.mat);
        this.mesh.position.set(SUN_RADIUS + radius + this.distanceFromSun, 0, 0);
        this.orbitParentObject.add(this.mesh);

        if (this.hasRing){
            
            if (this.name == "Saturn"){
                this.ringGeo = new THREE.RingGeometry(this.radius + 7,100, 200);
                this.ringMat = new THREE.MeshBasicMaterial({
                    map: new THREE.TextureLoader().load(saturnRingTexture),
                    side: THREE.DoubleSide
                })
                this.ringMesh = new THREE.Mesh(this.ringGeo, this.ringMat);
                this.mesh.add(this.ringMesh);
                this.ringMesh.rotateX(-0.5 * Math.PI);
            }

            if (this.name == "Uranus"){
                this.ringGeo = new THREE.RingGeometry(this.radius + 38, 100);
                this.ringMat = new THREE.MeshBasicMaterial({
                    map: new THREE.TextureLoader().load(neptuneRingTexture),
                    side: THREE.DoubleSide,
                    transparent: true
                })
                this.ringMesh = new THREE.Mesh(this.ringGeo, this.ringMat);
                this.mesh.add(this.ringMesh);
                this.ringMesh.rotateX(-0.6 * Math.PI);
                this.mesh.rotateX(-0.6 * Math.PI)
            }
        }
    }

    lockOn(moon = undefined){

        const worldPos = new THREE.Vector3();
        let distance;
        
        if (moon == undefined){
            this.mesh.getWorldPosition(worldPos);
            distance = this.radius + this.cameraDistanceFromPlanet;
        }
        else{   
            moon.mesh.getWorldPosition(worldPos);
            distance = moon.radius + moon.cameraDistanceFromMoon;
        }
        
        const direction = new THREE.Vector3();

        CAMERA.getWorldDirection(direction);
        
        const targetPosition = new THREE.Vector3().copy(worldPos).add(direction.multiplyScalar(-distance));

        CAMERA.position.copy(targetPosition);
        
        CONTROLS.target.copy(worldPos);

        CONTROLS.update();
    }

    updateDistance(delta){
        this.cameraDistanceFromPlanet += delta * 0.05;
        if (this.cameraDistanceFromPlanet < 2) { //Minimum Zoom
            this.cameraDistanceFromPlanet = 2;
        }
    }

    addMoon(name ,radius, distance, orbitalSpeed, rotationSpeed, texture)
    {
        const geo = new THREE.SphereGeometry(radius, 200, 200);
        const mat = new THREE.MeshStandardMaterial({
            map: new THREE.TextureLoader().load(texture)
        })
        const mesh = new THREE.Mesh(geo, mat);
        const orbitObject = new THREE.Object3D();
        
        this.mesh.add(orbitObject);
        orbitObject.add(mesh);
        mesh.position.set(this.radius+ radius + distance,0,0);

        const moon = {
            name: name,
            mesh: mesh,
            radius: radius,
            orbitObject: orbitObject,
            orbitSpeed: orbitalSpeed,
            rotationSpeed: rotationSpeed,
            cameraDistanceFromMoon: radius + 10,
            speedScaler: 0,
        };
        this.moons[name] = moon;
    }

    getMoon(name){
        return this.moons[name];
    }
}

export class Sun{
    constructor(texture)
    {
        this.geo = new THREE.SphereGeometry(SUN_RADIUS, 200, 200);
        this.mat = new THREE.MeshBasicMaterial();
        this.mat.map = new THREE.TextureLoader().load(texture);
        this.mesh = new THREE.Mesh(this.geo, this.mat);
        this.mesh.position.set(0,0,0);
        SCENE.add(this.mesh);

        const light =new THREE.PointLight(0x333333, 30000, 0, 1);
        light.position.set(0, 0, 0);
        SCENE.add(light);
    }
}