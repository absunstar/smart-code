module.exports = function init(site) {

  let collection_name = 'patients_tickets'

  let source = {
    name: 'Patients Tickets System',
    ar: 'نظام تذاكر المرضى'
  }

  let image_url = '/images/patients_tickets.png'
  let add_message = {
    name: 'New Patient Ticket Center Added',
    ar: 'تم أضافة تذكرة مريض جديد'
  }

  let update_message = {
    name: ' Patient Ticket Center Updated',
    ar: 'تم تعديل تذكرة مريض'
  }

  let delete_message = {
    name: ' Patient Ticket Center Deleted',
    ar: 'تم حذف تذكرة مريض '
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