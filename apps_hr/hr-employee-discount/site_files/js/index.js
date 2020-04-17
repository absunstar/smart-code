
app.controller("employee_discount", function ($scope, $http) {
  $scope._search = {};

  $scope.employee_discount = {};
  $scope.search = {};

  $scope.loadAll = function (where) {
    $scope.busy = true;
    
    $http({
      method: "POST",
      url: "/api/employee_discount/all",
      data: {where : where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.list = response.data.list;
          
         site.hideModal('#amountsInSearchModal');
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
      )
  };


  $scope.loadSafes = function () {
    $scope.list = {};
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {
        select: {
          id: 1,
          name: 1,
          number: 1,
          type : 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.safes = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.newemployee_discount = function () {
    $scope.error = '';
    $scope.employee_discount = { image_url: '/images/discount.png', date: new Date() , from_eng : false , from_company : false };
    site.showModal('#addEmployeeDiscountModal');
  };


  $scope.searchAll = function () {
    let where = {};

    
    if ($scope.search.date) {
      where['date'] = $scope.search.date;
    }

    if ($scope.search.dateFrom) {
      where['date_from'] = $scope.search.dateFrom;
    }

    if ($scope.search.dateTo) {
      where['date_to'] = $scope.search.dateTo;
    }


    if ($scope.search.company && $scope.search.company.id) {
      where['company.id'] = $scope.search.company.id;
    }

    if ($scope.search.source && $scope.search.source.id) {
      where['source.id'] = $scope.search.source.id;
    }

    if ($scope.search.customer && $scope.search.customer.id) {
      where['customer.id'] = $scope.search.customer.id;
    }

    if ($scope.search.employee && $scope.search.employee.id) {
      where['employee.id'] = $scope.search.employee.id;
    }

    if ($scope.search.value) {
      where['value'] = parseInt($scope.search.value);
    }

    if ($scope.search.description) {
      where['description'] = ($scope.search.description);
    }

    site.hideModal('#Employee_Discount_SearchModal');

    $scope.loadAll(where);
  };

  $scope.loadCities = function (gov) {
    if ($scope.townBusy == true) {
      return;
    }
    var where = {};

    if (typeof gov === 'string') {
      gov = JSON.parse(gov);
    } else {
      gov = gov || {};
    }
    if (gov && gov.id) {
      where = {
        'gov.id': gov.id
      };
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/cities/all",
      data: {
        where: where,
        select: {
          id: 1,
          name: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.cities = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.add = function () {

     $scope.error = '';
    let v = site.validated('#addEmployeeDiscountModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employee_discount/add",
      data: $scope.employee_discount
     
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addEmployeeDiscountModal');
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



  $scope.edit = function (employee_discount) {
    $scope.error = '';
    $scope.view(employee_discount);
    $scope.employee_discount = {};
    site.showModal('#updateEmployeeDiscountModal');
  };
  $scope.update = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employee_discount/update",
      data: $scope.employee_discount
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateEmployeeDiscountModal');
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

  $scope.remove = function (employee_discount) {
    $scope.view(employee_discount);
    $scope.employee_discount = {};
    site.showModal('#deleteEmployeeDiscountModal');
  };

  $scope.view = function (employee_discount) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employee_discount/view",
      data: { _id: employee_discount._id }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.employee_discount = response.data.doc;
          $scope.employee_discount.date = new Date($scope.employee_discount.date);
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
      )
  };
  $scope.details = function (employee_discount) {
    $scope.view(employee_discount);
    $scope.employee_discount = {};
    site.showModal('#viewEmployeeDiscountModal');
  };
  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employee_discount/delete",
      data: { _id: $scope.employee_discount._id, name: $scope.employee_discount.name }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteEmployeeDiscountModal');
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

  $scope.loadEmployees = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.employeeList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };
   
  $scope.loadSafes();
  $scope.loadEmployees();
  $scope.loadAll({date : new Date()});
});
