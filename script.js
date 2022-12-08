    'use strict';

   
    function dragElement(terrariumElement) {
        //set 4 positions for positioning on the screen
        let relX = 0,
            relY = 0,
            absX = 0,
            absY = 0;

        function pointerDrag(e) {
            e.preventDefault();
            absX = e.clientX;
            absY = e.clientY;
            document.onpointermove = elementDrag;
            document.onpointerup = stopElementDrag;
        }

        function elementDrag(e) {
            relX = absX - e.clientX;
            relY = absY - e.clientY;
            absX = e.clientX;
            absY = e.clientY;
            terrariumElement.style.top = terrariumElement.offsetTop - relY + 'px';
            terrariumElement.style.left = terrariumElement.offsetLeft - relX + 'px';
        }

        function stopElementDrag(s) {
            document.onpointerup = null;
            document.onpointermove = null;
        }
        
        terrariumElement.onpointerdown = pointerDrag;
    }

      

;(function() {
    dragElement(document.getElementById('plant1'));
    dragElement(document.getElementById('plant2'));
    dragElement(document.getElementById('plant3'));
    dragElement(document.getElementById('plant4'));
    dragElement(document.getElementById('plant5'));
    dragElement(document.getElementById('plant6'));
    dragElement(document.getElementById('plant7'));
    dragElement(document.getElementById('plant8'));
    dragElement(document.getElementById('plant9'));
    dragElement(document.getElementById('plant10'));
    dragElement(document.getElementById('plant11'));
    dragElement(document.getElementById('plant12'));
    dragElement(document.getElementById('plant13'));
    dragElement(document.getElementById('plant14'));
})()



// 1. Limitate moving plants on the html page
// 2. set plant on top