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

  $scope.updateReply = function (type, reply) {
    if ($scope.busyUpdateReply) {
      return;
    }
    reply = reply || {};
    let data = { id: $scope.item.id, code: reply.code, type };

    if (type == "addReply") {
      if (!$scope.item.$replyComment) {
        $scope.errorAddReply = "##word.Must Enter Comment##";
        return;
      }
      data.comment = $scope.item.$replyComment;
    } else if (type == "addSubReply") {
      if (!reply.$replyComment) {
        $scope.errorSubReply = "##word.Must Enter Comment##";
        return;
      }
      data.comment = reply.$replyComment;
    } else if (type == "unsupport" || type == "unopposition") {
      data.userId = site.toNumber("##user.id##");
    }

    $scope.busyUpdateReply = true;
    $scope.errorAddReply = "";
    $scope.errorSubReply = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/requestConsultations/updateReply`,
      data,
    }).then(
      function (response) {
        $scope.busyUpdateReply = false;
        if (response.data.done) {
          $scope.view();
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
  if ("##query.lawyerId##") {
    $scope.getUser();
  }
});
