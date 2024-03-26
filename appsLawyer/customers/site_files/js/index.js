app.controller('customers', function ($scope, $http, $timeout) {
  $scope.baseURL = '';
  $scope.appName = 'customers';
  $scope.modalID = '#customersManageModal';
  $scope.modalSearchID = '#customersSearchModal';
  $scope.mode = 'add';
  $scope._search = {};
  $scope.structure = {
    image: { url: '/images/customer.png' },
    commercialCustomer: false,
    purchaseMaturityPeriod: 0,
    creditLimit: 0,
    active: true,
  };
  $scope.customer = {};
  $scope.list = [];

  $scope.setCommercialInformations = function () {
    $scope.getDocumentsTypes();
  };
  $scope.showAddCustomer = function (_item) {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.customer = { ...$scope.structure, bankInformationsList: [], branchesList: [], purchaseMaturityPeriod: 0, creditLimit: 0 };
    site.showModal($scope.modalID);
    document.querySelector(`${$scope.modalID} .tab-link`).click();
  };

  $scope.addCustomer = function (_item) {
    $scope.error = '';
    const v = site.validated($scope.modalID);
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: `${$scope.baseURL}/api/${$scope.appName}/add`,
      data: $scope.customer,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal($scope.modalID);
          site.resetValidated($scope.modalID);
          $scope.list.unshift(response.data.doc);
        } else {
          $scope.error = response.data.error;
          if (response.data.error && response.data.error.like('*Must Enter Code*')) {
            $scope.error = '##word.Must Enter Code##';
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.showUpdate = function (_item) {
    $scope.error = '';
    $scope.mode = 'edit';
    $scope.view(_item);
    $scope.customer = {};
    site.showModal($scope.modalID);
    document.querySelector(`${$scope.modalID} .tab-link`).click();
  };

  $scope.update = function (_item) {
    $scope.error = '';
    const v = site.validated($scope.modalID);
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: `${$scope.baseURL}/api/${$scope.appName}/update`,
      data: _item,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal($scope.modalID);
          site.resetValidated($scope.modalID);
          let index = $scope.list.findIndex((itm) => itm.id == response.data.result.doc.id);
          if (index !== -1) {
            $scope.list[index] = response.data.result.doc;
          }
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.showView = function (_item) {
    $scope.error = '';
    $scope.mode = 'view';
    $scope.customer = {};
    $scope.view(_item);
    site.showModal($scope.modalID);
    document.querySelector(`${$scope.modalID} .tab-link`).click();
  };

  $scope.view = function (_item) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: `${$scope.baseURL}/api/${$scope.appName}/view`,
      data: {
        id: _item.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.customer = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.showDelete = function (_item) {
    $scope.error = '';
    $scope.mode = 'delete';
    $scope.customer = {};
    $scope.view(_item);
    site.showModal($scope.modalID);
    document.querySelector(`${$scope.modalID} .tab-link`).click();
  };

  $scope.delete = function (_item) {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: 'POST',
      url: `${$scope.baseURL}/api/${$scope.appName}/delete`,
      data: {
        id: $scope.customer.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal($scope.modalID);
          let index = $scope.list.findIndex((itm) => itm.id == response.data.result.doc.id);
          if (index !== -1) {
            $scope.list.splice(index, 1);
          }
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getAll = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'POST',
      url: `${$scope.baseURL}/api/${$scope.appName}/all`,
      data: {
        where: where,
        select: {
          id: 1,
          nameAr: 1,
          nameEn: 1,
          image: 1,
          active: 1,
          group: 1,
          commercialCustomer: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal($scope.modalSearchID);
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/numbering/getAutomatic',
      data: {
        screen: $scope.appName,
      },
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
    );
  };

  $scope.showSearch = function () {
    $scope.error = '';
    site.showModal($scope.modalSearchID);
  };

  $scope.searchAll = function () {
    $scope.getAll($scope.search);
    site.hideModal($scope.modalSearchID);
    $scope.search = {};
  };

  $scope.getCustomersGroups = function () {
    $scope.busy = true;
    $scope.customersGroupsList = [];
    $http({
      method: 'POST',
      url: '/api/customersGroups/all',
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          nameEn: 1,
          nameAr: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.customersGroupsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.addFiles = function () {
    $scope.error = '';
    $scope.customer.filesList = $scope.customer.filesList || [];
    $scope.customer.filesList.push({
      file_date: new Date(),
      file_upload_date: new Date(),
      upload_by: '##user.name##',
    });
  };

  $scope.getDocumentsTypes = function () {
    $scope.busy = true;
    $scope.documentsTypesList = [];
    $http({
      method: 'POST',
      url: '/api/documentsTypes',
      data: {
        select: {
          id: 1,
          nameEn: 1,
          nameAr: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.documentsTypesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getNationalities = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $scope.nationalitiesList = [];
    $http({
      method: 'POST',
      url: '/api/nationalities/all',
      data: {
        where: { active: true },
        select: {
          id: 1,
          nameAr: 1,
          nameEn: 1,
        },
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.nationalitiesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.addBank = function (selectedBank) {
    $scope.error = '';

    if (!selectedBank?.bank || !selectedBank.bank.id) {
      $scope.error = '##word.Please Enter Bank Name##';
      return;
    }

    if (!selectedBank.accountNumber) {
      $scope.error = '##word.Please Enter Account Number##';
      return;
    }

    if (!selectedBank.accountName) {
      $scope.error = '##word.Please Enter Account Name##';
      return;
    }
    selectedBank['active'] = true;
    $scope.customer.bankInformationsList.push(selectedBank);
    $scope.selectedBank = {};
  };

  $scope.getBanks = function () {
    $scope.busy = true;
    $scope.banksList = [];
    $http({
      method: 'POST',
      url: '/api/banks/all',
      data: {
        where: { active: true },
        select: {
          id: 1,
          swiftCode: 1,
          nameEn: 1,
          nameAr: 1,
          ibanSymbol: 1,
          ibanLength: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.banksList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getAccountingLinkList = function () {
    $scope.busy = true;
    $scope.accountingLinkList = [];
    $http({
      method: 'POST',
      url: '/api/accountingLinkList',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.accountingLinkList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getCountriesList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $scope.countriesList = [];
    $http({
      method: 'POST',
      url: '/api/countries/all',
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          nameEn: 1,
          nameAr: 1,
          callingCode: 1,
        },
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.countriesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getGovesList = function (country) {
    $scope.busy = true;
    $scope.govesList = [];

    $http({
      method: 'POST',
      url: '/api/goves/all',
      data: {
        where: {
          active: true,
          'country.id': country.id,
        },
        select: {
          id: 1,
          nameEn: 1,
          nameAr: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.govesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getCitiesList = function (gov) {
    $scope.busy = true;
    $scope.citiesList = [];
    $http({
      method: 'POST',
      url: '/api/cities/all',
      data: {
        where: {
          'gov.id': gov.id,
          active: true,
        },
        select: {
          id: 1,
          nameEn: 1,
          nameAr: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.citiesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getAreasList = function (city) {
    $scope.busy = true;
    $scope.areasList = [];
    $http({
      method: 'POST',
      url: '/api/areas/all',
      data: {
        where: {
          'city.id': city.id,
          active: true,
        },
        select: {
          id: 1,
          nameEn: 1,
          nameAr: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.areasList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getAccountingList = function (linkBy) {
    $scope.busy = true;
    $scope.accountingList = [];
    let url = '/api/accountsGuide/all';
    let where = {};
    let select = { id: 1, nameAr: 1, nameEn: 1 };

    if (linkBy.id == 1) {
      url = '/api/accountsGuide/all';
      where = {
        status: 'active',
        type: 'detailed',
      };
    } else {
      url = '/api/assistantGeneralLedger/all';
      where = {
        active: true,
      };
    }
    $http({
      method: 'POST',
      url: url,
      data: {
        where,
        select,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.accountingList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getMaritalStatus = function () {
    $scope.busy = true;
    $scope.maritalStatusList = [];
    $http({
      method: 'POST',
      url: '/api/maritalStatus',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.maritalStatusList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getGenders = function () {
    $scope.busy = true;
    $scope.gendersList = [];
    $http({
      method: 'POST',
      url: '/api/genders',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.gendersList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getAll();
  $scope.getBanks();
  $scope.getNationalities();
  $scope.getDocumentsTypes();
  $scope.getNumberingAuto();
  $scope.getCustomersGroups();
  $scope.getAccountingLinkList();
  $scope.getCountriesList();
  $scope.getMaritalStatus();
  $scope.getGenders();
});
