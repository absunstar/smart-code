let btn1 = document.querySelector('#settingDefault .tab-link');
if (btn1) {
  btn1.click();
}

app.controller('defaultSetting', function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.defaultSetting = {};

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
      url: '/api/siteTemplate/all',
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
    $scope.defaultSetting = {};
    $scope.busy = true;

    $http({
      method: 'POST',
      url: '/api/defaultSetting/get',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.defaultSetting = response.data.doc;
        } else {
          $scope.defaultSetting = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.saveSetting = function (id) {
    const v = site.validated(id);
    if (!v.ok) {
      $scope.error = v.messages[0]['##session.lang##'];
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/defaultSetting/save',
      data: $scope.defaultSetting,
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
        select: { id: 1, translatedList: 1, parentListId: 1, topParentId: 1, parentId: 1},
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.topCategoryList = response.data.topList;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.addKeyWords = function (ev, keyWord) {
    $scope.error = '';

    if (ev.which !== 13 || !keyWord) {
      return;
    }

    $scope.defaultSetting.keyWordsList = $scope.defaultSetting.keyWordsList || [];
    if (!$scope.defaultSetting.keyWordsList.some((k) => k === keyWord)) {
      $scope.defaultSetting.keyWordsList.push(keyWord);
    }

    $scope.defaultSetting.$keyword = '';
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
    $scope.defaultSetting.programming.dynamicRoutes = $scope.defaultSetting.programming.dynamicRoutes || [];
    $scope.defaultSetting.programming.dynamicRoutes.unshift({ ...dynamicRoute });
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
