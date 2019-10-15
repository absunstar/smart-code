app.controller("request_service", function ($scope, $http, $timeout) {

  $scope.request_service = {};

  $scope.displayAddRequestService = function () {
    $scope.error = '';
    $scope.request_service = {
      image_url: '/images/request_service.png',
      active: true,
      /* capaneighborhood : " - طالب", */
      immediate : false
    };
    site.showModal('#requestServiceAddModal');
    
  };

  $scope.addRequestService = function () {
    $scope.error = '';
    const v = site.validated('#requestServiceAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/request_service/add",
      data: $scope.request_service
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#requestServiceAddModal');
          $scope.getRequestServiceList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateRequestService = function (request_service) {
    $scope.error = '';
    $scope.viewRequestService(request_service);
    $scope.request_service = {};
    site.showModal('#requestServiceUpdateModal');
  };

  $scope.updateRequestService = function () {
    $scope.error = '';
    const v = site.validated('#requestServiceUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/request_service/update",
      data: $scope.request_service
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#requestServiceUpdateModal');
          $scope.getRequestServiceList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsRequestService = function (request_service) {
    $scope.error = '';
    $scope.viewRequestService(request_service);
    $scope.request_service = {};
    site.showModal('#requestServiceViewModal');
  };

  $scope.viewRequestService = function (request_service) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/request_service/view",
      data: {
        id: request_service.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.request_service = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteRequestService = function (request_service) {
    $scope.error = '';
    $scope.viewRequestService(request_service);
    $scope.request_service = {};
    site.showModal('#requestServiceDeleteModal');

  };

  $scope.deleteRequestService = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/request_service/delete",
      data: {
        id: $scope.request_service.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#requestServiceDeleteModal');
          $scope.getRequestServiceList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getRequestServiceList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/request_service/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#requestServiceSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.getCustomerList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/customers/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.customersList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getServiceList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/service/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.servicesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getHallList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/hall/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.hallsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getTrainerList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees/all",
      data: {
        where :{
          'job.trainer' : true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.trainersList = response.data.list;
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
    site.showModal('#requestServiceSearchModal');

  };

  $scope.searchAll = function () { 
    $scope.getRequestServiceList($scope.search);
    site.hideModal('#requestServiceSearchModal');
    $scope.search = {};

  };

  $scope.getRequestServiceList();
  $scope.getPeriod();
  $scope.getCustomerList();
  $scope.getServiceList ();
  $scope.getHallList();
  $scope.getTrainerList();
});