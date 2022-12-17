'use strict';

const plants = document.querySelectorAll(".plant");
let box = document.getElementById('page');
let width = box.offsetWidth;
let height = box.offsetHeight;
//console.log("width", width);

plants.forEach(dragElement);
plants.forEach(setElementToFront);

function dragElement(terrariumElement) {
    //set 4 positions for positioning on the screen
    let relX = 0,
        relY = 0,
        absX = 0,
        absY = 0;

    function pointerDrag(e) {
        e.preventDefault();
        absX = Math.round(e.clientX);
        absY = Math.round(e.clientY);
        document.onpointermove = elementDrag;
        document.onpointerup = stopElementDrag;
    }

    function elementDrag(e) {
        let rect = terrariumElement.getBoundingClientRect()

        let y = Math.round(e.clientY);
        relY = absY - y;
        if ((relY < 0 && (rect.bottom - relY) > height) || (relY > 0 && (rect.top - relY) < 0)) {
            relY = 0
        } else {
            absY = y;
            terrariumElement.style.top = terrariumElement.offsetTop - relY + 'px';
        }

        let x = Math.round(e.clientX);
        relX = absX - x
        if ((relX < 0 && (rect.right - relX) >= width) || (relX > 0 && (rect.left - relX) <= 0)) {
            relX = 0;
        }
        else {
            absX = x;
            terrariumElement.style.left = terrariumElement.offsetLeft - relX + 'px';
        }
    }

    function stopElementDrag() {
        document.onpointerup = null;
        document.onpointermove = null;
    }

    terrariumElement.onpointerdown = pointerDrag;
}    

    //
    function setElementToFront (terrariumElement) {
        terrariumElement.addEventListener("dblclick", function(){
            //Create array of all z-indexes 
            let arrZindexes = [];
            for (let i = 0; i < plants.length; i++){
                let z = window.getComputedStyle(plants[i]).getPropertyValue("z-index");
                arrZindexes.push(z);
            }

            let currentZindex = window.getComputedStyle(terrariumElement).getPropertyValue("z-index");
            let maxZindex = FindMaxZindex(arrZindexes);
            let maxPossibleZindex = 500;

                //Finding the Max z-index
            function FindMaxZindex(arrZindexes) {
                return Math.max.apply(null, arrZindexes);
            }

            if (maxZindex < maxPossibleZindex){
                let newZindex = maxZindex + 1;
                terrariumElement.style.zIndex = newZindex;
            }
            else {
                alert ("Reload the page!")
            }            
        });
    };