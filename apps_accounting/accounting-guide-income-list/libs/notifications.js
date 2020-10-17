module.exports = function init(site) {

  let collection_name = 'accounting_guide_income_list'

  let source = {
    name: 'Guide Income List System',
    ar: 'نظام دليل تصنيفات قائمة الدخل '
  }

  let image_url = '/images/accounting_guide_income_list.png'
  let add_message = {
    name: 'New Guide Income List Added',
    ar: 'تم أضافة دليل تصنيفات قائمة الدخل جديدة'
  }
  let update_message = {
    name: ' Guide Income List Updated',
    ar: 'تم تعديل دليل تصنيفات قائمة الدخل'
  }
  let delete_message = {
    name: ' Guide Income List Deleted',
    ar: 'تم حذف دليل تصنيفات قائمة الدخل '
  }


  site.on('mongodb after insert', function (result) {
    if (result.collection === collection_name) {
      site.call('please monitor action', {
        obj: {
          icon: image_url,
          source: source,
          message: add_message,
          value: {
            name: result.doc.name,
            ar: result.doc.name
          },
          add: result.doc,
          action: 'add'
        },
        result: result
      })
    }
  })

  site.on('mongodb after update', function (result) {
    if (result.collection === collection_name) {
      site.call('please monitor action', {
        obj: {
          icon: image_url,
          source: source,
          message: update_message,
          value: {
            name: result.old_doc.name,
            ar: result.old_doc.name
          },
          update: site.objectDiff(result.update.$set, result.old_doc),
          action: 'update'
        },
        result: result
      })
    }
  })


  site.on('mongodb after delete', function (result) {
    if (result.collection === collection_name) {
      site.call('please monitor action', {
        obj: {
          icon: image_url,
          source: source,
          message: delete_message,
          value: {
            name: result.doc.name,
            ar: result.doc.name
          },
          delete: result.doc,
          action: 'delete'
        },
        result: result
      })
    }
  })

}