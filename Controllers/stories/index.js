const StoriesModal = require("../../Modals/storiesModal");
const StoryUsersModal = require("../../Modals/storyUsersModal")
class StoriesController{
    constructor(){
        this.createStoryUser = (userId) => {
            return new Promise((resolve, reject) => {
                this.getStoryUser(userId)
                    .then(storyUser => {
                        if(storyUser){
                            console.log(`Story User Already exits!`)
                            console.log(storyUser)
                            resolve(storyUser)
                        }else{
                            console.log(`Creating Story User!`)
                            StoryUsersModal.create({userId})
                            .then(created => {
                                resolve(created);
                            }).catch(err => {
                                console.log(err);
                                reject(`Internal server error: create story user`)
                            })
                        }
                    }).catch(err => {
                        reject(err)
                    })
            })
        }
        this.getStoryUser = (userId) => {
            return new Promise((resolve, reject) => {
                StoryUsersModal.findOne({userId})
                    .then(storyUser => {
                        resolve(storyUser)
                    }).catch(err => {
                        reject(`Internal Server Error: get story user`)
                    })
            })
        }

        this.pushStoryToStoryUser = (storyUser,storyId, updatedAt) => {
            return new Promise((resolve, reject) => {
                storyUser.stories = storyUser.stories.filter(s => s._id != storyId)
                storyUser.updatedAt = updatedAt
                storyUser.stories.push(storyId)
                storyUser
                    .save()
                    .then(savedStoryUser => {
                        resolve(savedStoryUser)
                    }).catch(err => {
                        reject(`Internal Server Error: push story to story-user`);
                    })
            })
        }

        this.removeStoryFromStoryUser = (storyUser, storyId) => {
            return new Promise((resolve, reject) => {
                storyUser.stories = storyUser.stories.filter(s => s._id != storyId)
                storyUser
                    .save()
                    .then(savedStoryUser => {
                        resolve(savedStoryUser)
                    }).catch(err => {
                        reject(`Internal Server Error: push story to story-user`);
                    })
            })
        }

        this.create = (userId, createdAt, media, description = "") => {
            return new Promise((resolve, reject) => {
                this.createStoryUser(userId)
                    .then(storyUser => {
                        StoriesModal.create({userId, createdAt, media, description})
                        .then(created => {
                            this.pushStoryToStoryUser(storyUser, created._id, createdAt)
                                .then(savedStoryUser => {
                                    resolve(created)
                                }).catch(err => {
                                    console.log(`CATCH Error: Danger Create Story`)
                                    console.log(err);
                                    reject(err)
                                })
                        }).catch(err => {
                            reject(err)
                        })
                    }).catch(err => {
                        reject(err);
                    })
            })
        }
        this.getByUsers = (users = []) => {
            return new Promise((resolve, reject) => {  
                let filter = {stories: {$exists: true, $ne: []}};
                // if(users.length > 0){
                    filter = {...filter ,userId: {$in: users}}
                // }
                // console.log(filter)
                StoryUsersModal.find(filter)
                .populate({path: "userId", select: "_id username profileImage.imageUrl"})
                .populate("stories")
                .populate({path:"stories.views.userId", select: "_id username profileImage.imageUrl"})
                .sort({updatedAt: -1})
                    .then(stories => {
                        resolve(stories.map(s => ({
                            _id: s._id, 
                            username: s.userId.username, 
                            profile: s.userId.profileImage.imageUrl,
                            views: s.views, 
                            stories: s.stories.map(ms => ({
                                id: ms._id, 
                                url: ms.media.payload,
                                placeholder: ms.media.placeholder, 
                                key: ms.media.key,
                                description: ms.description,
                                type: ms.media.mediaType,
                                createdAt: ms.createdAt,
                                duration: 2.5,
                            }))
                        })))
                    }).catch(err => {
                        reject(`Internal Server Error: stories`)
                    })
            })
        }
        this.deleteStory = (storyId) => {
            return new Promise((resolve, reject) => {
                StoriesModal.findByIdAndDelete(storyId)
                    .then(deletedStory => {
                        if(deletedStory){
                            this.getStoryUser(deletedStory.userId)
                            .then(storyUser => {
                                this.removeStoryFromStoryUser(storyUser, storyId )
                                   .then(removed => {
                                       resolve(deletedStory)
                                   }).catch(err => {
                                       resolve(deletedStory)
                                   })
                            }).catch(err => {
                               reject(err)
                            })
                        }else{
                            reject(`Invalid Story`)
                        }
                    }).catch(err => {
                        console.log(err)
                        reject(`Internal Server Error: delete story`)
                    })
            })
        }

        this.markSeen = (storyId, userId, seenTime) => {
            return new Promise((resolve, reject) => {
                /// check if exist mark seen
                /// if not found? create: return result
                this.isViewedByUser(storyId, userId)
                .then(viewRes => {
                    if(viewRes.viewFound){
                        resolve(viewRes.story);
                    }else{
                        viewRes.story.views.push({
                            userId, 
                            viewedAt: seenTime
                        })
                        viewRes.story.save()
                            .then(savedStory => {
                                resolve(savedStory)
                            }).catch(err => {
                                reject({error: "internal server error: mark seen"})
                            })
                    }
                }).catch(err => {
                    reject(err);
                })
            })
        }

        this.getSingleStory = (storyId) =>{
            return new Promise((resolve, reject) => {
                StoriesModal.findById(storyId)
                    .then((story) => {
                        if(story){
                            resolve(story)
                        }else{
                            reject({message: "invalid story Id"})
                        }
                    }).catch(err => {
                        reject(err);
                    })
            })
        }

        this.isViewedByUser = (storyId, userId) => {
            return new Promise((resolve, reject) => {
                this.getSingleStory(storyId)
                    .then(story =>{
                        let userViewIndex = story.views.findIndex(v => v.userId == userId)
                        if(userViewIndex >= 0){
                            resolve({story, viewFound: true, viewIndex: userViewIndex})
                        }else{
                            resolve({story, viewFound: false, viewIndex: -1})
                        }
                    }).catch(err => {
                        reject(err);
                    })
            })
        }


      
    }
}
module.exports =  StoriesController;