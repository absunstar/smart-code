module.exports = function init(site) {

  let collection_name = 'shifts'


  let source = {
    en: 'Shifts System',
    ar: 'نظام الشيفتات'
  }

  let image_url = '/images/shift.png'
  let add_message = {
    en: 'New Shift Added',
    ar: 'تم إضافة شيفت جديدة'
  }

  let update_message = {
    en: 'Shift Updated',
    ar: 'تم تعديل شيفت'
  }

  let delete_message = {
    en: ' Shift Deleted',
    ar: 'تم حذف شيفت '
  }


  if (site.feature('school')) {

    source = {
      en: 'School Years System',
      ar: 'نظام الأعوام الدراسية'
    }

    add_message = {
      en: 'New School Year Added',
      ar: 'تم إضافة عام دراسي جديدة'
    }

    update_message = {
      en: 'School Year Updated',
      ar: 'تم تعديل عام دراسي'
    }

    delete_message = {
      en: ' School Year Deleted',
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
            code: result.doc.code,
            name_en: result.doc.name_en,
            name_ar: result.doc.name_ar
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
            name_en: result.old_doc.name_en,
            name_ar: result.old_doc.name_ar
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
            name_en: result.doc.name_en,
            name_ar: result.doc.name_ar
          },
          delete: result.doc,
          action: 'delete'
        },
        result: result
      })
    }
  })

}