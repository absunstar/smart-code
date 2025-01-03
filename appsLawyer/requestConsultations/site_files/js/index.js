app.controller(
  "requestConsultationsManage",
  function ($scope, $http, $timeout) {
    $scope.baseURL = "";
    $scope.appName = "requestConsultations";
    $scope.modalID = "#requestConsultationsManageModal";
    $scope.modalSearchID = "#requestConsultationsSearchModal";
    $scope.mode = "add";
    $scope._search = {};
    $scope.structure = {
      image: {},
      active: true,
    };
    $scope.item = {};
    $scope.list = [];

    $scope.showAdd = function (_item) {
      $scope.error = "";
      $scope.mode = "add";
      $scope.item = { ...$scope.structure };
      site.showModal($scope.modalID);
    };

    $scope.add = function (_item) {
      $scope.error = "";
      const v = site.validated($scope.modalID);
      if (!v.ok) {
        $scope.error = v.messages[0].Ar;
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
    };

    $scope.update = function (_item) {
      $scope.error = "";
      const v = site.validated($scope.modalID);
      if (!v.ok) {
        $scope.error = v.messages[0].Ar;
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

    $scope.updateStatus = function (_item,type) {
      $scope.error = "";
      _item.status = $scope.consultationsStatusList.find((l) => l.name == type)
    
      $scope.busy = true;
      $http({
        method: "POST",
        url: `${$scope.baseURL}/api/${$scope.appName}/update`,
        data: _item,
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
           
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
    };

    $scope.showReplies = function (_item) {
      $scope.error = "";
      $scope.mode = "view";
      $scope.item = {};
      $scope.view(_item);
      site.showModal("#repliesModal");
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

    $scope.getConsultationsStatus = function (where) {
      $scope.busy = true;
      $http({
        method: "POST",
        url: "/api/consultationsStatus",
        data: {},
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.consultationsStatusList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    };

    $scope.getConsultationsClassifications = function (where) {
      $scope.busy = true;
      $http({
        method: "POST",
        url: "/api/consultationsClassifications",
        data: {},
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.consultationsClassificationsList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    };
    $scope.getTypesConsultationsList = function (where) {
      $scope.busy = true;
      $http({
        method: "POST",
        url: "/api/typesConsultations/all",
        data: {
          where: {
            active: true,
          },
          select: {
            id: 1,
            name: 1,
            price: 1,
          },
        },
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.typesConsultationsList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    };

    $scope.updateReply = function (type, reply) {
      if ($scope.busyUpdateReply) {
        return;
      }
      let data = { id: $scope.item.id, type, code: reply.code };

      $scope.busyUpdateReply = true;
      $scope.errorAddReply = "";
      $http({
        method: "POST",
        url: `${$scope.baseURL}/api/${$scope.appName}/updateReply`,
        data,
      }).then(
        function (response) {
          $scope.busyUpdateReply = false;
          if (response.data.done) {
            let index = $scope.list.findIndex(
              (itm) => itm.id === response.data.result.doc.id
            );
            if (index !== -1) {
              $scope.list[index] = response.data.result.doc;
             $scope.item = $scope.list[index];
            }
            $scope.$applyAsync();
          } else {
            $scope.errorAddReply = response.data.error;
          }
        },
        function (err) {
          console.log(err);
          $scope.busyAddReply = false;
        }
      );
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

    $scope.getAll();
    $scope.getTypesConsultationsList();
    $scope.getConsultationsStatus();
    $scope.getConsultationsClassifications();
  }
);
