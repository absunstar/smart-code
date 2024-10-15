app.controller("miniBookReceiveView", function ($scope, $http, $timeout) {
  $scope.item = {};
  $scope.setting = site.showObject(`##data.#setting##`);
  $scope.purchase = {};
  $scope.baseURL = "";
  $scope.getStudent = function (ev, $search) {
    $scope.error = "";
    if (ev.which !== 13 || !$search) {
      return;
    }
    let where = {
      type: "student",
      active: true,
    };
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/miniBooks/getReceiveToStudent",
      data: {
        where: where,
        search: $search,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.studentSearch = '';
          $scope.student = response.data.doc.student;
          $scope.list = response.data.doc.list;
        } else {
          $scope.error = "##word.Not Found##";
        }

        $scope.item.$studentSearch = "";
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.receiveMiniBook = function (_item, type) {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/miniBooks/changeReceiveType`,
      data: {
        miniBookId: _item.miniBook.id,
        student: $scope.student,
        type: type,
        buyType: _item.buyType,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          _item.receiveType = type;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };
});
