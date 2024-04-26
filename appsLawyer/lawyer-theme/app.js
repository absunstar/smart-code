module.exports = function init(site) {
  site.get({
    name: '/lawyer',
    path: __dirname + '/site_files',
  });

  site.get({
    name: ['/css/lawyer.css'],
    parser: 'css2',
    public: true,
    compress: !0,
    path: [
      __dirname + '/site_files/css/header.css',
      __dirname + '/site_files/css/sidebar.css',
      __dirname + '/site_files/css/sidebarProfile.css',
      __dirname + '/site_files/css/storysContainer.css',
      __dirname + '/site_files/css/lawSectionsConatiner.css',
      __dirname + '/site_files/css/moreActiveLowersConatiner.css',
      __dirname + '/site_files/css/recentlyConsultantsContanier.css',
      __dirname + '/site_files/css/profile.css',
      __dirname + '/site_files/css/smScreen.css',
      __dirname + '/site_files/css/mdScreen.css',
      __dirname + '/site_files/css/cricleConsultantAskConatainer.css',
      __dirname + '/site_files/css/payedConsultantConatainer.css',
      __dirname + '/site_files/css/orderTextConsultingContainer.css',
      __dirname + '/site_files/css/videoStoryContainer.css',
      __dirname + '/site_files/css/adsBanner.css',
      __dirname + '/site_files/css/footer.css',
      __dirname + '/site_files/css/color.css',
      __dirname + '/site_files/css/style.css',
    ],
  });

  site.get({
    name: ['/js/lawyer.js'],
    parser: 'js2',
    public: true,
    compress: !0,
    path: [
      __dirname + '/site_files/js/SectionScroll.js',
      __dirname + '/site_files/js/orderConsultant.js',
      __dirname + '/site_files/js/orderTextConsultant.js',
      __dirname + '/site_files/js/storyvideoLower.js',
      __dirname + '/site_files/js/openMobileMenu.js',
    ],
  });

  site.get(
    {
      name: ['/', '/lawyer'],
    },
    (req, res) => {
      let setting = site.getSiteSetting(req.host);
      // if (!setting.host) {
      //   res.redirect(site.getMainHost(req.host), 301);
      //   return;
      // }

      if (!setting.languageList || setting.languageList.length == 0) {
        res.redirect('/404', 404);
        return;
      }

      let language = setting.languageList.find((l) => l.id == req.session.lang) || setting.languageList[0];

      if (!language) {
        res.redirect('/404', 404);
        return;
      }
      language.description = language.description || '';
      language.keyWordsList = language.keyWordsList || [];
      let data = {
        setting: setting,
        guid: '',
        language: language,
        filter: site.getHostFilter(req.host),
        site_logo: language.logo?.url || '/lawyer/images/logo.png',
        page_image: language.logo?.url || '/lawyer/images/logo.png',
        site_name: language.siteName,
        page_lang: language.id,
        page_type: 'website',
        page_title: language.siteName + ' ' + language.titleSeparator + ' ' + language.siteSlogan,
        page_description: language.description.substr(0, 200),
        page_keywords: language.keyWordsList.join(','),
      };

      res.render(__dirname + '/site_files/html/index.html', data, { parser: 'html', compres: true });
    }
  );
};
