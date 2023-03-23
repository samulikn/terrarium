const myCanvas = document.getElementById("c")

const circle = myCanvas.getContext("2d")

// circle.beginPath();


circle.arc(150, 220, 50, 0, 2 * Math.PI);
circle.fillStyle = "#FF0000";
circle.fill();

// circle.stroke();

