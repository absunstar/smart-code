module.exports = function init(site) {

  let collection_name = 'exam_grades'

  let source = {
    name: 'Exams Grades System',
    ar: ' نظام وضع درجات الإمتحانات'
  }

  let image_url = '/images/exam_grades.png'
  let add_message = {
    name: 'New Exam Grades Added',
    ar: 'تم إضافة وضع درجات الإمتحان جديدة'
  }
  let update_message = {
    name: 'Exam Grades Updated',
    ar: 'تم تعديل وضع درجات الإمتحان'
  }
  let delete_message = {
    name: 'Exam Grades Deleted',
    ar: 'تم حذف وضع درجات الإمتحان '
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