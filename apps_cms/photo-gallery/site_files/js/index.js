app.controller('photo_gallery', function ($scope, $http, $timeout) {
  $scope.mode = 'add';
  $scope.photo_gallery = {};

  $scope.displayAddPhotoGallery = function () {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.photo_gallery = {
      active: true,
    };

    site.showModal('#photoGalleryManageModal');
  };

  $scope.addPhotoGallery = function () {
    $scope.error = '';
    const v = site.validated('#photoGalleryManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/photo_gallery/add',
      data: $scope.photo_gallery,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#photoGalleryManageModal');
          $scope.getPhotoGalleryList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdatePhotoGallery = function (photo_gallery) {
    $scope.error = '';
    $scope.mode = 'edit';
    $scope.viewPhotoGallery(photo_gallery);
    $scope.photo_gallery = {};
    site.showModal('#photoGalleryManageModal');
  };

  $scope.updatePhotoGallery = function () {
    $scope.error = '';
    const v = site.validated('#photoGalleryManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/photo_gallery/update',
      data: $scope.photo_gallery,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#photoGalleryManageModal');
          $scope.getPhotoGalleryList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsPhotoGallery = function (photo_gallery) {
    $scope.error = '';
    $scope.mode = 'view';
    $scope.viewPhotoGallery(photo_gallery);
    $scope.photo_gallery = {};
    site.showModal('#photoGalleryManageModal');
  };

  $scope.viewPhotoGallery = function (photo_gallery) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/photo_gallery/view',
      data: {
        id: photo_gallery.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.photo_gallery = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };
  $scope.displayDeletePhotoGallery = function (photo_gallery) {
    $scope.error = '';
    $scope.mode = 'delete';
    $scope.viewPhotoGallery(photo_gallery);
    $scope.photo_gallery = {};
    site.showModal('#photoGalleryManageModal');
  };

  $scope.deletePhotoGallery = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: 'POST',
      url: '/api/photo_gallery/delete',
      data: {
        id: $scope.photo_gallery.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#photoGalleryManageModal');
          $scope.getPhotoGalleryList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getPhotoGalleryList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'POST',
      url: '/api/photo_gallery/all',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#photoGallerySearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getImageUrl = function () {
    $scope.error = '';

    if ($scope.photo_gallery.image_url) {
      $scope.photo_gallery.url = $scope.photo_gallery.image_url.url;
    }
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#photoGallerySearchModal');
  };

  $scope.searchAll = function () {
    $scope.getPhotoGalleryList($scope.search);
    site.hideModal('#photoGallerySearchModal');
    $scope.search = {};
  };

  $scope.getPhotoGalleryList();
});
