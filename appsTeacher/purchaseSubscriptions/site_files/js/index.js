app.controller("purchaseSubscriptions", function ($scope, $http, $timeout) {
  $scope.baseURL = "";
  $scope.appName = "purchaseSubscriptions";
  $scope.modalID = "#purchaseSubscriptionsManageModal";
  $scope.modalSearchID = "#purchaseSubscriptionsSearchModal";
  $scope.mode = "add";
  $scope._search = {};
  $scope.structure = {
    image: {},
    active: true,
  };
  $scope.paidAcceptList = [
    {
      name: "paidAccept",
      nameAr: "تأكيد الدفع",
      nameEn: "Paid Accept",
    },
    {
      name: "paidNotAccept",
      nameAr: "عدم تأكيد الدفع",
      nameEn: "Paid Not Accept",
    },
  ];
  $scope.item = {};
  $scope.list = [];

  $scope.showUpdate = function (_item) {
    $scope.error = "";
    $scope.mode = "edit";
    $scope.view(_item);
    $scope.item = {};
    site.showModal($scope.modalID);
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
  $scope.updateBookStatus = function (_item, type) {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/updateStatus`,
      data: { id: _item.id, type },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          let index = $scope.list.findIndex((itm) => itm.id == response.data.doc.id);
          if (index !== -1) {
            $scope.list[index] = response.data.doc;
          }
          if (type == "done") {
            site.hideModal("#actionModal");
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

  $scope.handle = function (_item) {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/handle`,
      data: {
       
      },
    }).then(
      function (response) {
        $scope.busy = false;
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.showDelete = function (_item) {
    $scope.error = "";
    $scope.mode = "delete";
    $scope.item = _item;
    site.showModal("#actionModal");
  };

  $scope.showPaid = function (_item) {
    $scope.error = "";
    $scope.mode = "paid";
    $scope.item = _item;
    site.showModal("#actionModal");
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
          site.hideModal("#actionModal");
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
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/all`,
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          $scope.totalPurchases = response.data.totalPurchases;
      
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

  $scope.getStudentsList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/manageUsers/all",
      data: {
        where: {
          type: "student",
          active: true,
        },
        select: { id: 1, firstName: 1 },
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.studentsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  /* 
  $scope.getPurchaseSubscriptionsTargetList = function () {
    $scope.busy = true;
    $scope.purchaseSubscriptionsTargetList = [];
    $http({
      method: "POST",
      url: "/api/purchaseSubscriptionsTargetList",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.purchaseSubscriptionsTargetList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
 */

  $scope.getSubscriptionsList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.busy = true;
    $scope.subscriptionsList = [];

    $http({
      method: "POST",
      url: "/api/subscriptions/all",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          name: 1,
        },
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.subscriptionsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getPurchaseTypeList = function () {
    $scope.error = "";
    $scope.busy = true;
    $scope.purchaseTypeList = [];
    $http({
      method: "POST",
      url: "/api/purchaseTypeList",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.purchaseTypeList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.selectPaidAccept = function (paidAccept) {
    $scope.error = "";
    if (paidAccept.name == "paidAccept") {
      $scope._search.done = true;
    } else if (paidAccept.name == "paidNotAccept") {
      $scope._search.done = false;
    }
  };

  $scope.showSearch = function () {
    $scope.error = "";
    site.showModal($scope.modalSearchID);
  };

  $scope.searchAll = function () {
    $scope.getAll($scope.search);
    site.hideModal($scope.modalSearchID);
    $scope.search = {};
  };

  $scope.getAll({});
  $scope.getStudentsList();
  $scope.getPurchaseTypeList();
  $scope.getSubscriptionsList();
  /*   $scope.getPurchaseSubscriptionsTargetList(); */
});
