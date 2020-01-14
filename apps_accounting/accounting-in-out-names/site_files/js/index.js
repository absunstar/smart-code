app.controller("in_out_names", function ($scope, $http) {
  $scope._search = {};

  $scope.in_out_name = {};

  $scope.loadAll = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/in_out_names/all",
      data: {
        where: where
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

  $scope.searchAll = function () {
    $scope.error = '';
    $scope.loadAll($scope.search);
    site.hideModal('#inOutSearchModal');
    $scope.search = {};
  };

  $scope.newIn_Out_Name = function () {
    $scope.error = '';
    $scope.in_out_name = { image_url: '/images/in_out_name.png', date: new Date() };
    site.showModal('#addInOutNameModal');
  };
  $scope.add = function () {
    $scope.error = '';
    let v = site.validated('#addInOutNameModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if (!$scope.in_out_name.in && !$scope.in_out_name.out) {
      $scope.error = "##word.error_select##"
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/in_out_names/add",
      data: $scope.in_out_name

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addInOutNameModal');
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

  $scope.edit = function (in_out_name) {
    $scope.error = '';
    $scope.view(in_out_name);
    $scope.in_out_name = {};
    site.showModal('#updateInOutNameModal');
  };
  $scope.update = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/in_out_names/update",
      data: $scope.in_out_name
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateInOutNameModal');
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

  $scope.remove = function (in_out_name) {
    $scope.error = '';
    $scope.view(in_out_name);
    $scope.in_out_name = {};
    site.showModal('#deleteInOutNameModal');
  };

  $scope.view = function (in_out_name) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/in_out_names/view",
      data: { _id: in_out_name._id }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.in_out_name = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
  $scope.details = function (in_out_name) {
    $scope.error = '';
    $scope.view(in_out_name);
    $scope.in_out_name = {};
    site.showModal('#viewInOutNameModal');
  };
  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/in_out_names/delete",
      data: { _id: $scope.in_out_name._id, name: $scope.in_out_name.name }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteInOutNameModal');
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
});
