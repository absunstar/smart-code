// start open video album and close//
let allcloseVButton = document.querySelectorAll('.closevideo');
let allvideopalyer = document.querySelectorAll('.videopalyer');
let allvideoFile= document.querySelectorAll('.videoFile');
for(let i=0 ; i< allvideoFile.length; i++){
    allvideoFile[i].addEventListener("mousedown", () => {
        allvideopalyer[i].classList.add('showAnddisplay') ;
    });
    for(let i=0 ; i< allcloseVButton.length; i++){
        allcloseVButton[i].addEventListener("mousedown", () => {
        allvideopalyer[i].classList.remove('showAnddisplay') ;
        });
    }
}

// end open video album and close//

// start open audio player and close//
let allcloseAButton = document.querySelectorAll('.closeAButton');
let allaudiopalyer = document.querySelectorAll('.audiopalyer');
let allaudioFile= document.querySelectorAll('.audioFile');
for(let i=0 ; i< allaudioFile.length; i++){
    allaudioFile[i].addEventListener("mousedown", () => {
        allaudiopalyer[i].classList.add('showAnddisplay') ;
    });
    for(let i=0 ; i< allcloseAButton.length; i++){
        allcloseAButton[i].addEventListener("mousedown", () => {
        allaudiopalyer[i].classList.remove('showAnddisplay') ;
        });
    }
}
// end open audio player and close//