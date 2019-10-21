app.controller("attend_services", function ($scope, $http, $timeout) {

  $scope.attend_services = {};

  $scope.displayAddAttendServices = function () {
    $scope.error = '';
    $scope.attend_services = {
      image_url: '/images/attend_services.png',
      active: true,
      date: new Date()
      /* capaneighborhood : " - طالب",       immediate : false
 */    };
    site.showModal('#attendServicesAddModal');

  };

  $scope.addAttendServices = function () {
    $scope.error = '';
    const v = site.validated('#attendServicesAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/attend_services/add",
      data: $scope.attend_services
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#attendServicesAddModal');
          $scope.getAttendServicesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateAttendServices = function (attend_services) {
    $scope.error = '';
    $scope.viewAttendServices(attend_services);
    $scope.attend_services = {};
    site.showModal('#attendServicesUpdateModal');
  };

  $scope.updateAttendServices = function () {

    $scope.error = '';
    const v = site.validated('#attendServicesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/attend_services/update",
      data: $scope.attend_services
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#attendServicesUpdateModal');
          $scope.getAttendServicesList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsAttendServices = function (attend_services) {
    $scope.error = '';
    $scope.viewAttendServices(attend_services);
    $scope.attend_services = {};
    site.showModal('#attendServicesViewModal');
  };

  $scope.viewAttendServices = function (attend_services) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/attend_services/view",
      data: {
        id: attend_services.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.attend_services = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteAttendServices = function (attend_services) {
    $scope.error = '';
    $scope.viewAttendServices(attend_services);
    $scope.attend_services = {};
    site.showModal('#attendServicesDeleteModal');

  };

  $scope.deleteAttendServices = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/attend_services/delete",
      data: {
        id: $scope.attend_services.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#attendServicesDeleteModal');
          $scope.getAttendServicesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getAttendServicesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/attend_services/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#attendServicesSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.getCustomerList = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/customers/all",
        data: {
          search: $scope.search_customer
          /*  select: {
            id: 1,
            name_ar: 1,
            name_en: 1,
          } */
        }
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
  };

  $scope.getTrainerList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees/all",
      data: {
        where: {
          'job.trainer': true
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

  $scope.getHallList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/hall/all",
      data: {
        select: {
          id: 1, capaneighborhood: 1, active: 1, name: 1
        }
      }
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


  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#attendServicesSearchModal');

  };

  $scope.attendNow = function () {
    $scope.attend_services.attend_date = new Date();

    $scope.attend_services.attend = {
      hour: new Date().getHours(),
      minute: new Date().getMinutes()
    };
  };

  $scope.leaveNow = function (attend_services) {
    attend_services.leave_date = new Date();
    attend_services.leave = {
      hour: new Date().getHours(),
      minute: new Date().getMinutes()
    };

    $http({
      method: "POST",
      url: "/api/attend_services/update",
      data: attend_services
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.getAttendServicesList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )

  };

  $scope.searchAll = function () {
    $scope.getAttendServicesList($scope.search);
    site.hideModal('#attendServicesSearchModal');
    $scope.search = {};

  };

  $scope.getAttendServicesList();
  $scope.getHallList();
  $scope.getTrainerList();
});