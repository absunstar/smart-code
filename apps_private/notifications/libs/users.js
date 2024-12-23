module.exports = function init(site) {

    site.on('user register', function (result) {
        site.notifications.add({
          icon: '/images/users.png',
          source: "Security System",
          source_Ar: "نظام الحماية",
          message: "New user Register",
          message_Ar: "تم أشتراك مستخدم جديد",
          value: result.doc.email,
          value_Ar: result.doc.email,
          add: result.doc,
          action: 'add'
        }, result)
      })
    
      site.on('user login', function (result) {
    
        site.notifications.add({
          icon: '/images/users.png',
          source: "Security System",
          source_Ar: "نظام الحماية",
          message: "user Login",
          message_Ar: "مستخدم سجل دخول",
          value: result.doc.email,
          value_Ar: result.doc.email,
          action: 'info'
        }, result)
    
      })
    
      site.on('user logout', function (result) {
    
        site.notifications.add({
          icon: '/images/users.png',
          source: "Security System",
          source_Ar: "نظام الحماية",
          message: "user Logout",
          message_Ar: "مستخدم سجل خروج",
          value: result.doc.email,
          value_Ar: result.doc.email,
          action: 'info'
        }, result)
    
      })
    
      site.on('user add', function (result) {
        site.notifications.add({
          icon: '/images/users.png',
          source: "Security System",
          source_Ar: "نظام الحماية",
          message: "New user Added",
          message_Ar: "تم إضافة مستخدم جديد",
          value: result.doc.email,
          value_Ar: result.doc.email,
          add: result.doc,
          action: 'add'
        }, result)
      })
    
      site.on('user update', function (result) {
    
        site.notifications.add({
          icon: '/images/users.png',
          source: "Security System",
          source_Ar: "نظام الحماية",
          message: "user Updated",
          message_Ar: "تم تعديل مستخدم",
          value: result.doc.email,
          value_Ar: result.doc.email,
          update: site.objectDiff(result.update.$set, result.doc),
          action: 'update'
        }, result)
      })
    
      site.on('user delete', function (result) {
        site.notifications.add({
          icon: '/images/users.png',
          source: "Security System",
          source_Ar: "نظام الحماية",
          message: "user Deleted",
          message_Ar: "تم حذف مستخدم ",
          value: result.doc.email,
          value_Ar: result.doc.email,
          delete: result.doc,
          action: 'delete'
        }, result)
      })
      
}