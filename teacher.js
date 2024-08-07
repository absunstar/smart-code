const site = require('../isite')({
  port: [80, 40021],
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
  let setting = site.getSiteSetting(req.host) || {};
  if (setting && setting.adsTxt) {
    res.end(setting.adsTxt);
  } else {
    res.txt('0/ads.txt');
  }
});

site.get('robots.txt', (req, res) => {
  let setting = site.getSiteSetting(req.host) || {};
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
// site.importApp(__dirname + '/apps_private/cloud_security', 'security');
// site.importApp(__dirname + '/apps_private/manage-user');
// site.importApp(__dirname + '/apps_private/companies');
site.importApp(__dirname + '/apps_cms/cms');
site.addFeature('teacher');

site.getMainHost = function (host = '') {
  if (host.contains('localhost') || host.contains('127.0.0.1')) {
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

site.xtime = function (_time, lang) {
  let since_few = ' Since few ';
  let before = ' Ago ';
  let second = ' Second ';
  let minute = ' Minute ';
  let hour = ' Hour ';
  let day = ' Day ';
  let month = ' Month ';
  let year = ' Year ';

  if (lang == 'Ar') {
    since_few = ' منذ قليل ';
    before = ' منذ ';
    second = ' ثانية ';
    minute = ' دقيقة ';
    hour = ' ساعة ';
    day = ' يوم ';
    month = ' شهر ';
    year = ' سنة ';
  }

  if (typeof _time == 'undefined' || !_time) {
    return since_few;
  }
  _time = new Date().getTime() - new Date(_time).getTime();

  let _type = null;

  let _time_2 = null;
  let _type_2 = null;

  let times = [1, 1000, 60, 60, 24, 30, 12];
  let times_type = ['x', second, minute, hour, day, month, year];

  let offset = new Date().getTimezoneOffset();
  if (false && offset < 0) {
    let diff = Math.abs(offset) * 60 * 1000;
    _time = _time + diff;
  }

  if (_time <= 10000) {
    return since_few;
  }

  for (let i = 0; i < times.length; i++) {
    if (_time < times[i]) {
      break;
    } else {
      _type = times_type[i];
      if (i > 0) {
        _time_2 = _time % times[i];
        _type_2 = times_type[i - 1];
      }
      _time = _time / times[i];
    }
  }

  _time = Math.floor(_time);
  _time_2 = Math.floor(_time_2);

  if (_time_2 == 0 || _type_2 == null || _type_2 == 'x') {
    return [before, _time, _type].join(' ');
  } else {
    return [before, _time, _type, _time_2, _type_2].join(' ');
  }
};

site.handleNotRoute = function (req, res) {
  let host = req.headers['host'];
 // console.log('handleNotRoute : ' + host + ' : ' + req.url);
  res.end();
  return;
  let setting = site.getSiteSetting(host);
  if (!setting.host) {
    res.redirect(site.getMainHost(host), 301);
  } else {
    res.redirect(setting.host);
  }
};

site.get("/x-update", (req, res) => {
  site.cmd("git pull", (data) => {
    res.end(data);
    console.log(data);
    site.cmd("pm2 restart 21", (data) => {
      console.log(data);
    });
  });
});

site.get("/x-restart", (req, res) => {
  site.cmd("pm2 restart 21", (data) => {
    console.log(data);
  });
});

site.run();
