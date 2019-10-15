app.controller("employee_list", function ($scope, $http, $timeout) {

  $scope.employee_list = {};

  $scope.displayAddEmployee = function () {
    $scope.error = '';
    $scope.employee_list = {
      image_url: '/images/employee_list.png',
      class_rooms_list : [{}],
      courses_list : [{}],
      active: true
      
    };
    site.showModal('#employeeAddModal');
    document.querySelector('#employeeAddModal .tab-link').click();

  };

  $scope.addEmployee = function () {
    $scope.error = '';
    const v = site.validated('#employeeAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees/add",
      data: $scope.employee_list
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#employeeAddModal');
          $scope.getEmployeeList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateEmployee = function (employee_list) {
    $scope.error = '';
    $scope.detailsEmployee(employee_list);
    $scope.employee_list = {};
    site.showModal('#employeeUpdateModal');
    document.querySelector('#employeeUpdateModal .tab-link').click();
  };

  $scope.updateEmployee = function () {
    $scope.error = '';
    const v = site.validated('#employeeUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees/update",
      data: $scope.employee_list
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#employeeUpdateModal');
          $scope.getEmployeeList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsEmployee = function (employee_list) {
    $scope.error = '';
    $scope.detailsEmployee(employee_list);
    $scope.employee_list = {};
    site.showModal('#employeeViewModal');
    document.querySelector('#employeeViewModal .tab-link').click();

  };

  $scope.detailsEmployee = function (employee_list) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/employees/view",
      data: {
        id: employee_list.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.employee_list = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteEmployee = function (employee_list) {
    $scope.error = '';
    $scope.detailsEmployee(employee_list);
    $scope.employee_list = {};
    site.showModal('#employeeDeleteModal');
    document.querySelector('#employeeDeleteModal .tab-link').click();

  };

  $scope.deleteEmployee = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/employees/delete",
      data: {
        id: $scope.employee_list.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#employeeDeleteModal');
          $scope.getEmployeeList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getEmployeeList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/employees/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#employeeSearchModal');
          $scope.search ={};

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
      url: "/api/class_rooms/all",
      data: {
        where: {
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.classRoomsList = response.data.list;
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
        select : {id : 1 , name : 1}
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

  $scope.getNeighborhoodList = function (gov) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/neighborhood/all",
      data: {
        where: {
          'gov.id': gov.id,
          active: true
        },
        select : {id : 1 , name : 1}
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.neighborhoodList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };
  
  $scope.getAreaList = function (neighborhood) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/area/all",
      data: {
        where: {
          'neighborhood.id': neighborhood.id,
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
      url: "/api/employees_degrees/all",
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
    site.showModal('#employeeSearchModal');

  };

  $scope.searchAll = function () {
  
    $scope.getEmployeeList($scope.search);
    site.hideModal('#employeeSearchModal');
    $scope.search ={};
  };

  $scope.getEmployeeList();
  $scope.getGovList();
  $scope.getClassRoomsList();
  $scope.getCoursesList();
  $scope.getJobsList();
  $scope.getDegree();
  $scope.getIndentfy();

});