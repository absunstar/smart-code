app.controller('employee_list', function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.employee_list = {};

  $scope.displayAddEmployee = function () {
    $scope.error = '';
    $scope.employee_list = {
      image_url: '/images/employee_list.png',
      /*  class_rooms_list : [{}],
       courses_list : [{}], */
      active: true,
    };
    site.showModal('#employeeAddModal');
    document.querySelector('#employeeAddModal .tab-link').click();
  };

  $scope.addEmployee = function () {
    $scope.error = '';
    const v = site.validated('#employeeAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/employees/add',
      data: $scope.employee_list,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#employeeAddModal');
          $scope.getEmployeeList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = '##word.must_enter_code##';
          } else if (response.data.error.like('*maximum number of adds exceeded*')) {
            $scope.error = '##word.err_maximum_adds##';
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
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
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/employees/update',
      data: $scope.employee_list,
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
    );
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
      method: 'POST',
      url: '/api/employees/view',
      data: {
        id: employee_list.id,
      },
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
    );
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
      method: 'POST',
      url: '/api/employees/delete',
      data: {
        id: $scope.employee_list.id,
      },
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
    );
  };

  $scope.getEmployeeList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    where = where || {};
    where.trainer = { $ne: true };
    where.delivery = { $ne: true };
    where.delegate = { $ne: true };
    where.active = true;

    $http({
      method: 'POST',
      url: '/api/employees/all',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#employeeSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getClassRoomsList = function (where) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/hall/all',
      data: {
        where: {
          active: true,
        },
      },
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
    );
  };

  $scope.getCoursesList = function (where) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/courses/all',
      data: {
        where: {
          active: true,
        },
      },
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
    );
  };

  $scope.loadMaritalsStatus = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/maritals_status/all',
      data: {
        select: { id: 1, name_Ar: 1, name_En: 1, code: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.maritals_status = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadMilitariesStatus = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/militaries_status/all',
      data: {
        select: { id: 1, name_Ar: 1, name_En: 1, code: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.militaries_status = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getJobsList = function (where) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/jobs/all',
      data: {
        select: {
          id: 1,
          active: 1,
          trainer: 1,
          name_Ar: 1,
          name_En: 1,
          code: 1,
        },
        where: {
          active: true,
        },
      },
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
    );
  };

  $scope.getDegree = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/employees_degrees/all',
      data: {},
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
    );
  };

  $scope.getGender = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.genderList = [];
    $http({
      method: 'POST',
      url: '/api/gender/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.genderList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getAccountingSystem = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.accountingSystemList = [];
    $http({
      method: 'POST',
      url: '/api/accounting_system/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.accountingSystemList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getGovList = function (where) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/goves/all',
      data: {
        where: {
          active: true,
        },
        select: { id: 1, name_Ar: 1, name_En: 1, code: 1 },
      },
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
    );
  };

  $scope.getCityList = function (gov) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/city/all',
      data: {
        where: {
          'gov.id': gov.id,
          active: true,
        },
      },
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
    );
  };

  $scope.getAreaList = function (city) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/area/all',
      data: {
        where: {
          'city.id': city.id,
          active: true,
        },
      },
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
    );
  };

  $scope.getGuideAccountList = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/accounting_guide_accounts/all',
      data: {
        where: {
          status: 'active',
          type: 'detailed',
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.guideAccountList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.getCostCenterList = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/accounting_cost_centers/all',
      data: {
        where: {
          status: 'active',
          type: 'detailed',
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.costCenterList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getFilesTypesList = function (where) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/file_type/all',
      data: {
        where: {
          active: true,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.files_types_List = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.addFiles = function () {
    $scope.error = '';
    $scope.employee_list.files_list = $scope.employee_list.files_list || [];
    $scope.employee_list.files_list.push({
      file_date: new Date(),
      file_upload_date: new Date(),
      upload_by: '##user.name##',
    });
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/numbering/get_automatic',
      data: {
        screen: 'employees',
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledCode = response.data.isAuto;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.netSalary = function () {
    $scope.error = '';
    $timeout(() => {
      $scope.employee_list.net_salary = 0;
      if ($scope.employee_list.degree) {
        $scope.employee_list.salary_differance = $scope.employee_list.salary_differance || 0;
        let total = $scope.employee_list.degree.salary + $scope.employee_list.salary_differance;
        let net_salary = (total * site.toNumber($scope.employee_list.degree.tax)) / 100;

        $scope.employee_list.net_salary = total - net_salary;
      }
    }, 250);
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#employeeSearchModal');
  };

  $scope.searchAll = function () {
    $scope.getEmployeeList($scope.search);
    site.hideModal('#employeeSearchModal');
    $scope.search = {};
  };

  $scope.email_examble = '';
  if (typeof '##session.company.host##' === 'string') {
    $scope.email_examble = 'examble##session.company.host##';
  } else {
    $scope.email_examble = 'you@examble.com';
  }

  $scope.getEmployeeList();
  $scope.getGovList();
  if (site.feature('school')) {
    $scope.getClassRoomsList();
    $scope.getCoursesList();
  }
  $scope.getJobsList();
  $scope.getDegree();
  $scope.getNumberingAuto();
  $scope.getGender();
  $scope.loadMaritalsStatus();
  $scope.loadMilitariesStatus();
  $scope.getFilesTypesList();
  $scope.getAccountingSystem();
  if (site.feature('erp')) {
    $scope.getGuideAccountList();
    $scope.getCostCenterList();
  }
});
