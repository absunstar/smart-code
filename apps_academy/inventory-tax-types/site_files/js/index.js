app.controller("tax_types", function ($scope, $http) {

  $scope.tax_type = {};

  $scope.loadAll = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tax_types/all",
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
  $scope.newTax_Type = function () {
    $scope.error = '';
    $scope.tax_type = { image_url: '/images/tax_type.png' };
    site.showModal('#addTaxTypeModal');
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
      url: "/api/tax_types/add",
      data: $scope.tax_type
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addTaxTypeModal');
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

  $scope.edit = function (tax_type) {
    $scope.error = '';
    $scope.tax_type = {};
    $scope.view(tax_type);
    site.showModal('#updateTaxTypeModal');
  };
  $scope.update = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tax_types/update",
      data: $scope.tax_type
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateTaxTypeModal');
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

  $scope.remove = function (tax_type) {
    $scope.error = '';
    $scope.view(tax_type);
    $scope.tax_type = {};
    site.showModal('#deleteTaxTypeModal');
  };

  $scope.view = function (tax_type) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tax_types/view",
      data: { _id: tax_type._id }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.tax_type = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
      )
  };

  $scope.details = function (tax_type) {
    $scope.error = '';
    $scope.view(tax_type);
    $scope.tax_type = {};
    site.showModal('#viewTaxTypeModal');
  };
  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tax_types/delete",
      data: { _id: $scope.tax_type._id, name: $scope.tax_type.name }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteTaxTypeModal');
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
