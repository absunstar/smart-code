// start open football matches and close//
let closeVCButton = document.getElementById('closeVCButton');
let mainConvertCurrancy = document.getElementById('mainConvertCurrancy');
let convertCurrancyToggle= document.getElementById('convertCurrancyToggle');


convertCurrancyToggle.addEventListener("mousedown", () => {
    mainConvertCurrancy.classList.add('showAnddisplay') ;
});
closeVCButton.addEventListener("mousedown", () => {
    mainConvertCurrancy.classList.remove('showAnddisplay') ;
});
// end open football matches and close//