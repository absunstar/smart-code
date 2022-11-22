const site = require('../isite')({
  port: [80, 40017],
  lang: 'ar',
  version: '2022.11.15',
  name: 'souq',
  savingTime: 5,
  log: true,
  require: {
    features: [],
    permissions: [],
  },
  theme: 'theme_paper',
  mongodb: {
    db: 'smart_code_souq_2022',
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

if (site.hasFeature('haraj')) {
}
site.words.addList(__dirname + '/site_files/json/words-sa.json');

site.get({
  name: '/',
  path: site.dir + '/',
  public: true,
});

site.get(
  {
    name: ['/', '/category/:id'],
  },
  (req, res) => {
    if (site.setting.user_design.id == 1) {
      res.render(
        '0/index.html',
        {},
        {
          parser: 'html css js',
        }
      );
    } else if (site.setting.user_design.id == 2) {
      res.render(
        '0/index.html',
        {},
        {
          parser: 'html css js',
        }
      );
    } else {
      res.render(
        'haraj/index.html',
        {},
        {
          parser: 'html css js',
        }
      );
    }
  }
);

site.ready = false;
site.loadLocalApp('client-side');
site.loadLocalApp('ui-print');
site.importApps(__dirname + '/apps_souq');
site.importApp(__dirname + '/apps_private/cloud_security', 'security');
site.importApp(__dirname + '/apps_private/ui-help');
site.importApp(__dirname + '/apps_private/notifications');
site.importApp(__dirname + '/apps_private/default_data');
site.importApp(__dirname + '/apps_private/manage-user');

site.importApp(__dirname + '/apps_private/companies');
site.addFeature('souq');

site.ready = true;

site.run();
site.security.addKey('5e8edd851d2fdfbd7415232c67367cc3');
site.security.addKey('0e849095ad8db45384a9cdd28d7d0e20');


site.sendMobileMessage = function (options) {
  try {
    if (site.setting.enable_sending_messages_mobile && site.setting.account_id_mobile && site.setting.auth_token_mobile && site.setting.messaging_services_id_mobile) {

      console.log(options);
      // const accountSid = 'ACf8c465f2b02b59f743c837eafe19a1a9';
      // const authToken = '046e313826666f9ffe41fc96b4964530';
      const client = require('twilio')(site.setting.account_id_mobile, site.setting.auth_token_mobile);
  
      client.messages
        .create({
          body: options.message,
          messagingServiceSid: site.setting.messaging_services_id_mobile,
          to: '+' + options.to
        })
        .then(message => console.log(message.sid))
        .done();
    }
    return true;
  } catch (error) {
      return false;
  }


}

site.sendMailMessage = function (options) {
  console.log(options);
}
// site.on('zk attend', attend=>{
//     console.log(attend)
// })
