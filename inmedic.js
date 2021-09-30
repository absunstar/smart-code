const site = require('isite')({
  port: [9090],
  lang: 'ar',
  version: '1.0.9',
  name: 'inmedic',
  theme: 'theme_paper',
  require: {
    features: [],
    permissions: [],
  },
  https: {
    enabled: false,
    port: 5050,
  },
  mongodb: {
    db: 'inmedic_db',
    limit: 100000,
  },
  security: {
    keys: ['e698f2679be5ba5c9c0b0031cb5b057c', '9705a3a85c1b21118532fefcee840f99'],
  },
});

site.ready = false;

site.addFeature('inmedic');
site.addFeature('atm');

site.importApp(__dirname + '/apps_innovalz/in-medic', 'inmedic');


site.importApp(__dirname + '/apps_private/cloud_security', 'security');
site.importApp(__dirname + '/apps_private/ui-help');
site.importApp(__dirname + '/apps_private/notifications')
site.importApps(__dirname + '/apps_accounting');
site.importApps(__dirname + '/apps_inventories');
site.importApps(__dirname + '/apps_reports');
site.importApps(__dirname + '/apps_medical');
site.importApps(__dirname + '/apps_innovalz_store');
site.importApps(__dirname + '/apps_agora');

site.importApps(__dirname + '/apps_hr');
site.importApps(__dirname + '/apps_medic')
site.importApps(__dirname + '/apps_core');

site.run();
