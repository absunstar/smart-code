module.exports = function init(site) {
  site.get({
    name: "images",
    path: __dirname + "/site_files/images/",
  });

  site.get({
    name: "css",
    path: __dirname + "/site_files/css/",
  });

  site.get(
    {
      name: ["/profileView/:id", ["teacher/:userName"]],
    },
    (req, res) => {
      let setting = site.getSiteSetting(req.host) || {};
      site.security.getUser(
        { id: req.params.id, userName: req.params.userName },
        (err, user) => {
          if (user) {
            let data = {
              packagesList: packages,
              lecturesList: lectures,
              setting: setting,
              guid: "",
              setting: setting,
              filter: site.getHostFilter(req.host),
              site_logo: setting.logo?.url || "/lawyer/images/logo.png",
              page_image: setting.logo?.url || "/lawyer/images/logo.png",
              user_image:
                req.session?.user?.image?.url || "/lawyer/images/logo.png",
              site_name: setting.siteName,
              page_lang: setting.id,
              page_type: "website",
              page_title:
                setting.siteName +
                " " +
                setting.titleSeparator +
                " " +
                setting.siteSlogan,
              page_description: setting.description.substr(0, 200),
              page_keywords: setting.keyWordsList.join(","),
            };
  
            if (req.hasFeature("host.com")) {
              data.site_logo = "https://" + req.host + data.site_logo;
              data.page_image = "https://" + req.host + data.page_image;
              data.user_image = "https://" + req.host + data.user_image;
            }
            res.render("profile/profileView.html", data, {
              parser: "html",
              compres: true,
            });
          }
        }
      );
    }
  );

  // site.onGET("profileView/:id", (req, res) => {
  //   site.security.getUser({ id: req.params.id }, (err, user) => {
  //     if (user) {
  //       user.title = user.firstName + " " + user.lastName;
  //       res.render("profile/profileView.html", user);
  //     }
  //   });
  // });

  site.onGET("profileEdit/:id", (req, res) => {
    site.security.getUser({ id: req.params.id }, (err, user) => {
      if (user) {
        let setting = site.getSiteSetting(req.host);
        setting.description = setting.description || "";
        setting.keyWordsList = setting.keyWordsList || [];
        let data = {
          setting: setting,
          guid: "",
          setting: setting,
          filter: site.getHostFilter(req.host),
          site_logo: setting.logo?.url || "/lawyer/images/logo.png",
          page_image: setting.logo?.url || "/lawyer/images/logo.png",
          user_image:
            req.session?.user?.image?.url || "/lawyer/images/logo.png",
          site_name: setting.siteName,
          page_lang: setting.id,
          page_type: "website",
          page_title:
            setting.siteName +
            " " +
            setting.titleSeparator +
            " " +
            setting.siteSlogan,
          page_description: setting.description.substr(0, 200),
          page_keywords: setting.keyWordsList.join(","),
        };
        if (req.hasFeature("host.com")) {
          data.site_logo = "https://" + req.host + data.site_logo;
          data.page_image = "https://" + req.host + data.page_image;
          data.user_image = "https://" + req.host + data.user_image;
        }
        res.render("profile/profileEdit.html", data);
      }
    });
  });

  site.get(
    {
      name: ["/login"],
    },
    (req, res) => {
      res.render(
        __dirname + "/site_files/html/index.html",
        { setting: site.getSiteSetting(req.host) },
        { parser: "html", compres: true }
      );
    }
  );
};
