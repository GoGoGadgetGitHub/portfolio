import * as THREE from 'three';
import { options } from './solarsystemUI';
import { SCENE,CAMERA,RENDERER,CONTROLS } from "./constants";
import { Planet,Sun } from "./planet";
import starsPX from '../assets/px.jpg';
import starsNX from '../assets/nx.jpg';
import starsPY from '../assets/py.jpg';
import starsNY from '../assets/ny.jpg';
import starsPZ from '../assets/pz.jpg';
import starsNZ from '../assets/nz.jpg';
import sunTexture from '../assets/8k_sun.jpg';
import mercuryTexture from '../assets/2k_mercury.jpg';
import venusTexture from '../assets/4k_venus_atmosphere.jpg';
import earthTexture from '../assets/8k_earth_daymap.jpg';
import marsTexture from '../assets/2k_mars.jpg';
import jupiterTexture from '../assets/8k_jupiter.jpg';
import satrunTexture from '../assets/8k_saturn.jpg';
import uranusTexture from '../assets/2k_uranus.jpg';
import neptuneTexture from '../assets/2k_neptune.jpg';
import earthMoonTexture from '../assets/1k_earth_moon.jpg';
import phobosTexture from '../assets/phobos_texture.png';
import callistoTexture from '../assets/8k_callisto_texture.png';
import ganymedeTexture from '../assets/11k_ganymede_texture.png';
import europaTexture from '../assets/20k_europa_texture.jpg';
import ioTexture from '../assets/8k_io_texture.jpg';
import mimasTexture from '../assets/mimas2kalb.jpg';
import enceladusTexture from '../assets/Enceladus.png';
import tethyTexture from '../assets/tethys4kalb.jpg';
import dioneTexture from '../assets/Dione.jpg';
import rheaTexture from '../assets/rhea.jpg';
import titanTexture from '../assets/Titan.png';
import iapetusTexture from '../assets/iapetus4kalb.jpg';
import mirandaTexture from '../assets/miranda.jpg';
import arielTexture from '../assets/Ariel.png';
import umbrielTexture from '../assets/Umbriel.png';
import titaniaTexture from '../assets/Titania.png';
import oberonTexture from '../assets/Oberon.png';
import tritonTexture from '../assets/Triton.png';

//Skybox
const cubeTextureLoader = new THREE.CubeTextureLoader();
SCENE.background = cubeTextureLoader.load([
  starsPX,
  starsNX,
  starsPY,
  starsNY,
  starsPZ,
  starsNZ
]);

//Objects
const scaleDistance = 5;

const sun = new Sun(sunTexture);
const mercury = new Planet('Mercury', 2 ,58*scaleDistance, 0.0047, 0.001, false, 5, mercuryTexture);
const venus = new Planet('Venus', 6, 108*scaleDistance, 0.0035, 0.0006, false, 15, venusTexture);
const earth = new Planet('Earth', 6, 149*scaleDistance, 0.0029, 0.003, false, 15, earthTexture);
earth.addMoon('Moon',1, 38, 0.0003, 0.003, earthMoonTexture);

const mars = new Planet('Mars', 3, 227*scaleDistance, 0.0024, 0.0002, false, 5, marsTexture);
mars.addMoon('Phobos', 0.2, 9, 0.0002, 0.0001, phobosTexture);
mars.addMoon('Deimos', 0.09, 14, 0.0001, 0.0001, phobosTexture);

const jupiter = new Planet('Jupiter', 69, 778*scaleDistance, 0.0013, 0.0012, false, 150, jupiterTexture);
jupiter.addMoon('Callisto', 0.18, 54, 0.0008, 0.003, callistoTexture);
jupiter.addMoon('Ganymede', 0.15, 30, 0.0010, 0.002, ganymedeTexture);
jupiter.addMoon('Europa', 0.26, 18, 0.0013, 0.0002, europaTexture);
jupiter.addMoon('IO', 0.24, 12, 0.0017, 0.004, ioTexture);

const saturn = new Planet('Saturn', 58, 1430*scaleDistance, 0.0009, 0.0009, true, 95, satrunTexture);
saturn.addMoon('Mimas', 0.03, 45, 0.0014, 0.0008, mimasTexture);
saturn.addMoon('Enceladus', 0.24, 57.5, 0.0024, 0.007, enceladusTexture);
saturn.addMoon('Tethy', 0.5, 72.5, 0.0011, 0.0003, tethyTexture);
saturn.addMoon('Dione', 0.56, 92.5, 0.0010, 0.005, dioneTexture);
saturn.addMoon('Rhea', 0.76, 130, 0.0008, 0.0004, rheaTexture);
saturn.addMoon('Titan', 2.575, 305, 0.0005, 0.0008, titanTexture);
saturn.addMoon('Iapetus', 0.73, 890, 0.0003, 0.004, iapetusTexture);

const uranus = new Planet('Uranus', 25, 2870*scaleDistance, 0.0006, 0.0006, true, 95, uranusTexture);
uranus.addMoon('Miranda', 0.23, 12, 0.0006, 0.0004, mirandaTexture);
uranus.addMoon('Ariel', 0.57, 19, 0.0005, 0.0003, arielTexture);
uranus.addMoon('Umbriel', 0.58, 26, 0.0004, 0.0002, umbrielTexture);
uranus.addMoon('Titania', 0.78, 43, 0.0003, 0.0003, titaniaTexture);
uranus.addMoon('Oberon', 0.76, 58, 0.0003, 0.0001, oberonTexture);

const neptune = new Planet('Neptune', 24, 4500*scaleDistance, 0.0005, 0.0005, false, 85, neptuneTexture);
neptune.addMoon('Triton', 0.23, 13, 0.0004, 0.0007, tritonTexture);


export const planets = {
  Mercury: mercury, 
  Venus: venus, 
  Earth: earth, 
  Mars: mars, 
  Jupiter: jupiter, 
  Saturn: saturn, 
  Uranus: uranus, 
  Neptune: neptune
};

//Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.01)
SCENE.add(ambientLight);

//Animation
function animate(){
  let speed = document.getElementById("speed-control").value;
  //Sun Rotation
  sun.mesh.rotateY(0.004 * speed);

  Object.keys(planets).forEach(function(key, index){
    var planet = planets[key];

    //Planet Orbits
    planet.orbitParentObject.rotateY(planet.orbitSpeed * speed);

    //Planet Rotation
    planet.mesh.rotation.y += planet.rotationSpeed * speed;

    //Moon Orbits and rotations
    Object.keys(planet.moons).forEach(function(key, index){
      const moon = planet.moons[key];

      moon.orbitObject.rotateY(((moon.orbitSpeed * speed) - planet.rotationSpeed) * speed);

      moon.mesh.rotateY(moon.rotationSpeed * speed);


      //Lock on for moons
      if (options[moon.name]){
        planet.lockOn(moon, options.RotationLock);
      }
    })

    //Lock on planets
    if (options[planet.name]){
      planet.lockOn(undefined, options.RotationLock);
    };
  })

  CONTROLS.update();
  RENDERER.render(SCENE, CAMERA);
}

//An event listener for the mouse wheel to change the camera distance from the locked on object
//Be that a moon or a planeto

//yes i know the indentation is fucking horrible here

document.addEventListener('wheel', function(e) {
  const delta = e.deltaY;
  Object.keys(options).forEach(function(i, index){
    const planet = planets[i];
    if (options[i] && planet!="None"){
      if (planet != undefined){
        planet.updateDistance(delta * planet.radius * 0.2);}
      else{
        Object.keys(planets).forEach(function(j, index){
          var moon = planets[j].getMoon(i);
          if (moon != undefined){
            planets[j].getMoon(i).cameraDistanceFromMoon += delta * moon.radius * 0.2;
            if (moon.cameraDistanceFromMoon < 0.5){
              moon.cameraDistanceFromMoon = 0.5;
            }
          }
        });
      }
    }
  });
});

window.addEventListener('resize', function(){
  CAMERA.aspect = window.innerWidth / window.innerHeight;
  CAMERA.updateProjectionMatrix();
  RENDERER.setSize(window.innerWidth, window.innerHeight);
}); 


RENDERER.setAnimationLoop(animate);


