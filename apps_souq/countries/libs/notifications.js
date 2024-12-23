module.exports = function init(site) {

  let collection_name = 'countries'

  let source = {
    En: 'Countries System',
    Ar: 'نظام الدول'
  }

  let image_url = '/images/countries.png'
  let add_message = {
    En: 'New Country Added',
    Ar: 'تم إضافة دولة جديدة'
  }
  let update_message = {
    En: ' Country Updated',
    Ar: 'تم تعديل دولة'
  }
  let delete_message = {
    En: ' Country Deleted',
    Ar: 'تم حذف دولة '
  }


  site.on('mongodb after insert', function (result) {
    if (result.collection === collection_name) {
      site.call('please monitor action', {
        obj: {
          icon: image_url,
          source: source,
          message: add_message,
          value: {
            code: result.doc.code,
            name_En: result.doc.name_En,
            name_Ar: result.doc.name_Ar
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
            code: result.old_doc.code,
            name_En: result.old_doc.name_En,
            name_Ar: result.old_doc.name_Ar
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
            code: result.doc.code,
            name_En: result.doc.name_En,
            name_Ar: result.doc.name_Ar
          },
          delete: result.doc,
          action: 'delete'
        },
        result: result
      })
    }
  })

}