let closeVCButton = document.getElementById('closeVCButton');
let mainConvertCurrancy = document.getElementById('mainConvertCurrancy');
let convertCurrancyToggle= document.getElementById('convertCurrancyToggle');


convertCurrancyToggle.addEventListener("click", () => {
    mainConvertCurrancy.classList.add('showAnddisplay') ;
});
closeVCButton.addEventListener("click", () => {
    mainConvertCurrancy.classList.remove('showAnddisplay') ;
});
