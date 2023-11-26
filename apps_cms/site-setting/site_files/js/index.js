let btn1 = document.querySelector('#settingDefault .tab-link');
if (btn1) {
  btn1.click();
}

app.controller('siteSetting', function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.siteSetting = site.showObject('##data.#setting##');
  $scope.siteTemplateList = site.showObject('##data.#templateList##');
  console.log($scope.siteSetting);
  $scope.publishingSystemList = site.showObject('##data.#publishingSystem##');
  $scope.closingSystemList = site.showObject('##data.#closingSystem##');

  $scope.siteColorList = site.showObject('##data.#siteColor##');
  $scope.articleStatusList = site.showObject('##data.#articleStatus##');
  $scope.durationExpiryList = site.showObject('##data.#durationExpiry##');



  $scope.saveSetting = function (id) {
    if (id) {
      const v = site.validated(id);
      if (!v.ok) {
        $scope.error = v.messages[0]['##session.lang##'];
        return;
      }
    }

    $scope.siteSetting.goldPricesList = $scope.siteSetting.goldPricesList || [];
    $scope.siteSetting.goldPricesList.forEach((g) => {
      g.increase = false;
      g.decrease = false;
      if (g.type == 'increase') {
        g.increase = true;
      } else if (g.type == 'decrease') {
        g.decrease = true;
      }
    });
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/set-site-setting',
      data: $scope.siteSetting,
    }).then(
      function (response) {
        $scope.busy = false;
        if (!response.data.done) {
          $scope.error = response.data.error;
        } else {
          site.showModal('#alert');
          $timeout(() => {
            site.hideModal('#alert');
          }, 1500);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadWriters = function (where) {
    $scope.error = '';
    $scope.busy = true;
    where = where || {};
    where['type.id'] = 1;

    $http({
      method: 'POST',
      url: '/api/users/all',
      data: {
        where: where,
        select: { id: 1, profile: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.writersList = response.data.users;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadEditors = function (where) {
    $scope.error = '';
    $scope.busy = true;
    where = where || {};
    where['type.id'] = 2;

    $http({
      method: 'POST',
      url: '/api/users/all',
      data: {
        where: where,
        select: { id: 1, profile: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.editorsList = response.data.users;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadCategories = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.categoryList = [];
    $scope.topCategoryList = [];
    $http({
      method: 'POST',
      url: '/api/categories/all',
      data: {
        where: {
          active: true,
        },
        select: { id: 1, translatedList: 1, parentListId: 1, topParentId: 1, parentId: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.topCategoryList = response.data.topList;
          $scope.categoryList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.addKeyWords = function (ev, lang) {
    $scope.error = '';
    if (ev.which !== 13 || !lang.$keyword) {
      return;
    }

    if (!Array.isArray(lang.keyWordsList)) {
      lang.keyWordsList = [];
    }
    if (!lang.keyWordsList.some((k) => k === lang.$keyword)) {
      lang.keyWordsList.push(lang.$keyword);
    }

    lang.$keyword = '';
  };

  $scope.upDownList = function (list, type, index) {
    let element = list[index];
    let toIndex = index;

    if (type == 'up') {
      toIndex = index - 1;
    } else if (type == 'down') {
      toIndex = index + 1;
    }

    list.splice(index, 1);
    list.splice(toIndex, 0, element);
  };

  $scope.addMainCategory = function () {
    $scope.error = '';
    if ($scope.siteSetting.$category && $scope.siteSetting.$category.id) {
      $scope.siteSetting.mainCategoryList = $scope.siteSetting.mainCategoryList || [];
      let index = $scope.siteSetting.mainCategoryList.findIndex((itm) => itm.id == $scope.siteSetting.$category.id);
      if (index === -1) {
        $scope.siteSetting.mainCategoryList.unshift($scope.siteSetting.$category);
      } else {
        $scope.error = '##word.Already Existed##';
        return;
      }
      $scope.siteSetting.$category = {};
    }
  };

  $scope.addMetaTags = function (programming) {
    $scope.error = '';
    programming.metaTags = programming.metaTags || [];
    programming.metaTags.unshift({ active: true });
  };

  $scope.addStyles = function (programming) {
    $scope.error = '';
    programming.styles = programming.styles || [];
    programming.styles.unshift({ active: true });
  };

  $scope.addScripts = function (programming) {
    $scope.error = '';
    programming.scripts = programming.scripts || [];
    programming.scripts.unshift({ active: true });
  };

  $scope.addGoldPrices = function () {
    $scope.error = '';
    $scope.siteSetting.goldPricesList = $scope.siteSetting.goldPricesList || [];
    $scope.siteSetting.goldPricesList.unshift({});
  };

  $scope.addMoneyPrices = function () {
    $scope.error = '';
    $scope.siteSetting.moneyPricesList = $scope.siteSetting.moneyPricesList || [];
    $scope.siteSetting.moneyPricesList.unshift({});
  };

  $scope.addPrayerTimings = function () {
    $scope.error = '';
    $scope.siteSetting.prayerTimingsList = $scope.siteSetting.prayerTimingsList || [];
    $scope.siteSetting.prayerTimingsList.unshift({});
  };

  $scope.addMatchSchedule = function () {
    $scope.error = '';
    $scope.siteSetting.matchScheduleList = $scope.siteSetting.matchScheduleList || [];
    $scope.siteSetting.matchScheduleList.unshift({ image1: { url: '/theme1/images/football.png' }, image2: { url: '/theme1/images/football.png' } });
  };

  $scope.addBlockIp = function (block) {
    $scope.error = '';
    block.ipList = block.ipList || [];
    block.ipList.unshift({});
  };

  $scope.addBlockDomains = function (block) {
    $scope.error = '';
    block.domainsList = block.domainsList || [];
    block.domainsList.unshift({});
  };

  $scope.addBlockUserAgent = function (block) {
    $scope.error = '';
    block.userAgentList = block.userAgentList || [];
    block.userAgentList.unshift({});
  };

  $scope.addDynamicRoutes = function (dynamicRoute) {
    $scope.error = '';
    const v = site.validated('#dynamicRoutes');
    if (!v.ok) {
      $scope.error = v.messages[0]['##session.lang##'];
      return;
    }
    $scope.siteSetting.programming.dynamicRoutes = $scope.siteSetting.programming.dynamicRoutes || [];
    $scope.siteSetting.programming.dynamicRoutes.unshift({ ...dynamicRoute });
    site.hideModal('#dynamicRoutes');
  };

  $scope.showDynamicRoutes = function () {
    $scope.dynamicRoute = { active: true };
    site.showModal('#dynamicRoutes');
  };

   $scope.loadWriters();
  $scope.loadEditors();
  $scope.loadCategories();
});
