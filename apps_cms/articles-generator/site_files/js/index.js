app.connectScope(
  {
    app: [
      { name: 'generator_sites', as: 'site', modal: '#sitesModal' },
      { name: 'generator_yts', as: 'yts', modal: '#ytsModal' },
    ],
  },
  ($scope, $http, $timeout, $interval) => {
    $scope.siteDefaultItem = {
      logo: { url: '/images/site.jpg' },
      url: 'https://egytag.com',
    };

    $scope.addArticle = function (movie) {
      $scope.ytsSendCount++;
      $http({
        method: 'POST',
        url: '/api/articles/add',
        data: movie,
      }).then(
        function (response) {
          if (response.data.done) {
            $scope.ytsAddCount++;
          } else {
            $scope.ytsfailCount++;
            $scope.error = response.data.error;
          }
        },
        function (err) {
          $scope.error = err;
        }
      );
    };

    $scope.fetchYTS = function (op, callback) {
      callback = callback || function () {};
      op = op || {};
      op.page = op.page || 1;
      op.limit = op.limit || 50;
      $http({
        url: `https://yts.mx/api/v2/list_movies.json?limit=${op.limit}&page=${op.page}`,
        method: 'GET',
      }).then((res) => {
        callback(res.data.data);
      });
    };

    $scope.ytsPage = 0;
    $scope.ytsGetCount = 0;
    $scope.ytsSendCount = 0;
    $scope.ytsAddCount = 0;
    $scope.ytsfailCount = 0;

    $scope.generateYTS = function () {
      $scope.ytsPage++;
      $scope.fetchYTS({ page: $scope.ytsPage }, (data) => {
        $scope.ytsGetCount += data.movies.length;
        if (data.movies.length > 0) {
          data.movies.forEach((movie) => {
            console.log(movie);
            $scope.addArticle({ ...movie, is_yts: true });
          });
          setTimeout(() => {
            $scope.generateYTS();
          }, 1000 * 5);
        }
      });
    };
    $scope.siteLoadAll();
  }
);
