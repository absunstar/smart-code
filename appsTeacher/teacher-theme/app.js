module.exports = function init(site) {
  site.get({
    name: '/teacher',
    path: __dirname + '/site_files',
  });
  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: ['/css/teacher.css'],
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
      __dirname + '/site_files/css/teacher-mobile.css',
    ],
  });

  site.get({
    name: ['/js/teacher.js'],
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
      name: ['favicon.ico'],
    },
    (req, res) => {
      let setting = site.getSiteSetting(req.host) || {};
      res.redirect(setting.logo?.url || '/images/logo.png');
    }
  );

  site.get(
    {
      name: ['/', '/@*'],
    },
    (req, res) => {
      let teacherUsername = req.url.split('@')[1];
      if (teacherUsername) {
        let teacher = site.teacherList.find((t) => t.username && t.username.toLowerCase() == teacherUsername.toLowerCase());

        if (teacher) {
          req.session.selectedTeacherId = teacher.id;
          req.session.selectedTeacherName = teacher.firstName.split(' ').slice(0, 2);
          site.saveSession(req.session);
        }
      }

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

      req.body.teacherLimit = 9;
      setting.description = setting.description || '';
      setting.keyWordsList = setting.keyWordsList || [];
      let data = {
        newsList: site.getNews(req),
        packagesList: site.getPackages(req),
        lecturesList: site.getLectures(req),
        miniBooksList: site.getMiniBooks(req),
        booksList: site.getBooks(req),
        liveList: site.getLive(req),
        teacherList: site.getTeachers({ host: req.host, limit: 9 }),
        childrenList: site.getStudents({ host: req.host, parentId: req.session?.user?.id }),
        isTeacher: req.session.selectedTeacherId ? true : false,
        isSingleSite: !setting.isShared && !setting.isCenter ? true : false,
        guid: '',
        showTeachers: setting.isShared && !req.session.selectedTeacherId ? true : false,
        setting: setting,
        notificationsCount: notificationsCount,
        notificationsList: req.session?.user?.notificationsList?.slice(0, 7),
        filter: site.getHostFilter(req.host),
        site_logo: setting.logo?.url || '/images/logo.png',
        powerdByLogo: setting.powerdByLogo?.url || '/images/logo.png',
        site_footer_logo: setting.footerLogo?.url || '/images/logo.png',
        banner: setting.banner?.url || '/images/logo.png',
        page_image: setting.logo?.url || '/images/logo.png',
        user_image: req.session?.user?.image?.url || '/images/logo.png',
        site_name: setting.siteName,
        page_lang: setting.id,
        page_type: 'website',
        page_title: setting.siteName + ' ' + setting.titleSeparator + ' ' + setting.siteSlogan,
        page_description: setting.description.substr(0, 200),
        page_keywords: setting.keyWordsList.join(','),
      };
      if (data.liveList?.length > 0) {
        data.isLive = true;
      }
      if (req.session.user) {
        if (req.session.user.type == 'student') {
          data.isStudent = true;
        }
        if (req.session.user.type == 'parent') {
          data.isParent = true;
        }
      } else {
        data.isStudent = true;
      }

      if (req.hasFeature('host.com')) {
        data.site_logo = '//' + req.host + data.site_logo;
        data.site_footer_logo = '//' + req.host + data.site_footer_logo;
        data.banner = '//' + req.host + data.banner;
        data.page_image = '//' + req.host + data.page_image;
        data.user_image = '//' + req.host + data.user_image;
        data.powerdByLogo = '//' + req.host + data.powerdByLogo;
      }
      res.render(__dirname + '/site_files/html/index.html', data, {
        parser: 'html',
        compres: true,
      });
    }
  );

  site.post({ name: '/api/selectTeacher' }, (req, res) => {
    let response = {
      done: false,
    };
    site.security.getUser({ id: req.data }, (err, user) => {
      if (!err && user) {
        req.session.selectedTeacherObjectId = user._id;
        req.session.selectedTeacherId = req.data;
        req.session.selectedTeacherName = user.firstName.split(' ').slice(0, 2);
        site.saveSession(req.session);
        response.done = true;
        res.json(response);
      }
    });
  });

  site.post({ name: '/api/exitTeacher' }, (req, res) => {
    let response = {
      done: false,
    };
    req.session.selectedTeacherObjectId = null;
    req.session.selectedTeacherId = null;
    req.session.selectedTeacherName = null;
    site.saveSession(req.session);
    response.done = true;
    res.json(response);
  });
};
