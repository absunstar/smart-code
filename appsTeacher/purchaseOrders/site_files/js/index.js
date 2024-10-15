app.controller("purchaseOrders", function ($scope, $http, $timeout) {
  $scope.baseURL = "";
  $scope.appName = "purchaseOrders";
  $scope.modalID = "#purchaseOrdersManageModal";
  $scope.modalSearchID = "#purchaseOrdersSearchModal";
  $scope.mode = "add";
  $scope._search = {};
  $scope.structure = {
    image: { url: "/theme1/images/setting/purchaseOrders.png" },
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
    where["type"] = "##query.type##";
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
          /*    $scope.totalLectures = response.data.totalLectures;
          $scope.totalBooks = response.data.totalBooks;
          $scope.totalPackages = response.data.totalPackages; */
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

  $scope.getLecturesList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.lecturesList = [];
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/lectures/all",
      data: {
        where: {
          active: true,
        },
        select: { id: 1, name: 1 },
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.lecturesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getMiniBooksList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.miniBooksList = [];
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/miniBooks/all",
      data: {
        where: {
          active: true,
        },
        select: { id: 1, name: 1 },
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.miniBooksList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getPackagesList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.packagesList = [];
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/packages/all",
      data: {
        where: {
          active: true,
        },
        select: { id: 1, name: 1 },
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.packagesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getBooksList = function ($search) {
    if ($search && $search.length < 1) {
      return;
    }
    $scope.booksList = [];
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/books/all",
      data: {
        where: {
          active: true,
        },
        select: { id: 1, name: 1 },
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.booksList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getBookStatusList = function () {
    $scope.busy = true;
    $scope.bookStatusList = [];
    $http({
      method: "POST",
      url: "/api/bookStatusList",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.bookStatusList = response.data.list;
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
  $scope.getPurchaseOrdersTargetList = function () {
    $scope.busy = true;
    $scope.purchaseOrdersTargetList = [];
    $http({
      method: "POST",
      url: "/api/purchaseOrdersTargetList",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.purchaseOrdersTargetList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
 */

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
  $scope.getBooksList();
  $scope.getPackagesList();
  $scope.getLecturesList();
  $scope.getMiniBooksList();
  $scope.getStudentsList();
  $scope.getBookStatusList();
  $scope.getPurchaseTypeList();
  /*   $scope.getPurchaseOrdersTargetList(); */
});
