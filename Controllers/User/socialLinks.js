const MyUserController = require("./index")
const MyErrorHandler = require("../broadcast/errorHandler");

class SocialLinksManager{
    constructor(){
        this.createOrUpdate = (userId, linkType, value)  => {
            return new Promise((resolve, reject) => {
                MyUserController.getUserById(userId)
                    .then(user => {
                        if(user){
                            // console.log(`LT01: User Found`)
                            let linkIndex = user.socialLinks.findIndex(l => l.linkType === linkType);
                            if(linkIndex>=0){
                                // console.log(`LT02: Link Found, updating`)
                                user.socialLinks[linkIndex] = {linkType, value};
                            }else{
                                // console.log(`LT02: User Not Found, creating`)
                                user.socialLinks.push({linkType, value});
                            }
                            user.save()
                                .then(savedUser => {
                                    // console.log(`LT03: Saved`)
                                    resolve(savedUser.socialLinks);
                                }).catch(err =>{
                                    console.log(`LT03: FAIL`)
                                    reject(MyErrorHandler.catchBuilder(err))
                                })
                        }else{
                            console.log(`LT02: FAIL`)
                            reject(MyErrorHandler.build("Invalid User"))
                        }
                    }).catch(err => {
                        console.log(`LT01: FAIL`)
                        reject(MyErrorHandler.catchBuilder(err))
                    })
            })
        }

        this.getLinksByUserId = (userId) => {
            return new Promise((resolve, reject) => {
                MyUserController.getUserById(userId)
                .then(user => {
                    if(user){
                        resolve(user.socialLinks)
                    }else{
                        console.log(`LT02: FAIL`)
                        reject(MyErrorHandler.build("Invalid User"))
                    }
                }).catch(err => {
                    console.log(`LT01: FAIL`)
                    reject(MyErrorHandler.catchBuilder(err))
                })
            })
        }
    }
}
const MySocialLinksManager = new SocialLinksManager();
module.exports = MySocialLinksManager;