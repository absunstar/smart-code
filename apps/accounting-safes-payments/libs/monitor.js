module.exports = function init(site) {

  site.on('mongodb after insert', function (result) {
      if (result.collection === 'safes') {
        site.call('please monitor action' , { obj : {
          icon: '/images/safe.png',
          source: "Safes System",
          source_ar: "نظام الخزن",
          message: "New Safe Added",
          message_ar: "تم أضافة خزينة جديدة",
          value: result.doc.name,
          value_ar: result.doc.name,
          add: result.doc,
          action: 'add'
        }, result : result })
      }
  })

  site.on('mongodb after update', function (result) {
      if (result.collection === 'safes') {
        site.call('please monitor action' , { obj : {
          icon: '/images/safe.png',
          source: "Safes System",
          source_ar: "نظام الخزن",
          message: "New Safe Updated",
          message_ar: "تم تعديل خزينة ",
          value: result.doc.name,
          value_ar: result.doc.name,
          update: site.objectDiff(result.update.$set, result.doc),
          action: 'update'
        }, result : result })
      }
  })


  site.on('mongodb after delete', function (result) {
      if (result.collection === 'safes') {
        site.call('please monitor action' , { obj : {
          icon: '/images/safe.png',
          source: "Safes System",
          source_ar: "نظام الخزن",
          message: " Safe Deleted",
          message_ar: "تم حذف خزينة ",
          value: result.doc.name,
          value_ar: result.doc.name,
          delete: result.doc,
          action: 'delete'
        }, result : result })
      }
  })

}