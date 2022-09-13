
const { loginValidator, addUserValidator, addSocialUserValidator,
    updateUserValidator} = require("../../Validators/user");
const { UserModal } = require("../../Modals");
const passwordEncryptor = require("../../Utills/passwordEncryptor");
const { deleteS3File, getAvatarImage } = require("../../Config/fileUpload");
const passwordValidator = require("../../Utills/passwordValidator");
const tokenProducer = require("../../Utills/tokenProducer");
const { idValidator } = require("../../Validators/custom");
const { USER, ALL, SOCIAL, SIMPLE } = require("../constVariables");
const MyErrorHandler = require("../broadcast/errorHandler");
class UserClass {
    constructor() {

        this.respDeal = (err, Emittor, eMessage) => {
            if (err?.isJoi === true) {
                Emittor({
                error: { err, message: err.message, errorCode: 500 },
                success: false,
              });
            } else {
                Emittor({
                error: { err, message: eMessage, errorCode: 500 },
                success: false,
              });
            }
        };

        this.preSocialSignUpAdd = (data, req) => {
            return new Promise((resolve, reject) => {
                if (req.file) {
                    let Objects = [];
                    Objects.push({ Key: req.file.key });
                    
                    getAvatarImage(req.file.key)
                        .then(resp_Avatar => {
                            if (resp_Avatar.success == true) {
                                let image = {
                                    imageName: req.file.key,
                                    imageUrl: req.file.location,
                                    avatarName: resp_Avatar.avatar.key, // TODO:depr
                                    avatarUrl: resp_Avatar.avatar.Location, //TODO:depr
                                    thumbnail: data.thumbnail? data.thumbnail:"", //TODO:updated
                                }
                                Objects.push({ Key: resp_Avatar.avatar.key });

                                this.addSocialSugnUp(data, image)
                                .then((updated) => {
                                    resolve(updated);
                                })
                                .catch( (err) => {
                                    deleteS3File(Objects)
                                    .then((deleted) => {
                                      reject(err);
                                    })
                                    .catch((DeletionError) => {
                                      reject(err);
                                    });
                                });
                            } else {
                                deleteS3File(Objects)
                                    .then((deleted) => {
                                      reject(resp_Avatar);
                                    })
                                    .catch((DeletionError) => {
                                      reject(resp_Avatar);
                                    });
                            }
                        })
                        .catch(err => {
                            deleteS3File(Objects)
                            .then((deleted) => {
                              reject(err);
                            })
                            .catch((DeletionError) => {
                              reject(err);
                            });
                        })
                    
                  
                } else{
                    this.respDeal({}, reject, "Please Select Image");
                }
            }) 
        }
        this.userToJson = (data) => {
            return {
                _id: data._id,
                fullName: data.fullName,
                username: data.username,
                email: data.email,
                phoneNumber: data.phoneNumber,
                address: data.address,
                profileImage: data.profileImage,
                socials: data.socials,
                bio: data.bio ? data.bio : ""
            }
        }

        this.addSocialSugnUp = ( data, Image ) => {
            return new Promise((resolve, reject) => {
                addSocialUserValidator.validateAsync(data)
                .then(validated => {
                    this.getSingle({
                        $or: [
                            { "socials.accountId": data.socials.accountId },
                            { email: data.email }
                        ]
                    })
                        .then(async resp_User => {
                            if (resp_User.success === true) {
                                if (resp_User.user.email == data.email) {
                                    this.respDeal({}, reject, "Email Already Exist");
                                } else{
                                    this.respDeal({}, reject, "Social Account Already Exist");
                                }
                            } else {
                                try {
                                    let newUser = new UserModal({
                                        fullName: data.fullName,//
                                        username: data.username?data.username:"",//TODO:updated
                                        email: data.email,
                                        phoneNumber: data.phoneNumber,
                                        address: data.address,
                                        profileImage: Image,
                                        socials: data.socials,
                                        // socials: [{
                                        //     accountId:  "N4o9UCqD3HbHsCgWgV4ekOhxVYz2",
                                        //     payload: null
                                        // }],
                                        accountCreatedType: SOCIAL
                                    })

                                    newUser.save()
                                        .then(userCreated => {
                                            if (userCreated) {
                                                resolve({ message: "User Registered", user: userCreated, success: true });
                                            } else {
                                                this.respDeal({}, reject, "Failed, User Registration");
                                            }
                                        })
                                        .catch(err => {
                                            this.respDeal(err, reject, "Catch Error, Creating User");
                                        })
                                } catch (error) {
                                    console.log( "Error" )
                                    reject(error);
                                }
                               
                            }
                    })
                    .catch(err => {
                        reject(err);
                    } )
                })
                .catch(err => {
                this.respDeal( err , reject, "Catch Error, Validation" )
            } )
            })
        }
        this.preAdd = ( data , req ) => {
            return new Promise( async (resolve, reject) => {
                console.log("Api preAdd");
                if (req.file) {
                    let Objects = [];
                    Objects.push({ Key: req.file.key });
                    getAvatarImage(req.file.key)
                        .then(resp_Avatar => {
                            if (resp_Avatar.success == true) {
                                let image = {
                                    imageName: req.file.key,
                                    imageUrl: req.file.location,
                                    avatarName: resp_Avatar.avatar.key, ///TODO:depr
                                    avatarUrl : resp_Avatar.avatar.Location, ///TODO:depr
                                    thumbnail: data.thumbnail? data.thumbnail:"", // TODO:add
                                }

                                this.add(data, image)
                                .then((updated) => {
                                    resolve(updated);
                                })
                                .catch((err) => {
                                    deleteS3File(Objects)
                                    .then((deleted) => {
                                    reject(err);
                                    })
                                    .catch((DeletionError) => {
                                    reject(err);
                                    });
                                });
                            } else{
                                deleteS3File(Objects)
                                .then((deleted) => {
                                    reject(resp_Avatar);
                                })
                                .catch((DeletionError) => {
                                    reject(resp_Avatar);
                                });
                            }
                            
                        })
                        .catch(err => {
                            this.respDeal(err, resolve, err.message);
                    } )
                   
                } else{
                    this.respDeal({}, reject, "Please Select Image");
                }
            }) 
        }
        this.add = (data, image) => {
            return new Promise((resolve, reject) => {
                addUserValidator.validateAsync(data)
                    .then(validated => {
                        this.getSingle({ email: data.email })
                            .then(async resp_User => {
                                if (resp_User.success === true) {
                                    this.respDeal({}, reject, "Email Already Exist");
                                } else {
                                    try {
                                        let repPassword = await passwordEncryptor(data.password);
                                        // resolve(repPassword);
                                        let newUser = new UserModal({
                                            fullName: data.fullName,
                                            username: data.username, /// TODO:updated
                                            email: data.email,
                                            phoneNumber: data.phoneNumber,
                                            address: data.address,
                                            password: repPassword.hash,
                                            profileImage: image,
                                            // socials: [{
                                            //     accountId:  "N4o9UCqD3HbHsCgWgV4ekOhxVYz2",
                                            //     payload: null
                                            // }],
                                            accountCreatedType: SIMPLE
                                        })
    
                                        newUser.save()
                                            .then(userCreated => {
                                                if (userCreated) {
                                                    resolve({ message: "User Registered", user: userCreated, success: true });
                                                } else {
                                                    this.respDeal({}, reject, "Failed, User Registration");
                                                }
                                            })
                                            .catch(err => {
                                                this.respDeal(err, reject, "Catch Error, Creating User");
                                            })
                                    } catch (error) {
                                        console.log( "Error" )
                                        reject(error);
                                    }
                                   
                                }
                        })
                        .catch(err => {
                            reject(err);
                        } )
                    })
                    .catch(err => {
                    this.respDeal( err , reject, "Catch Error, Validation" )
                } )
            })
        }


        this.getSingle = ( data ) => {
            return new Promise((resolve, reject) => {
                UserModal.findOne(data)
                    .then(user => {
                        if (user) {
                            resolve({ message: "User", user, success: true });
                        } else{
                            resolve({ error: { message: "No User Found" , errorCode: 500} , success: false})
                        }
                    })
                    .catch(err => {
                        this.respDeal(err, reject, "Catch Error, Getting User");
                } )
            })
        }
        this.getUserById = (userId) => {
            return new Promise((resolve, reject) => {
                this.getSingle({_id: userId})
                    .then(userRes => {
                        if(userRes.success){
                            resolve(userRes.user)
                        }else{
                            reject(userRes);
                        }
                    }).catch(err => {
                        reject(err)
                    })
            })
        }
        this.login = (data) => {
            return new Promise((resolve, reject) => {
                loginValidator.validateAsync(data)
                    .then(validated => {
                        this.getSingle({ email: data.email })
                            .then( async userFound => {
                                if (userFound.success === true) {
                                    passwordValidator({
                                        password: data.password,
                                        emailPassword: userFound.user.password,
                                      })
                                        .then(passwordValid => {
                                            // resolve(passwordValid);
                                            if (passwordValid.success === true) {
                                                const payload = {
                                                    user: {
                                                        _id: userFound.user._id,
                                                        personType: USER
                                                    }
                                                };
                                                // resolve(payload);
                                                tokenProducer(payload, "1d")
                                                .then(resp_Token => {
                                                    resp_Token.message = "Login Successfully";
                                                    resp_Token = {...resp_Token, user: userFound.user }
                                                        resolve(resp_Token);
                                                })
                                                .catch(err => {
                                                    reject(err);
                                                } )
                                                
                                            } else{
                                                this.respDeal({}, reject, "Invalid Password");
                                            }
                                        })
                                        .catch(err => {
                                            this.respDeal(err, reject, "Catch Error, Password Validation");
                                    })
                                } else {
                                    this.respDeal({}, reject, "Invalid Email");
                                }
                            })
                            .catch(err => {
                                reject(err);
                        } )
                    })
                    .catch(err => {
                        this.respDeal(err, reject, "Catch Error, Valdiation");
                } )
            })
        }

        this.getList = () => {
            return new Promise((resolve, reject) => {
                UserModal.find()
                    .then(users => {
                        if (users.length > 0) {
                            resolve({ message: "Users ", users, success: true });
                        } else{
                            this.respDeal({}, reject, "Empty List");
                        }
                    })
                    .catch(err => {
                        this.respDeal(err, reject, "Catch Error, Gettign Users");
                } )
            })
        }

        this.updatePassword = ( data ) => {
            return new Promise((resolve, reject) => {
                let where = {};
                if (data.email) {
                    where.email= data.email;
                } else {
                    where.phoneNumber = data.phoneNumber;
                }

                UserModal.findOne(where)
                .then(respUser => {
                    if (respUser) {
                        console.log("1");
                        passwordEncryptor(data.password)
                            .then(respEncrpted => {
                                UserModal.updateOne(where, {
                                    password : respEncrpted.hash
                                })
                                .then(updated => {    
                                    resolve({ message: "Password Updated", success: true });
                                })
                                .catch( err =>{
                                    this.respDeal(err, reject, "Catch Error, Updating Password");
                                } )
                            })
                            .catch(err => {
                                reject(err);
                        } ) 
                        
                    } else {
                        this.respDeal({}, reject, "Invalid Request");
                    }
                })
                .catch(err => {
                    this.respDeal(err, reject, "Catch Error, Getting User");
                } )
            })
        }

        this.sociallogin = (data) => {
            return new Promise((resolve, reject) => {
                idValidator.validateAsync(data)
                    .then(validated => {
                        this.getSingle({ "socials.accountId": data._id })
                            .then(resp_User => {
                                if (resp_User.success === true) {
                                    const payload = {
                                        user: {
                                            _id: resp_User.user._id,
                                            personType: USER
                                        }
                                    };
                                    tokenProducer(payload, "10h")
                                        .then(resp_Token => {
                                            resp_Token.message = "Login Successfully";
                                            resp_Token = {...resp_Token , user: resp_User.user}
                                            resolve(resp_Token);
                                        })
                                        .catch(err => {
                                            reject(err);
                                    } )
                                } else {
                                    resolve(resp_User);
                                }
                            })
                            .catch(err => {
                                reject(err);
                        } )
                    })
                    .catch(err => {
                        this.respDeal(err, reject, "Catch Error, Validation");
                } )
            })
        }

        this.socialloginV2 = (data) => {
            return new Promise((resolve, reject) => {
                idValidator.validateAsync(data)
                    .then(validated => {
                        this.getSingle({ "email": data.email, accountCreatedType: "SOCIAL" })
                            .then(resp_User => {
                                if (resp_User.success === true) {
                                    const payload = {
                                        user: {
                                            _id: resp_User.user._id,
                                            personType: USER
                                        }
                                    };
                                    tokenProducer(payload, "10h")
                                        .then(resp_Token => {
                                            resp_Token.message = "Login Successfully";
                                            resp_Token = {...resp_Token , user: resp_User.user}
                                            resolve(resp_Token);
                                        })
                                        .catch(err => {
                                            reject(err);
                                    } )
                                } else {
                                    resolve(resp_User);
                                }
                            })
                            .catch(err => {
                                reject(err);
                        } )
                    })
                    .catch(err => {
                        this.respDeal(err, reject, "Catch Error, Validation");
                } )
            })
        }

        this.preUpdateProfile = (data, req) => {
            return new Promise(async (resolve, reject) => {
                console.log("updated Profile");
                console.log(data);
                let image = "";
                let Objects = [];
                if (req.file) {
                    Objects.push({ Key: req.file.key });
                    let resp_Avatar = await getAvatarImage(req.file.key);
                    console.log(resp_Avatar);
                    if (resp_Avatar.success == true) {
                        image = {
                            imageName: req.file.key,
                            imageUrl: req.file.location,
                            avatarName: resp_Avatar.avatar.key,
                            avatarUrl: resp_Avatar.avatar.Location,
                            thumbnail: data.thumbnail? data.thumbnail:"", // TODO:add
                        }
                    }
                }
                    this.updateProfile(data, image)
                        .then((updated) => {
                        console.log( "1-" ) 
                        if (updated.toRemoveImage?.length > 0) {
                            deleteS3File(updated.toRemoveImage)
                                .then((deleted) => {
                                    console.log('old Image removed');
                                resolve( updated )
                            })
                            .catch((DeletionError) => {
                                resolve( updated )

                            });
                        } else {
                            resolve(updated);
                        }
                    })
                    .catch((err) => {
                        deleteS3File(Objects)
                        .then((deleted) => {
                          reject(err);
                        })
                        .catch((DeletionError) => {
                          reject(err);
                        });
                    });
            }) 
        }

        this.updateProfile = (data, Image) => {
            console.log("=>Updating Images")
            console.log(Image)
            return new Promise((resolve, reject) => {
                updateUserValidator.validateAsync(data)
                    .then(validated => {
                        this.getSingle({ _id: data._id })
                            .then(async resp_User => {
                                if (resp_User.success === true) {
                                    let toRemoveImage = [];
                                    if (data.fullName) {
                                        resp_User.user.fullName = data.fullName; ///TODO:depr
                                        resp_User.user.username = data.username; /// TODO:updated
                                    }
                                    if (data.address) {
                                        resp_User.user.address = data.address;
                                    }
                                    if (Image !== "") {
                                        console.log("1");
                                        if (resp_User.user.profileImage) {
                                        console.log("2");
                                            
                                            toRemoveImage.push({ Key: resp_User.user.profileImage.imageName })
                                            toRemoveImage.push({ Key: resp_User.user.profileImage.avatarUrl })

                                            
                                        }
                                        console.log("=>Image Updated.");
                                        resp_User.user.profileImage = Image;
                                        console.log(resp_User.user.profileImage);
                                        console.log("3");

                                    }
                                    if (data.bio) {
                                        resp_User.user.bio = data.bio;
                                    }

                                    let userUpdated = await resp_User.user.save();
                                    let upUser = this.userToJson(userUpdated);
                                    resolve({ message: "User Updated", user: upUser, toRemoveImage, success: true });
                                  
                                } else{
                                    this.respDeal( {}, reject, "Invalid User Id" )
                                }
                        })
                        .catch(err => {
                            reject(err);
                        } )
                    })
                    .catch(err => {
                    this.respDeal( err , reject, "Catch Error, Validation" )
                } )
            })
        }

        this.delete = (data) => {
            return new Promise((resolve, reject) => {
                idValidator.validateAsync(data)
                    .then(validated => {
                        if (data._id === ALL ) {
                            UserModal.deleteMany()
                            .then(deleted => {
                                resolve({ message: `User Deleted`, deletedId: data._id, success: true });
                            })
                            .catch(err => {
                                this.respDeal(err, reject, `Catch Error, Deleting USERS`);
                            } )
                        } else {
                            UserModal.deleteOne({ _id: data._id })
                            .then(deleted => {
                                resolve({ message: `User Deleted`, deletedId: data._id, success: true });
                            })
                            .catch(err => {
                                this.respDeal(err, reject, `Catch Error, Deleting ${RacordTitle}`);
                            } )
                        }
                    })
                    .catch(err => {
                        this.respDeal(err, reject, "Catch Error, Validation");
                } )
            })
        }

        this.customUpdate = (data) => {
            return new Promise((resolve, reject) => {
                console.log(data);
                UserModal.updateMany({}, {
                    profileImage: data
                })
                    .then(updated => {
                        resolve({ message: "Updated", success: true });
                    })
                    .catch(err => {
                    this.respDeal({}, reject, "Cathc Error, User Update")
                } )
            })
        }
        this.updateUser = (userId, object) => {
            console.log(userId)
            console.log(object);
            return new Promise((resolve, reject) => {
                if(userId && typeof(object) === "object"){
                    UserModal.findByIdAndUpdate(userId, object)
                     .then(updatedUser => {
                         console.log(`Updated User ActiveRoom ${updatedUser.activeRoom}`)
                         resolve(updatedUser)
                     }).catch(err => {
                         console.log("Could Not upadte activeRoom")
                         console.log(err);
                         reject(MyErrorHandler.catchBuilder(err));
                     })
                }else{
                    console.log("Could Not upadte activeRoom Invalid data")
                    reject(MyErrorHandler.build("Invalid Data"))
                }
            })
        }
        this.getUserInterests = (userId) => {
            return new Promise((resolve, reject) => {
              this.getUserById(userId)
                .then(user => {
                  if(user){
                    let interests = user.interests.map(i => i.mainType);
                    resolve(interests);
                  }else{
                    reject(MyErrorHandler.build("Invalid User"));
                  }
                }).catch(err =>{
                  reject(err);
                })
            })
          }

        this.getUsersWithInterest = (interestId) => {
            return new Promise((resolve, reject) => {
                UserModal.find({"interests.mainType": interestId})
                    .then(users => {
                        resolve(users.map(u => u._id))
                    }).catch(err => {
                        reject(MyErrorHandler.catchBuilder(err))
                    })  
            })
        }
        this.getUserTribes = (userId) => {
            return new Promise((resolve, reject) => {
                this.getUserById(userId)
                    .then(user => {
                        resolve(user.myTribe)
                    }).catch(err => {
                        reject(err)
                    })
            })
        } 
        
    }
}
const MyUserControler = new UserClass();
module.exports = MyUserControler;