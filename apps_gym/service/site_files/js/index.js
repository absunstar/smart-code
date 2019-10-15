app.controller("service", function ($scope, $http, $timeout) {

  $scope.service = {};

  $scope.displayAddService = function () {
    $scope.error = '';
    $scope.service = {
      image_url: '/images/service.png',
      active: true,
      /* capaneighborhood : " - طالب", */
      immediate : false
    };
    site.showModal('#serviceAddModal');
    
  };

  $scope.addService = function () {
    $scope.error = '';
    const v = site.validated('#serviceAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/service/add",
      data: $scope.service
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#serviceAddModal');
          $scope.getServiceList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateService = function (service) {
    $scope.error = '';
    $scope.viewService(service);
    $scope.service = {};
    site.showModal('#serviceUpdateModal');
  };

  $scope.updateService = function () {
    $scope.error = '';
    const v = site.validated('#serviceUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/service/update",
      data: $scope.service
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#serviceUpdateModal');
          $scope.getServiceList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsService = function (service) {
    $scope.error = '';
    $scope.viewService(service);
    $scope.service = {};
    site.showModal('#serviceViewModal');
  };

  $scope.viewService = function (service) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/service/view",
      data: {
        id: service.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.service = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteService = function (service) {
    $scope.error = '';
    $scope.viewService(service);
    $scope.service = {};
    site.showModal('#serviceDeleteModal');

  };

  $scope.deleteService = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/service/delete",
      data: {
        id: $scope.service.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#serviceDeleteModal');
          $scope.getServiceList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getServiceList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/service/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#serviceSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getPeriod = function () {
    $scope.busy = true;
    $scope.periodList = [];
    $http({
      method: "POST",
      url: "/api/period_class/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.periodList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#serviceSearchModal');

  };

  $scope.searchAll = function () { 
    $scope.getServiceList($scope.search);
    site.hideModal('#serviceSearchModal');
    $scope.search = {};

  };

  $scope.getServiceList();
  $scope.getPeriod();

});