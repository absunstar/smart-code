module.exports = function init(site) {
  site.get({
    name: "/lawyer",
    path: __dirname + "/site_files",
    public : true
  });

  site.get({
    name: ["/css/lawyer.css"],
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
    name: ["/js/lawyer.js"],
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
      name: ["/", "/lawyer"],
    },
    (req, res) => {
      let setting = site.getSiteSetting(req.host) || {};
      // if (!setting.host) {
      //   res.redirect(site.getMainHost(req.host), 301);
      //   return;
      // }

      site.getConsultations(
        { "status.name": "closed" },
        (err, consultations) => {
          setting.description = setting.description || "";
          setting.keyWordsList = setting.keyWordsList || [];
          let data = {
            setting: setting,
            guid: "",
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
            typesConsultationsList:
              site.getApp("typesConsultations").memoryList,
            specialtiesList: site.getApp("specialties").memoryList,
            servicesList: site.getApp("services").memoryList,
            newList: site.getApp("manageUsers").newList,
            activeList: site.getApp("manageUsers").activeList,
            consultationsList: [],
          };
          if (consultations) {
            data.consultationsList = consultations;
          }
          if (req.hasFeature("host.com")) {
            data.site_logo = "//" + req.host + data.site_logo;
            data.site_footer_logo = "//" + req.host + data.site_footer_logo;
            data.banner = "//" + req.host + data.banner;
            data.page_image = "//" + req.host + data.page_image;
            data.user_image = "//" + req.host + data.user_image;
            data.powerdByLogo = "//" + req.host + data.powerdByLogo;
          }
          res.render(__dirname + "/site_files/html/index.html", data, {
            parser: "html",
            compres: true,
          });
        }
      );
    }
  );
};
