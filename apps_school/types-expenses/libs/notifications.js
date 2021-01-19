module.exports = function init(site) {

  let collection_name = 'types_expenses'

  let source = {
    name: 'Types Expenses System',
    ar: ' نظام أنواع المصروفات الدراسية'
  }

  let image_url = '/images/types_expenses.png'
  let add_message = {
    name: 'New Types Expenses Added',
    ar: 'تم إضافة نوع مصروفات دراسية جديدة'
  }
  let update_message = {
    name: 'Types Expenses Updated',
    ar: 'تم تعديل نوع مصروفات دراسية'
  }
  let delete_message = {
    name: 'Types Expenses Deleted',
    ar: 'تم حذف نوع مصروفات دراسية '
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