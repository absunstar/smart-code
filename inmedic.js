const site = require('isite')({
  port: [80 , 40015],
  lang: 'ar',
  version: '2021.12.04',
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
    db: 'smart_code_medical',
    limit: 100000,
  },
  security: {
    keys: ['e698f2679be5ba5c9c0b0031cb5b057c', '9705a3a85c1b21118532fefcee840f99'],
  },
});

site.ready = false;

site.get({ name: '/', path: __dirname + '/site_files' });

site.addFeature('inmedic');
site.addFeature('atm');
site.addFeature('medical');

site.importApp(__dirname + '/apps_innovalz/in-medic', 'inmedic');

site.loadLocalApp('client-side');
site.loadLocalApp('ui-print');
site.importApp(__dirname + '/apps_private/cloud_security', 'security');
site.importApp(__dirname + '/apps_private/ui-help');
site.importApp(__dirname + '/apps_private/notifications');
site.importApps(__dirname + '/apps_accounting');
site.importApps(__dirname + '/apps_inventories');
site.importApps(__dirname + '/apps_reports');
site.importApps(__dirname + '/apps_medical');
site.importApps(__dirname + '/apps_innovalz_store');
site.importApps(__dirname + '/apps_agora');

site.importApps(__dirname + '/apps_hr');
site.importApps(__dirname + '/apps_medic');
site.importApps(__dirname + '/apps_core');



setTimeout(() => {
  site.importApp(__dirname + '/apps_private/companies');
  site.importApp(__dirname + '/apps_private/zk-reader');
}, 1000);

setTimeout(() => {
  site.ready = true;
}, 1000 * 2);


// site.onWS('/notification', (client) => {
//   client.onMessage = function (message) {
//     if (message.type === 'info') {
//       client.info = message.content
//     }
//   }
// })

// setInterval(() => {
//   site.ws.clientList.forEach(client => {
//     if (client.path === '/notification') {
//       if (client.info && client.info.type === 'doctor') {
//         client.send({ type: 'you are a doctor' })
//       } else {
//         client.send({ type: 'you are Not a doctor' })
//       }
//     }

//   });
// }, 1000 * 5);

// site.sendEmail({
//   from : 'amr@egytag.com',
//   to : 'a.yousry2122@gmail.com',
//   subject : 'test mail server 1',
//   message : 'test message 1'
// })


site.run();
