const site = require("../isite")({
  port: [80, 40017],
  lang: "ar",
  version: "2023.03.07.2",
  name: "souq",
  savingTime: 5,
  log: true,
  require: {
    features: [],
    permissions: [],
  },
  theme: "theme_paper",
  mongodb: {
    db: "smart_code_souq_2022",
    limit: 100000,
    events: true,
    identity: {
      enabled: !0,
    },
  },
  security: {
    keys: [
      "e698f2679be5ba5c9c0b0031cb5b057c",
      "9705a3a85c1b21118532fefcee840f99",
    ],
  },
});

if (site.hasFeature("haraj")) {
}
site.words.addList(__dirname + "/site_files/json/words-sa.json");

site.get({
  name: "/",
  path: site.dir + "/",
  public: true,
});

site.get(
  {
    name: ["/", "/category/:id"],
  },
  (req, res) => {
    if (site.setting.user_design.id == 1) {
      res.render(
        "0/index.html",
        {},
        {
          parser: "html css js",
        }
      );
    } else if (site.setting.user_design.id == 2) {
      res.render(
        "0/index.html",
        {},
        {
          parser: "html css js",
        }
      );
    } else {
      res.render(
        "haraj/index.html",
        {
          title: site.setting.title,
          image_url: site.setting.logo,
          description: site.setting.description,
        },
        {
          parser: "html css js",
        }
      );
    }
  }
);

site.ready = false;
site.loadLocalApp("client-side");
site.loadLocalApp("ui-print");
site.importApps(__dirname + "/apps_souq");
site.importApp(__dirname + "/apps_private/cloud_security", "security");
site.importApp(__dirname + "/apps_private/ui-help");
site.importApp(__dirname + "/apps_private/notifications");
site.importApp(__dirname + "/apps_private/default_data");
site.importApp(__dirname + "/apps_private/manage-user");

site.importApp(__dirname + "/apps_private/companies");
site.addFeature("souq");

site.ready = true;

site.run();
site.security.addKey("5e8edd851d2fdfbd7415232c67367cc3");
site.security.addKey("0e849095ad8db45384a9cdd28d7d0e20");

site.sendMobileTwilioMessage = function (options) {
  try {
    if (
      site.setting.enable_sending_messages_mobile &&
      site.setting.account_id_mobile &&
      site.setting.auth_token_mobile &&
      site.setting.messaging_services_id_mobile
    ) {
      console.log(options);
      // const accountSid = 'ACf8c465f2b02b59f743c837eafe19a1a9';
      // const authToken = '046e313826666f9ffe41fc96b4964530';
      const client = require("twilio")(
        site.setting.account_id_mobile,
        site.setting.auth_token_mobile
      );

      client.messages
        .create({
          body: options.message,
          messagingServiceSid: site.setting.messaging_services_id_mobile,
          to: "+" + options.to,
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
  site
    .fetch("https://api.taqnyat.sa/wa/v1/messages", {
      mode: "no-cors",
      headers: {
        bearer: "87b92c81c66938a9ed6dda5fd1687145",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9,ar;q=0.8",
        "cache-control": "max-age=0",
        dnt: 1,
        "sec-ch-ua":
          '"Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": 1,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36",
      },
      body: {
        recipients: ["+" + options.to],
        body: options.message,
        sender: "Taqnyat.sa",
        scheduledDatetime: new Date(),
        deleteId: 3242424,
      },
      agent: function (_parsedURL) {
        /* if (_parsedURL.protocol == 'http:') {
            return new site.http.Agent({
                keepAlive: true,
            });
        } else {
            return new site.https.Agent({
                keepAlive: true,
            });
        } */
      },
    })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      default_items_group = data || [];
      res.json({
        done: true,
        docs: data || [],
      });
    });

  try {
    if (
      site.setting.enable_sending_messages_mobile &&
      site.setting.account_id_mobile &&
      site.setting.auth_token_mobile &&
      site.setting.messaging_services_id_mobile
    ) {
      console.log(options);
      // const accountSid = 'ACf8c465f2b02b59f743c837eafe19a1a9';
      // const authToken = '046e313826666f9ffe41fc96b4964530';
      const client = require("twilio")(
        site.setting.account_id_mobile,
        site.setting.auth_token_mobile
      );

      client.messages
        .create({
          body: options.message,
          messagingServiceSid: site.setting.messaging_services_id_mobile,
          to: "+" + options.to,
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
    obj.type = "smpt";
    obj.host = site.setting.email_setting.host;
    obj.port = site.setting.email_setting.port;
    obj.username = site.setting.email_setting.username;
    obj.password = site.setting.email_setting.password;
    obj.from = site.setting.email_setting.from;

    site.sendMail(obj);
  }
};

// site.on('zk attend', attend=>{
//     console.log(attend)
// })
