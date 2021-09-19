module.exports = function init(site) {
  const $test = site.connectCollection("test")
  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: 'css',
    path: __dirname + '/site_files/css/'
  })

  site.get({
    name: 'js',
    path: __dirname + '/site_files/js/'
  })

  site.get({
    name: 'webfonts',
    path: __dirname + '/site_files/webfonts/'
  })

  site.get({
    name: 'fonts',
    path: __dirname + '/site_files/fonts/'
  })

  site.get({
    name: "/",
    path: __dirname + "/site_files/html/index.html",
    parser: "html"
  })
  site.get({
    name: "products",
    path: __dirname + "/site_files/html/products.html",
    parser: "html"
  })
  site.get({
    name: "about",
    path: __dirname + "/site_files/html/about.html",
    parser: "html"
  })

  site.get({
    name: "contactUs",
    path: __dirname + "/site_files/html/contact-us.html",
    parser: "html"
  })

  site.get({
    name: "services",
    path: __dirname + "/site_files/html/services.html",
    parser: "html"
  })

  site.get({
    name: "branding",
    path: __dirname + "/site_files/html/branding.html",
    parser: "html"
  })
  site.get({
    name: "digital-marketing",
    path: __dirname + "/site_files/html/digital-marketing.html",
    parser: "html"
  })

  site.get({
    name: "event-management",
    path: __dirname + "/site_files/html/event-management.html",
    parser: "html"
  })

  site.get({
    name: "media-production",
    path: __dirname + "/site_files/html/media-production.html",
    parser: "html"
  })

  site.get({
    name: "mobile-development",
    path: __dirname + "/site_files/html/mobile-development.html",
    parser: "html"
  })

  site.get({
    name: "web-development",
    path: __dirname + "/site_files/html/web-development.html",
    parser: "html"
  })

  site.get({
    name: "web-design",
    path: __dirname + "/site_files/html/web-design.html",
    parser: "html"
  })

  site.get({
    name: "software-solutions",
    path: __dirname + "/site_files/html/software-solutions.html",
    parser: "html"
  })

  site.get({
    name: "products",
    path: __dirname + "/site_files/html/products.html",
    parser: "html"
  })
  site.get({
    name: "health-care",
    path: __dirname + "/site_files/html/health-care.html",
    parser: "html"
  })
  site.get({
    name: "library-archiving",
    path: __dirname + "/site_files/html/library-archiving.html",
    parser: "html"
  })

  site.get({
    name: "fitness",
    path: __dirname + "/site_files/html/fitness.html",
    parser: "html"
  }) 
  site.get({
    name: "e-learning",
    path: __dirname + "/site_files/html/e-learning.html",
    parser: "html"
  })
  site.get({
    name: "e-commerce",
    path: __dirname + "/site_files/html/e-commerce.html",
    parser: "html"
  })
  site.get({
    name: "cms",
    path: __dirname + "/site_files/html/content-management.html",
    parser: "html"
  })
  site.get({
    name: "career",
    path: __dirname + "/site_files/html/career.html",
    parser: "html"
  })
}