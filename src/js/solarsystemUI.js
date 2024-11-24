import downArrow from '../assets/down-arrow.svg';
import {planets} from './canvas';

export const options = {
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
};

const dropdown = document.getElementById("dropdown-content");
var menuEntry;
var subMenu;
var label;
var arrow;
var planetObj;
var lastSelected;

arrow = document.createElement("img");
arrow.src = downArrow;
arrow.classList.add("arrow","main-dropdown");
arrow.dataset.rotation = "0";
arrow.onclick = expandMain;
document.getElementById("view-dropdown").append(arrow);

document.getElementById("stop-viewing").onclick = removeLockOn;

styleSlider();
        
Object.keys(planets).forEach(function(planet, index){
    planetObj = planets[planet];

    menuEntry = document.createElement("div");
    menuEntry.id = "planet-div";
    menuEntry.classList.add(`${planet}`);

    label = document.createElement("label");
    label.textContent = `${planet}`;
    label.classList.add(`${planet}`);
    label.onclick = setLockOn;

    dropdown.appendChild(menuEntry);
    menuEntry.appendChild(label);

    if (planet !== "Mercury" && planet !== "Venus"){
        arrow = document.createElement("img");
        arrow.src = downArrow;
        arrow.classList.add("arrow", `${planet}`);
        arrow.dataset.rotation = "0";
        arrow.onclick = expand;
        menuEntry.append(arrow);
    }

    subMenu = document.createElement("div");
    subMenu.id = `moons-${planet}` 
    subMenu.classList.add("hide", "dropdown-item");
    dropdown.appendChild(subMenu);

    Object.keys(planetObj.moons).forEach(function(moon, index){
        menuEntry = document.createElement("div");
        menuEntry.id = "moon-div";
        menuEntry.classList.add(`${planet}`);

        label = document.createElement("label");
        label.textContent= `${moon}`;
        label.classList.add(`${moon}`);
        label.onclick = setLockOn;

        menuEntry.appendChild(label);
        subMenu.appendChild(menuEntry);
    })
}) 

function rotate(event){
    const arrow = event.target; 
    let rotation = parseInt(arrow.dataset.rotation || 0, 10); 
    rotation += 180;
    arrow.dataset.rotation = rotation;
    arrow.style.transform = `rotate(${rotation}deg)`;
}

function expand(event){
    rotate(event);
    const clicked = event.target;
    const planet = clicked.classList[clicked.classList.length -1];
    const subMenu = document.getElementById(`moons-${planet}`);
    if (subMenu.classList.contains("hide")){
        subMenu.classList.remove("hide");
    }else{
        subMenu.classList.add("hide");
    }
}

function expandMain(event){
    rotate(event);
    const dropdown = document.getElementById("dropdown-content");
    if (dropdown.classList.contains("hide")){
        dropdown.classList.remove("hide");
    }else{
        dropdown.classList.add("hide");
    }
}

function setLockOn(event){
    const clicked = event.target;
    if (lastSelected){
        lastSelected.classList.remove("selected");
    }
    const parent = clicked.parentElement;
    lastSelected = parent;
    parent.classList.add("selected");
    const body = clicked.classList[clicked.classList.length -1];
    options[body] = true;
    Object.keys(options).forEach(function(option, index){
        if (option === body){
            options[option] = true;
        }
        if (option !== body) {
            options[option] = false;
        }
    })
}

function removeLockOn(){
    if (lastSelected){
        lastSelected.classList.remove("selected");
    }
    Object.keys(options).forEach(function(option, index){
        options[option] = false;
    })
}
const slider=document.getElementById("speed-control");
slider.addEventListener("input", function(){
    styleSlider();
})

function styleSlider(){
    const slider=document.getElementById("speed-control");
    const value = slider.value;
    const min = slider.min;
    const max = slider.max;
    const percentage = ((value-min) / (max-min)) * 100;
    slider.style.background = `linear-gradient(to right, var(--color3) ${percentage}%, var(--foreground) ${percentage}%)`;
}