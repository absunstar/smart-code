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
      $http({
        method: 'POST',
        url: '/api/articles/add',
        data: movie,
      }).then(
        function (response) {
          if (response.data.done) {
          } else {
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

    $scope.generateYTS = function () {
      $scope.fetchYTS(null, (data) => {
        data.movies.forEach((movie) => {
          console.log(movie);
          $scope.addArticle({ ...movie, is_yts: true });
        });
      });
    };
    $scope.siteLoadAll();
  }
);
