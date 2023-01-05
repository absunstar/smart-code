app.controller('video_gallery', function ($scope, $http, $timeout) {
  $scope.mode = 'add';
  $scope.video_gallery = {};

  $scope.displayAddVideoGallery = function () {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.video_gallery = {
      active: true,
    };

    site.showModal('#videoGalleryManageModal');
  };

  $scope.addVideoGallery = function () {
    $scope.error = '';
    const v = site.validated('#videoGalleryManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/video_gallery/add',
      data: $scope.video_gallery,
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

  $scope.displayUpdateVideoGallery = function (video_gallery) {
    $scope.error = '';
    $scope.mode = 'edit';
    $scope.viewVideoGallery(video_gallery);
    $scope.video_gallery = {};
    site.showModal('#videoGalleryManageModal');
  };

  $scope.updateVideoGallery = function () {
    $scope.error = '';
    const v = site.validated('#videoGalleryManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/video_gallery/update',
      data: $scope.video_gallery,
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

  $scope.displayDetailsVideoGallery = function (video_gallery) {
    $scope.error = '';
    $scope.mode = 'view';
    $scope.viewVideoGallery(video_gallery);
    $scope.video_gallery = {};
    site.showModal('#videoGalleryManageModal');
  };

  $scope.viewVideoGallery = function (video_gallery) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/video_gallery/view',
      data: {
        id: video_gallery.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.video_gallery = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };
  $scope.displayDeleteVideoGallery = function (video_gallery) {
    $scope.error = '';
    $scope.mode = 'delete';
    $scope.viewVideoGallery(video_gallery);
    $scope.video_gallery = {};
    site.showModal('#videoGalleryManageModal');
  };

  $scope.deleteVideoGallery = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: 'POST',
      url: '/api/video_gallery/delete',
      data: {
        id: $scope.video_gallery.id,
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
      url: '/api/video_gallery/all',
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

    if ($scope.video_gallery.file) {
      $scope.video_gallery.url = $scope.video_gallery.file.url;
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
