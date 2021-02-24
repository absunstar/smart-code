module.exports = function init(site) {

  let collection_name = 'medical_insurance_companies'

  let source = {
    name: 'Insurance Companies System',
    ar: 'نظام شركات التأمين'
  }

  let image_url = '/images/medical_insurance_companies.png'
  let add_message = {
    name: 'New Insurance Companies Added',
    ar: 'تم أضافة شركة تأمين جديدة'
  }
  let update_message = {
    name: ' Insurance Companies Updated',
    ar: 'تم تعديل شركة تأمين'
  }
  let delete_message = {
    name: ' Insurance Companies Deleted',
    ar: 'تم حذف شركة تأمين '
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