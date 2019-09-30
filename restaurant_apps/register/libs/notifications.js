module.exports = function init(site) {

  let collection_name = 'register'

  let source = {
    name: 'Users System',
    ar: 'نظام المستخدمين'
  }

  let image_url = '/images/user.png'
  let add_message = {
    name: 'New User Added',
    ar: 'تم أضافة مستخدم جديد '
  }
  let update_message = {
    name: ' User Updated',
    ar: 'تم تعديل مستخدم'
  }
  let delete_message = {
    name: ' User Deleted',
    ar: 'تم حذف مستخدم '
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