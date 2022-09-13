const { StreamsModal } = require("../../Modals")
class StreamsOperationManager{
    constructor(){}
    get(userId){
        return new Promise((resolve, reject) => {
            StreamsModal.find()
            .populate({path: "user", select: "_id profileImage username email phoneNumber bio"})
            .populate({path: "comments.user", select: "_id profileImage username email phoneNumber bio"})
                .then(streams =>{
                    resolve(streams.map(s => ({
                        ...s._doc,
                        seenBy: [],
                        liked: (s.seenBy.findIndex(s => (s.liked === true && s.user == userId)) >= 0),
                        likesCount: s.seenBy.filter(s => s.liked).length
                    })));
                }).catch(err =>{
                    reject(err);
                })
        })
    }
    getByUserId(userId){
        return new Promise((resolve, reject) => {
            console.log(`My ID:${userId}`)
            StreamsModal.find({user: userId})
            .populate({path: "user", select: "_id profileImage username email phoneNumber bio"})
            .populate({path: "seenBy.user", select: "_id profileImage username email phoneNumber bio"})
            .populate({path: "comments.user", select: "_id profileImage username email phoneNumber bio"})
                .then(streams => {
                    resolve(streams.map(s => ({
                        ...s._doc,
                        liked: (s.seenBy.findIndex(s => (s.liked === true && s.user._id == userId)) >= 0),
                        likesCount: s.seenBy.filter(s => s.liked).length
                    })));
                }).catch(err => {
                    console.log(err)
                    reject(err);
                })
        })
    }
    getById(streamId){
        return new Promise((resolve, reject) => {
            StreamsModal.findById(streamId)
                .then(stream =>{
                    resolve(stream)
                }).catch(err =>{
                    console.log(`CATCH error in getting stream by Id: ${streamId}`)
                    console.log(err)
                    reject(err);
                })
        })
    }

    updateStream(streamId, updateObject){
        return new Promise((resolve, reject) => {
            StreamsModal.findByIdAndUpdate(streamId, updateObject)
                .then(updated => {
                    resolve(updated)
                }).catch(err => {
                    reject(err);
                })
        })
    }


    getByIdPopulated(streamId){
        return new Promise((resolve, reject) => {
            StreamsModal.findById(streamId)
            .populate({path: "user", select: "_id profileImage username email phoneNumber"})
            .populate({path: "seenBy.user", select: "_id profileImage username email phoneNumber"})
            .populate({path: "comments.user", select: "_id profileImage username email phoneNumber"})
                .then(stream =>{
                    resolve(stream)
                }).catch(err =>{
                    console.log(`CATCH error in getting stream by Id: ${streamId}`)
                    console.log(err)
                    reject(err);
                })
        })
    }

    create(userId, streamUrl, poster, description=""){
        return new Promise((resolve, reject) => {
            let singleStream = {
                user: userId,
                streamSource:{
                    url: streamUrl, 
                    poster: poster
                }, 
                description: description
            }
            StreamsModal.create(singleStream)
                .then(createdStream => {
                    this.getByIdPopulated(createdStream._id)
                                .then(s => {
                                    resolve(s)
                                }).catch(err => {
                                    resolve(createdStream)
                                })
                }).catch(err => {
                    reject(err)
                })
        })
    }

    delete(streamId){
        return new Promise((resolve, reject) => {
            StreamsModal.findByIdAndDelete(streamId)
                .then(deletedStream => {
                    resolve(deletedStream)
                }).catch(err => {
                    reject(err)
                })
        })
    }

    update(){
        return new Promise((resolve, reject) => {
            
        })

    }

    createStreamComment(userId ,streamId, commentText,commentType ,payload, dateTime){
        return new Promise((resolve, reject) => {
            this.getById(streamId)
                .then(singleStream => {
                    if(singleStream){
                        
                        singleStream.comments.push({
                            user: userId, 
                            text: commentText, 
                            dateTime: dateTime,
                            commentType, 
                            payload
                        })
                        singleStream.save()
                            .then(savedStream => {
                                this.getByIdPopulated(streamId)
                                .then(s => {
                                    resolve(s)
                                }).catch(err => {
                                    resolve(savedStream)
                                })
                                // savedStream.populate({path: "comments.user", select: "_id profileImage username email phoneNumber"}, 
                                // (err, doc) => {
                                //     if(!err){
                                //         savedStream.populate({path: "seenBy.user", select: "_id profileImage username email phoneNumber"}, 
                                //         (err_, doc_) => {
                                //             if(!err_){
                                //                 savedStream.populate({path: "user", select: "_id profileImage username email phoneNumber"}, 
                                //                 (err__, doc__) => {
                                //                     if(!err__){
                                //                         resolve(doc__)
                                //                     }else{
                                //                         console.log(`CATCH error in populating stream`)
                                //                         console.log(err)
                                //                         reject(`Saving stream, internal server error`)
                                //                     }
                                //                 })
                                //             }else{
                                //                 console.log(`CATCH error in populating stream`)
                                //                 console.log(err)
                                //                 reject(`Saving stream, internal server error`)
                                //             }
                                //         })
                                //     }else{
                                //         console.log(`CATCH error in populating stream`)
                                //         console.log(err)
                                //         reject(`Saving stream, internal server error`)
                                //     }
                                // })
                            }).catch(err => {
                                console.log(`CATCH error in saving stream`)
                                console.log(err)
                                reject(`Saving stream, internal server error`)
                            })
                    }else{
                        reject(`Invalid stream`)
                    }
                }).catch(err => {
                    reject(err);
                })
        })
    }
    createMarkSeen(userId, streamId){
        return new Promise((resolve, reject) => {
            this.getById(streamId)
                .then(singleStream => {
                    if(singleStream){
                        let seenIndex = singleStream.seenBy.findIndex(s => s.user.toString() == userId)
                        if(seenIndex === -1){
                            singleStream.seenBy.push({
                                user: userId
                            })
                            singleStream.save()
                            .then(savedStream => {
                                this.getByIdPopulated(streamId)
                                    .then(s => {
                                        resolve(s)
                                    }).catch(err => {
                                        resolve(savedStream)
                                    })
                            }).catch(err => {
                                console.log(`CATCH error in saving stream`)
                                console.log(err)
                                reject(`Saving stream, internal server error`)
                            })
                        }else{
                            resolve(singleStream)
                        }
                    }else{
                        reject(`Invalid stream`)
                    }
                }).catch(err => {
                    reject(err);
                })
        })
    }
    createLike(userId, streamId, liked){
        return new Promise((resolve, reject) => {
            this.getById(streamId)
                .then(singleStream => {
                    if(singleStream){
                        let seenIndex = singleStream.seenBy.findIndex(s => s.user.toString() == userId)
                        if(seenIndex >= 0){
                            singleStream.seenBy[seenIndex] = {
                                user: userId, 
                                liked: liked
                            }
                        }else{
                            singleStream.seenBy.push({
                                user: userId, 
                                liked: liked
                            })
                        }
                        singleStream.save()
                            .then(savedStream => {
                                this.getByIdPopulated(streamId)
                                    .then(s => {
                                        resolve(s)
                                    }).catch(err => {
                                        resolve(savedStream)
                                    })
                            }).catch(err => {
                                console.log(`CATCH error in saving stream`)
                                console.log(err)
                                reject(`Saving stream, internal server error`)
                            })
                    }else{
                        reject(`Invalid stream`)
                    }
                }).catch(err => {
                    reject(err);
                })
        })
    }
    
    

    getStreamComments(streamId){
        return new Promise((resolve, reject) => {
            StreamsModal.findById(streamId)
                .then(stream =>{
                    if(stream){
                        resolve(stream.comments)
                    }else{ 
                        resolve([])
                    }
                }).catch(err =>{
                    console.log(`CATCH Error in getting comments ${streamId}`)
                    reject(err);
                })
        })
    }
}
module.exports = StreamsOperationManager;