const site = require('../isite')({
  port: [80, 40018],
  lang: 'ar',
  version: Date.now(),
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

site.time = new Date().getTime();

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
    if (!site.setting.siteTemplate || !site.setting.siteLogo) {
      res.redirect('/admin');
      return;
    }
    if (true || site.setting.siteTemplate.id == 1) {
      res.render(
        'theme1/index.html',
        {
          site_name: site.setting.languagesList[0].siteName,
          page_logo: site.setting.siteLogo.url,
          page_title: site.setting.languagesList[0].siteName + site.setting.languagesList[0].titleSeparator + site.setting.languagesList[0].siteSlogan,
          page_description: site.setting.languagesList[0].description,
          prayerTimingsList: site.setting.prayerTimingsList,
          categoriesDisplayList1: site.categoriesDisplayList1,
          categoriesDisplayList2: site.categoriesDisplayList2,
          categoriesDisplayList3: site.categoriesDisplayList3,
          categoriesList1: site.categoriesList1,
          categoriesList2: site.categoriesList2,
          categoriesList3: site.categoriesList3,
          topNews: site.topNews,
          MainSliderNews: site.MainSliderNews,
        },
        {
          parser: 'html css js',
        }
      );
    }
  }
);
site.get(
  {
    name: ['/article/:id'],
  },
  (req, res) => {
    if (!site.setting.siteTemplate || !site.setting.siteLogo) {
      res.redirect('/admin');
      return;
    }
    if (true || site.setting.siteTemplate.id == 1) {
      let article = site.articlesList.find((a) => a.id == req.params.id);
      res.render(
        'theme1/article.html',
        {
          site_name: site.setting.languagesList[0].siteName,
          page_logo: doc.imageURL || site.setting.siteLogo.url,
          page_title: site.setting.languagesList[0].siteName + site.setting.languagesList[0].titleSeparator + doc.title,
          page_description: doc.description,
          prayerTimingsList: site.setting.prayerTimingsList,
          categoriesDisplayList1: site.categoriesDisplayList1,
          categoriesDisplayList2: site.categoriesDisplayList2,
          categoriesDisplayList3: site.categoriesDisplayList3,
          categoriesList1: site.categoriesList1,
          categoriesList2: site.categoriesList2,
          categoriesList3: site.categoriesList3,
          topNews: site.topNews,
          MainSliderNews: site.MainSliderNews,
          article: article,
        },
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
