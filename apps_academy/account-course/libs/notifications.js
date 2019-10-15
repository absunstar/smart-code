module.exports = function init(site) {

  let collection_name = 'account_course'

  let source = {
    name: 'Account Course System',
    ar: 'نظام حساب الكورسات'
  }

  let image_url = '/images/account_course.png'
  let add_message = {
    name: 'New Account Course Added',
    ar: 'تم أضافة حساب كورس جديدة'
  }
  let update_message = {
    name: ' Account Course Updated',
    ar: 'تم تعديل حساب كورس'
  }
  let delete_message = {
    name: ' Account Course Deleted',
    ar: 'تم حذف حساب كورس '
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