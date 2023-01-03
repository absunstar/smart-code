let btn1 = document.querySelector("#setting_default .tab-link");
if (btn1) {
  btn1.click();
}

app.controller("default_setting", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.default_setting = {};

  $scope.showSearch = function () {
    site.showModal("#searchModal");
  };

  $scope.searchAll = function () {
    $scope.getMenuList($scope.search);

    site.hideModal("#searchModal");
    $scope.clearAll();
  };

  $scope.clearAll = function () {
    $scope.search = new Search();
  };

  $scope.getPublishingSystemsList = function () {
    $scope.error = "";
    $scope.busy = true;
    $scope.publishingSystemList = [];
    $http({
      method: "POST",
      url: "/api/publishing_system/all",
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
    $scope.error = "";
    $scope.busy = true;
    $scope.closingSystemList = [];
    $http({
      method: "POST",
      url: "/api/closing_system/all",
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
    $scope.error = "";
    $scope.busy = true;
    $scope.siteTemplateList = [];
    $http({
      method: "POST",
      url: "/api/site_template/all",
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
    $scope.error = "";
    $scope.busy = true;
    $scope.siteColorList = [];
    $http({
      method: "POST",
      url: "/api/site_color/all",
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
    $scope.error = "";
    $scope.busy = true;
    $scope.articleStatusList = [];
    $http({
      method: "POST",
      url: "/api/article_status/all",
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
    $scope.error = "";
    $scope.busy = true;
    $scope.durationExpiryList = [];
    $http({
      method: "POST",
      url: "/api/duration_expiry/all",
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
      method: "POST",
      url: "/api/default_setting/get",
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
      method: "POST",
      url: "/api/default_setting/save",
      data: $scope.default_setting,
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

  $scope.getLanguagesList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.languagesList = [];
    $http({
      method: 'POST',
      url: '/api/languages/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.languagesList = response.data;
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
    programming.meta_tags.push({});
  };

  $scope.addStyles = function (programming) {
    $scope.error = '';
    programming.styles = programming.styles || [];
    programming.styles.push({});
  };

  $scope.addScripts = function (programming) {
    $scope.error = '';
    programming.scripts = programming.scripts || [];
    programming.scripts.push({});
  };
  
  $scope.loadSetting();
  $scope.getSiteTemplateList();
  $scope.getSiteColorList();
  $scope.getPublishingSystemsList();
  $scope.getArticleStatusList();
  $scope.getClosingSystemList();
  $scope.getDurationExpiryList();
  $scope.getLanguagesList();
});
