app.controller("militaries_status", function ($scope, $http) {

  $scope.military_state = {};

  $scope.loadMilitaries_Status = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/militaries_status/all",
      data: {
        select: { id: 1, name_Ar: 1, name_En: 1 ,code:1}
      }
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
    $scope.military_state = {
      active: true,
      image_url: '/images/military.png'
    };
    site.showModal('#addMilitaryStateModal');
  };

  $scope.add = function () {

    $scope.error = '';
    const v = site.validated('#addMilitaryStateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
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
          site.hideModal('#addMilitaryStateModal');
          $scope.loadAll();
        } else {
          $scope.error = '##word.error##';
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
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
    site.showModal('#updateMilitaryStateModal');
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
          site.hideModal('#updateMilitaryStateModal');
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
    site.showModal('#deleteMilitaryStateModal');
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
    site.showModal('#viewMilitaryStateModal');
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
          site.hideModal('#deleteMilitaryStateModal');
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

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "militaies"
      }
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
    )
  };

  $scope.loadAll();
  $scope.loadMilitaries_Status();
  $scope.getNumberingAuto();
});
