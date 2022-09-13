const { MainInterestModal, SubInterestModal }  = require("../../Modals")
class InterestsController{
    handleCreateSubInterest(title, interestId) {
        return new Promise((resolve, reject) => {
            /// get sub interest
            SubInterestModal.findOne({title})
                .then(subInterest => {
                    if(subInterest){
                        this.assignSubInterestToInterest(subInterest._id, interestId)
                                .then((updatedInterst) => {
                                    resolve(updatedInterst)
                                }).catch(err => reject(err))
                    }else{
                        /// else
                       this.createSubInterest(title)
                        .then(createdSubInterest => {
                            this.assignSubInterestToInterest(createdSubInterest._id, interestId)
                                .then((updatedInterst) => {
                                    resolve(updatedInterst)
                                }).catch(err => reject(err))
                        }).catch(err => {
                            reject(err);
                        })
                    }
                }).catch(err => {
                    console.log(err)
                    reject(`Internal Server Error: find sub-interest.`)
                })
        })
    }


    handleCreateMultipleSubInterest(interestList, interestId){
        interestList.forEach((interestTitle => {
            this.handleCreateSubInterest(interestTitle, interestId)
                .then(c => console.log(`+${interestTitle}`))
                .catch(err => console.log(`ERROR AT:${interestTitle}, DESC: ${err} `));
        }))
    }

    handleDeleteSubInterest(subInterestId){
        return new Promise((resolve, reject) => {
            SubInterestModal.findByIdAndDelete(subInterestId)
                .then(deletedSubInterest => {
                    resolve(deletedSubInterest)
                }).catch(err => {
                    reject(err);
                })
        })
    }






    //@Private Funcitons

    createSubInterest(title){
        return new Promise((resolve, reject) => {
            /// create sub interest.
            SubInterestModal.create({title})
            .then(createdSubInterest => {
                
               resolve(createdSubInterest)
            }).catch(err => {
                console.log(err)
                reject(`Internal Server Error: creating sub-interest.`)
            })
        })
    }

    assignSubInterestToInterest(subInterestId, interestId){
        return new Promise((resolve, reject) => {
            console.log(`>InterestId:${interestId}`)
            MainInterestModal
            .findById(interestId)
                .then(interest => {
                    // push sub interest.
                    interest.subType = interest.subType.filter(s => s.toString()!= subInterestId);
                    interest.subType.push(subInterestId)
                    /// save.
                    interest.save()
                        .then(savedInterest => {
                            MainInterestModal.populate(savedInterest, {path: "subType"})
                                .then(pInterest => {
                                    resolve(pInterest)
                                }).catch(err => {
                                    resolve(savedInterest)
                                })
                        }).catch(err => {
                            console.log(err);
                            reject(`Internal server error: saving main interests`)
                        })
                }).catch(err => {
                    console.log(err);
                    reject(`Internal server error: finding main interest`)
                })
        })
    }
    removeSubInterestFromInterest(subInterestId, interestId){
        return new Promise((resolve, reject) => {
            console.log(`>InterestId:${interestId}`)
            MainInterestModal
            .findById(interestId)
                .then(interest => {
                    // remove sub interest.
                    interest.subType = interest.subType.filter(s => s.toString()!= subInterestId);
                    /// save.
                    interest.save()
                        .then(savedInterest => {
                            MainInterestModal.populate(savedInterest, {path: "subType"})
                                .then(pInterest => {
                                    resolve(pInterest)
                                }).catch(err => {
                                    resolve(savedInterest)
                                })
                        }).catch(err => {
                            console.log(err);
                            reject(`Internal server error: saving main interests`)
                        })
                }).catch(err => {
                    console.log(err);
                    reject(`Internal server error: finding main interest`)
                })
        })
    }
}
module.exports = InterestsController;