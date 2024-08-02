let btn1 = document.querySelector("#settingDefault .tab-link");
if (btn1) {
  btn1.click();
}

app.controller("siteSetting", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.siteSetting = site.showObject("##data.#setting##");
  $scope.siteTemplateList = site.showObject("##data.#templateList##");
  $scope.publishingSystemList = site.showObject("##data.#publishingSystem##");
  $scope.closingSystemList = site.showObject("##data.#closingSystem##");
  $scope.siteColorList = site.showObject("##data.#siteColor##");
  $scope.articleStatusList = site.showObject("##data.#articleStatus##");
  $scope.durationExpiryList = site.showObject("##data.#durationExpiry##");

  $scope.saveSetting = function (id) {
    if (id) {
      const v = site.validated(id);
      if (!v.ok) {
        $scope.error = v.messages[0]["##session.lang##"];
        return;
      }
    }

    $scope.siteSetting.goldPricesList = $scope.siteSetting.goldPricesList || [];
    $scope.siteSetting.goldPricesList.forEach((g) => {
      g.increase = false;
      g.decrease = false;
      if (g.type == "increase") {
        g.increase = true;
      } else if (g.type == "decrease") {
        g.decrease = true;
      }
    });
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/set-site-setting",
      data: $scope.siteSetting,
    }).then(
      function (response) {
        $scope.busy = false;
        if (!response.data.done) {
          $scope.error = response.data.error;
        } else {
          site.showModal("#alert");
          $timeout(() => {
            site.hideModal("#alert");
          }, 1500);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getTeachersList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/manageUsers/all",
      data: {
        where: {
          email: $search,
          type: "teacher",
          active: true,
        },
        select: { id: 1, firstName: 1, prefix: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.teachersList = response.data.list;
          
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.addKeyWords = function (ev, lang) {
    $scope.error = "";
    if (ev.which !== 13 || !lang.$keyword) {
      return;
    }

    if (!Array.isArray(lang.keyWordsList)) {
      lang.keyWordsList = [];
    }
    if (!lang.keyWordsList.some((k) => k === lang.$keyword)) {
      lang.keyWordsList.push(lang.$keyword);
    }

    lang.$keyword = "";
  };

  $scope.upDownList = function (list, type, index) {
    let element = list[index];
    let toIndex = index;

    if (type == "up") {
      toIndex = index - 1;
    } else if (type == "down") {
      toIndex = index + 1;
    }

    list.splice(index, 1);
    list.splice(toIndex, 0, element);
  };

  $scope.addMetaTags = function (programming) {
    $scope.error = "";
    programming.metaTags = programming.metaTags || [];
    programming.metaTags.unshift({ active: true });
  };

  $scope.addStyles = function (programming) {
    $scope.error = "";
    programming.styles = programming.styles || [];
    programming.styles.unshift({ active: true });
  };

  $scope.addScripts = function (programming) {
    $scope.error = "";
    programming.scripts = programming.scripts || [];
    programming.scripts.unshift({ active: true });
  };

  $scope.addGoldPrices = function () {
    $scope.error = "";
    $scope.siteSetting.goldPricesList = $scope.siteSetting.goldPricesList || [];
    $scope.siteSetting.goldPricesList.unshift({});
  };

  $scope.addMoneyPrices = function () {
    $scope.error = "";
    $scope.siteSetting.moneyPricesList = $scope.siteSetting.moneyPricesList || [];
    $scope.siteSetting.moneyPricesList.unshift({});
  };

  $scope.addPrayerTimings = function () {
    $scope.error = "";
    $scope.siteSetting.prayerTimingsList = $scope.siteSetting.prayerTimingsList || [];
    $scope.siteSetting.prayerTimingsList.unshift({});
  };

  $scope.addMatchSchedule = function () {
    $scope.error = "";
    $scope.siteSetting.matchScheduleList = $scope.siteSetting.matchScheduleList || [];
    $scope.siteSetting.matchScheduleList.unshift({ image1: { url: "/theme1/images/football.png" }, image2: { url: "/theme1/images/football.png" } });
  };

  $scope.addBlockPrograms = function () {
    $scope.error = "";
    $scope.siteSetting.blockPrograms = $scope.siteSetting.blockPrograms || {};
    $scope.siteSetting.blockPrograms.programsNamesList = $scope.siteSetting.blockPrograms.programsNamesList || [];
    $scope.siteSetting.blockPrograms.programsNamesList.unshift({});
  };
  $scope.addBlockIp = function (block) {
    $scope.error = "";
    block.ipList = block.ipList || [];
    block.ipList.unshift({});
  };

  $scope.addBlockDomains = function (block) {
    $scope.error = "";
    block.domainsList = block.domainsList || [];
    block.domainsList.unshift({});
  };

  $scope.addBlockUserAgent = function (block) {
    $scope.error = "";
    block.userAgentList = block.userAgentList || [];
    block.userAgentList.unshift({});
  };

  $scope.addDynamicRoutes = function (dynamicRoute) {
    $scope.error = "";
    const v = site.validated("#dynamicRoutes");
    if (!v.ok) {
      $scope.error = v.messages[0]["##session.lang##"];
      return;
    }
    $scope.siteSetting.programming.dynamicRoutes = $scope.siteSetting.programming.dynamicRoutes || [];
    $scope.siteSetting.programming.dynamicRoutes.unshift({ ...dynamicRoute });
    site.hideModal("#dynamicRoutes");
  };

  $scope.showDynamicRoutes = function () {
    $scope.dynamicRoute = { active: true };
    site.showModal("#dynamicRoutes");
  };
});
