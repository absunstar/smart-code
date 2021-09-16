
//   $(document).ready(function(){
//     $(".products-carousel").owlCarousel({
//         rtl:true,
//         margin:10,
//         nav:true,
//         loop:true,
//     responsiveClass:true,
//     responsive:{
//         0:{
//             items:1,
//             nav:true
//         },
//         600:{
//             items:2,
//             nav:false
//         },
//         1000:{
//             items:3,
//             nav:true,
//             loop:true
//         }
//     }
    

//     });
//     $(".customer-carousel").owlCarousel({
//       rtl:true,
//       margin:10,
//       nav:true,
//       loop:true,
//   responsiveClass:true,
//   responsive:{
//       0:{
//           items:1,
//           nav:true
//       },
//       600:{
//           items:2,
//           nav:false
//       },
//       1000:{
//           items:4,
//           nav:true,
//           loop:true
//       }
//   }

//   });
//   });
$('.owl-carousel').owlCarousel({
    loop:true,
    margin:10,
    responsiveClass:true,
    responsive:{
        0:{
            items:1,
            nav:true
        },
        600:{
            items:3,
            nav:false
        },
        1000:{
            items:5,
            nav:true,
            loop:false
        }
    }
})

   