module.exports = function init(site) {
  site.get({
    name: "/teacher",
    path: __dirname + "/site_files",
  });

  site.get({
    name: ["/css/teacher.css"],
    parser: "css2",
    public: true,
    compress: !0,
    path: [
      __dirname + "/site_files/css/header.css",
      __dirname + "/site_files/css/sidebar.css",
      __dirname + "/site_files/css/sidebarProfile.css",
      __dirname + "/site_files/css/storysContainer.css",
      __dirname + "/site_files/css/lawSectionsConatiner.css",
      __dirname + "/site_files/css/moreActiveLowersConatiner.css",
      __dirname + "/site_files/css/recentlyConsultantsContanier.css",
      __dirname + "/site_files/css/profile.css",
      __dirname + "/site_files/css/smScreen.css",
      __dirname + "/site_files/css/mdScreen.css",
      __dirname + "/site_files/css/cricleConsultantAskConatainer.css",
      __dirname + "/site_files/css/payedConsultantConatainer.css",
      __dirname + "/site_files/css/orderTextConsultingContainer.css",
      __dirname + "/site_files/css/videoStoryContainer.css",
      __dirname + "/site_files/css/adsBanner.css",
      __dirname + "/site_files/css/footer.css",
      __dirname + "/site_files/css/color.css",
      __dirname + "/site_files/css/style.css",
    ],
  });

  site.get({
    name: ["/js/teacher.js"],
    parser: "js2",
    public: true,
    compress: !0,
    path: [
      __dirname + "/site_files/js/SectionScroll.js",
      __dirname + "/site_files/js/orderConsultant.js",
      __dirname + "/site_files/js/orderTextConsultant.js",
      __dirname + "/site_files/js/storyvideoLower.js",
      __dirname + "/site_files/js/openMobileMenu.js",
    ],
  });

  site.get(
    {
      name: ["/", "/teacher"],
    },
    (req, res) => {
      let setting = site.getSiteSetting(req.host) || {};
      // if (!setting.host) {
      //   res.redirect(site.getMainHost(req.host), 301);
      //   return;
      // }
      let notificationsCount = 0;
      if(req.session.user) {
        let notifications = req.session.user.notificationsList.filter(_n => !_n.show)
        notificationsCount = notifications.length
      }

      site.getPackages(req, (err, packages) => {
        site.getLectures(req, (err, lectures) => {
          site.getBooks(req, (err, books) => {
            setting.description = setting.description || "";
            setting.keyWordsList = setting.keyWordsList || [];
            let data = {
              packagesList: packages,
              lecturesList: lectures,
              booksList: books,
              guid: "",
              setting: setting,
              notificationsCount: notificationsCount,
              notificationsList: req.session.user.notificationsList.slice(0, 7),
              filter: site.getHostFilter(req.host),
              site_logo: setting.logo?.url || "/images/logo.png",
              page_image: setting.logo?.url || "/images/logo.png",
              user_image: req.session?.user?.image?.url || "/images/logo.png",
              site_name: setting.siteName,
              page_lang: setting.id,
              page_type: "website",
              page_title: setting.siteName + " " + setting.titleSeparator + " " + setting.siteSlogan,
              page_description: setting.description.substr(0, 200),
              page_keywords: setting.keyWordsList.join(","),
            };
            if (req.hasFeature("host.com")) {
              data.site_logo = "https://" + req.host + data.site_logo;
              data.page_image = "https://" + req.host + data.page_image;
              data.user_image = "https://" + req.host + data.user_image;
            }
            res.render(__dirname + "/site_files/html/index.html", data, {
              parser: "html",
              compres: true,
            });
          });
        });
      });
    }
  );
};
