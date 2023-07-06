app.connectScope({ app: { name: 'generator_sites', as: 'site', modal: '#sitesModal' } }, ($scope, $http, $timeout, $interval) => {
  $scope.siteDefaultItem = {
    logo: { url: '/images/site.jpg' },
    url: 'https://egytag.com',
  };
  $scope.siteLoadAll();
});
