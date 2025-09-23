const site = require('../isite')({
  port: [80, 40004],
  lang: 'Ar',
  language: { id: 'Ar', dir: 'rtl', text: 'right' },
  version: '2023.03.07.2',
  name: 'restaurant',
  savingTime: 5,
  log: true,
    upload_dir: __dirname + "/../uploads",
    download_dir: __dirname + "/../downloads",
    backup_dir: __dirname + "/../backups",
  require: {
    features: [],
    permissions: [],
  },
  theme: 'theme_paper',
  mongodb: {
    db: 'smart_code_restaurants',
    limit: 100000,
    events: true,
    identity: {
      enabled: !0,
    },
  },
  security: {
    keys: ['e698f2679be5ba5c9c0b0031cb5b057c', '9705a3a85c1b21118532fefcee840f99'],
  },
});

if (site.hasFeature('protouch')) {
  site.words.addList(__dirname + '/site_files/json/words-sa.json');
}

site.get({
  name: '/',
  path: site.dir + '/',
});

site.get({
  name: '/',
  path: site.dir + '/html/index.html',
  parser: 'html css js',
});

site.words.add(
  {
    name: 'le',
    En: 'Ryal',
    Ar: 'ريال',
  },
  {
    name: 'pound',
    En: 'Ryal',
    Ar: 'ريال',
  }
);

site.ready = false;
site.loadLocalApp('client-side');
site.loadLocalApp('ui-print');
site.importApp(__dirname + '/apps_private/cloud_security', 'security');
site.importApp(__dirname + '/apps_private/ui-help');
site.importApp(__dirname + '/apps_private/notifications');
site.importApps(__dirname + '/apps_core');
site.importApps(__dirname + '/apps_accounting');
site.importApps(__dirname + '/apps_inventories');
site.importApps(__dirname + '/apps_reports');
site.importApps(__dirname + '/apps_order');
site.importApps(__dirname + '/apps_hr');
site.importApps(__dirname + '/apps_restaurant');
site.addFeature('restaurant');

setTimeout(() => {
  site.importApp(__dirname + '/apps_private/companies');
  site.importApp(__dirname + '/apps_private/zk-reader');
}, 1000);

setTimeout(() => {
  site.ready = true;
}, 1000 * 2);

site.run();
site.security.addKey('5e8edd851d2fdfbd7415232c67367cc3');
site.security.addKey('0e849095ad8db45384a9cdd28d7d0e20');

// add sa sasa keys
site.security.addKey('c12e01f2a13ff5587e1e9e4aedb8242d');
site.security.addKey('f45731e3d39a1b2330bbf93e9b3de59e');
