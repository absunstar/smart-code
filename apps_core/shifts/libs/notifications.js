module.exports = function init(site) {

  let collection_name = 'shifts'


  let source = {
    name: 'Shifts System',
    ar: 'نظام الشيفتات'
  }

  let image_url = '/images/shift.png'
  let add_message = {
    name: 'New Shift Added',
    ar: 'تم إضافة شيفت جديدة'
  }

  let update_message = {
    name: 'Shift Updated',
    ar: 'تم تعديل شيفت'
  }

  let delete_message = {
    name: ' Shift Deleted',
    ar: 'تم حذف شيفت '
  }


  if (site.feature('school')) {

    source = {
      name: 'School Years System',
      ar: 'نظام الأعوام الدراسية'
    }

    add_message = {
      name: 'New School Year Added',
      ar: 'تم إضافة عام دراسي جديدة'
    }

    update_message = {
      name: 'School Year Updated',
      ar: 'تم تعديل عام دراسي'
    }

    delete_message = {
      name: ' School Year Deleted',
      ar: 'تم حذف عام دراسي '
    }
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