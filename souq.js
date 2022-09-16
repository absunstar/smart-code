const site = require('isite')({
  port: [80, 40017],
  lang: 'ar',
  version: '2021.12.14',
  name: 'souq',
  savingTime: 5,
  log: true,
  require: {
    features: [],
    permissions: [],
  },
  theme: 'theme_paper',
  mongodb: {
    db: 'smart_code_souq',
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

if (site.hasFeature('herag')) {
  site.words.addList(__dirname + '/site_files/json/words-sa.json');
}

site.get({
  name: '/',
  path: site.dir + '/',
  public: true,
});

site.get(
  {
    name: '/',
  },
  (req, res) => {
    site.getDefaultSetting((data) => {
      data = data || {}
      data.site_settings = data.site_settings || {};
      data.site_settings.user_design = data.site_settings.user_design || { id: 5 };
      if (data.site_settings.user_design.id == 1) {
        res.render(
          '0-default/index.html',
          {},
          {
            parser: 'html css js',
          }
        );
      } else if (data.site_settings.user_design.id == 2) {
        res.render(
          '0-default/index.html',
          {},
          {
            parser: 'html css js',
          }
        );
      } else {
        res.render(
          'herag/index.html',
          {},
          {
            parser: 'html css js',
          }
        );
      }
    });
  }
);

site.ready = false;
site.loadLocalApp('client-side');
site.loadLocalApp('ui-print');
site.importApp(__dirname + '/apps_private/cloud_security', 'security');
site.importApp(__dirname + '/apps_private/ui-help');
site.importApp(__dirname + '/apps_private/notifications');
site.importApp(__dirname + '/apps_private/default_data');
site.importApp(__dirname + '/apps_private/manage-user');
site.importApps(__dirname + '/apps_souq');

site.importApp(__dirname + '/apps_private/companies');
site.addFeature('souq');

site.ready = true;

site.run();
site.security.addKey('5e8edd851d2fdfbd7415232c67367cc3');
site.security.addKey('0e849095ad8db45384a9cdd28d7d0e20');

// site.on('zk attend', attend=>{
//     console.log(attend)
// })
