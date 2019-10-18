app.controller("discount_types", function ($scope, $http) {
  $scope._search = {};

  $scope.discount_type = {};


  $scope.loadAll = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/discount_types/all",
      data: {
        select: {
          id: 1,
          name: 1,
          value: 1,
          type: 1
        }
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

  $scope.newDiscount_Type = function () {
    $scope.error = '';
    $scope.discount_type = { image_url: '/images/discount_type.png' };
    site.showModal('#addDiscountTypeModal');
  };
  $scope.add = function () {
    $scope.error = '';
    let v = site.validated();

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if(!$scope.discount_type.type){
      $scope.error = "##word.discount_types_error##"
      return;
    };
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/discount_types/add",
      data: $scope.discount_type
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addDiscountTypeModal');
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

  $scope.edit = function (discount_type) {
    $scope.error = '';
    $scope.discount_type = {};
    $scope.view(discount_type);
    site.showModal('#updateDiscountTypeModal');
  };
  $scope.update = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/discount_types/update",
      data: $scope.discount_type
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateDiscountTypeModal');
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

  $scope.remove = function (discount_type) {
    $scope.error = '';
    $scope.view(discount_type);
    $scope.discount_type = {};
    site.showModal('#deleteDiscountTypeModal');
  };

  $scope.view = function (discount_type) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/discount_types/view",
      data: { _id: discount_type._id }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.discount_type = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
      )
  };
  $scope.details = function (discount_type) {
    $scope.error = '';
    $scope.view(discount_type);
    $scope.discount_type = {};
    site.showModal('#viewDiscountTypeModal');
  };
  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/discount_types/delete",
      data: { _id: $scope.discount_type._id, name: $scope.discount_type.name }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteDiscountTypeModal');
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
