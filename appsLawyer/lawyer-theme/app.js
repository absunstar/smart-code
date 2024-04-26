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
      name: ['/','lawyer'],
    },
    (req, res) => {
      res.render(__dirname + '/site_files/html/index.html', { setting: site.getSiteSetting(req.host) }, { parser: 'html', compres: true });
    }
  );
};
