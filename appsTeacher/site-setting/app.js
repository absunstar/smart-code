module.exports = function init(site) {
  const $siteSetting = site.connectCollection("siteSetting");
  const hostManager = site.connectApp({
    name: "hosts",
    allowMemory: true,
    sort: { id: 1 },
  });

  site.settingList = [];

  site.supportedLanguageList = [
    {
      id: "AR",
      name: "عربي",
      direction: "rtl",
    },
    {
      id: "EN",
      name: "English",
      direction: "ltr",
    },
    {
      id: "FR",
      name: "French",
      direction: "ltr",
    },
    {
      id: "TR",
      name: "Turki",
      direction: "rtl",
    },
  ];

  site.articleTypes = [
    {
      id: 1,
      EN: "Standred",
      AR: "افتراضى",
    },
    {
      id: 2,
      EN: "advanced",
      AR: "متطور",
    },
    {
      id: 3,
      EN: "Multi-Paragraph",
      AR: "متعدد الفقرات",
    },
    {
      id: 4,
      EN: "Multi-Paragraph advanced",
      AR: "متعدد الفقرات متطور",
    },
    {
      id: 5,
      EN: "Multi-Image",
      AR: "متعدد الصور",
    },
    {
      id: 6,
      EN: "google-news",
      AR: "أخبار جوجل",
    },
    {
      id: 7,
      EN: "yts-movie",
      AR: "yts-movie",
    },
    {
      id: 8,
      EN: "Youtube Video",
      AR: "Youtube Video",
    },
    {
      id: 9,
      EN: "Facebook Post",
      AR: "Facebook Post",
    },
  ];
  site.publishingSystem = [
    {
      id: 1,
      EN: "Immediately",
      AR: "فوري",
    },
    {
      id: 2,
      EN: "By User",
      AR: "بواسطة المستخدم",
    },
  ];
  site.closingSystem = [
    {
      id: 1,
      EN: "After a specified period",
      AR: "بعد مدة محددة",
    },
    {
      id: 2,
      EN: "By User",
      AR: "بواسطة المستخدم",
    },
    {
      id: 3,
      EN: "For Ever",
      AR: "الى الابد",
    },
  ];

  site.siteColor = [
    {
      id: "#d7373f",
      EN: "Red",
      AR: "أحمر",
    },
    {
      id: "#2196f3",
      EN: "Blue",
      AR: "أزرق",
    },
    {
      id: "#8bc34a",
      EN: "Green",
      AR: "أخضر",
    },
    {
      id: "#272727",
      EN: "Black",
      AR: "أسود",
    },
  ];
  site.articleStatus = [
    {
      id: 1,
      EN: "Active",
      AR: "نشط",
    },
    {
      id: 2,
      EN: "Under review",
      AR: "قيد المراجعة",
    },
    {
      id: 3,
      EN: "Forbidden",
      AR: "محظور",
    },
  ];
  site.durationExpiry = [
    {
      id: 1,
      EN: "Hour",
      AR: "ساعة",
    },
    {
      id: 2,
      EN: "Day",
      AR: "يوم",
    },
    {
      id: 3,
      EN: "Month",
      AR: "شهر",
    },
  ];
  site.defaultSetting = {
    host: "",
    lengthOrder: 0,
    siteTemplate: { id: 1 },
    mainCategoryList: [],
    programming: {},
    languageList: [],
    article: {
      articleTypes: site.articleTypes,
    },
    block: {},
    siteColor1: "#272727",
    siteColor2: "#d7373f",
    siteColor3: "#8bc34a",
    siteColor4: "#8bc34a",
    siteBackground1: "#d9d9d9",
    siteBackground2: "#000000",
    siteBackground1: "#ffffff",
    siteBackground3: "#ffffff",
    siteBackground4: "#ffffff",
  };
  site.getHostFilter = function (domain = "") {
    let h = hostManager.memoryList.find((h) => domain.like(h.domain));
    if (h) {
      return h.filter;
    } else {
      return domain;
    }
  };

  site.addNewHost = function (data) {
    hostManager.add(data);
  };

  site.getSiteSetting = function (host = "") {
    return (
      site.settingList.find((s) => s.host.like(host)) || {
        ...site.defaultSetting,
        ...site.settingList[0],
        host: "",
      }
    );
  };

  site.getTeacherSetting = function (req) {
    let teacherId = null;
    let setting = site.settingList.find((s) => s.host.like(req.host)) || {
      ...site.defaultSetting,
      ...site.settingList[0],
      host: "",
    };

    if (setting.isShared) {
      if (req.session.user && req.session.user.type == "teacher") {
        teacherId = req.session.user.id;
      } else if (req.session.teacherId) {
        teacherId = req.session.teacherId;
      }
    } else {
      if (setting.teacher && setting.teacher.id) {
        teacherId = setting.teacher.id;
      }
    }
    return teacherId;
  };

  site.getTeacherSettingToGet = function (req) {
    let teacherId = null;
    let setting = site.settingList.find((s) => s.host.like(req.host)) || {
      ...site.defaultSetting,
      ...site.settingList[0],
      host: "",
    };

    if (setting.isShared) {
      if (req.session.user && req.session.user.type == "teacher") {
        teacherId = req.session.user.id;
      } else {
      }
    } else {
      if (setting.teacher && setting.teacher.id) {
        teacherId = setting.teacher.id;
      }
    }
    return teacherId;
  };

  site.supportedLanguageList.forEach((l) => {
    site.defaultSetting.languageList.push({ ...l });
  });

  $siteSetting.findAll({ sort: { id: 1 } }, (err, docs) => {
    if (!err && docs && docs.length > 0) {
      docs.forEach((doc) => {
        if (!doc.article.articleTypes) {
          doc.article.articleTypes = site.articleTypes;
        }

        if (!doc.article.languages) {
          doc.article.languages = [...site.supportedLanguageList];
        }

        if (!doc.languageList) {
          doc.languageList = [...site.supportedLanguageList];
        } else {
          doc.languageList.forEach((lang, i) => {
            doc.languageList[i] = {
              ...doc.languageList[i],
              ...site.supportedLanguageList[i],
            };
          });
        }
        site.settingList.push({ ...doc });
      });
      site.defaultSetting = { ...site.defaultSetting, ...site.settingList[0] };
    } else {
      $siteSetting.add(site.defaultSetting, (err, doc) => {
        if (!err && doc) {
          site.settingList.push({ ...doc });
          site.defaultSetting = {
            ...site.defaultSetting,
            ...site.settingList[0],
          };
        }
      });
    }
  });

  site.get(
    {
      name: "host-manager",
      require: { permissions: ["login"] },
    },
    (req, res) => {
      res.render("site-setting/hosts.html", {}, { parser: "html" });
    }
  );

  site.get(
    {
      name: "site-setting",
      require: { permissions: ["login"] },
    },
    (req, res) => {
      let setting = site.getSiteSetting(req.host) || {};
      let language = setting.languageList.find((l) => l.id == req.session.lang) || setting.languageList[0];

      res.render(
        "site-setting/index.html",
        {
          language: language,
          setting: setting,
          templateList: site.templateList,
          publishingSystem: site.publishingSystem,
          closingSystem: site.closingSystem,
          siteColor: site.siteColor,
          articleStatus: site.articleStatus,
          durationExpiry: site.durationExpiry,
        },
        { parser: "html" }
      );
    }
  );

  site.get({
    name: "/images",
    path: __dirname + "/site_files/images",
  });

  site.post({
    name: "/api/location/all",
    path: __dirname + "/site_files/json/location.json",
  });

  site.post("/api/get-site-setting", (req, res) => {
    let response = {
      doc: site.getSiteSetting(req.host),
      done: true,
    };
    res.json(response);
  });

  site.post({ name: "/api/set-site-setting", require: { permissions: ["login"] } }, (req, res) => {
    let response = {
      done: false,
    };
    let data = req.data;
    data.host = data.host || req.host;
    let index = site.settingList.findIndex((s) => s.host == data.host);
    data.nameNotBesidLogoShow = data.nameBesidLogoShow ? false : true;
    data.teacherId = data.teacher && data.teacher.id ? data.teacher.id : 0;
    if (index > -1) {
      $siteSetting.update(data, (err, result) => {
        if (!err && result.doc) {
          response.done = true;
          site.settingList[index] = {
            ...site.settingList[index],
            ...result.doc,
          };
        } else {
          response.error = err.message;
        }
        res.json(response);
      });
    } else {
      delete data.id;
      delete data._id;
      data.nameNotBesidLogoShow = data.nameBesidLogoShow ? false : true;

      $siteSetting.add(data, (err, doc) => {
        if (!err && doc) {
          response.done = true;
          site.settingList.push({ ...doc });
        }
        res.json(response);
      });
    }
  });
};
