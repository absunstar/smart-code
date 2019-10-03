module.exports = function init(site) {


    site.on('user register', function (result) {
        site.notifications.add({
          icon: '/images/users.png',
          source: "Security System",
          source_ar: "نظام الحماية",
          message: "New user Register",
          message_ar: "تم أشتراك مستخدم جديد",
          value: result.doc.email,
          value_ar: result.doc.email,
          add: result.doc,
          action: 'add'
        }, result)
      })
    
      site.on('user login', function (result) {
    
        site.notifications.add({
          icon: '/images/users.png',
          source: "Security System",
          source_ar: "نظام الحماية",
          message: "user Login",
          message_ar: "مستخدم سجل دخول",
          value: result.doc.email,
          value_ar: result.doc.email,
          action: 'info'
        }, result)
    
      })
    
      site.on('user logout', function (result) {
    
        site.notifications.add({
          icon: '/images/users.png',
          source: "Security System",
          source_ar: "نظام الحماية",
          message: "user Logout",
          message_ar: "مستخدم سجل خروج",
          value: result.doc.email,
          value_ar: result.doc.email,
          action: 'info'
        }, result)
    
      })
    
      site.on('user add', function (result) {
        site.notifications.add({
          icon: '/images/users.png',
          source: "Security System",
          source_ar: "نظام الحماية",
          message: "New user Added",
          message_ar: "تم أضافة مستخدم جديد",
          value: result.doc.email,
          value_ar: result.doc.email,
          add: result.doc,
          action: 'add'
        }, result)
      })
    
      site.on('user update', function (result) {
    
        site.notifications.add({
          icon: '/images/users.png',
          source: "Security System",
          source_ar: "نظام الحماية",
          message: "user Updated",
          message_ar: "تم تعديل مستخدم",
          value: result.doc.email,
          value_ar: result.doc.email,
          update: site.objectDiff(result.update.$set, result.doc),
          action: 'update'
        }, result)
      })
    
      site.on('user delete', function (result) {
        site.notifications.add({
          icon: '/images/users.png',
          source: "Security System",
          source_ar: "نظام الحماية",
          message: "user Deleted",
          message_ar: "تم حذف مستخدم ",
          value: result.doc.email,
          value_ar: result.doc.email,
          delete: result.doc,
          action: 'delete'
        }, result)
      })
      
}