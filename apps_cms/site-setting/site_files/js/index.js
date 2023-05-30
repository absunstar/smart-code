let btn1 = document.querySelector('#settingDefault .tab-link');
if (btn1) {
  btn1.click();
}

app.controller('siteSetting', function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.siteSetting = {};

  $scope.getPublishingSystemsList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.publishingSystemList = [];
    $http({
      method: 'POST',
      url: '/api/publishingSystem/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.publishingSystemList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getClosingSystemList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.closingSystemList = [];
    $http({
      method: 'POST',
      url: '/api/closingSystem/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.closingSystemList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getSiteTemplateList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.siteTemplateList = [];
    $http({
      method: 'POST',
      url: '/api/get-site-templates',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.siteTemplateList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getSiteColorList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.siteColorList = [];
    $http({
      method: 'POST',
      url: '/api/siteColor/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.siteColorList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getArticleStatusList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.articleStatusList = [];
    $http({
      method: 'POST',
      url: '/api/articleStatus/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.articleStatusList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getDurationExpiryList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.durationExpiryList = [];
    $http({
      method: 'POST',
      url: '/api/durationExpiry/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.durationExpiryList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadSetting = function (where) {
    $scope.siteSetting = site.showObject('##site.#setting##');
    $scope.busy = true;
  };

  $scope.saveSetting = function (id) {
    if (id) {
      const v = site.validated(id);
      if (!v.ok) {
        $scope.error = v.messages[0]['##session.lang##'];
        return;
      }
    }

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

  $scope.addPrayerTimings = function () {
    $scope.error = '';
    $scope.siteSetting.prayerTimingsList = $scope.siteSetting.prayerTimingsList || [];
    $scope.siteSetting.prayerTimingsList.unshift({});
  };

  $scope.addMatchSchedule = function () {
    $scope.error = '';
    $scope.siteSetting.matchScheduleList = $scope.siteSetting.matchScheduleList || [];
    $scope.siteSetting.matchScheduleList.unshift({});
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

  $scope.loadSetting();
  $scope.getSiteTemplateList();
  $scope.getSiteColorList();
  $scope.getPublishingSystemsList();
  $scope.getArticleStatusList();
  $scope.getClosingSystemList();
  $scope.getDurationExpiryList();
  $scope.loadWriters();
  $scope.loadEditors();
  $scope.loadCategories();
});
