app.controller("requestConsultationsView", function ($scope, $http, $timeout) {
  $scope.item = {};
  $scope.baseURL = "";
  $scope.appName = "requestConsultationsView";
  $scope.modalID = "#requestConsultationsViewModal";

  $scope.view = function () {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/requestConsultations/view`,
      data: {
        id: site.toNumber("##query.requestId##"),
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

  $scope.addReply = function () {
    if ($scope.busyAddReply) {
      return;
    }

    if (!$scope.item.$reply) {
      $scope.error = "##word.Must Enter Comment##";

      return;
    }

    $scope.busyAddReply = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/requestConsultationsReply/add`,
      data: {
        requestId: site.toNumber("##query.requestId##"),
        comment: $scope.item.$reply,
      },
    }).then(
      function (response) {
        $scope.busyAddReply = false;
        if (response.data.done) {
          $scope.getRepliesList();
          $scope.item.$reply = "";
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
        $scope.busyAddReply = false;
      }
    );
  };

  $scope.updateReply = function (type, reply) {
    if ($scope.busyUpdateReply) {
      return;
    }
    let data = { id: reply.id,type };

    if (type == "addReply") {
      if (!reply.$replyComment) {
        $scope.errorAddReply = "##word.Must Enter Comment##";
        return;
      }
      data.comment = reply.$replyComment;
    } else if (type == "unsupport" || type == "unopposition") {
      data.userId = site.toNumber("##user.id##");
    }

    $scope.busyUpdateReply = true;
    $scope.errorAddReply = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/requestConsultationsReply/update`,
      data,
    }).then(
      function (response) {
        $scope.busyUpdateReply = false;
        if (response.data.done) {
          $scope.getRepliesList();
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

  $scope.getRepliesList = function () {
    let where = { requestId: site.toNumber("##query.requestId##") };

    $scope.repliesList = [];
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/requestConsultationsReply/all`,
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busyAll = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.repliesList = response.data.list;
        }
      },
      function (err) {
        $scope.busyAll = false;
        $scope.error = err;
      }
    );
  };

  $scope.getUser = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/user/view",
      data: {
        id: site.toNumber("##query.lawyerId##"),
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.item.lawyer = {
            id: response.data.doc.id,
            firstName: response.data.doc.firstName,
            lastName: response.data.doc.lastName,
          };
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {}
    );
  };

  $scope.showReplyComment = function (id) {
    $scope.error = "";

    let reply = document.querySelector(`#reply_${id}`);
    if (reply) {
      if (reply.style.display === "block") {
        reply.style.display = "none";
      } else {
        reply.style.display = "block";
      }
    }
  };

  $scope.view();
  $scope.getRepliesList();
  if ("##query.lawyerId##") {
    $scope.getUser();
  }
});
