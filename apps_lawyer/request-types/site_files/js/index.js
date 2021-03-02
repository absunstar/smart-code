app.controller("request_types", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.request_types = {};

  $scope.displayAddRequestTypes = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.request_types = {
      image_url: '/images/request_types.png',
      active: true
    };
    site.showModal('#requestTypesAddModal');
  };

  $scope.addRequestTypes = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#requestTypesAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/request_types/add",
      data: $scope.request_types
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#requestTypesAddModal');
          $scope.getRequestTypesList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key error*')) {
            $scope.error = "##word.code_exisit##"
          } else if (response.data.error.like('*Please write code*')) {
            $scope.error = "##word.enter_code_inventory##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateRequestTypes = function (request_types) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsRequestTypes(request_types);
    $scope.request_types = {};
    site.showModal('#requestTypesUpdateModal');
  };

  $scope.updateRequestTypes = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#requestTypesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/request_types/update",
      data: $scope.request_types
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#requestTypesUpdateModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list[i] = response.data.doc;
            }
          });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsRequestTypes = function (request_types) {
    $scope.error = '';
    $scope.detailsRequestTypes(request_types);
    $scope.request_types = {};
    site.showModal('#requestTypesDetailsModal');
  };

  $scope.detailsRequestTypes = function (request_types) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/request_types/view",
      data: {
        id: request_types.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.request_types = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteRequestTypes = function (request_types) {
    $scope.error = '';
    $scope.detailsRequestTypes(request_types);
    $scope.request_types = {};
    site.showModal('#requestTypesDeleteModal');
  };

  $scope.deleteRequestTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/request_types/delete",
      data: {
        id: $scope.request_types.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#requestTypesDeleteModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list.splice(i, 1);
              $scope.count -= 1;
            }
          });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getRequestTypesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/request_types/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getRequestTypesList($scope.search);
    site.hideModal('#requestTypesSearchModal');
    $scope.search = {}

  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "request_types"
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

  $scope.getNumberingAuto();
  $scope.getRequestTypesList();

});