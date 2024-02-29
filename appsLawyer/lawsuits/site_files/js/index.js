app.controller("lawsuits", function ($scope, $http, $timeout) {
  $scope.baseURL = "";
  $scope.appName = "lawsuits";
  $scope.modalID = "#lawsuitsManageModal";
  $scope.modalSearchID = "#lawsuitsSearchModal";
  $scope.mode = "add";
  $scope.structure = {
    active: true,
  };
  $scope.item = {};
  $scope.list = [];
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
      opponentsList: [],
      opposingCounselsList: [],
    };
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
          if (
            response.data.error &&
            response.data.error.like("*Must Enter Code*")
          ) {
            $scope.error = "##word.Must Enter Code##";
          }
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
  $scope.getAdjectivesInLawsuit = function () {
    $scope.busy = true;
    $scope.adjectivesInLawsuitList = [];
    $http({
      method: "POST",
      url: "/api/adjectivesInLawsuit/all",
      data: {
        select: {
          id: 1,
          name: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.adjectivesInLawsuitList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
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

  $scope.getNumberingAuto = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/getAutomatic",
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
          code: 1,
          name: 1,
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
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $scope.clientsLawyersList = [];
    $http({
      method: "POST",
      url: "/api/employees/all",
      data: {
        where: { active: true, "type.id": 4, "jobType.name": "lawyers" },
        select: {
          id: 1,
          code: 1,
          image: 1,
          fullNameEn: 1,
          fullNameAr: 1,
          department: 1,
          section: 1,
          job: 1,
          mobile: 1,
        },
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.clientsLawyersList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getClientsList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $scope.clientsList = [];
    $http({
      method: "POST",
      url: "/api/customers/all",
      data: {
        where: {
          active: true,
          "type.id": 6,
        },
        select: {
          id: 1,
          code: 1,
          image: 1,
          nameEn: 1,
          nameAr: 1,
        },
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.clientsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getOpponentsList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $scope.opponentsList = [];
    $http({
      method: "POST",
      url: "/api/opponents/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          code: 1,
          image: 1,
          nameEn: 1,
          nameAr: 1,
        },
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.opponentsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getOpposingCounselsList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $scope.opposingCounselsList = [];
    $http({
      method: "POST",
      url: "/api/opposingCounsels/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          code: 1,
          image: 1,
          nameEn: 1,
          nameAr: 1,
        },
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.opposingCounselsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getLawsuitDegreesList = function () {
    $scope.busy = true;
    $scope.lawsuitDegreesList = [];

    $http({
      method: "POST",
      url: "/api/lawsuitDegrees/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          code: 1,
          name: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.lawsuitDegreesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getStatusLawsuitList = function () {
    $scope.busy = true;
    $scope.statusLawsuitList = [];

    $http({
      method: "POST",
      url: "/api/statusLawsuit/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          code: 1,
          name: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.statusLawsuitList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getTypesLawsuitList = function () {
    $scope.busy = true;
    $scope.typesLawsuitList = [];

    $http({
      method: "POST",
      url: "/api/typesLawsuit/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          code: 1,
          name: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.typesLawsuitList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getCourtsList = function () {
    $scope.busy = true;
    $scope.courtsList = [];

    $http({
      method: "POST",
      url: "/api/courts/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          code: 1,
          name: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.courtsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getCirclesList = function (courtId) {
    $scope.busy = true;
    $scope.circlesList = [];

    $http({
      method: "POST",
      url: "/api/circles/all",
      data: {
        where: {
          active: true,
          "court.id": courtId,
        },
        select: {
          id: 1,
          code: 1,
          name: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.circlesList = response.data.list;
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
    $timeout(() => {
      $scope.item.$clientError = "";
    }, 1500);
    if (!$scope.item.$client || !$scope.item.$client.id) {
      $scope.item.$clientError = "##word.Must add client##";
      return;
    }
    if (
      !$scope.item.$adjectiveInLawsuitClient ||
      !$scope.item.$adjectiveInLawsuitClient.id
    ) {
      $scope.item.$clientError = "##word.Must add adjective in lawsuit##";
      return;
    }
    let index = $scope.item.clientsList.findIndex(
      (itm) => itm.client.id == $scope.item.$client.id
    );
    if (index === -1) {
      $scope.item.clientsList.push({
        client: $scope.item.$client,
        adjectiveInLawsuit: $scope.item.$adjectiveInLawsuitClient,
      });
      $scope.item.$client = {};
      $scope.item.$adjectiveInLawsuitClient = {};
    } else {
      $scope.item.$clientError = "##word.Exists before##";
    }
  };

  $scope.addClientsLawyers = function () {
    $scope.error = "";
    $timeout(() => {
      $scope.item.$clientLawyerError = "";
    }, 1500);
    if (!$scope.item.$clientLawyer || !$scope.item.$clientLawyer.id) {
      $scope.item.$clientLawyerError = "##word.Must add client lawyer##";
      return;
    }
    if (
      !$scope.item.$adjectiveInLawsuitClientLawyer ||
      !$scope.item.$adjectiveInLawsuitClientLawyer.id
    ) {
      $scope.item.$clientLawyerError = "##word.Must add adjective in lawsuit##";
      return;
    }
    let index = $scope.item.clientsLawyersList.findIndex(
      (itm) => itm.lawyer.id == $scope.item.$clientLawyer.id
    );
    if (index === -1) {
      $scope.item.$clientLawyer.nameAr = $scope.item.$clientLawyer.fullNameAr;
      $scope.item.$clientLawyer.nameEn = $scope.item.$clientLawyer.fullNameEn;
      $scope.item.clientsLawyersList.push({
        lawyer: $scope.item.$clientLawyer,
        adjectiveInLawsuit: $scope.item.$adjectiveInLawsuitClientLawyer,
      });
      $scope.item.$clientLawyer = {};
      $scope.item.$adjectiveInLawsuitClientLawyer = {};
    } else {
      $scope.item.$clientLawyerError = "##word.Exists before##";
    }
  };

  $scope.addOpponents = function () {
    $scope.error = "";
    $timeout(() => {
      $scope.item.$opponentError = "";
    }, 1500);
    if (!$scope.item.$opponent || !$scope.item.$opponent.id) {
      $scope.item.$opponentError = "##word.Must add opponent##";
      return;
    }
    if (
      !$scope.item.$adjectiveInLawsuitOpponent ||
      !$scope.item.$adjectiveInLawsuitOpponent.id
    ) {
      $scope.item.$opponentError = "##word.Must add adjective in lawsuit##";
      return;
    }
    let index = $scope.item.opponentsList.findIndex(
      (itm) => itm.opponent.id == $scope.item.$opponent.id
    );
    if (index === -1) {
      $scope.item.opponentsList.push({
        opponent: $scope.item.$opponent,
        adjectiveInLawsuit: $scope.item.$adjectiveInLawsuitOpponent,
      });
      $scope.item.$opponent = {};
      $scope.item.$adjectiveInLawsuitOpponent = {};
    } else {
      $scope.item.$opponentError = "##word.Exists before##";
    }
  };

  $scope.addOpposingCounsels = function () {
    $scope.error = "";
    $timeout(() => {
      $scope.item.$opposingCounselError = "";
    }, 1500);
    if (!$scope.item.$opposingCounsel || !$scope.item.$opposingCounsel.id) {
      $scope.item.$opposingCounselError = "##word.Must add opposing counsel##";
      return;
    }
    if (
      !$scope.item.$adjectiveInLawsuitOpposingCounsel ||
      !$scope.item.$adjectiveInLawsuitOpposingCounsel.id
    ) {
      $scope.item.$opposingCounselError =
        "##word.Must add adjective in lawsuit##";
      return;
    }
    let index = $scope.item.opposingCounselsList.findIndex(
      (itm) => itm.opposingCounsel.id == $scope.item.$opposingCounsel.id
    );
    if (index === -1) {
      $scope.item.opposingCounselsList.push({
        opposingCounsel: $scope.item.$opposingCounsel,
        adjectiveInLawsuit: $scope.item.$adjectiveInLawsuitOpposingCounsel,
      });
      $scope.item.$opposingCounsel = {};
      $scope.item.$adjectiveInLawsuitOpposingCounsel = {};
    } else {
      $scope.item.$opposingCounselError = "##word.Exists before##";
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
  $scope.getNumberingAuto();
  $scope.getClientsList();
  $scope.getOpponentsList();
  $scope.getTypesPoaList();
  $scope.getClientsLawyersList();
  $scope.getOpposingCounselsList();
  $scope.getAdjectivesInLawsuit();
  $scope.getCourtsList();
  $scope.getLawsuitDegreesList();
  $scope.getStatusLawsuitList();
  $scope.getTypesLawsuitList();
  $scope.getCurrentMonthDate();
});
