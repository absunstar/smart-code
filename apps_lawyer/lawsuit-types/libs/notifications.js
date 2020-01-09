module.exports = function init(site) {

  let collection_name = 'lawsuit_types'

  let source = {
    name: 'LawSuit Types System',
    ar: ' نظام أنواع الدعاوي'
  }

  let image_url = '/images/lawsuit_types.png'

  let add_message = {
    name: 'New LawSuit Types Added',
    ar: 'تم إضافة نوع دعوى جديدة'
  }
  let update_message = {
    name: ' LawSuit Types Updated',
    ar: 'تم تعديل نوع دعوى'
  }
  let delete_message = {
    name: ' LawSuit Types Deleted',
    ar: 'تم حذف نوع دعوى '
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