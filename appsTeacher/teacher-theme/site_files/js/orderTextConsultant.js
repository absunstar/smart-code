const orderTextConsultingContainer = document.querySelector('.orderTextConsultingContainer');

closeBtn.forEach((close) => {
  close.addEventListener('click', () => {
    if (orderTextConsultingContainer.classList.contains('display')) {
      orderTextConsultingContainer.classList.remove('display');
      orderTextConsultingContainer.classList.add('hidden');
    }
  });
});

const orderTextButton = document.querySelectorAll('.orderTextButton');
const orderTextConsulting = document.querySelector('.orderTextConsultingContainer');
orderTextButton.forEach((order) => {
  order.addEventListener('click', () => {
    document.querySelector('body').classList.add('no-scroll');
    if (orderTextConsulting.classList.contains('display')) {
      orderTextConsulting.classList.remove('display');
      orderTextConsulting.classList.add('hidden');
    } else {
      orderTextConsulting.classList.add('display');
      orderTextConsulting.classList.remove('hidden');
    }
  });
});
