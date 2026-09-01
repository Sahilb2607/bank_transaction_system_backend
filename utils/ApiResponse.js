class ApiResponse{
    constructor(StatusCode,data,message=Sucess){
        this.StatusCode=StatusCode,
        this.message=message,
        this.data=data,
        this.Sucess=StatusCode < 400
    }
}
export {ApiResponse}