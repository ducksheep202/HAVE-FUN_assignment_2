/*RMIT University Vietnam
Course: COSC2430 Web Programming
Semester: 2023A
Assessment: Assignment 2
Author: Ho Minh Duc, Nguyen Bao Hoang, Muhammad Zainulabideen Noaman, Pham Tuan Vy 
ID: s3994277, s3978685, s4021266, s3989482
Acknowledgement: chatGPT*/
function changeStatus() {
    let node = document.getElementById("status-row");
    let selected = document.getElementById("status");
    let currentText = selected.value;
    if (currentText === "Active") {
        node.style.backgroundColor = "yellow";
        selected.style.backgroundColor = "yellow"
    } else if (currentText === "Delivered") {
        node.style.backgroundColor = "green";
        selected.style.backgroundColor = "green"
    } else if (currentText === "Canceled") {
        node.style.backgroundColor = "red";
        selected.style.backgroundColor = "red"
    } else {
        node.style.backgroundColor = "#d4a373";
        selected.style.backgroundColor = "#d4a373"
    };

}

function showStatus() {
    let allTableCells = document.getElementsByTagName("td")
    for (var i = 0, max = allTableCells.length; i < max; i++) {
        var node = allTableCells[i];
        var currentText = node.childNodes[0].nodeValue;
        if (currentText === "Active") {
            node.style.backgroundColor = "yellow";
        } else if (currentText === "Delivered") {
            node.style.backgroundColor = "green";
        } else if (currentText === "Canceled") {
            node.style.backgroundColor = "red";
        };
    }
}


function overlayShow() {
    let popup = document.getElementById("overlay")
    let opacity = document.getElementById("main-container")
    popup.classList.add("open-popup");
    opacity.classList.add("overlay-container");
}

function overlayHide() {
    let popup = document.getElementById("overlay")
    let opacity = document.getElementById("main-container")
    popup.classList.remove("open-popup");
    opacity.classList.remove("overlay-container");
}