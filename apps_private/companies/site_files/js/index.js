app.controller("companies", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.company = {};

  $scope.displayAddcompany = function () {
    $scope.error = '';
    $scope.company = {
      image_url: '/images/company.png',
      calender_type: 'gegorian',
      active: true,
      branch_count: 3,
      store: 5,
      item: 100,
      unit: 5,
      currency: 5,
      users_count: 20,
      customers_count: 50,
      employees_count: 20,
      branch_list: [{
        code: 1,
        name_ar: 'الفرع الرئيسى',
        name_en: 'Main Branch',
        charge: [{}]
      }],
      bank_list: [{}]
    };
    site.showModal('#companyAddModal');
    document.querySelector('#companyAddModal .tab-link').click();
  };

  $scope.addcompany = function () {
    if ($scope.busy) {
      return;
    }

    $scope.error = '';
    const v = site.validated('#companyAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/companies/add",
      data: $scope.company
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {

          site.hideModal('#companyAddModal');
          $scope.list.push(response.data.doc);
          $scope.count += 1;

          $scope.busy = true;
          $http({
            method: "POST",
            url: "/api/numbering/get",
            data: {
              reset: true,
              doc: response.data.doc

            }
          }).then(
            function (response) {
              $scope.busy = false;
              if (response.data.done) {
              }
            },
            function (err) {
              $scope.busy = false;
              $scope.error = err;
            }
          )

        } else {
          $scope.error = response.data.error;
          $scope.busy = false;

          if (response.data.error.like('*ername must be typed correctly*')) {
            $scope.error = "##word.err_username_contain##"

          } else if (response.data.error.like('*User Is Exist*')) {
            $scope.error = "##word.user_exists##"
          }

        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdatecompany = function (company) {
    $scope.error = '';
    $scope.detailscompany(company);
    $scope.company = {};
    site.showModal('#companyUpdateModal');
    document.querySelector('#companyUpdateModal .tab-link').click();
  };

  $scope.updatecompany = function () {
    if ($scope.busy) {
      return;
    }

    $scope.error = '';
    const v = site.validated('#companyUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/companies/update",
      data: $scope.company
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#companyUpdateModal');
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

  $scope.displayDetailscompany = function (company) {
    $scope.error = '';
    $scope.detailscompany(company);
    $scope.company = {};
    site.showModal('#companyDetailsModal');
    document.querySelector('#companyDetailsModal .tab-link').click();
  };

  $scope.detailscompany = function (company) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/companies/view",
      data: {
        id: company.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.company = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeletecompany = function (company) {
    $scope.error = '';
    $scope.detailscompany(company);
    $scope.company = {};
    site.showModal('#companyDeleteModal');
    document.querySelector('#companyDeleteModal .tab-link').click();
  };

  $scope.deletecompany = function () {
    if ($scope.busy) {
      return
    }

    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/companies/delete",
      data: {
        id: $scope.company.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#companyDeleteModal');
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

  $scope.getcompanyActivityList = function () {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/companies_activities/all",
      data: {
        select: {
          id: 1,
          name_ar: 1, name_en: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.companisActivitiesList = response.data.list;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getGovList = function () {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/goves/all",
      data: {
        select: {
          id: 1,
          name_ar: 1, name_en: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.govList = response.data.list;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getcompanyList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/companies/all",
      data: {}
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


  $scope.getCityList = function (gov) {
    if (!gov) {
      return;
    }
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/cities/all",
      data: {
        select: {
          id: 1,
          name_ar: 1, name_en: 1,
          code: 1
        },
        where: {
          'gov.id': gov.id
        }
      }
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
    )
  };

  $scope.getBankList = function () {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/banks/all",
      data: {
        select: {
          id: 1,
          name_ar: 1, name_en: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.bankList = response.data.list;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };



  $scope.getcompanyList();
  $scope.getGovList();
  $scope.getBankList();
  $scope.getcompanyActivityList();
});