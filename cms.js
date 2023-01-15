const site = require('../isite')({
  port: [80, 40018],
  lang: 'ar',
  version: '2022.12.15',
  name: 'cms',
  savingTime: 5,
  log: true,
  require: {
    features: [],
    permissions: [],
  },
  theme: 'theme_paper',
  mongodb: {
    db: 'smart_code_cms',
    limit: 100000,
    events: true,
    identity: {
      enabled: !0,
    },
  },
  security: {
    keys: ['21232f297a57a5a743894a0e4a801fc3', 'f6fdffe48c908deb0f4c3bd36c032e72'],
  },
});

// if (site.hasFeature('cms')) {
// }
// site.words.addList(__dirname + '/site_files/json/words-sa.json');

site.get({
  name: '/',
  path: site.dir + '/',
  public: true,
});

site.get(
  {
    name: ['/'],
  },
  (req, res) => {
    if (site.setting.site_template &&site.setting.site_template.id == 1) {
      res.render(
        'cms/theme1.html',
        {},
        {
          parser: 'html css js',
        }
      );
    } else if (site.setting.site_template &&site.setting.site_template.id == 2) {
      res.render(
        'cms/index.html',
        {},
        {
          parser: 'html css js',
        }
      );
    } else {
      res.render(
        'cms/index.html',
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
site.importApps(__dirname + '/apps_cms');
site.importApp(__dirname + '/apps_private/cloud_security', 'security');
site.importApp(__dirname + '/apps_private/ui-help');
site.importApp(__dirname + '/apps_private/notifications');
site.importApp(__dirname + '/apps_private/default_data');
site.importApp(__dirname + '/apps_private/manage-user');

site.importApp(__dirname + '/apps_private/companies');
site.addFeature('cms');

site.ready = true;

site.run();

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
          to: '+' + options.to,
        })
        .then((message) => console.log(message.sid))
        .done();
    }
    return true;
  } catch (error) {
    return false;
  }
};

site.sendMailMessage = function (obj) {
  if (
    site.setting.email_setting &&
    site.setting.email_setting.host &&
    site.setting.email_setting.port &&
    site.setting.email_setting.username &&
    site.setting.email_setting.password &&
    site.setting.email_setting.from
  ) {
    obj.enabled = true;
    obj.type = 'smpt';
    obj.host = site.setting.email_setting.host;
    obj.port = site.setting.email_setting.port;
    obj.username = site.setting.email_setting.username;
    obj.password = site.setting.email_setting.password;
    obj.from = site.setting.email_setting.from;

    site.sendMail(obj);
  }
};
