app.controller("brand", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.brand = {};

  $scope.displayAddBrand = function () {
    $scope.error = '';
    $scope.brand = {
      image_url: '/images/brand.png',
      active: true ,
    };
    site.showModal('#brandAddModal');

  };

  $scope.addBrand = function () {
    $scope.error = '';
    const v = site.validated('#brandAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/brand/add",
      data: $scope.brand
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#brandAddModal');
          $scope.getBrandList();
        } else {
          $scope.error = response.data.error;
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

  $scope.displayUpdateBrand = function (brand) {
    $scope.error = '';
    $scope.viewBrand(brand);
    $scope.brand = {};
    site.showModal('#brandUpdateModal');
  };

  $scope.updateBrand = function () {
    $scope.error = '';
    const v = site.validated('#brandUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/brand/update",
      data: $scope.brand
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#brandUpdateModal');
          $scope.getBrandList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsBrand = function (brand) {
    $scope.error = '';
    $scope.viewBrand(brand);
    $scope.brand = {};
    site.showModal('#brandViewModal');
  };

  $scope.viewBrand = function (brand) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/brand/view",
      data: {
        id: brand.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.brand = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteBrand = function (brand) {
    $scope.error = '';
    $scope.viewBrand(brand);
    $scope.brand = {};
    site.showModal('#brandDeleteModal');

  };

  $scope.deleteBrand = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/brand/delete",
      data: {
        id: $scope.brand.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#brandDeleteModal');
          $scope.getBrandList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getBrandList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/brand/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#brandSearchModal');
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
        screen: "brand"
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

  $scope.getGovList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/goves/all",
      data: {
        where: {
          active: true,
        },
        select: { id: 1, name_ar: 1, name_en: 1, code: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.govList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getCityList = function (gov) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/city/all",
      data: {
        where: {
          "gov.id": gov.id,
          active: true,
        },
        select: { id: 1, name_ar: 1, name_en: 1, code: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.cityList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
 
  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#brandSearchModal');

  };

  $scope.searchAll = function () { 
    $scope.getBrandList($scope.search);
    site.hideModal('#brandSearchModal');
    $scope.search = {};

  };

  $scope.getBrandList();
  $scope.getGovList();
  $scope.getNumberingAuto();
});