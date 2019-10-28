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
    var goves ={
        id: 'int required auto',
        name: 'string required if has required ',
        active:'boolean',
        image_url:'string'
       

    }

# API
    -Add (POST),'/api/goves/add','required {} (parameter)'
    -Update (POST),'/api/goves/update' , 'required where (parameter)'
    -Delete(POST),'/api/goves/delete' , 'required where (parameter)'
    -Search (POST),'/api/goves/all', 'required where (parameter)'
    -view (POST),'/api/goves/view', 'required where (parameter)'


# Describtion
    - This is service app serve other apps
    - The aim from this app is define gov to use it in other apps
