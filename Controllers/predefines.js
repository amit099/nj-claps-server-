const { addPredefineValidator, updatePredefineValidator , listPredefineValidator, idValidator} = require("../Validators/predefines");
const { ALL } = require("./constVariables");
class PredefinesClass {
    constructor(){

        this.respDeal = ( err, Emittor , eMessage  ) => {
            if (err.isJoi === true) {   
                Emittor({ error: { message: err.message, errorCode: 500 }, success: false });
            } else {
                Emittor({ error: { err,  message: eMessage, errorCode: 500 }, success: false });
            }
        }
        this.getSingle = (data, Modal, RacordTitle) => {
            return new Promise((resolve, reject) => {
                Modal.findOne(data)
                    .then(found => {
                        if (found) {
                            resolve({ message: `${RacordTitle} Found`, found: found, success: true });
                        } else {
                            this.respDeal({}, resolve, `${RacordTitle} Not Found`);
                        }
                    })
                    .catch(err => {
                        this.respDeal(err, reject, `Catch Error, Getting ${RacordTitle}`);
                } )
            
            })
        }
        this.add = (data, Modal, RacordTitle) => {
            return new Promise((resolve, reject) => {
                addPredefineValidator.validateAsync(data)
                .then(validated => {
                    this.getSingle({  title: data.title }, Modal, RacordTitle)
                    .then(resp_GetSingle=> {
                        if( resp_GetSingle.success === true ){
                            this.respDeal({}, reject, `Already in ${RacordTitle}`);
                        }else{
                            let newRecord = new Modal({
                                title: data.title,
                                
                                payload: data.payload,
                                createdAt: Date.now()
                            })

                            if (data.subType) {
                                newRecord.subType = data.subType;
                            }
                            newRecord.save()
                            .then(created => {
                                if (created) {
                                    this.getSingle({ _id: created._id }, Modal, RacordTitle)
                                    .then(resp_GetSingle=> {
                                        if( resp_GetSingle.success === true ){
                                            resp_GetSingle.message = `${RacordTitle} Created Successfully`;
                                        }
                                        resolve(resp_GetSingle);
                                    })
                                    .catch(err => {
                                        reject(err);
                                    } )
                                } else {
                                    this.respDeal({}, reject, `${RacordTitle} Not Created`);
                                }
                            })
                            .catch(err => {
                                this.respDeal(err, reject, `Catch Error, Creating ${RacordTitle}`);
                            } )
                        }
                    })
                    .catch( err => {
                        this.respDeal(err, reject, `Catch Error, Creating ${RacordTitle}`);
                    } )
                })
                .catch(err => {
                    this.respDeal(err, reject, `Catch Error, ${RacordTitle}`);
                } )
            })
        }

        this.update = (data, Modal, RacordTitle) => {
            return new Promise((resolve, reject) => {
                updatePredefineValidator.validateAsync(data)
                    .then(validated => {
                        this.getSingle({ _id: { $ne: data._id },  title: data.title }, Modal, RacordTitle)
                        .then(resp_Get => {
                            if (resp_Get.success === true) {
                                this.respDeal({}, reject, `Already Exist in ${RacordTitle}`);
                            } else {
                                let toUpdate = {};
                                if (data.title) {
                                    toUpdate.title = data.title;
                                }
                                if (data.payload) {
                                    toUpdate.payload = data.payload;
                                }

                                if (data.subType) {
                                    toUpdate.subType = data.subType;
                                }
                                Modal.updateOne({ _id: data._id }, toUpdate)
                                .then(updated => {
                                    this.getSingle({ _id: data._id }, Modal, RacordTitle)
                                        .then(resp_GetUpdated => {
                                            if( resp_GetUpdated.success === true ){
                                                resp_GetUpdated.message = `${RacordTitle} Updated Successfully`;
                                            }
                                            resolve(resp_GetUpdated);
                                    })
                                    .catch(err => {
                                        reject(err);
                                    } )
                                })
                                .catch(err => {
                                    this.respDeal(err, reject, `Catch Error, Updating ${RacordTitle}`);
                                } )
                            }
                        })
                        .catch(err => {
                            reject(err);
                        } )
                    })
                    .catch(err => {
                        this.respDeal(err, reject, `Catch Error, Validation ${RacordTitle}`);
                } )
            })
        }

        this.getList = (data, Modal, RacordTitle) => {
            return new Promise((resolve, reject) => {
                listPredefineValidator.validateAsync(data)
                    .then(validated => {
                        Modal.find()
                            .populate({ path: "subType" })
                            // .skip(data.offset)
                            // .limit(data.limit)
                            .then(foundList => {
                                if (foundList.length > 0) {
                                    resolve({ message: `${RacordTitle} List`, foundList: foundList, success: true });
                                } else {
                                    this.respDeal({}, resolve, `${RacordTitle} List Empty`);
                                }
                            })
                            .catch(err => {
                                this.respDeal(err, reject, `Catch Error, Getting ${RacordTitle}`);
                        } )
                    })
                    .catch(err => {
                        this.respDeal(err, reject, `Catch Error, Validation`);
                } )
            })
        }

        this.delete = (data, Modal, RacordTitle) => {
            return new Promise(( resolve, reject ) => {
                idValidator.validateAsync(data)
                .then(validated => {
                    if (data._id === ALL ) {
                        Modal.deleteMany()
                        .then(deleted => {
                            resolve({ message: `${RacordTitle} Deleted`, deletedId: data._id, success: true });
                        })
                        .catch(err => {
                            this.respDeal(err, reject, `Catch Error, Deleting ${RacordTitle}`);
                        } )
                    } else {
                        Modal.deleteOne({ _id: data._id })
                        .then(deleted => {
                            resolve({ message: `${RacordTitle} Deleted`, deletedId: data._id, success: true });
                        })
                        .catch(err => {
                            this.respDeal(err, reject, `Catch Error, Deleting ${RacordTitle}`);
                        } )
                    }
                })
                .catch( err => {
                    this.respDeal(err, reject, "Catch Error, Validation");
                } )
            })
        }
    }
}
const MyPredefinesController = new PredefinesClass();
module.exports = MyPredefinesController; 
