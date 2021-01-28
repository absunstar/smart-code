# Backend
    - Data Access Layer (connect to Db)
    - Security Layer (check permissions for users)
    - Validation Layer (check required fields and field size and data type)
    - Integration Layer (check if app need to integrate with anothe app or more)
    - http API Layer (cloud API)
    - Busniess Layer (check that bussniess workflow is right)
    - Testing 

# FrontEnd
    - ui Layer (interface (add - update - delete - details))
    - Validation (check required fields and field size and data type)
    - http Layer (ajax)
    - Busniess Layer (check that bussniess workflow is right )
    - Testing


# object structure
```js 
    var clinics ={
        id: 'int required auto',
        name: 'string required if has required ',
        specialty:{
            id: 'int required',
            name:'string required',
            active:'boolean',
            image_url:'string'
        },
        shift_list:[{
                name:'string required',
                active :'boolean',
                times_list:[{
                        id: 'int required',
                        name:'string required',
                        active :'boolean'
                    from : {
                        id : 'int required',
                        name : 'sring required',
                        en : 'string required',
                        ar : 'string required'
                        },
                    to : {
                        id : 'int required',
                        name : 'sring required',
                        en : 'string required',
                        ar : 'string required'
                        }
                    }]
      
        }],
    doctor_list:[
        {
            id:'int required',
            name:'string required',
            active:'boolean',
            shift : {name :'string required'}
        },
    ]
       
        

    }

# API
    -Add (POST),'/api/clinics/add','required {} (parameter)'
    -Update (POST),'/api/clinics/update' , 'required where (parameter)'
    -Delete(POST),'/api/clinics/delete' , 'required where (parameter)'
    -Search (POST),'/api/clinics/all', 'required where (parameter)'
    -view (POST),'/api/clinics/view', 'required where (parameter)'


# Describtion
    - This is service app serve other apps
    - The aim from this app is define clinic to use it in other apps
