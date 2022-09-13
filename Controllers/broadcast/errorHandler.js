class ErrorHandler{
    constructor(){
        this.catchBuilder = (error) => {
            return {
                error: {
                    message: error.message
                }, 
                success:false
            }
        }
        this.build = (errorMessage) => {
            return {
                error: {
                    message: errorMessage
                }, 
                success:false
            }
        }
    }
}
const MyErrorHandler = new ErrorHandler();
module.exports = MyErrorHandler;