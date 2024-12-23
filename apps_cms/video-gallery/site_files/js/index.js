app.controller('videoGallery', function ($scope, $http, $timeout) {
  $scope.mode = 'add';
  $scope.videoGallery = {};

  $scope.displayAddVideoGallery = function () {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.videoGallery = {
      active: true,
    };

    site.showModal('#videoGalleryManageModal');
  };

  $scope.addVideoGallery = function () {
    $scope.error = '';
    const v = site.validated('#videoGalleryManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/videoGallery/add',
      data: $scope.videoGallery,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#videoGalleryManageModal');
          $scope.getVideoGalleryList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdateVideoGallery = function (videoGallery) {
    $scope.error = '';
    $scope.mode = 'edit';
    $scope.viewVideoGallery(videoGallery);
    $scope.videoGallery = {};
    site.showModal('#videoGalleryManageModal');
  };

  $scope.updateVideoGallery = function () {
    $scope.error = '';
    const v = site.validated('#videoGalleryManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/videoGallery/update',
      data: $scope.videoGallery,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#videoGalleryManageModal');
          $scope.getVideoGalleryList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsVideoGallery = function (videoGallery) {
    $scope.error = '';
    $scope.mode = 'view';
    $scope.viewVideoGallery(videoGallery);
    $scope.videoGallery = {};
    site.showModal('#videoGalleryManageModal');
  };

  $scope.viewVideoGallery = function (videoGallery) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/videoGallery/view',
      data: {
        id: videoGallery.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.videoGallery = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };
  $scope.displayDeleteVideoGallery = function (videoGallery) {
    $scope.error = '';
    $scope.mode = 'delete';
    $scope.viewVideoGallery(videoGallery);
    $scope.videoGallery = {};
    site.showModal('#videoGalleryManageModal');
  };

  $scope.deleteVideoGallery = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: 'POST',
      url: '/api/videoGallery/delete',
      data: {
        id: $scope.videoGallery.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#videoGalleryManageModal');
          $scope.getVideoGalleryList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getVideoGalleryList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'POST',
      url: '/api/videoGallery/all',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#videoGallerySearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getFileUrl = function () {
    $scope.error = '';

    if ($scope.videoGallery.file) {
      $scope.videoGallery.url = $scope.videoGallery.file.url;
    }
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#videoGallerySearchModal');
  };

  $scope.searchAll = function () {
    $scope.getVideoGalleryList($scope.search);
    site.hideModal('#videoGallerySearchModal');
    $scope.search = {};
  };

  $scope.getVideoGalleryList();
});
