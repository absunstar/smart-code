app.controller("goves", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.gov = {};

  $scope.displayAddGov = function () {
    $scope.error = '';
    $scope.gov = {
      image_url: '/images/gov.png',
      active: true
    };

    site.showModal('#govAddModal');

  };

  $scope.addGov = function () {
    $scope.error = '';
    const v = site.validated('#govAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/goves/add",
      data: $scope.gov
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#govAddModal');
          $scope.getGovList();
        } else {
          $scope.error = response.data.error;
      
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateGov = function (gov) {
    $scope.error = '';
    $scope.viewGov(gov);
    $scope.gov = {};
    site.showModal('#govUpdateModal');
  };

  $scope.updateGov = function () {
    $scope.error = '';
    const v = site.validated('#govUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/goves/update",
      data: $scope.gov
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#govUpdateModal');
          $scope.getGovList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsGov = function (gov) {
    $scope.error = '';
    $scope.viewGov(gov);
    $scope.gov = {};
    site.showModal('#govViewModal');
  };

  $scope.viewGov = function (gov) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/goves/view",
      data: {
        id: gov.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.gov = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteGov = function (gov) {
    $scope.error = '';
    $scope.viewGov(gov);
    $scope.gov = {};
    site.showModal('#govDeleteModal');
  };

  $scope.deleteGov = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/goves/delete",
      data: {
        id: $scope.gov.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#govDeleteModal');
          $scope.getGovList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  
  $scope.searchAll = function () {

    $scope.getGovList($scope.search);
    site.hideModal('#govSearchModal');
    $scope.search = {};
  };


  $scope.getGovList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/goves/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#govSearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )
  };

  $scope.getCountriesList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/countries/all",
      data: {
        where: {
          active: true
        },
        select: {
          id: 1, name_ar: 1, name_en: 1 ,
          code: 1, country_code: 1,

        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.countriesList = response.data.list;

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };



  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#govSearchModal');

  };

  $scope.getGovList();
  $scope.getCountriesList();
});