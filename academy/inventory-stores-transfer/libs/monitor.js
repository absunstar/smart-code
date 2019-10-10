module.exports = function init(site) {

  site.on('mongodb after insert', function (result) {
      if (result.collection === 'stores_in') {
        site.call('please monitor action' , { obj : {
          icon: '/images/store_in.png',
          source: "Stores In System",
          source_ar: "نظام اذونات الدخول",
          message: "New Store In Added",
          message_ar: "تم أضافة اذن دخول جديد",
          value: result.doc.vendor.name,
          value_ar: result.doc.vendor.name,
          add: result.doc,
          action: 'add'
        }, result : result })
      }
  })

  site.on('mongodb after update', function (result) {
      if (result.collection === 'stores_in') {
        site.call('please monitor action' , { obj : {
          icon: '/images/store_in.png',
          source: "Stores In System",
          source_ar: "نظام اذونات الدخول",
          message: "New Store In Updated",
          message_ar: "تم تعديل اذن دخول ",
          value: result.doc.vendor.name,
          value_ar: result.doc.vendor.name,
          update: site.objectDiff(result.update.$set, result.doc),
          action: 'update'
        }, result : result })
      }
  })


  site.on('mongodb after delete', function (result) {
      if (result.collection === 'stores_in') {
        site.call('please monitor action' , { obj : {
          icon: '/images/store_in.png',
          source: "Stores In System",
          source_ar: "نظام اذونات الدخول",
          message: " Store In Deleted",
          message_ar: "تم حذف اذن دخول ",
          value: result.doc.vendor.name,
          value_ar: result.doc.vendor.name,
          delete: result.doc,
          action: 'delete'
        }, result : result })
      }
  })

}