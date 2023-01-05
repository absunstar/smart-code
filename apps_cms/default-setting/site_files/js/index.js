let btn1 = document.querySelector('#setting_default .tab-link');
if (btn1) {
  btn1.click();
}

app.controller('default_setting', function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.default_setting = {};

  $scope.getPublishingSystemsList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.publishingSystemList = [];
    $http({
      method: 'POST',
      url: '/api/publishing_system/all',
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
      url: '/api/closing_system/all',
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
      url: '/api/site_template/all',
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
      url: '/api/site_color/all',
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
      url: '/api/article_status/all',
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
      url: '/api/duration_expiry/all',
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
    $scope.default_setting = {};
    $scope.busy = true;

    $http({
      method: 'POST',
      url: '/api/default_setting/get',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.default_setting = response.data.doc;
        } else {
          $scope.default_setting = {};
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
      url: '/api/default_setting/save',
      data: $scope.default_setting,
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

  $scope.loadMainCategories = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.category_list = [];
    $scope.top_category_list = [];
    $http({
      method: 'POST',
      url: '/api/main_categories/all',
      data: {
        where: {
          status: 'active',
        },
        select: { id: 1, name: 1, parent_list_id: 1, top_parent_id: 1, parent_id: 1, image_url: 1, type: 1 },
        top: true,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.top_category_list = response.data.top_list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.addKeyDown = function (ev, keyWord) {
    $scope.busy = true;

    if (ev.which !== 13 || !keyWord) {
      return;
    }

    $scope.default_setting.keywords_list = $scope.default_setting.keywords_list || [];
    if (!$scope.default_setting.keywords_list.some((k) => k === keyWord)) {
      $scope.default_setting.keywords_list.push(keyWord);
    }

    $scope.default_setting.$keyword = '';
  };

  $scope.addMetaTags = function (programming) {
    $scope.error = '';
    programming.meta_tags = programming.meta_tags || [];
    programming.meta_tags.unshift({});
  };

  $scope.addStyles = function (programming) {
    $scope.error = '';
    programming.styles = programming.styles || [];
    programming.styles.unshift({});
  };

  $scope.addScripts = function (programming) {
    $scope.error = '';
    programming.scripts = programming.scripts || [];
    programming.scripts.unshift({});
  };

  $scope.addBlockIp = function (block) {
    $scope.error = '';
    block.ip_list = block.ip_list || [];
    block.ip_list.unshift({});
  };

  $scope.addBlockDomains = function (block) {
    $scope.error = '';
    block.domains_list = block.domains_list || [];
    block.domains_list.unshift({});
  };

  $scope.addBlockUserAgent = function (block) {
    $scope.error = '';
    block.user_agent_list = block.user_agent_list || [];
    block.user_agent_list.unshift({});
  };

  $scope.addDynamicRoutes = function (dynamic_route) {
    $scope.error = '';
    const v = site.validated('#dynamicRoutes');
    if (!v.ok) {
      $scope.error = v.messages[0]['##session.lang##'];
      return;
    }
    $scope.default_setting.programming.dynamic_routes = $scope.default_setting.programming.dynamic_routes || [];
    $scope.default_setting.programming.dynamic_routes.unshift({ ...dynamic_route });
    site.hideModal('#dynamicRoutes');
  };

  $scope.showDynamicRoutes = function () {
    $scope.dynamic_route = {};
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
  $scope.loadMainCategories();
});
