app.controller("contracting_companies", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.contracting_company = {};

  $scope.displayAddContracting_company = function () {
    $scope.error = '';
    $scope.contracting_company = {
      image_url: '/images/contracting_company.png',
      active: true
    };

    site.showModal('#contracting_companyAddModal');

  };

  $scope.addContracting_company = function () {
    $scope.error = '';
    const v = site.validated('#contracting_companyAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/contracting_companies/add",
      data: $scope.contracting_company
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#contracting_companyAddModal');
          $scope.getContracting_companyList();
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

  $scope.displayUpdateContracting_company = function (contracting_company) {
    $scope.error = '';
    $scope.viewContracting_company(contracting_company);
    $scope.contracting_company = {};
    site.showModal('#contracting_companyUpdateModal');
  };

  $scope.updateContracting_company = function () {
    $scope.error = '';
    const v = site.validated('#contracting_companyUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/contracting_companies/update",
      data: $scope.contracting_company
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#contracting_companyUpdateModal');
          $scope.getContracting_companyList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsContracting_company = function (contracting_company) {
    $scope.error = '';
    $scope.viewContracting_company(contracting_company);
    $scope.contracting_company = {};
    site.showModal('#contracting_companyViewModal');
  };

  $scope.viewContracting_company = function (contracting_company) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/contracting_companies/view",
      data: {
        id: contracting_company.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.contracting_company = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteContracting_company = function (contracting_company) {
    $scope.error = '';
    $scope.viewContracting_company(contracting_company);
    $scope.contracting_company = {};
    site.showModal('#contracting_companyDeleteModal');
  };

  $scope.deleteContracting_company = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/contracting_companies/delete",
      data: {
        id: $scope.contracting_company.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#contracting_companyDeleteModal');
          $scope.getContracting_companyList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getContracting_companyList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/contracting_companies/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#contracting_companySearchModal');
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
        screen: "contracting_company"
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

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#contracting_companySearchModal');

  };

  $scope.searchAll = function () {

    $scope.getContracting_companyList($scope.search);
    site.hideModal('#contracting_companySearchModal');
    $scope.search = {};
  };

  $scope.getContracting_companyList();
  $scope.getNumberingAuto();
});