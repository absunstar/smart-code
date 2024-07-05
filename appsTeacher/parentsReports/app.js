module.exports = function init(site) {
  let app = {
    name: "parentsReports",
    allowMemory: false,
    memoryList: [],
    allowCache: false,
    cacheList: [],
    allowRoute: true,
    allowRouteGet: true,
    allowRouteAdd: true,
    allowRouteUpdate: true,
    allowRouteDelete: true,
    allowRouteView: true,
    allowRouteAll: true,
  };

  site.get(
    {
      name: "lecturesStudentView",
    },
    (req, res) => {
      let notificationsCount = 0;
      if (req.session.user && req.session.user.notificationsList) {
        let notifications = req.session.user.notificationsList.filter((_n) => !_n.show);
        notificationsCount = notifications.length;
      }
      let setting = site.getSiteSetting(req.host);
      setting.description = setting.description || "";
      setting.keyWordsList = setting.keyWordsList || [];
      let data = {
        notificationsCount: notificationsCount,
        notificationsList: req.session?.user?.notificationsList?.slice(0, 7),
        setting: setting,
        guid: "",
        setting: setting,
        filter: site.getHostFilter(req.host),
        site_logo: setting.logo?.url || "/images/logo.png",
        site_footer_logo: setting.footerLogo?.url || "/images/logo.png",
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
        data.site_logo = "//" + req.host + data.site_logo;
        data.site_footer_logo = "//" + req.host + data.site_footer_logo;
        data.page_image = "//" + req.host + data.page_image;
        data.user_image = "//" + req.host + data.user_image;
      }
      res.render(app.name + "/lecturesStudentView.html", data, {
        parser: "html",
        compres: true,
      });
    }
  );

  site.post(
    {
      name: `/api/${app.name}/lecturesStudent`,
      require: { permissions: ["login"] },
    },
    (req, res) => {
      let response = {
        done: false,
      };

      let _data = req.data;
      site.getLecturesToStudent(req, (err, lectures) => {
        site.getQuizzesToStudent(req, (err, quizzes) => {
          response.done = true;
          lectures = lectures || [];
          quizzes = quizzes || [];
          for (let i = 0; i < lectures.length; i++) {
            let lecture = lectures[i];

            let index = quizzes.findIndex((itm) => itm.lecture.id === lecture.id);
            if (index !== -1) {
              lecture.quiz = {
                done: true,
                userDegree: quizzes[index].userDegree,
                timesEnterQuiz: quizzes[index].timesEnterQuiz,
                date: quizzes[index].date,
                questionsCount: quizzes[index].questionsList.length,
                correctAnswers: quizzes[index].correctAnswers,
                wrongAnswers: quizzes[index].questionsList.length - quizzes[index].correctAnswers,
              };
            } else {
              lecture.quiz = {
                done: false,
              };
            }
          }

          response.list = lectures;
          res.json(response);
        });
      });
    }
  );

  site.addApp(app);
};
