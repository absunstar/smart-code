app.controller("employees_advances_fin", function ($scope, $http) {
  $scope._search = {};

  $scope.employees_advances_fin = {};
  $scope.search = {};

 

  $scope.approved = function () {

    $scope.busy = true;

      $scope.employees_advances_fin.done = true
    
    $http({
      method: "POST",
      url: "/api/employees_advances_fin/approved",
      data: $scope.employees_advances_fin
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#employees_advances_fin');
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

  $scope.loadAll = function (where , limit) {
    $scope.busy = true;
    
    $http({
      method: "POST",
      url: "/api/employees_advances_fin/all",
      data: {where : where,
      limit : limit ||10000000
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
      data: {}
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




  $scope.newemployees_advances_fin = function () {
    $scope.error = '';
    $scope.employees_advances_fin = { image_url: '/images/discount.png', date: new Date() , from_eng : false , from_company : false };
    site.showModal('#addEmployeesAdvancesFinModal');
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

    if ($scope.search.employee && $scope.search.employee.id) {
      where['employee.id'] = $scope.search.employee.id;
    }

    if ($scope.search.value) {
      where['value'] = parseInt($scope.search.value);
    }


    
    $scope.loadAll(where , $scope.search.limit);
  };

  $scope.add = function () {

     $scope.error = '';
    let v = site.validated();

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_advances_fin/add",
      data: $scope.employees_advances_fin
     
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addEmployeesAdvancesFinModal');
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

  $scope.edit = function (employees_advances_fin) {
    $scope.error = '';
    $scope.view(employees_advances_fin);
    $scope.employees_advances_fin = {};
    site.showModal('#updateEmployeesAdvancesFinModal');
  };

 
  $scope.update = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_advances_fin/update",
      data: $scope.employees_advances_fin
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateEmployeesAdvancesFinModal');
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

  $scope.remove = function (employees_advances_fin) {
    $scope.view(employees_advances_fin);
    $scope.employees_advances_fin = {};
    site.showModal('#deleteEmployeesAdvancesFinModal');
  };

  $scope.view = function (employees_advances_fin) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_advances_fin/view",
      data: { _id: employees_advances_fin._id }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.employees_advances_fin = response.data.doc;
          $scope.employees_advances_fin.date = new Date($scope.employees_advances_fin.date);
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
      )
  };
  $scope.details = function (employees_advances_fin) {
    $scope.view(employees_advances_fin);
    $scope.employees_advances_fin = {};
    site.showModal('#viewEmployeesAdvancesFinModal');
  };
  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees_advances_fin/delete",
      data: { _id: $scope.employees_advances_fin._id, name: $scope.employees_advances_fin.name }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteEmployeesAdvancesFinModal');
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
  
   
  $scope.loadSafes();
  $scope.loadAll();
});
