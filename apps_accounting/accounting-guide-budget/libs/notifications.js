module.exports = function init(site) {

  let collection_name = 'accounting_guide_budget'

  let source = {
    name: 'Guide Budget System',
    ar: 'نظام دليل تصنيفات الميزانية '
  }

  let image_url = '/images/accounting_guide_budget.png'
  let add_message = {
    name: 'New Guide Budget Added',
    ar: 'تم أضافة دليل تصنيفات الميزانية جديدة'
  }
  let update_message = {
    name: ' Guide Budget Updated',
    ar: 'تم تعديل دليل تصنيفات الميزانية'
  }
  let delete_message = {
    name: ' Guide Budget Deleted',
    ar: 'تم حذف دليل تصنيفات الميزانية '
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