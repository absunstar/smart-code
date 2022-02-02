app.controller("shipping_company", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.shipping_company = {};

  $scope.displayAddShippingCompany = function () {
    $scope.error = '';
    $scope.shipping_company = {
      image_url: '/images/shipping_company.png',
      active: true ,
    };
    site.showModal('#shippingCompanyAddModal');

  };

  $scope.addShippingCompany = function () {
    $scope.error = '';
    const v = site.validated('#shippingCompanyAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shipping_company/add",
      data: $scope.shipping_company
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#shippingCompanyAddModal');
          $scope.getShippingCompanyList();
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

  $scope.displayUpdateShippingCompany = function (shipping_company) {
    $scope.error = '';
    $scope.viewShippingCompany(shipping_company);
    $scope.shipping_company = {};
    site.showModal('#shippingCompanyUpdateModal');
  };

  $scope.updateShippingCompany = function () {
    $scope.error = '';
    const v = site.validated('#shippingCompanyUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shipping_company/update",
      data: $scope.shipping_company
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#shippingCompanyUpdateModal');
          $scope.getShippingCompanyList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsShippingCompany = function (shipping_company) {
    $scope.error = '';
    $scope.viewShippingCompany(shipping_company);
    $scope.shipping_company = {};
    site.showModal('#shippingCompanyViewModal');
  };

  $scope.viewShippingCompany = function (shipping_company) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/shipping_company/view",
      data: {
        id: shipping_company.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.shipping_company = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteShippingCompany = function (shipping_company) {
    $scope.error = '';
    $scope.viewShippingCompany(shipping_company);
    $scope.shipping_company = {};
    site.showModal('#shippingCompanyDeleteModal');

  };

  $scope.deleteShippingCompany = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/shipping_company/delete",
      data: {
        id: $scope.shipping_company.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#shippingCompanyDeleteModal');
          $scope.getShippingCompanyList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getShippingCompanyList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/shipping_company/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#shippingCompanySearchModal');
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
        screen: "Products_groups"
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
    site.showModal('#shippingCompanySearchModal');

  };

  $scope.searchAll = function () { 
    $scope.getShippingCompanyList($scope.search);
    site.hideModal('#shippingCompanySearchModal');
    $scope.search = {};

  };

  $scope.getShippingCompanyList();
  $scope.getGovList();
  $scope.getNumberingAuto();
});