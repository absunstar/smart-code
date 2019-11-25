module.exports = function init(site) {

  let collection_name = 'tasks'

  let source = {
    name: 'Tasks System',
    ar: 'نظام المهام'
  }

  let image_url = '/images/task.png'
  let add_message = {
    name: 'New Task Added',
    ar: 'تم إضافة مهمة جديدة'
  }
  let update_message = {
    name: ' Task Updated',
    ar: 'تم تعديل مهمة'
  }
  let delete_message = {
    name: ' Task Deleted',
    ar: 'تم حذف مهمة '
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

  

}