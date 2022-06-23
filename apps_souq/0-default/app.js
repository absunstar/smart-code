module.exports = function init(site) {


    site.post({
        name: '/api/types_category_require/all',
        path: __dirname + '/site_files/json/types_category_require.json',
      });
      site.post({
        name: '/api/comment_activities/all',
        path: __dirname + '/site_files/json/comment_activities.json',
      });
}