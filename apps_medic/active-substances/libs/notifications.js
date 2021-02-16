module.exports = function init(site) {

  let collection_name = 'active_substances'

  let source = {
    name: 'Active Substances System',
    ar: ' نظام المواد الفعالة'
  }

  let image_url = '/images/active_substances.png'
  let add_message = {
    name: 'New Active Substance Added',
    ar: 'تم إضافة مادة فعالة جديدة'
  }
  let update_message = {
    name: ' Active Substance Updated',
    ar: 'تم تعديل مادة فعالة'
  }
  let delete_message = {
    name: ' Active Substance Deleted',
    ar: 'تم حذف مادة فعالة '
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