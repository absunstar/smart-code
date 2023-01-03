module.exports = function init(site) {
  site.get(
    {
      name: 'create_content',
    },
    (req, res) => {
      res.render(
        'create-content/index.html',
        { title: site.setting.title, image_url: site.setting.logo, description: site.setting.description },
        {
          parser: 'html css js',
          compress: true,
        }
      );
    }
  );

  site.get({
    name: '/images',
    path: __dirname + '/site_files/images',
  });
};
