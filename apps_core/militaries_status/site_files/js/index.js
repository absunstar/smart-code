app.controller("militaries_status", function ($scope, $http) {

  $scope.military_state = {};

  $scope.loadMilitaries_Status = function() {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/militaries_status/all",
      data: {
        select : {id:1 , name : 1}
      }
    }).then(
      function(response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.militaries_status = response.data.list;
        }
      },
      function(err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadAll = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/militaries_status/all",
      data: {}
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
  
 
  $scope.newMilitary_State = function () {
    $scope.error = '';
    $scope.military_state = { image_url: '/images/military.png' };
    site.showModal('#addMilitary_StateModal');
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
      url: "/api/militaries_status/add",
      data: $scope.military_state
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addMilitary_StateModal');
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

  $scope.edit = function (military_state) {
    $scope.error = '';
    $scope.view(military_state);
    $scope.military_state = {};
    site.showModal('#updateMilitary_StateModal');
  };
  $scope.update = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/militaries_status/update",
      data: $scope.military_state
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateMilitary_StateModal');
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

  $scope.remove = function (military_state) {
    $scope.error = '';
    $scope.view(military_state);
    $scope.military_state = {};
    site.showModal('#deleteMilitary_StateModal');
  };

  $scope.view = function (military_state) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/militaries_status/view",
      data: { id: military_state.id }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.military_state = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
      )
  };
  $scope.details = function (military_state) {
    $scope.error = '';
    $scope.view(military_state);
    $scope.military_state = {};
    site.showModal('#viewMilitary_StateModal');
  };
  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/militaries_status/delete",
      data: { id: $scope.military_state.id, name: $scope.military_state.name }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteMilitary_StateModal');
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
  $scope.loadMilitaries_Status();
});
