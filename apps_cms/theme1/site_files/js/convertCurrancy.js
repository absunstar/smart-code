let closeVCButton = document.getElementById('closeVCButton');
let mainConvertCurrancy = document.getElementById('mainConvertCurrancy');
let convertCurrancyToggle= document.getElementById('convertCurrancyToggle');


convertCurrancyToggle.addEventListener("mousedown", () => {
    mainConvertCurrancy.classList.add('showAnddisplay') ;
});
closeVCButton.addEventListener("mousedown", () => {
    mainConvertCurrancy.classList.remove('showAnddisplay') ;
});
