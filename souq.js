const site = require('../isite')({
  port: [80, 40017],
  lang: 'Ar',
  language: { id: 'Ar', dir: 'rtl', text: 'right' },
  version: Date.now(),
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
    req.session.language = { id: 'Ar', dir: 'rtl', text: 'right' };
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
      let data = {
        title: site.setting.title,
        image_url: '//' + req.host + site.setting.logo,
        description: site.setting.description,
      };
      if (req.hasFeature('host.harajtmor')) {
        data.image_url = 'https://' + req.host + '/images/haraj.jpg';
      }
      res.render('haraj/index.html', data, {
        parser: 'html css js',
      });
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

site.sendMobileTwilioMessage = function (options) {
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

site.sendMobileTaqnyatMessage = function (options) {
  console.log(options);
  let bodyObject = {
    recipients: [options.to],
    body: options.message,
    sender: site.setting.account_sender_taqnya,
  };
  console.log(bodyObject);
  return site
    .fetch('https://api.taqnyat.sa/v1/messages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${site.setting.auth_token_mobile_taqnyat}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyObject),
      agent: function (_parsedURL) {
        return new site.https.Agent({
          keepAlive: true,
        });
      },
    })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.log(err);
    });
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

site.get('/x-update', (req, res) => {
  site.cmd('git pull', (data) => {
    res.end(data);
    console.log(data);
    site.cmd('pm2 restart 0', (data) => {
      console.log(data);
    });
  });
});

site.get('/x-restart', (req, res) => {
  site.cmd('pm2 restart 0', (data) => {
    console.log(data);
  });
});

// site.on('zk attend', attend=>{
//     console.log(attend)
// })
// site
//   .sendMobileTaqnyatMessage({
//     to: "+966591300875",
//     message: "Message For Test From Haraj Tomor",
//   })
//   .then((data) => {
//     console.log(data);
//   });
