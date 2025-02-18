
let bgColorsLight = [
    "rgb(255, 118, 186)",
    "rgb(143, 214, 128)",
    "rgb(255, 213, 105)",
    "rgb(255, 105, 113)",
    "rgb(190, 105, 255)",
    "rgb(105, 175, 255)",
];

let bgColorsDark = [
    "rgb(192, 52, 122)",
    "rgb(78, 154, 62)",
    "rgb(192, 151, 47)",
    "rgb(192, 40, 48)",
    "rgb(123, 41, 186)",
    "rgb(37, 107, 187)",
];

let box_elems = Array.from(document.getElementsByClassName("box"));
let audio_elems = Array.from(document.getElementsByClassName("sound"));

console.log(box_elems.length, audio_elems.length);

for (let i = 0; i < box_elems.length; i++) {

    box_elems[i].addEventListener("click", () => {
        if (!audio_elems[i].paused) return; // Prevent multiple clicks

        box_elems[i].style.backgroundColor = bgColorsDark[i]; // Change color while playing
        box_elems[i].disabled = true; // Prevent multiple clicks

        audio_elems[i].play();

        audio_elems[i].onended = () => {
            box_elems[i].style.backgroundColor = bgColorsLight[i]; // Revert color
            box_elems[i].disabled = false; // Enable clicking again
        };
    });

}

