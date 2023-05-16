module.exports = function init(site) {
  site.get({
    name: 'css',
    path: __dirname + '/site_files/css/',
  });
  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });
  site.get({
    name: ['/css/cms.css'],
    parser: 'css',
    public: true,
    compress: !0,
    path: [
      'client-side/bootstrap-5-support.css',
      'client-side/normalize.css',
      'client-side/theme.css',
      'client-side/layout.css',
      'client-side/modal.css',
      'client-side/color.css',
      'client-side/html5.css',
      'client-side/images.css',
      'client-side/dropdown.css',
      'client-side/fonts.css',
      'client-side/font-droid.css',
      'client-side/effect.css',
      'client-side/scrollbar.css',
      'client-side/table.css',
      'client-side/treeview.css',
      'client-side/tabs.css',
      'client-side/help.css',
      'client-side/print.css',
      'client-side/tableExport.css',
      'client-side/theme_paper.css',
      'client-side/bootstrap5.css',
      'client-side/bootstrap5-addon.css',
      'client-side/font-awesome.css',
      __dirname + '/site_files/css/editor.css',
      __dirname + '/site_files/css/public.css',
      __dirname + '/site_files/css/nav.css',
      __dirname + '/site_files/css/main-menu.css',
      __dirname + '/site_files/css/user-menu.css',
      __dirname + '/site_files/css/article.css',
      __dirname + '/site_files/css/cms.css',
      __dirname + '/site_files/css/mobile.css',
    ],
  });
};
