let btn1 = document.querySelector("#settingDefault .tab-link");
if (btn1) {
  btn1.click();
}

app.controller("siteSetting", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.siteSetting = site.showObject("##data.#setting##");
  console.log($scope.siteSetting.id);
  
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

  $scope.getPrintersPaths = function () {
    $scope.busy = true;
    $scope.printersPathsList = [];
    $http({
      method: 'POST',
      url: '/api/printersPaths/all',
      data: {
        where: { active: true },
        select: {
          id: 1,
          code: 1,
          ip: 1,
          name: 1,
          ipDevice: 1,
          portDevice: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.printersPathsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
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

  $scope.getPrintersPaths();
});
