import * as THREE from 'three';
import * as dat from 'dat.gui';
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


const planets = {
    Mercury: mercury, 
    Venus: venus, 
    Earth: earth, 
    Mars: mars, 
    Jupiter: jupiter, 
    Saturn: saturn, 
    Uranus: uranus, 
    Neptune: neptune};


//Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.01)
SCENE.add(ambientLight);

//GUI
//const gui =new dat.GUI();

const options = {
    Mercury: false,
    Venus: false,
    Earth: false,
    Mars: false,
    Jupiter: false,
    Saturn: false,
    Uranus: false,
    Neptune: false,
    Moon: false,
    Phobos: false,
    Deimos: false,
    Callisto: false,
    Ganymede: false,
    Europa: false,
    IO: false,
    Mimas: false,
    Enceladus: false,
    Tethy: false,
    Dione: false,
    Rhea: false,
    Titan: false,
    Iapetus: false,
    Miranda: false,
    Ariel: false,
    Umbriel: false,
    Titania: false,
    Oberon: false,
    Triton: false,
    None: true,
    RotationLock: false,
    Speed: 0.1
};

const dropdown = document.getElementById("dropdown-content");
var menuEntry;
var label;
var checkBox;
for (var planet in planets){
    menuEntry = document.createElement("div");
    dropdown.appendChild(menuEntry);
    menuEntry.setAttribute("class",`planet-${planet}`);
    menuEntry.setAttribute("id", "planet-div");
    label = document.createElement("lable");
    label.textContent = `${planet}`;
    checkBox = document.createElement("input");
    checkBox.setAttribute("type", "checkbox");
    menuEntry.appendChild(label);
    menuEntry.appendChild(checkBox);

}


/*
const lockOnPlanets = gui.addFolder("Planets");
const lockOnEarthMoons = gui.addFolder("Earth Moons");
const lockOnMarsMoons = gui.addFolder("Mars Moons");
const lockOnJupiterMoons = gui.addFolder("Jupiter Moons");
const lockOnSaturnMoons = gui.addFolder("Saturn Moons");
const lockOnUranusMoons = gui.addFolder("Uranus Moons");
const lockOnNeptuneMoons = gui.addFolder("Neptune Moons");

//LockOn Options for Planets
lockOnPlanets.add(options, 'Mercury').name('Mercury').listen().onChange(function(){setChecked("Mercury")});
lockOnPlanets.add(options, 'Venus').name('Venus').listen().onChange(function(){setChecked("Venus")});
lockOnPlanets.add(options, 'Earth').name('Earth').listen().onChange(function(){setChecked("Earth")});
lockOnPlanets.add(options, 'Mars').name('Mars').listen().onChange(function(){setChecked("Mars")});
lockOnPlanets.add(options, 'Jupiter').name('Jupiter').listen().onChange(function(){setChecked("Jupiter")});
lockOnPlanets.add(options, 'Saturn').name('Saturn').listen().onChange(function(){setChecked("Saturn")});
lockOnPlanets.add(options, 'Uranus').name('Uranus').listen().onChange(function(){setChecked("Uranus")});
lockOnPlanets.add(options, 'Neptune').name('Neptune').listen().onChange(function(){setChecked("Neptune")});

//LockOn Options for Moons
lockOnEarthMoons.add(options, 'Moon').name('Moon').listen().onChange(function(){setChecked("Moon")});

lockOnMarsMoons.add(options, 'Phobos').name('Phobos').listen().onChange(function(){setChecked("Phobos")});
lockOnMarsMoons.add(options, 'Deimos').name('Deimos').listen().onChange(function(){setChecked("Deimos")});

lockOnJupiterMoons.add(options, 'Callisto').name('Callisto').listen().onChange(function(){setChecked("Callisto")});
lockOnJupiterMoons.add(options, 'Ganymede').name('Ganymede').listen().onChange(function(){setChecked("Ganymede")});
lockOnJupiterMoons.add(options, 'Europa').name('Europa').listen().onChange(function(){setChecked("Europa")});
lockOnJupiterMoons.add(options, 'IO').name('IO').listen().onChange(function(){setChecked("IO")});

lockOnSaturnMoons.add(options, 'Mimas').name('Mimas').listen().onChange(function(){setChecked("Mimas")});
lockOnSaturnMoons.add(options, 'Enceladus').name('Enceladus').listen().onChange(function(){setChecked("Enceladus")});
lockOnSaturnMoons.add(options, 'Tethy').name('Tethy').listen().onChange(function(){setChecked("Tethy")});
lockOnSaturnMoons.add(options, 'Dione').name('Dione').listen().onChange(function(){setChecked("Dione")});
lockOnSaturnMoons.add(options, 'Rhea').name('Rhea').listen().onChange(function(){setChecked("Rhea")});
lockOnSaturnMoons.add(options, 'Titan').name('Titan').listen().onChange(function(){setChecked("Titan")});
lockOnSaturnMoons.add(options, 'Iapetus').name('Iapetus').listen().onChange(function(){setChecked("Iapetus")});

lockOnUranusMoons.add(options, 'Miranda').name('Miranda').listen().onChange(function(){setChecked("Miranda")});
lockOnUranusMoons.add(options, 'Ariel').name('Ariel').listen().onChange(function(){setChecked("Ariel")});
lockOnUranusMoons.add(options, 'Umbriel').name('Umbriel').listen().onChange(function(){setChecked("Umbriel")});
lockOnUranusMoons.add(options, 'Titania').name('Titania').listen().onChange(function(){setChecked("Titania")});
lockOnUranusMoons.add(options, 'Oberon').name('Oberon').listen().onChange(function(){setChecked("Oberon")});

lockOnNeptuneMoons.add(options, 'Triton').name('Triton').listen().onChange(function(){setChecked("Triton")});

gui.add(options, 'None').name('None').listen().onChange(function(){setChecked("None")});

//Speed Control
gui.add(options, 'Speed', 0, 1, 0.0001);

//Radio Button Logic
function setChecked(prop){
    for(let opt in options){
        if (opt != 'Speed' && opt != 'Rotation Lock'){options[opt] = false};
    }
    options[prop] =true;
}
*/

//Animation
function animate(){
    
    //Sun Rotation
    sun.mesh.rotateY(0.004 * options.Speed);

    Object.keys(planets).forEach(function(key, index){
        var planet = planets[key];

        //Planet Orbits
        planet.orbitParentObject.rotateY(planet.orbitSpeed * options.Speed);
        
        //Planet Rotation
        planet.mesh.rotation.y += planet.rotationSpeed * options.Speed;

        //Moon Orbits and rotations
        Object.keys(planet.moons).forEach(function(key, index){
            const moon = planet.moons[key];
            
            moon.orbitObject.rotateY(((moon.orbitSpeed * options.Speed) - planet.rotationSpeed) * options.Speed);
            
            moon.mesh.rotateY(moon.rotationSpeed * options.Speed);
            
            
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
//Be that a moon or a planet
document.addEventListener('wheel', function(e) {
    const delta = e.deltaY;
    Object.keys(options).forEach(function(i, index){
        const planet = planets[i];
        if (options[i] && planet!="None"){
            if (planet != undefined){
                planet.updateDistance(delta * planet.radius * 0.5);}
            else{
                Object.keys(planets).forEach(function(j, index){
                    var moon = planets[j].getMoon(i);
                    if (moon != undefined){
                        planets[j].getMoon(i).cameraDistanceFromMoon += delta * moon.radius * 0.5;
                        if (moon.cameraDistanceFromMoon < 0.5){
                            moon.cameraDistanceFromMoon = 0.5;
                        }
                    }
                });
            }
        }
    });
});

/*const guiController = gui.domElement;
guiController.addEventListener('wheel', function(e){
    e.stopPropagation();
});*/

window.addEventListener('resize', function(){
    CAMERA.aspect = window.innerWidth / window.innerHeight;
    CAMERA.updateProjectionMatrix();
    RENDERER.setSize(window.innerWidth, window.innerHeight);
}); 


RENDERER.setAnimationLoop(animate);


