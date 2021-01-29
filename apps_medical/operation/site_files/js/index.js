app.controller("operation", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.operation = {};

  $scope.displayAddOperation = function () {
    $scope.error = '';
    $scope.operation = {
      image_url: '/images/operation.png',
      active: true

    };
    site.showModal('#operationAddModal');

  };

  $scope.addOperation = function () {
    $scope.error = '';
    const v = site.validated('#operationAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/operation/add",
      data: $scope.operation
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#operationAddModal');
          $scope.getOperationList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateOperation = function (operation) {
    $scope.error = '';
    $scope.viewOperation(operation);
    $scope.operation = {};
    site.showModal('#operationUpdateModal');
  };

  $scope.updateOperation = function () {
    $scope.error = '';
    const v = site.validated('#operationUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/operation/update",
      data: $scope.operation
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#operationUpdateModal');
          $scope.getoperationList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsOperation = function (operation) {
    $scope.error = '';
    $scope.viewOperation(operation);
    $scope.operation = {};
    site.showModal('#operationViewModal');
  };

  $scope.viewOperation = function (operation) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/operation/view",
      data: {
        id: operation.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.operation = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteOperation = function (operation) {
    $scope.error = '';
    $scope.viewOperation(operation);
    $scope.operation = {};
    site.showModal('#operationDeleteModal');
  };

  $scope.deleteOperation = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/operation/delete",
      data: {
        id: $scope.operation.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#operationDeleteModal');
          $scope.getOperationList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getOperationList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/operation/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#operationSearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
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
        screen: "operations"
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

  $scope.searchAll = function () {
   
    $scope.getOperationList($scope.search);
    site.hideModal('#operationSearchModal');
    $scope.search = {};
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#operationSearchModal');

  };

  $scope.getOperationList();
  $scope.getNumberingAuto();

});