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
    var scan_center ={
        id: 'int required auto',
        name: 'string required ',  
        gov:{
            id:'int required',
            name:'string required'
        },
        city:{
            id:'int required',
            name:'string required'
        },
        address:{
            name:'string required'
        }
        hotline:'string',
        phone:'required string',
        mobile:'string',
        fax:'string',
        website:'string',
        email:'string', 
        active:'boolean',
        image_url:'string',
        scan_names:[{
            id:'int required auto',
            name:'string required',
            active:'bollean',
            image_url:'string'
        }]


    }

# API
    -Add (POST),'/api/scan_center/add','required {} (parameter)'
    -Update (POST),'/api/scan_center/update' , 'required where (parameter)'
    -Delete(POST),'/api/scan_center/delete' , 'required where (parameter)'
    -Search (POST),'/api/scan_center/all', 'required where (parameter)'
    -view (POST),'/api/scan_center/view', 'required where (parameter)'
 

# Describtion
    - This is service app serve other apps
    - The aim from this app is define scan_center to use it in other apps
 