app.controller("sub_categories_2", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.sub_categories_2 = {};

  $scope.displayAddSubCategories2 = function () {
    $scope.error = '';
    $scope.sub_categories_2 = {
      image_url: '/images/sub_categories_2.png',
      active: true/* ,
      immediate : false */
    };
    site.showModal('#subCategories2AddModal');
    
  };

  $scope.addSubCategories2 = function () {
    $scope.error = '';
    const v = site.validated('#subCategories2AddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/sub_categories_2/add",
      data: $scope.sub_categories_2
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#subCategories2AddModal');
          $scope.getSubCategories2List();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateSubCategories2 = function (sub_categories_2) {
    $scope.error = '';
    $scope.viewSubCategories2(sub_categories_2);
    $scope.sub_categories_2 = {};
    site.showModal('#subCategories2UpdateModal');
  };

  $scope.updateSubCategories2 = function () {
    $scope.error = '';
    const v = site.validated('#subCategories2UpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/sub_categories_2/update",
      data: $scope.sub_categories_2
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#subCategories2UpdateModal');
          $scope.getSubCategories2List();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsSubCategories2 = function (sub_categories_2) {
    $scope.error = '';
    $scope.viewSubCategories2(sub_categories_2);
    $scope.sub_categories_2 = {};
    site.showModal('#subCategories2ViewModal');
  };

  $scope.viewSubCategories2 = function (sub_categories_2) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/sub_categories_2/view",
      data: {
        id: sub_categories_2.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.sub_categories_2 = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteSubCategories2 = function (sub_categories_2) {
    $scope.error = '';
    $scope.viewSubCategories2(sub_categories_2);
    $scope.sub_categories_2 = {};
    site.showModal('#subCategories2DeleteModal');

  };

  $scope.deleteSubCategories2 = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/sub_categories_2/delete",
      data: {
        id: $scope.sub_categories_2.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#subCategories2DeleteModal');
          $scope.getSubCategories2List();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getSubCategories2List = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/sub_categories_2/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#subCategories2SearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadMainCategories = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.mainCategories = [];
    $http({
      method: 'POST',
      url: '/api/main_categories/all',
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          code: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) $scope.mainCategories = response.data.list;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadSubCategories1 = function (main_category) {
    $scope.error = '';
    $scope.busy = true;
    $scope.subCategories1 = [];
    $http({
      method: 'POST',
      url: '/api/sub_categories_1/all',
      data: {
        where : {
          'main_category.id' : main_category.id ,
          active : true,
        },
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          code: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) $scope.subCategories1 = response.data.list;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "sub_categories_2"
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledCode = response.data.isAuto;
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
    site.showModal('#subCategories2SearchModal');

  };

  $scope.searchAll = function () { 
    $scope.getSubCategories2List($scope.search);
    site.hideModal('#subCategories2SearchModal');
    $scope.search = {};

  };

  $scope.getSubCategories2List();
  $scope.loadMainCategories();
  $scope.getNumberingAuto();
});