app.controller("administrative_business", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.administrative_business = {};

  $scope.displayAddAdministrativeBusiness = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.administrative_business = {
      image_url: '/images/administrative_business.png',
      active: true,
      date : new Date()
    };
    site.showModal('#administrativeBusinessAddModal');
  };

  $scope.addAdministrativeBusiness = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';
    $scope.busy = true;

    const v = site.validated('#administrativeBusinessAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $http({
      method: "POST",
      url: "/api/administrative_business/add",
      data: $scope.administrative_business
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#administrativeBusinessAddModal');
          $scope.getAdministrativeBusinessList();
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

  $scope.displayUpdateAdministrativeBusiness = function (administrative_business) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsAdministrativeBusiness(administrative_business);
    $scope.administrative_business = {
      image_url: '/images/vendor_logo.png',

    };
    site.showModal('#administrativeBusinessUpdateModal');
  };

  $scope.updateAdministrativeBusiness = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';
    $scope.busy = true;

    const v = site.validated('#administrativeBusinessUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $http({
      method: "POST",
      url: "/api/administrative_business/update",
      data: $scope.administrative_business
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#administrativeBusinessUpdateModal');
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

  $scope.displayDetailsAdministrativeBusiness = function (administrative_business) {
    $scope.error = '';
    $scope.detailsAdministrativeBusiness(administrative_business);
    $scope.administrative_business = {};
    site.showModal('#administrativeBusinessDetailsModal');
  };

  $scope.detailsAdministrativeBusiness = function (administrative_business) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/administrative_business/view",
      data: {
        id: administrative_business.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.administrative_business = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteAdministrativeBusiness = function (administrative_business) {
    $scope.error = '';
    $scope.detailsAdministrativeBusiness(administrative_business);
    $scope.administrative_business = {};
    site.showModal('#administrativeBusinessDeleteModal');
  };

  $scope.deleteAdministrativeBusiness = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/administrative_business/delete",
      data: {
        id: $scope.administrative_business.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#administrativeBusinessDeleteModal');
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

  $scope.getAdministrativeBusinessList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/administrative_business/all",
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
    $scope.getAdministrativeBusinessList($scope.search);
    site.hideModal('#administrativeBusinessSearchModal');
    $scope.search = {}

  };

  $scope.loadAdministrativeBusiness = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/request_types/all",
      data: {
        select: { id: 1, name: 1, description: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.administrativeBusinessList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getAdministrativeBusinessList();
  $scope.loadAdministrativeBusiness();
});