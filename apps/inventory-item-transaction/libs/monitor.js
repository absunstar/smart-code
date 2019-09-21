module.exports = function init(site) {

  site.on('mongodb after insert', function (result) {
      if (result.collection === 'categories_items') {
        site.call('please monitor action' , { obj : {
          icon: '/images/category_item.png',
          source: "Categories Items System",
          source_ar: "نظام الاصناف",
          message: "New Category Item Added",
          message_ar: "تم أضافة صنف جديد",
          value: result.doc.name,
          value_ar: result.doc.name,
          add: result.doc,
          action: 'add'
        }, result : result })
      }
  })

  site.on('mongodb after update', function (result) {
      if (result.collection === 'categories_items') {
        site.call('please monitor action' , { obj : {
          icon: '/images/category_item.png',
          source: "Categories Items System",
          source_ar: "نظام الاصناف",
          message: "New Category Item Updated",
          message_ar: "تم تعديل صنف ",
          value: result.doc.name,
          value_ar: result.doc.name,
          update: site.objectDiff(result.update.$set, result.doc),
          action: 'update'
        }, result : result })
      }
  })


  site.on('mongodb after delete', function (result) {
      if (result.collection === 'categories_items') {
        site.call('please monitor action' , { obj : {
          icon: '/images/category_item.png',
          source: "Categories Items System",
          source_ar: "نظام الاصناف",
          message: " Category Item Deleted",
          message_ar: "تم حذف صنف ",
          value: result.doc.name,
          value_ar: result.doc.name,
          delete: result.doc,
          action: 'delete'
        }, result : result })
      }
  })

}
