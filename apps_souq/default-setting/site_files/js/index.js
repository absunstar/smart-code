let btn1 = document.querySelector("#setting_default .tab-link");
if (btn1) {
  btn1.click();
}

app.controller("default_setting", function ($scope, $http,$timeout) {
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

  $scope.loadCurrencies = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/currency/all",
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          minor_currency_ar: 1,
          minor_currency_en: 1,
          ex_rate: 1,
          code: 1,
        },
        where: {
          active: true,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.currenciesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
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

  $scope.getContentStatusList = function () {
    $scope.error = "";
    $scope.busy = true;
    $scope.contentStatusList = [];
    $http({
      method: "POST",
      url: "/api/content_status/all",
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.contentStatusList = response.data;
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

  $scope.getUserDesignList = function () {
    $scope.error = "";
    $scope.busy = true;
    $scope.userDesignList = [];
    $http({
      method: "POST",
      url: "/api/user_design/all",
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.userDesignList = response.data;
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

  $scope.saveSetting = function (where) {
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

  $scope.loadUnits = function () {
    $scope.busy = true;
    $scope.unitsList = [];
    $http({
      method: "POST",
      url: "/api/units/all",
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          barcode: 1,
          code: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.unitsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

 
 

  $scope.loadUnits();
  $scope.loadCurrencies();
  $scope.loadSetting();
  $scope.getUserDesignList();
  $scope.getPublishingSystemsList();
  $scope.getContentStatusList();
  $scope.getClosingSystemList();
  $scope.getDurationExpiryList();
});
