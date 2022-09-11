app.controller("messages", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.message = {};

  $scope.displayAddMessage = function () {
    $scope.error = '';
    $scope.message = {
      image_url: '/images/message.png',
      active: true
    };
    site.showModal('#messageAddModal');
  };

  $scope.addMessage = function () {
    $scope.error = '';
    const v = site.validated('#messageAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/messages/add",
      data: $scope.message
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#messageAddModal');
          $scope.getMessageList();
        } else {
          $scope.error = response.data.error;
        if (response.data.error.like('*maximum number of adds exceeded*')) {
            $scope.error = "##word.err_maximum_adds##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateMessage = function (message) {
    $scope.error = '';
    $scope.viewMessage(message);
    $scope.message = {};
    site.showModal('#messageUpdateModal');
  };

  $scope.updateMessage = function () {
    $scope.error = '';
    const v = site.validated('#messageUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/messages/update",
      data: $scope.message
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#messageUpdateModal');
          $scope.getMessageList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsMessage = function (message) {
    $scope.error = '';
    $scope.viewMessage(message);
    $scope.message = {};
    site.showModal('#messageViewModal');
  };

  $scope.viewMessage = function (message) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/messages/view",
      data: {
        id: message.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.message = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteMessage = function (message) {
    $scope.error = '';

    $scope.viewMessage(message);
    $scope.message = {};
    site.showModal('#messageDeleteModal');
  };

  $scope.deleteMessage = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/messages/delete",
      data: {
        id: $scope.message.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#messageDeleteModal');
          $scope.getMessageList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

 
  $scope.getMessageList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/messages/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#messageSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#messageSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getMessageList($scope.search);
    site.hideModal('#messageSearchModal');
    $scope.search = {};
  };

  $scope.getMessageList();
});