module.exports = function init(site) {
  const $siteSetting = site.connectCollection("siteSetting");
  const hostManager = site.connectApp({
    name: "hosts",
    allowMemory: true,
    sort: { id: 1 },
  });

  site.settingList = [];

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

  site.defaultSetting = {
    host: "",
    lengthOrder: 0,
    siteTemplate: { id: 1 },
    mainCategoryList: [],
    programming: {},

    block: {},
    siteColor1: "#272727",
    siteColor2: "#d7373f",
    siteColor3: "#8bc34a",
    siteColor4: "#8bc34a",
    siteButtonColor: "#8bc34a",
    siteBackground1: "#d9d9d9",
    siteBackground2: "#000000",
    siteBackground1: "#ffffff",
    siteBackground3: "#ffffff",
    siteBackground4: "#ffffff",
    siteButtonBackground: "#ffffff",
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

  site.getLawyerSetting = function (req) {
    let lawyerId = null;
    let setting = site.settingList.find((s) => s.host.like(req.host)) || {
      ...site.defaultSetting,
      ...site.settingList[0],
      host: "",
    };

    if (setting.isShared) {
      if (req.session.user && req.session.user.type == "lawyer") {
        lawyerId = req.session.user.id;
      } else if (req.session.selectedLawyerId) {
        lawyerId = req.session.selectedLawyerId;
      }
    } else {
      if (setting.lawyer && setting.lawyer.id) {
        lawyerId = setting.lawyer.id;
      }
    }
    return lawyerId;
  };

  $siteSetting.findAll({ sort: { id: 1 } }, (err, docs) => {
    if (!err && docs && docs.length > 0) {
      docs.forEach((doc) => {
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
      require: { permissions: ["lawyer"] },
    },
    (req, res) => {
      let setting = site.getSiteSetting(req.host) || {};

      res.render(
        "site-setting/index.html",
        {
          setting: setting,
          siteColor: site.siteColor,
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
    data.lawyerId = data.lawyer && data.lawyer.id ? data.lawyer.id : 0;
    if (index > -1) {
      $siteSetting.edit(data, (err, result) => {
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
