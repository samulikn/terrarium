'use strict';

const plants = document.querySelectorAll(".plant");
const page = document.getElementById('page');
let width = 0;
let height = 0;

getPageSize();

window.onresize = getPageSize;

plants.forEach(addDraggingHandler);
plants.forEach(setElementToFront);

function addDraggingHandler(terrariumElement) {
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
        const boundingRect = terrariumElement.getBoundingClientRect()

        let y = Math.round(e.clientY);
        relY = absY - y;

        const isGoingBelowBottom = relY < 0 && (boundingRect.bottom - relY) > height
        const isGoingAboveTop = relY > 0 && (boundingRect.top - relY) < 0
        if (isGoingAboveTop || isGoingBelowBottom) {
            relY = 0;
        } else {
            absY = y;
            terrariumElement.style.top = terrariumElement.offsetTop - relY + 'px';
        }

        let x = Math.round(e.clientX);
        relX = absX - x;

        const isGoingOutsideRight = relX < 0 && (boundingRect.right - relX) > width;
        const isGoingOutsideLeft = relX > 0 && (boundingRect.left - relX) < 0
        if (isGoingOutsideRight || isGoingOutsideLeft) {
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
};

function getPageSize() {
    width = page.offsetWidth;
    height = page.offsetHeight;
};

// function to get z-index
function getZindex(plant) {
    return window.getComputedStyle(plant).getPropertyValue("z-index");
};

function setElementToFront(terrariumElement) {
    terrariumElement.addEventListener("dblclick", function () {
        let maxZindex = Number.MIN_SAFE_INTEGER;
        for (const i of plants) {
            const z = Number(getZindex(i));
            if (maxZindex < z) {
                maxZindex = z;
            }
        }
        terrariumElement.style.zIndex = maxZindex + 1;
    });
};