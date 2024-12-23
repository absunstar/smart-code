module.exports = function init(site) {

  let collection_name = 'shifts'


  let source = {
    En: 'Shifts System',
    Ar: 'نظام الشيفتات'
  }

  let image_url = '/images/shift.png'
  let add_message = {
    En: 'New Shift Added',
    Ar: 'تم إضافة شيفت جديدة'
  }

  let update_message = {
    En: 'Shift Updated',
    Ar: 'تم تعديل شيفت'
  }

  let delete_message = {
    En: ' Shift Deleted',
    Ar: 'تم حذف شيفت '
  }


  if (site.feature('school')) {

    source = {
      En: 'School Years System',
      Ar: 'نظام الأعوام الدراسية'
    }

    add_message = {
      En: 'New School Year Added',
      Ar: 'تم إضافة عام دراسي جديدة'
    }

    update_message = {
      En: 'School Year Updated',
      Ar: 'تم تعديل عام دراسي'
    }

    delete_message = {
      En: ' School Year Deleted',
      Ar: 'تم حذف عام دراسي '
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