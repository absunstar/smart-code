const closeBtn = document.querySelectorAll('.closeBtn');
const payedConsultant = document.querySelector('.payedConsultantConatainer');

closeBtn.forEach((close) => {
  close.addEventListener('click', () => {
    if (payedConsultant.classList.contains('display')) {
      payedConsultant.classList.remove('display');
      payedConsultant.classList.add('hidden');
    }
  });
});

const orderButton = document.querySelectorAll('.orderButton');
const orderPayedConsultant = document.querySelector('.payedConsultantConatainer');
orderButton.forEach((order) => {
  order.addEventListener('click', () => {
    document.querySelector('body').classList.add('no-scroll');
    if (orderPayedConsultant.classList.contains('display')) {
      orderPayedConsultant.classList.remove('display');
      orderPayedConsultant.classList.add('hidden');
    } else {
      orderPayedConsultant.classList.add('display');
      orderPayedConsultant.classList.remove('hidden');
    }
  });
});
