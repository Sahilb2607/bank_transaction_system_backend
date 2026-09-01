class ApiError extends Error{
    constructor(
     StatusCode,
     Message="Something went wrong",
     stack="",
     errors=[]
    ){
        super(Message)
        this.StatusCode=StatusCode,
        this.Message=Message,
        this.errors=errors,
        this.sucess=false,
        this.data=null

        if(stack){
           this.stack=stack
        }else{
              Error.captureStackTrace(this, this.constructor);
        }
    }


}
export {ApiError }