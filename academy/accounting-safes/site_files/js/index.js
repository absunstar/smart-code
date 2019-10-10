app.controller("safes", function ($scope, $http) {

  $scope.safe = {};


  $scope.loadEmployees = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees/all",
      data: {
        select : {id:1 , name : 1}
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
  
  
  $scope.loadAll = function (where , limit) {
    $scope.list = {};
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {where : where,
      limit : limit ||1000000000
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#safesSearchModal'); 
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.newSafe = function () {
    $scope.error = '';
    $scope.safe = { image_url: '/images/safe.png' , balance:0 };
    
    site.showModal('#addSafeModal');
    $('#safe_name').focus();
  };

  $scope.add = function () {
    $scope.error = '';
    const v = site.validated();
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/add",
      data: $scope.safe
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addSafeModal');
          $scope.loadAll();
        } 
       
        else if(response.data.error.includes('duplicate')){

          $scope.error = "##word.duplicate_alarm##";
        }
        else {
         $scope.error = '##word.error##';
        }
      },
      function (err) {
        console.log(err);
      }
      )
  };

  $scope.edit = function (safe) {
    $scope.error = '';
    $scope.view(safe);
    $scope.safe = {};
    site.showModal('#updateSafeModal');
    $('#safe_name').focus();
  };
  $scope.update = function () {
    $scope.error = '';
    const v = site.validated();
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/update",
      data: $scope.safe
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateSafeModal');
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

  $scope.remove = function (safe) {
    $scope.error = '';
    $scope.view(safe);
    $scope.safe = {};
    site.showModal('#deleteSafeModal');
  };

  $scope.view = function (safe) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/view",
      data: { _id: safe._id }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.safe = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
      )
  };
  $scope.details = function (safe) {
    $scope.error = '';
    $scope.view(safe);
    $scope.safe = {};
    site.showModal('#viewSafeModal');
  };

  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/delete",
      data: { _id: $scope.safe._id, name: $scope.safe.name }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteSafeModal');
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

  $scope.searchAll = function () {
    $scope.error = '';
    let where = {};

    if ($scope.search.employee) {
      where['employee'] = $scope.search.employee;
    }
   
    if ($scope.search.balance) {
      where['balance'] = site.toNumber($scope.search.balance);
    }
    if ($scope.search.name) {
      where['name'] = $scope.search.name;
    }
    
    if ($scope.search.description) {
      where['description'] = $scope.search.description;
    }
    $scope.loadAll(where , $scope.search.limit);
    site.hideModal('#SafesSearchModal'); 

  };

  $scope.loadAll();
  $scope.loadEmployees();
  // $scope.loadSafes();

 
});
