const menuContainer = document.querySelector(".menuContainer");
const burgerMenu = document.querySelector(".burgerMenu");
const closeMenuBtn = document.querySelector(".closeBtn");
if (burgerMenu && burgerMenu.addEventListener) {
  burgerMenu.addEventListener("click", () => {
    menuContainer.classList.toggle("open");
    document.querySelector("body").classList.toggle("no-scroll");
  });
}

if (closeMenuBtn && closeMenuBtn.addEventListener) {
  closeMenuBtn.addEventListener("click", () => {
    menuContainer.classList.toggle("open");
    document.querySelector("body").classList.remove("no-scroll");
  });
}
