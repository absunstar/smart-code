const lawSection = document.querySelector('.lawSection');
const storysAccounts = document.querySelector('.storysAccounts');

let mouseDown = false;
let startX, scrollLeft;

let startDragging = function (e) {
  mouseDown = true;
  startX = e.pageX - lawSection.offsetLeft;
  scrollLeft = lawSection.scrollLeft;
};
let stopDragging = function (event) {
  mouseDown = false;
};
if (lawSection) {
  lawSection.addEventListener('mousemove', (e) => {
    e.preventDefault();
    if (!mouseDown) {
      return;
    }
    const x = e.pageX - lawSection.offsetLeft;
    const scroll = x - startX;
    lawSection.scrollLeft = scrollLeft - scroll;
  });

  lawSection.addEventListener('mousedown', startDragging, false);
  lawSection.addEventListener('mouseup', stopDragging, false);
  lawSection.addEventListener('mouseleave', stopDragging, false);
}
if (lawSection) {
  lawSection.addEventListener('wheel', (event) => {
    event.preventDefault();

    lawSection.scrollBy({
      left: event.deltaY < 0 ? -30 : 30,
    });
  });
}

let startStoryDragging = function (e) {
  mouseDown = true;
  startX = e.pageX - lawSection.offsetLeft;
  scrollLeft = lawSection.scrollLeft;
};
let stopStoryDragging = function (event) {
  mouseDown = false;
};
if (storysAccounts) {
  storysAccounts.addEventListener('mousemove', (e) => {
    e.preventDefault();
    if (!mouseDown) {
      return;
    }
    const x = e.pageX - storysAccounts.offsetLeft;
    const scroll = x - startX;
    storysAccounts.scrollLeft = scrollLeft - scroll;
  });

  storysAccounts.addEventListener('mousedown', startStoryDragging, false);
  storysAccounts.addEventListener('mouseup', stopStoryDragging, false);
  storysAccounts.addEventListener('mouseleave', stopStoryDragging, false);
}

if (storysAccounts) {
  storysAccounts.addEventListener('wheel', (event) => {
    event.preventDefault();

    storysAccounts.scrollBy({
      left: event.deltaY < 0 ? -30 : 30,
    });
  });
}
