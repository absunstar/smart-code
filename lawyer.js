const site = require('../isite')({
  port: [80, 40009],
  lang: 'AR',
  version: Date.now(),
  name: 'lawyer',
  savingTime: 5,
  log: true,
  www: false,
  require: {
    features: [],
    permissions: [],
  },
  theme: 'theme_paper',
  mongodb: {
    db: 'SMART-LAWYER',
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
site.importApps(__dirname + '/appsLawyer');
site.importApp(__dirname + '/apps_private/cloud_security', 'security');
site.importApp(__dirname + '/apps_private/manage-user');
site.importApp(__dirname + '/apps_private/companies');
site.addFeature('lawyer');


site.getMainHost = function (host = '') {
  let arr = host.split('.');
  if (arr.length > 1) {
    let com = arr.pop();
    let domain = arr.pop();
    return '//' + domain + '.' + com;
  }
  return host;
};

site.handleNotRoute = function (req, res) {
  console.log(req.path)
  let host = req.headers['host'];
  let setting = site.getSiteSetting(host);
  if (!setting.host) {
    res.redirect('/');
  } else {
    res.redirect('/');
  }
};

site.run();
