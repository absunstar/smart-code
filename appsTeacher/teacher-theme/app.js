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
      __dirname + "/site_files/css/teacher-mobile.css",
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
      if (req.session.user && req.session.user.notificationsList) {
        let notifications = req.session.user.notificationsList.filter((_n) => !_n.show);
        notificationsCount = notifications.length;
      }
      site.security.getUsers(
        {
          where: {
            "parent.id": req.session?.user?.id,
          },
        },
        (err, children) => {
          site.getTeachers(req, (errTeachers, teachers) => {
            site.getPackages(req, (errPackages, packages) => {
              site.getLectures(req, (errLectures, lectures) => {
                site.getBooks(req, (errBooks, books) => {
                  setting.description = setting.description || "";
                  setting.keyWordsList = setting.keyWordsList || [];

                  let data = {
                    childrenList: children,
                    packagesList: packages,
                    lecturesList: lectures,
                    booksList: books,
                    teachersList: teachers,
                    isTeacher: req.session.selectedTeacherId ? true : false,
                    guid: "",
                    showTeachers: setting.isShared && !req.session.selectedTeacherId ? true : false,
                    setting: setting,
                    notificationsCount: notificationsCount,
                    notificationsList: req.session?.user?.notificationsList?.slice(0, 7),
                    filter: site.getHostFilter(req.host),
                    site_logo: setting.logo?.url || "/images/logo.png",
                    site_footer_logo: setting.footerLogo?.url || "/images/logo.png",
                    banner: setting.banner?.url || "/images/logo.png",
                    page_image: setting.logo?.url || "/images/logo.png",
                    user_image: req.session?.user?.image?.url || "/images/logo.png",
                    site_name: setting.siteName,
                    page_lang: setting.id,
                    page_type: "website",
                    page_title: setting.siteName + " " + setting.titleSeparator + " " + setting.siteSlogan,
                    page_description: setting.description.substr(0, 200),
                    page_keywords: setting.keyWordsList.join(","),
                  };

                  if (req.session.user) {
                    if (req.session.user.type == "student") {
                      data.isStudent = true;
                    }
                    if (req.session.user.type == "parent") {
                      data.isParent = true;
                    }
                  } else {
                    data.isStudent = true;
                  }

                  if (req.hasFeature("host.com")) {
                    data.site_logo = "//" + req.host + data.site_logo;
                    data.site_footer_logo = "//" + req.host + data.site_footer_logo;
                    data.banner = "//" + req.host + data.banner;
                    data.page_image = "//" + req.host + data.page_image;
                    data.user_image = "//" + req.host + data.user_image;
                  }
                  res.render(__dirname + "/site_files/html/index.html", data, {
                    parser: "html",
                    compres: true,
                  });
                });
              });
            });
          });
        }
      );
    }
  );

  site.post({ name: "/api/selectTeacher" }, (req, res) => {
    let response = {
      done: false,
    };
    req.session.selectedTeacherId = req.data
    site.saveSession(req.session);
    response.done = true;
    res.json(response);
  });

  site.post({ name: "/api/exitTeacher" }, (req, res) => {
    let response = {
      done: false,
    };
    req.session.selectedTeacherId = null;
    site.saveSession(req.session);
    response.done = true;
    res.json(response);
  });
};
