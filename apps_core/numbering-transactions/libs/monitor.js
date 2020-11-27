module.exports = function init(site) {

  site.on('mongodb after insert', function (result) {
      if (result.collection === 'vendores') {
        site.call('please monitor action' , { obj : {
          icon: '/images/vendor.png',
          source: "Vendor System",
          source_ar: "نظام القري",
          message: "New Vendor Added",
          message_ar: "تم أضافة مورد جديد",
          value: result.doc.name,
          value_ar: result.doc.name,
          add: result.doc,
          action: 'add'
        }, result : result })
      }
  })

  site.on('mongodb after update', function (result) {
      if (result.collection === 'vendores') {
        site.call('please monitor action' , { obj : {
          icon: '/images/vendor.png',
          source: "Vendor System",
          source_ar: "نظام القري",
          message: "New Vendor Updated",
          message_ar: "تم تعديل مورد ",
          value: result.doc.name,
          value_ar: result.doc.name,
          update: site.objectDiff(result.update.$set, result.doc),
          action: 'update'
        }, result : result })
      }
  })


  site.on('mongodb after delete', function (result) {
      if (result.collection === 'vendores') {
        site.call('please monitor action' , { obj : {
          icon: '/images/vendor.png',
          source: "Vendor System",
          source_ar: "نظام القري",
          message: " Vendor Deleted",
          message_ar: "تم حذف مورد ",
          value: result.doc.name,
          value_ar: result.doc.name,
          delete: result.doc,
          action: 'delete'
        }, result : result })
      }
  })

}