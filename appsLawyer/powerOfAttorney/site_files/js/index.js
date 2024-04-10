app.controller("powerOfAttorney", function ($scope, $http, $timeout) {
  $scope.baseURL = "";
  $scope.appName = "powerOfAttorney";
  $scope.modalID = "#powerOfAttorneyManageModal";
  $scope.modalSearchID = "#powerOfAttorneySearchModal";
  $scope.mode = "add";
  $scope.structure = {
    image: { url: "/theme1/images/setting/powerOfAttorney.png" },
    active: true,
  };
  $scope.item = {};
  $scope.list = [];
  $scope.userOfficesList = "##session.user.officesList##"
  .split(",")
  .map(Number);

  $scope.search = { fromDate: new Date(), toDate: new Date() };
  $scope.getCurrentMonthDate = function () {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    $scope.search.fromDate = new Date(firstDay);
    $scope.search.toDate = new Date(lastDay);
    return { firstDay, lastDay };
  };
  $scope.showAdd = function (_item) {
    $scope.error = "";
    $scope.mode = "add";
    $scope.item = {
      ...$scope.structure,
      date: new Date(),
      clientsList: [],
      clientsLawyersList: [],
    };
    $scope.item.office = $scope.officesList.find(
      (l) => l.id == $scope.userOfficesList[0]
    );
    site.showModal($scope.modalID);
    document.querySelector(`${$scope.modalID} .tab-link`).click();
  };

  $scope.add = function (_item) {
    $scope.error = "";
    const v = site.validated($scope.modalID);
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/add`,
      data: $scope.item,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal($scope.modalID);
          site.resetValidated($scope.modalID);
          $scope.list.unshift(response.data.doc);
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.showUpdate = function (_item) {
    $scope.error = "";
    $scope.mode = "edit";
    $scope.view(_item);
    $scope.item = {};
    site.showModal($scope.modalID);
    document.querySelector(`${$scope.modalID} .tab-link`).click();
  };

  $scope.update = function (_item) {
    $scope.error = "";
    const v = site.validated($scope.modalID);
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/update`,
      data: _item,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal($scope.modalID);
          site.resetValidated($scope.modalID);
          let index = $scope.list.findIndex(
            (itm) => itm.id == response.data.result.doc.id
          );
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
    $scope.error = "";
    $scope.mode = "view";
    $scope.item = {};
    $scope.view(_item);
    site.showModal($scope.modalID);
    document.querySelector(`${$scope.modalID} .tab-link`).click();
  };

  $scope.view = function (_item) {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/view`,
      data: {
        id: _item.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.item = response.data.doc;
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
    $scope.error = "";
    $scope.mode = "delete";
    $scope.item = {};
    $scope.view(_item);
    site.showModal($scope.modalID);
    document.querySelector(`${$scope.modalID} .tab-link`).click();
  };

  $scope.delete = function (_item) {
    $scope.busy = true;
    $scope.error = "";

    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/delete`,
      data: {
        id: $scope.item.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal($scope.modalID);
          let index = $scope.list.findIndex(
            (itm) => itm.id == response.data.result.doc.id
          );
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

  $scope.searchGetAll = function (ev, search) {
    if (ev && ev.which != 13) {
      return;
    }

    $scope.getAll({}, search);
  };

  $scope.getAll = function (where, search) {
    if ($scope.busyAll) {
      return;
    }
    $scope.busyAll = true;
    where = where || {};
    where["office.id"] = { $in: $scope.userOfficesList };
     $scope.list = [];
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/all`,
      data: {
        where: where,
        search,
      },
    }).then(
      function (response) {
        $scope.busyAll = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal($scope.modalSearchID);
        }
      },
      function (err) {
        $scope.busyAll = false;
        $scope.error = err;
      }
    );
  };

  $scope.getDocumentsTypes = function () {
    $scope.busy = true;
    $scope.documentsTypesList = [];
    $http({
      method: "POST",
      url: "/api/documentsTypes",
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

  $scope.addFiles = function () {
    $scope.error = "";
    $scope.item.filesList = $scope.item.filesList || [];
    $scope.item.filesList.push({
      file_date: new Date(),
      file_upload_date: new Date(),
      upload_by: "##user.name##",
    });
  };

  $scope.getTypesPoaList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $scope.typesPoaList = [];
    $http({
      method: "POST",
      url: "/api/typesPoa/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          nameEn: 1,
          nameAr: 1,
        },
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.typesPoaList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getClientsLawyersList = function ($search) {
    if (!$scope.item.office || !$scope.item.office.id) {
      return;
    }
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $scope.clientsLawyersList = [];
    $http({
      method: "POST",
      url: "/api/users/all",
      data: {
        where: {
          search: $search,
          officesList: $scope.item.office.id,
          'roles.name': 'lawyer',
        },
        select: {
          id: 1,
          image: 1,
          firstName: 1,
          lastName: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.users.length > 0) {
          $scope.clientsLawyersList = response.data.users;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getClientsList = function ($search) {
    if (!$scope.item.office || !$scope.item.office.id) {
      return;
    }
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $scope.clientsList = [];
    $http({
      method: "POST",
      url: "/api/users/all",
      data: {
        where: {
          search: $search,
          officesList: $scope.item.office.id,
          'roles.name': 'client',
        },
        select: {
          id: 1,
          image: 1,
          firstName: 1,
          lastName: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.users.length > 0) {
          $scope.clientsList = response.data.users;
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
      method: "POST",
      url: "/api/countries/all",
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
      method: "POST",
      url: "/api/goves/all",
      data: {
        where: {
          active: true,
          "country.id": country.id,
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
      method: "POST",
      url: "/api/cities/all",
      data: {
        where: {
          "gov.id": gov.id,
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
      method: "POST",
      url: "/api/areas/all",
      data: {
        where: {
          "city.id": city.id,
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

  $scope.getOfficesList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $scope.officesList = [];
    $http({
      method: "POST",
      url: "/api/offices/all",
      data: {
        where: {
          active: true,
        },
        type: "myOffices",
        select: {
          id: 1,
          nameEn: 1,
          nameAr: 1,
        },
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.officesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.addClients = function () {
    $scope.error = "";
    if ($scope.item.$client) {
      let index = $scope.item.clientsList.findIndex(
        (itm) => itm.user.id == $scope.item.$client.id
      );
      if (index === -1) {
        $scope.item.clientsList.push({ user: $scope.item.$client });
        $scope.item.$client = {};
      } else {
        $scope.item.$clientError = "##word.Exists before##";
        $timeout(() => {
          $scope.item.$clientError = "";
        }, 1000);
      }
    }
  };

  $scope.addClientsLawyers = function () {
    $scope.error = "";
    if ($scope.item.$clientLawyer) {
      let index = $scope.item.clientsLawyersList.findIndex(
        (itm) => itm.user.id == $scope.item.$clientLawyer.id
      );
      if (index === -1) {
        $scope.item.clientsLawyersList.push({
          user: $scope.item.$clientLawyer,
        });
        $scope.item.$clientLawyer = {};
      } else {
        $scope.item.$clientLawyerError = "##word.Exists before##";
        $timeout(() => {
          $scope.item.$clientLawyerError = "";
        }, 1000);
      }
    }
  };

  $scope.showSearch = function () {
    $scope.error = "";
    site.showModal($scope.modalSearchID);
  };

  $scope.searchAll = function () {
    $scope.getAll($scope.search);
    site.hideModal($scope.modalSearchID);
  };

  $scope.getAll();
  $scope.getDocumentsTypes();
  $scope.getCountriesList();
  $scope.getTypesPoaList();
  $scope.getCurrentMonthDate();
  $scope.getOfficesList();
});
