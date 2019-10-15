app.controller("vendors", function ($scope, $http, $timeout) {

  $scope.vendor = {};

  $scope.displayAddVendor = function () {
    $scope.error = '';
    $scope.vendor = {
      image_url: '/images/vendor.png',
      active: true,
      balance: 0,
      branch_list: [{
        charge: [{}]
      }],
      currency_list: [],
      opening_balance: [{ initial_balance: 0 }],
      bank_list: [{}],
      dealing_company: [{}]
    };
    $scope.showOpeningBalance=true;
    site.showModal('#vendorAddModal');
    document.querySelector('#vendorAddModal .tab-link').click();
  };

  $scope.addVendor = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#vendorAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
  
    $http({
      method: "POST",
      url: "/api/vendors/add",
      data: $scope.vendor
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#vendorAddModal');
          $scope.list.push(response.data.doc);
          $scope.count = $scope.list.length;
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateVendor = function (vendor) {
    $scope.error = '';
    $scope.detailsVendor(vendor);
    $scope.vendor = {};
    site.showModal('#vendorUpdateModal');
    $scope.showOpeningBalance=false;
    document.querySelector('#vendorUpdateModal .tab-link').click();
  };

  $scope.displaybankingAndAccounting = function (event) {

    site.showTabContent(event, '#bankingAndAccounting');

    let num = 0;
    let ln = $scope.vendor.opening_balance;

    for (let i = 0; i < ln.length; i++) {
      if (ln[i].initial_balance > 0) {

        if (ln[i].balance_type == "credit") {
          num = num - parseInt(ln[i].initial_balance);

        } else {
          num = num + parseInt(ln[i].initial_balance);
        }

      }

    }

    if($scope.showOpeningBalance ){

      $scope.vendor.balance = parseInt(num);
    }
    


  };



  $scope.updateVendor = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#vendorUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/vendors/update",
      data: $scope.vendor
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#vendorUpdateModal');
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

  $scope.displayDeleteVendor = function (vendor) {
    $scope.error = '';
    $scope.detailsVendor(vendor);
    $scope.vendor = {};
    site.showModal('#vendorDeleteModal');
    document.querySelector('#vendorDeleteModal .tab-link').click();
  };

  $scope.deleteVendor = function () {
    $scope.error = '';
    if ($scope.busy) {
      return
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/vendors/delete",
      data: {
        id: $scope.vendor.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#vendorDeleteModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list.splice(i, 1);
              $scope.count = $scope.list.length;
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

  $scope.displayDetailsVendor = function (vendor) {
    $scope.error = '';
    $scope.detailsVendor(vendor);
    $scope.vendor = {};
    site.showModal('#vendorDetailsModal');
    document.querySelector('#vendorDetailsModal .tab-link').click();
  };

  $scope.detailsVendor = function (vendor) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vendors/view",
      data: {
        id: vendor.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.vendor = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displaySendEmail = function () {
    $scope.error = '';
    site.showModal('#vendorSendEmailModal');
  };

  $scope.getVendorList = function (where) {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/vendors/all",
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
  
  $scope.getVendorGroupList = function () {
    $http({
      method: "POST",
      url: "/api/vendors_group/all",
      data: {
        select: {
          id: 1,
          name: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.vendorGroupList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getNationalityList = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/nationalities/all",
      data: {
        select: {
          id: 1,
          name_ar: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.nationalityList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getCurrencyList = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/currencies/all",
      data: {
        select: {
          id: 1,
          name_ar: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.currencyList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getBankList = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/banks/all",
      data: {
        select: {
          id: 1,
          name: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.bankList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getGovList = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/goves/all",
      data: {
        select: {
          id: 1,
          name: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.govList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getCityList = function (gov) {
    $scope.error = '';
    if (!gov) {
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/cities/all",
      data: {
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
        $scope.error = err;
      }
    )
  };

  $scope.getBranchCityList = function (branch) {
    $scope.error = '';
    if (!branch) {
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/cities/all",
      data: {
        select: {
          id: 1,
          name: 1
        },
        where: {
          'gov.id': branch.gov.id
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          branch.$cityList = response.data.list;
        }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getFileNameList = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/files_names/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.fileNameList = response.data.list;
        }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.searchAll = function () {

    let where = {};

    if ($scope.search.code) {

      where['code'] = $scope.search.code;
    }
    if ($scope.search.name_ar) {

      where['name_ar'] = $scope.search.name_ar;
    }
    if ($scope.search.name_en) {

      where['name_en'] = $scope.search.name_en;
    }
    if ($scope.search.nationality) {

      where['nationality'] = $scope.search.nationality;
    }
    if ($scope.search.gov) {

      where['gov'] = $scope.search.gov;
    }
    if ($scope.search.city) {

      where['city'] = $scope.search.city;
    }
    if ($scope.search.phone) {

      where['phone'] = $scope.search.phone;
    }
    if ($scope.search.mobile) {

      where['mobile'] = $scope.search.mobile;
    }
    where['active'] = 'all';

    $scope.getVendorList(where);

    site.hideModal('#vendorSearchModal');
    $scope.search = {}

  };

  $scope.getCompanyList = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/companies/all",
      data: {
        select: {
          id: 1,
          name_ar: 1,
          'branch_list': 1
        }
      }
    }).then(
      function (response) {
        if (response.data.done && response.data.list.length > 0) {
          $scope.companyList = response.data.list;
        }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  
  $scope.getGuideAccountsList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.guideAccountsList = [];
    $http({
      method: "POST",
      url: "/api/guide_accounts/all",
      data: {
        where: {
          type: 'detailed'
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.guideAccountsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getCompanyBranchList = function (company) {
    $scope.error = '';
    if (!company) {
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/companies/all",
      data: {
        where: {
          id: company.id
        },
        select: {
          id: 1,
          name_ar: 1,
          'branch_list': 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.branchList = response.data.list;
        }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  


  $scope.getVendorList();
  $scope.getVendorGroupList();
  $scope.getNationalityList();
  $scope.getCurrencyList();
  $scope.getBankList();
  $scope.getGovList();
  $scope.getCompanyList();
  $scope.getFileNameList();
  $scope.getGuideAccountsList();

});