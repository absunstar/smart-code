app.controller("employees_insurances", function ($scope, $http) {

  function toFloat(num){
    num = num || 0;
    num = num.toString().trim();
    return parseFloat(num);
  };

  $scope.calc = function () {
    setTimeout(() => {
       $scope.employee_insurance.total =  
    toFloat($scope.employee_insurance.insurance_discount) +
    
     toFloat($scope.employee_insurance.salary_discount);
    }, 200);
   
  },


  $scope.calc_variable_fixed = function () {
    setTimeout(() => {
       $scope.employee_insurance.total_fixed_variable =  
    toFloat($scope.employee_insurance.employee.salary) +
    
     toFloat($scope.employee_insurance.variable_salary);
    }, 200);
   
  },

  

  $scope.loadEmployees = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees/all",
      data: {
        select: { id: 1, name: 1, insurance_number: 1 ,'salary':1}
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.employees = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
      )
  };

  

  $scope.loadInsurances_slides = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/insurances_slides/all",
      data: {
        select: { id: 1, name: 1, value: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.insurances_slides = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
      )
  };

  $scope.loadFacilites_Codes = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/facilities_codes/all",
      data: {
        select: { id: 1, name: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.facilities_codes = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
      )
  };


  $scope.loadAll = function (where , limit) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_insurances/all",
      data: {where : where,
      limit : limit ||10000000
      }

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.list = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
      )
  };

  $scope.newEmployee_Insurance = function () {
    $scope.error = '';
    $scope.employee_insurance = { image_url: '/images/employee_insurance.png'  , increase : .07 , date: new Date()};
    site.showModal('#addEmployeeInsuranceModal');
  };
  
  $scope.add = function () {

    
    let v = site.validated();

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.error = '';

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_insurances/add",
      data: $scope.employee_insurance
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addEmployeeInsuranceModal');
          $scope.loadAll();
        } else {
          $scope.error = '##word.error##';
        }
      },
      function (err) {
        console.log(err);
      }
      )
  };

  $scope.edit = function (employee_insurance) {
    $scope.error = '';
    $scope.employee_insurance = {};
    $scope.view(employee_insurance);
    site.showModal('#updateEmployeeInsuranceModal');
  };
  $scope.update = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_insurances/update",
      data: $scope.employee_insurance
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateEmployeeInsuranceModal');
          $scope.loadAll();
        } else {
          $scope.error = '##word.error##';
        }
      },
      function (err) {
        console.log(err);
      }
      )
  };

  $scope.remove = function (employee_insurance) {
    $scope.error = '';
    $scope.view(employee_insurance);
    $scope.employee_insurance = {};
    site.showModal('#deleteEmployeeInsuranceModal');
  };

  $scope.view = function (employee_insurance) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_insurances/view",
      data: { _id: employee_insurance._id }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.employee_insurance = response.data.doc;
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
    $scope.error = '';
    let where = {};
    
    if ($scope.search.employee && $scope.search.employee.id) {
      where['employee.id'] = $scope.search.employee.id;
    }

    if ($scope.search.facility_name && $scope.search.facility_name.id) {
      where['facility_name.id'] = $scope.search.facility_name.id;
    }

    if ($scope.search.insurance_slide && $scope.search.insurance_slide.id) {
      where['insurance_slide.id'] = $scope.search.insurance_slide.id;
    }

    
    if ($scope.search.fixed_salary) {
      where['fixed_salary'] = ($scope.search.fixed_salary);
    }

    if ($scope.search.insurance_discount) {
      where['insurance_discount'] = ($scope.search.insurance_discount);
    }

    if ($scope.search.variable_salary) {
      where['variable_salary'] = ($scope.search.variable_salary);
    }

    if ($scope.search.salary_discount) {
      where['salary_discount'] = ($scope.search.salary_discount);
    }

    if ($scope.search.description) {
      where['description'] = ($scope.search.description);
    }

    
    $scope.loadAll(where , $scope.search.limit);
  };

  $scope.details = function (employee_insurance) {
    $scope.view(employee_insurance);
    $scope.employee_insurance = {};
    site.showModal('#viewEmployeeInsuranceModal');
  };
  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_insurances/delete",
      data: { _id: $scope.employee_insurance._id, name: $scope.employee_insurance.name }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteEmployeeInsuranceModal');
          $scope.loadAll();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
      )
  };
  $scope.loadAll();
  $scope.loadEmployees();
  $scope.loadInsurances_slides();
  $scope.loadFacilites_Codes();
});
