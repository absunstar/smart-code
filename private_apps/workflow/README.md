# workflow for all sysytem
```js

    let workflow1 = {
        name : 'workflow1',
        type : 'multi-approved | any-approved | ',
        users : [],
        status : 'done | cancel | stop | working'
    }
    site.workflow.add(workflow1 , obj)
    site.workflow.start(obj)
    site.workflow.stop(obj)
    site.workflow.done(obj)

  let w1 = site.workflow.get(obj)


  site.on('workflow-done' , (workflow)=>{
      if(workflow.ref_id == obj._id){

      }
  })
  

```