// start add date to top header // 

n =  new Date();
y = n.getFullYear();
m = n.getMonth() + 1;
d = n.getDate();
document.getElementById("todaydateXlscreen").innerHTML= m + "/" + d + "/" + y;
document.getElementById("todaydateMdscreen").innerHTML= m + "/" + d + "/" + y;
document.getElementById("todaydateXsscreen").innerHTML= m + "/" + d + "/" + y;

// end add date to top header // 


// start paryer time submenu //

var pt = window.matchMedia("(max-width: 425px)");
function myFunction(pt) {
    if(pt.matches){
        //mobile version//
        let PrayerTime = document.querySelectorAll('.PrayerTime');
        let paryertimeItems= document.querySelectorAll('.paryertimeItems');
        for(let p=0 ; p< PrayerTime.length; p++){
            PrayerTime[p].addEventListener("click", () => {
                if(paryertimeItems[p].style.display == "block" ){
                    paryertimeItems[p].style.display = "none" ;
                    console.log('mobiletoggelblock');
                }else{
                    paryertimeItems[p].style.display = "block" ;
                    console.log('mobiletoggelnone');

                }
            });
        } 
    }else{

        //desktop version//
        let PrayerTimeHover = document.querySelectorAll('.PrayerTime');
        let paryertimeItemsHover= document.querySelectorAll('.paryertimeItems');
        for(let i=0 ; i< PrayerTimeHover.length; i++){
            PrayerTimeHover[i].addEventListener("mouseout", () => {
                paryertimeItemsHover[i].style.display = "none" ;
                    console.log('desktophover');
                });
                PrayerTimeHover[i].addEventListener("mouseover", () => {
                    paryertimeItemsHover[i].style.display = "block" ;
                        console.log('desktophover');
                });
        }
    
    }
}
myFunction(pt);

// end paryer time submenu //

// start open burger menu and close//
let closeButton = document.querySelector('.closeButton');
let burgermenuoverlay = document.getElementById('burgermenuoverlay');
let burgermenuToggle= document.getElementById('burgermenuToggle');

closeButton.addEventListener("mousedown", () => {
    burgermenuoverlay.classList.remove('showAnddisplay') ;
    console.log("test");
});
burgermenuToggle.addEventListener("mousedown", () => {
    burgermenuoverlay.classList.add('showAnddisplay') ;
    console.log("test");
});
// end open burger menu and close//



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

// start image slider and close//
let closeSButton = document.querySelectorAll('#closeSButton');
let albumimageslider = document.querySelectorAll('#albumimageslider');
let imagesFile= document.querySelectorAll('#imagesFile');
for(let i=0 ; i< imagesFile.length; i++){
    imagesFile[i].addEventListener("mousedown", () => {
        albumimageslider[i].classList.add('showAnddisplay') ;
        console.log("test");
    });
    for(let i=0 ; i< closeSButton.length; i++){
        closeSButton[i].addEventListener("mousedown", () => {
            albumimageslider[i].classList.remove('showAnddisplay') ;
            console.log("test");
        });
    }
}

// end open image slider and close//


// start album images slider //

let IsliderContainer = document.querySelectorAll('.imageslider-slider-container');
let IinnerSlider = document.querySelectorAll('.imageslider-inner-slider');
let albumImageSlider = document.querySelectorAll('.albumimageslider');

let Spressed = false;
let ISstartISx;
let ISx;
for(let i=0 ; i< albumImageSlider.length; i++){
    IsliderContainer[i].addEventListener("mousedown", (e) => {
        Spressed = true;
        ISstartISx = e.offsetX  - IinnerSlider[i].offsetLeft;
        IsliderContainer[i].style.cursor = "grabbing";
        IScheckBoundary();
    });

    IsliderContainer[i].addEventListener("mouseenter", () => {
        IsliderContainer[i].style.cursor = "grab";
    });

    IsliderContainer[i].addEventListener("mouseup", () => {
        IsliderContainer[i].style.cursor = "grab";
        Spressed = false;
    });

    IsliderContainer[i].addEventListener("mousemove", (e) => {
        if (!Spressed) return;
        e.preventDefault();

        ISx = e.offsetX ;

        IinnerSlider[i].style.left = `${ISx - ISstartISx}px`;
    });

    const IScheckBoundary = () => {
        let outer = IsliderContainer[i].getBoundingClientRect();
        let inner = IinnerSlider[i].getBoundingClientRect();

        if (parseInt(IinnerSlider[i].style.left) > 0) {
            IinnerSlider[i].style.left = "0px";
        }

        if (inner.right < outer.right) {
            IinnerSlider[i].style.left = `-${inner.width - outer.width}px`;
        }
    };
}

// end album images slider //

// start open three dot and close//
let articlestimeItems = document.querySelectorAll('.articlestimeItems');
let moreDot= document.querySelectorAll('.moreDot');
let sectionTwo = document.querySelectorAll('.sectionTwo');
for(let i=0 ; i< sectionTwo.length; i++){
    moreDot[i].addEventListener("mousedown", () => {
        if(articlestimeItems[i].style.display === "block" ){
            articlestimeItems[i].style.display = "none" ;
            console.log("test");
        }else{
            articlestimeItems[i].style.display = "block" ;
            console.log("test");
        }
    });

}

// end open three dot and close//

// start share button //

    let share = document.querySelectorAll('.share');
    let shareMenu = document.querySelectorAll('.sharemenu');
    let sharebutton = document.querySelectorAll('.sharebutton');

    for(let s=0; s< sharebutton.length; s++){
        share[s].addEventListener("click", () => {
            if(shareMenu[s].style.display === "block" ){
                shareMenu[s].style.display = "none" ;
                console.log("test");
            }else{
                shareMenu[s].style.display = "block" ;
                console.log("test");
            }
        });

    }

// end share button //


// start show vote resulte //

    let voteprogres = document.querySelector('.voteprogres');
    let survybutton = document.querySelector('.survybutton');
    let answer = document.querySelector('.answer');

    survybutton.addEventListener("mousedown", () => {
        if(voteprogres.style.display === "flex" && answer.style.display === "none"  ){
            voteprogres.style.display = "none" ;
            answer.style.display = "none" ;
        }else{
            voteprogres.style.display = "flex" ;
            answer.style.display = "none" ;
        }
    });
// end show vote resulte //