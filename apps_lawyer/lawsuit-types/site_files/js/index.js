app.controller("lawsuit_types", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.lawsuit_types = {};

  $scope.displayAddLawsuitStatus = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.lawsuit_types = {
      image_url: '/images/lawsuit_types.png',
      active: true
    };
    site.showModal('#lawsuitStatusAddModal');
  };

  $scope.addLawsuitStatus = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#lawsuitStatusAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/lawsuit_types/add",
      data: $scope.lawsuit_types
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#lawsuitStatusAddModal');
          $scope.getLawsuitStatusList();
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

  $scope.displayUpdateLawsuitStatus = function (lawsuit_types) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsLawsuitStatus(lawsuit_types);
    $scope.lawsuit_types = {
      image_url: '/images/vendor_logo.png',

    };
    site.showModal('#lawsuitStatusUpdateModal');
  };

  $scope.updateLawsuitStatus = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#lawsuitStatusUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/lawsuit_types/update",
      data: $scope.lawsuit_types
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#lawsuitStatusUpdateModal');
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

  $scope.displayDetailsLawsuitStatus = function (lawsuit_types) {
    $scope.error = '';
    $scope.detailsLawsuitStatus(lawsuit_types);
    $scope.lawsuit_types = {};
    site.showModal('#lawsuitTypesDetailsModal');
  };

  $scope.detailsLawsuitStatus = function (lawsuit_types) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/lawsuit_types/view",
      data: {
        id: lawsuit_types.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.lawsuit_types = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteLawsuitStatus = function (lawsuit_types) {
    $scope.error = '';
    $scope.detailsLawsuitStatus(lawsuit_types);
    $scope.lawsuit_types = {};
    site.showModal('#lawsuitStatusDeleteModal');
  };

  $scope.deleteLawsuitStatus = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/lawsuit_types/delete",
      data: {
        id: $scope.lawsuit_types.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#lawsuitStatusDeleteModal');
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

  $scope.getLawsuitStatusList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/lawsuit_types/all",
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
    $scope.getLawsuitStatusList($scope.search);
    site.hideModal('#lawsuitStatusSearchModal');
    $scope.search = {}

  };

  $scope.getLawsuitStatusList();

});