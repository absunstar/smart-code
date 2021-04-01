module.exports = function (SOCIALBROWSER) {
  SOCIALBROWSER.menu_list.push({
    label: 'Open POS System',
    click: () => {
      document.location.href = 'http://127.0.0.1';
    },
  });
};
