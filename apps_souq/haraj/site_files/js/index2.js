let user = document.querySelector('.user');
let burger_icon = document.querySelector('.burger-icon');
let close = document.querySelector('.close-menu');

burger_icon.addEventListener('click', () => {
  user.classList.add('open-menu');
});

close.addEventListener('click', () => {
  user.classList.remove('open-menu');
});

function mouseoverbox1() { }

taghide();

function taghide() {
  let plus = document.getElementById('open');
  let tags = document.getElementById('tags-filter');
  if (tags) {

    if (tags.style.display != 'none') {
      tags.style.display = 'none';
    } else {
      tags.style.display = 'block';
    }
  }
}

function xtaghide() {
  let plus = document.getElementById('open');
  let tags = document.getElementById('xtags-filter');
  if (tags) {

    if (tags.style.display != 'none') {
      tags.style.display = 'none';
    } else {
      tags.style.display = 'block';
    }
  }
}
xtaghide();

let xbtnFilter = document.querySelector('.xfilter-toggel');
if (xbtnFilter) {

  let xicon = xbtnFilter.querySelector('.fa-plus');

  xbtnFilter.onclick = function () {
    if (xicon.classList.contains('fa-plus')) {
      xicon.classList.replace('fa-plus', 'fa-minus');
    } else {
      xicon.classList.replace('fa-minus', 'fa-plus');
    }
  };
}

let btnFilter = document.querySelector('.filter-toggel');
if (btnFilter) {

  let icon = btnFilter.querySelector('.fa-plus');

  btnFilter.onclick = function () {
    if (icon.classList.contains('fa-plus')) {
      icon.classList.replace('fa-plus', 'fa-minus');
    } else {
      icon.classList.replace('fa-minus', 'fa-plus');
    }
  }
};

let tagSide = document.querySelector('.tagSide');
let mobileFilter = document.querySelector('.mobile-filter');
let closeFilter = document.querySelector('.close-filter');
if (mobileFilter) {

  mobileFilter.addEventListener('click', () => {
    tagSide.classList.add('open-filter');
  });
}
if (closeFilter) {

  closeFilter.addEventListener('click', () => {
    tagSide.classList.remove('open-filter');
  });
}
let sideheader = document.querySelector('.user-side-header');
let mapheader = document.querySelector('.map-side-header');
let notifname = document.getElementById('notif1');

if (sideheader) {
  sideheader.addEventListener('mouseenter', () => {
    notifname.classList.add('show-notif-name');
    notifname.classList.remove('notif-name');
  });
  sideheader.addEventListener('mouseleave', () => {
    notifname.classList.remove('show-notif-name');
    notifname.classList.add('notif-name');
  });
  let notifname2 = document.getElementById('notif2');

  sideheader.addEventListener('mouseenter', () => {
    notifname2.classList.add('show-notif-name');
    notifname2.classList.remove('notif-name');
  });
  sideheader.addEventListener('mouseleave', () => {
    notifname2.classList.remove('show-notif-name');
    notifname2.classList.add('notif-name');
  });
  let notifname3 = document.getElementById('notif3');

  sideheader.addEventListener('mouseenter', () => {
    notifname3.classList.add('show-notif-name');
    notifname3.classList.remove('notif-name');
  });
  sideheader.addEventListener('mouseleave', () => {
    notifname3.classList.remove('show-notif-name');
    notifname3.classList.add('notif-name');
  });
  let notifname4 = document.getElementById('notif4');

  sideheader.addEventListener('mouseenter', () => {
    notifname4.classList.add('show-notif-name');
    notifname4.classList.remove('notif-name');
  });
  sideheader.addEventListener('mouseleave', () => {
    notifname4.classList.remove('show-notif-name');
    notifname4.classList.add('notif-name');
  });

  let notifname6 = document.getElementById('notif6');

  if (notifname6) {
    sideheader.addEventListener('mouseenter', () => {

      notifname6.classList.add('show-notif-name');
      notifname6.classList.remove('notif-name');

    });
    sideheader.addEventListener('mouseleave', () => {

      notifname6.classList.remove('show-notif-name');
      notifname6.classList.add('notif-name');
    });
  }
}

let notifname5 = document.getElementById('notif5');
if (mapheader) {

  mapheader.addEventListener('mouseenter', () => {
    notifname5.classList.add('show-notif-name');
    notifname5.classList.remove('notif-name');
  });
  mapheader.addEventListener('mouseleave', () => {
    notifname5.classList.remove('show-notif-name');
    notifname5.classList.add('notif-name');
  });
}

const mapToggle = document.getElementById('map-toggle');
const map = document.querySelector('.map');
let changename = document.getElementById('notif5');
let minmapbtn = document.getElementById('mapbtn');
function hsMap(type) {
  if (map.style.display === 'block' || type == 'hide') {
    map.style.display = 'none';
    changename.innerText = '##word.map_search##';
    minmapbtn.classList.remove('side-header-map');
    mapheader.addEventListener('mouseenter', () => {
      notifname5.classList.add('show-notif-name');
      notifname5.classList.remove('notif-name');
    });
    mapheader.addEventListener('mouseleave', () => {
      notifname5.classList.remove('show-notif-name');
      notifname5.classList.add('notif-name');
    });
  } else {
    map.style.display = 'block';
    changename.innerText = '##word.hide_map##';
    minmapbtn.classList.add('side-header-map');
    mapheader.addEventListener('mouseleave', () => {
      notifname5.classList.add('show-notif-name');
      notifname5.classList.remove('notif-name');
    });
  }
}

site.onLoad(() => {
  setTimeout(() => {
    if (xbtnFilter) {
      xbtnFilter.click();
    }
    xtaghide();
  }, 1000);
});
