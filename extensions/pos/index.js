module.exports = function (browser) {
  let extension = {};
  extension.id = browser.md5(__filename);
  extension.name = 'Smart Pos';
  extension.description = 'Dynamic POS System';
  extension.paid = true;
  extension.version = '1.0.0';
  extension.canDelete = true;
  extension.worker = null;
  extension.init = () => {};
  extension.enable = () => {
    extension.worker = browser.run([browser.path.join(__dirname, '/../../pos.js')], { detached: false, cwd: browser.path.join(__dirname, '/../../') });
    browser.var.preload_list.push({
      id: extension.id,
      path: browser.path.join(__dirname, 'preload.js'),
    });
    browser.applay('preload_list');
  };

  extension.disable = () => {
    browser.var.preload_list.forEach((p, i) => {
      if (p.id == extension.id) {
        browser.var.preload_list.splice(i, 1);
      }
    });
    browser.applay('preload_list');

    if (extension.worker && extension.worker.kill) {
      extension.worker.kill();
    }
  };

  extension.remove = () => {
    extension.disable();
  };
  return extension;
};
