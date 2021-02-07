app.controller("lawsuit_status", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.lawsuit_status = {};

  $scope.displayAddLawsuitStatus = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.lawsuit_status = {
      image_url: '/images/lawsuit_status.png',
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
      url: "/api/lawsuit_status/add",
      data: $scope.lawsuit_status
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

  $scope.displayUpdateLawsuitStatus = function (lawsuit_status) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsLawsuitStatus(lawsuit_status);
    $scope.lawsuit_status = {};
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
      url: "/api/lawsuit_status/update",
      data: $scope.lawsuit_status
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

  $scope.displayDetailsLawsuitStatus = function (lawsuit_status) {
    $scope.error = '';
    $scope.detailsLawsuitStatus(lawsuit_status);
    $scope.lawsuit_status = {};
    site.showModal('#lawsuitStatusDetailsModal');
  };

  $scope.detailsLawsuitStatus = function (lawsuit_status) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/lawsuit_status/view",
      data: {
        id: lawsuit_status.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.lawsuit_status = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteLawsuitStatus = function (lawsuit_status) {
    $scope.error = '';
    $scope.detailsLawsuitStatus(lawsuit_status);
    $scope.lawsuit_status = {};
    site.showModal('#lawsuitStatusDeleteModal');
  };

  $scope.deleteLawsuitStatus = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/lawsuit_status/delete",
      data: {
        id: $scope.lawsuit_status.id

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
      url: "/api/lawsuit_status/all",
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