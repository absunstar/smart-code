app.controller("delivery_employee_list", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.delivery_employee_list = {};

  $scope.displayAddDeliveryEmployee = function () {
    $scope.error = '';
    $scope.delivery_employee_list = {
      image_url: '/images/delivery_employee_list.png',
      active: true
    };
    site.showModal('#deliveryEmployeeAddModal');
    document.querySelector('#deliveryEmployeeAddModal .tab-link').click();

  };

  $scope.addDeliveryEmployee = function () {
    $scope.error = '';
    const v = site.validated('#deliveryEmployeeAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/delivery_employees/add",
      data: $scope.delivery_employee_list
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deliveryEmployeeAddModal');
          $scope.getDeliveryEmployeeList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateDeliveryEmployee = function (delivery_employee_list) {
    $scope.error = '';
    $scope.detailsDeliveryEmployee(delivery_employee_list);
    $scope.delivery_employee_list = {};
    site.showModal('#deliveryEmployeeUpdateModal');
    document.querySelector('#deliveryEmployeeUpdateModal .tab-link').click();
  };

  $scope.updateDeliveryEmployee = function () {
    $scope.error = '';
    const v = site.validated('#deliveryEmployeeUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/delivery_employees/update",
      data: $scope.delivery_employee_list
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deliveryEmployeeUpdateModal');
          $scope.getDeliveryEmployeeList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsDeliveryEmployee = function (delivery_employee_list) {
    $scope.error = '';
    $scope.detailsDeliveryEmployee(delivery_employee_list);
    $scope.delivery_employee_list = {};
    site.showModal('#deliveryEmployeeViewModal');
    document.querySelector('#deliveryEmployeeViewModal .tab-link').click();

  };

  $scope.detailsDeliveryEmployee = function (delivery_employee_list) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/delivery_employees/view",
      data: {
        id: delivery_employee_list.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.delivery_employee_list = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteDeliveryEmployee = function (delivery_employee_list) {
    $scope.error = '';
    $scope.detailsDeliveryEmployee(delivery_employee_list);
    $scope.delivery_employee_list = {};
    site.showModal('#deliveryEmployeeDeleteModal');
    document.querySelector('#deliveryEmployeeDeleteModal .tab-link').click();

  };

  $scope.deleteDeliveryEmployee = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/delivery_employees/delete",
      data: {
        id: $scope.delivery_employee_list.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deliveryEmployeeDeleteModal');
          $scope.getDeliveryEmployeeList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getDeliveryEmployeeList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/delivery_employees/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#deliveryEmployeeSearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getClassRoomsList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/hall/all",
      data: {
        where: {
          active: true
        },
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

  $scope.getCoursesList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/courses/all",
      data: {
        where: {
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.coursesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getJobsList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/jobs/all",
      data: {
        select: {
          id: 1, active: 1, trainer: 1, name: 1, code: 1
        },
        where: {
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.jobsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getIndentfy = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.indentfyList = [];
    $http({
      method: "POST",
      url: "/api/indentfy_employee/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.indentfyList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getGovList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/goves/all",
      data: {
        where: {
          active: true
        },
        select: { id: 1, name: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.govList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getCityList = function (gov) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/city/all",
      data: {
        where: {
          'gov.id': gov.id,
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.cityList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getAreaList = function (city) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/area/all",
      data: {
        where: {
          'city.id': city.id,
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.areaList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getDegree = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/delivery_employees_degrees/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.degreeList = response.data.list;
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
    site.showModal('#deliveryEmployeeSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getDeliveryEmployeeList($scope.search);
    site.hideModal('#deliveryEmployeeSearchModal');
    $scope.search = {};
  };

  $scope.getDeliveryEmployeeList();
  $scope.getGovList();
  $scope.getClassRoomsList();
  $scope.getCoursesList();
  $scope.getJobsList();
  $scope.getDegree();
  $scope.getIndentfy();

});