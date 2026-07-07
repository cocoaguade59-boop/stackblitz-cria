const cv = document.getElementById("c");
const cx = cv.getContext("2d");

cx.fillStyle = "#ffd700";
cx.fillRect(220, 190, 200, 100);
cx.fillStyle = "#000";
cx.font = '10px "Press Start 2P"';
cx.fillText("FUNCIONA!", 260, 248);