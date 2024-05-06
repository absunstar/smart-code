const site = require('../isite')({
  port: [80, 40009],
  lang: 'Ar',
  version: Date.now(),
  name: 'teacher',
  savingTime: 5,
  log: true,
  require: {
    features: [],
    permissions: [],
  },
  theme: 'theme_paper',
  mongodb: {
    db: 'SMART-TEACHER',
    limit: 100000,
    events: true,
    identity: {
      enabled: !0,
    },
  },
  security: {
    keys: ['e698f2679be5ba5c9c0b0031cb5b057c', '9705a3a85c1b21118532fefcee840f99', '710998fd1b7c0235170265650770a4b1', '820a6b58c2beed9f67932b476c7d8a21'],
  },
});

site.time = new Date().getTime();

site.get({
  name: '/',
  path: site.dir + '/',
  public: true,
});

site.get('ads.txt', (req, res) => {
  let setting = site.getSiteSetting(req.host);
  if (setting && setting.adsTxt) {
    res.end(setting.adsTxt);
  } else {
    res.txt('0/ads.txt');
  }
});

site.get('robots.txt', (req, res) => {
  let setting = site.getSiteSetting(req.host);
  if (setting && setting.adsTxt) {
    res.end(setting.robotsTxt);
  } else {
    res.txt('0/robots.txt');
  }
});

site.templateList = [];

site.loadLocalApp('client-side');
site.loadLocalApp('ui-print');
site.importApps(__dirname + '/appsTeacher');
site.importApp(__dirname + '/apps_private/cloud_security', 'security');
site.importApp(__dirname + '/apps_private/manage-user');
// site.importApp(__dirname + '/apps_private/companies');
site.importApp(__dirname + '/apps_cms/cms');
site.addFeature('teacher');

site.getMainHost = function (host = '') {
  if (host == 'localhost' || host == '127.0.0.1') {
    return host;
  }
  let arr = host.split('.');
  if (arr.length > 1) {
    let com = arr.pop();
    let domain = arr.pop();
    return '//' + domain + '.' + com;
  }
  return host;
};

site.handleNotRoute = function (req, res) {
  let host = req.headers['host'];
  console.log('handleNotRoute : ' + host + ' : ' + req.url);

  let setting = site.getSiteSetting(host);
  if (!setting.host) {
    res.redirect(site.getMainHost(host), 301);
  } else {
    res.redirect(setting.host);
  }
};

site.run();
