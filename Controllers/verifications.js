const { VerificationModal, UserModal } = require("../Modals");
const { sendVerificationOtp, validateCodeValidator,
    validateLinkValidator} = require("../Validators/verifications");
const randomize = require("randomatic");
const { EMAIL, USER, PROJECT_KEY_NAME,  VERIFICATION,
    AVAILIBILITY, FORGOTPASSWORD, LINK, CODE, RESETPSSWORDLINK, ALL,
    AuthValidationPeriod
} = require("./constVariables");
const { titleCase } = require("../Utills/stringFormates");
const secretOrKey = require("../Config/db").secretOrKey;
const sgMail = require("@sendgrid/mail");
const { idValidator } = require("../Validators/custom");
sgMail.setApiKey(process.env.EMAILKEY_SENDGRID);
const jwt = require("jsonwebtoken");

const client = require("twilio")(
    process.env.TWILIO_ACCOUTSID,
    process.env.TWILIO_ACCOUNTTOKEN
  );
require("dotenv").config();

class VerficatioCalss {
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

        this.getSingle = (data, Modal, RacordTitle) => {
            return new Promise((resolve, reject) => {
              Modal.findOne(data)
                .then((found) => {
                  if (found) {
                    resolve({
                      message: `${RacordTitle} Found`,
                      found: found,
                      success: true,
                    });
                  } else {
                    this.respDeal({}, resolve, `${RacordTitle} Not Found`);
                  }
                })
                .catch((err) => {
                  this.respDeal(err, reject, `Catch Error, Getting ${RacordTitle}`);
                });
            });
          };
          
        
          this.sendPhoneDataPrepare = (reject, resolve, data, _callback) => {
            // _callback(null, { success: true });
            if (data.verificationMethod === LINK) {
              const payload = {
                user: {
                    verificationMethod: data.verificationMethod,
                      verificationOn: data.verificationOn,
                      verificationType: data.verificationType,
                    personType: data.personType,
                },
              };
              jwt.sign(payload, secretOrKey, { expiresIn: "5m" }, (err, token) => {
                if (err) {
                  _callback(
                    this.respDeal(err, reject, "Error, Jwt Token Implementation"),
                    null
                  );
                  // resolve ({ msg: "Error, In Getting Token ", success :false });
                } else {
                  data.code = token;
      
                  data.body = `${data.subject}, ${RESETPSSWORDLINK}${data.code}`;
                  _callback(null, { data, success: true });
                }
              });
            } else  {
              console.log("7");
              data.body = `${data.subject} ${data.code} `;
              _callback(null, { data, success: true });
            } 
          };
        
          this.sendPhoneCode = (data) => {
            return new Promise((resolve, reject) => {
              client.messages
                .create({
                  body: data.body,
                  from: "+12562025565",
                  // 12562025565
                  to: `${data.verificationOn}`,
                })
                .then((message) => {
                  console.log(message.sid);
                  console.log("OTP Sent");
                  resolve({ message: "OTP Sent", success: true });
                })
                .catch((err) => {
                  console.log("Catch Error, Sending Code To Phone Number");
                  this.respDeal(
                    err,
                    reject,
                    "Catch Error, Getting Phone From Key Value"
                  );
                });
            });
          };
        
        this.phoneVerficationSending = (data) => {
            return new Promise((resolve, reject) => {
                console.log("Send COde");
                console.log("1");
                let Modal = "";
                let title = titleCase(data.verificationType);
                if (data.personType === USER) {
                    Modal = UserModal;
                }
              console.log("3");
              if (data.purpose === AVAILIBILITY) {
                data.subject = `${PROJECT_KEY_NAME}: Phone Number Varification, Registration`;
              } else if (data.purpose === FORGOTPASSWORD) {
                data.subject = `${PROJECT_KEY_NAME}: Phone Number Varification, Forget Password`;
              } else if (data.purpose === VERIFICATION) {
                data.subject = `${PROJECT_KEY_NAME}: Varification Code`;
              } else {
                this.respDeal({}, reject, "Invalid Verfication Purpose");
              }
              console.log("4");
              // resolve({ data });
              this.getSingle(
                { phoneNumber: data.verificationOn },
                Modal,
                titleCase(data.personType)
              )
                .then((foundUser) => {
                  if (foundUser.success === true && data.purpose === AVAILIBILITY) {
                    this.respDeal({}, reject, `Phone Number Already Exist`);
                  } else if (
                    foundUser.success === false &&
                    data.purpose === FORGOTPASSWORD
                  ) {
                    this.respDeal({}, reject, `Phone Number Invalid`);
                  } else {
                    this.sendPhoneDataPrepare( reject, resolve, data, (err, response) => {
                        if (err !== null) {
                          resolve(err);
                        } else {
                          data = response.data;
                          this.sendPhoneCode(data)
                            .then((resp_SentCode) => {
                              this.save_Update_CodeToDb(data, VerificationModal)
                                .then((resp_Added) => {
                                  resolve(resp_Added);
                                })
                                .catch((err) => {
                                  reject(err);
                                });
                            })
                            .catch((err) => {
                              reject(err);
                            });
                        }
                      }
                    );
                  }
                })
                .catch((err) => {
                  reject(err);
                });
            });
        };
        
        this.sendEMail = (data) => {
            return new Promise((resolve, reject) => {
              console.log("Sendgin Email");
              const msg = {
                to: `${data.email}`.toLowerCase(),
                from: process.env.SENDEMAIL_FROM, // Use the email address or domain you verified above
                subject: `${data.subject}`,
                // text: `${data.text}`,
                html: `${data.html}`,
              };
      
              sgMail
                .send(msg)
                .then((sended) => {
                  console.log("Email Sended");
                  resolve({ message: "Email Sended Successfully", success: true });
                })
                .catch((err) => {
                  console.log(err);
                  this.respDeal(err, reject, "Catch Error, Sending Email");
                });
            });
          };
        
          this.save_Update_CodeToDb = (data, Modal) => {
            return new Promise((resolve, reject) => {
              let title = titleCase(data.verificationType);
                let where = {
                    verificationOn: `${data.verificationOn}`.toString()
                };
             
              this.getSingle(where, Modal, title)
                .then(async (resp_Get) => {
                  if (resp_Get.success === true) {
                    resp_Get.found.code = data.code;
                    resp_Get.found.createdAt = Date.now();
                    let updatedPerson = await resp_Get.found.save();
                    resolve({
                      message: `${title} Verification Added Successfully`,
                      success: true,
                    });
                  } else {
                    let newUser = new VerificationModal({
                        verificationOn: data.verificationOn,
                        code: data.code,
                        verificationMethod: data.verificationMethod,
                        personType: data.personType,
                        createdAt: Date.now(),
                    });
                    newUser
                      .save()
                      .then((added) => {
                        resolve({
                          message: `${title} Verification Added Successfully.`,
                          success: true,
                        });
                      })
                      .catch((err) => {
                        this.respDeal(
                          err,
                          reject,
                          `Catch Error, Creating ${title} Verification`
                        );
                      });
                  }
                })
                .catch((err) => {
                  this.respDeal(err, reject, `Catch Error, Getting ${title}`);
                });
            });
        };
        
        this.sendEmailDataPrepare = async (reject, resolve, data, _callback) => {
            if (data.verificationMethod === LINK) {
              const payload = {
                  user: {
                    verificationMethod: data.verificationMethod,
                      verificationOn: data.verificationOn,
                      verificationType: data.verificationType,
                    personType: data.personType,
                },
              };
              jwt.sign(payload, secretOrKey, { expiresIn: "5m" }, (err, token) => {
                if (err) {
                  _callback(
                    this.respDeal(err, reject, "Error, Jwt Token Implementation"),
                    null
                  );
                  // resolve ({ msg: "Error, In Getting Token ", success :false });
                } else {
                  data.code = token;
                  data.html = `<html><head></head><body>Verify Your Email by clicking on link and follow up: <a href=\"${RESETPSSWORDLINK}${data.code}"> ${data.code} </a></body></html>`;
                  _callback(null, { data, success: true });
                }
              });
            } else {
              console.log("7");
              data.html = `Your Email Verfication Code Is: <strong> ${data.code} </strong>`;
              _callback(null, { data, success: true });
            } 
          };
          this.emailVerificationSending = (data) => {
            return new Promise((resolve, reject) => {
                console.log("1");
                let title = titleCase(data.verificationType);
                let Modal = "";
                if (data.personType === USER) {
                    Modal = UserModal;
                }
      
                if (data.purpose === AVAILIBILITY) {
                    data.subject = `${PROJECT_KEY_NAME}: Email Varification, Registration`;
                } else if (data.purpose === FORGOTPASSWORD) {
                    data.subject = `${PROJECT_KEY_NAME}: Email Varification, Forget Password`;
                } else if (data.purpose === VERIFICATION) {
                    data.subject = `${PROJECT_KEY_NAME}: Email Varification `;
                } else {
                    this.respDeal({}, reject, "Invalid Verfication Purpose");
                }
                
                let myWhere = {
                    email: data.verificationOn
                };
              this.getSingle(myWhere, Modal, title)
                .then(async (resp_AvailibiltyChek) => {
                  console.log("5");
                  if ( resp_AvailibiltyChek.success === true && data.purpose === AVAILIBILITY ) {
                    this.respDeal({}, reject, `Email Already Exist`);
                  } else if ( resp_AvailibiltyChek.success === false && data.purpose === FORGOTPASSWORD ) {
                    this.respDeal({}, reject, `Email Invalid`);
                  } else {
                    console.log("6");
                    this.sendEmailDataPrepare( reject, resolve, data,
                      (err, response) => {
                        if (err !== null) {
                          resolve(err);
                        } else {
                          data = response.data; // never erase
                          this.sendEMail(data)
                            .then((emailsent) => {
                              console.log("8");
                              this.save_Update_CodeToDb(data, VerificationModal)
                                .then((resp_Added) => {
                                  resolve(resp_Added);
                                })
                                .catch((err) => {
                                  reject(err);
                                });
                            })
                            .catch((err) => {
                              reject(err);
                            });
                        }
                      }
                    );
                  }
                })
                .catch((err) => {
                  reject(err);
                });
            });
        };
        this.sendCode = (data) => {
            return new Promise((resolve, reject) => {
                sendVerificationOtp
                .validateAsync(data)
                .then((validated) => {
                  let code = randomize("0", 4);
                  data.code = code;
      
                  let sendProcess = "";
                  if (data.verificationType === EMAIL) {
                    sendProcess = this.emailVerificationSending;
                    data.email = `${data.verificationOn}`.toLowerCase();
                  } else {
                    sendProcess = this.phoneVerficationSending;
                  }
                  sendProcess(data)
                    .then((respSent) => {
                      resolve(respSent);
                    })
                    .catch((err) => {
                      reject(err);
                    });
                })
                .catch((err) => {
                  this.respDeal(
                    err,
                    reject,
                    "Catch Error, Getting Email From Key Value"
                  );
                });
            });
        };
        
        this.list = () => {
            return new Promise((resolve, reject) => {
                VerificationModal.find()
                    .then(vList => {
                        if (vList.length > 0) {
                            resolve({ message: "Verification Records", list: vList , success: true});
                        } else {
                            this.respDeal({}, reject, "Empty List");
                        }
                    })
                    .catch(err => {
                        this.respDeal(err, reject, 'Catch Error, Getting Verifications List');
                } )
            })
        }

        this.deleteVerification = ( data ) => {
            return new Promise(( resolve, reject ) => {
                idValidator.validateAsync(data)
                .then(validated => {
                    if (data._id === ALL ) {
                        VerificationModal.deleteMany()
                        .then(deleted => {
                            resolve({ message: `Deleted`, deletedId: data._id, success: true });
                        })
                        .catch(err => {
                            this.errDeal(err, reject, `Catch Error, Deleting`);
                        } )
                    } else {
                        VerificationModal.deleteOne({ _id: data._id })
                        .then(deleted => {
                            resolve({ message: `Deleted`, deletedId: data._id, success: true });
                        })
                        .catch(err => {
                            this.errDeal(err, reject, `Catch Error, Deleting`);
                        } )
                    }
                })
                .catch( err => {
                    this.errDeal(err, reject, "Catch Error, Validation");
                } )
            })
        }

        this.removeVerifer = (data) => {
            return new Promise(( resolve, reject ) =>{
                VerificationModal.deleteOne( data )
                    .then(removed => {
                    resolve({ message: "Verifier Removed", success: true });
                } )
                .catch( err => {
                    this.respDeal( err, reject, "Catch Error, Removing Verifier" );
                } )
            })
        }

        this.varifyCodes = (data) => {
            return new Promise((resolve, reject) => {
                console.log("k;kkdsf;ksl;d");
                validateCodeValidator
                  .validateAsync(data)
                  .then((validated) => {
                    console.log("1");
                    let title = titleCase(data.verificationType);
                      VerificationModal.findOne({
                          verificationOn: data.verificationOn,
                          personType: data.personType,
                    })
                      .then(async (foundVerifer) => {
                        if (foundVerifer) {
                          let hours =
                            Math.abs(
                              new Date().getTime() -
                                new Date(foundVerifer.createdAt).getTime()
                            ) / 36e5;
                          let title = titleCase(foundVerifer.verificationMethod);
                          if (hours < AuthValidationPeriod) {
                            if (foundVerifer.code === data.code) {
                              this.removeVerifer({ _id: foundVerifer._id })
                                .then((removed) => {
                                  resolve({
                                    message: "Verfied Succesfully",
                                    success: true,
                                  });
                                })
                                .catch((err) => {
                                  reject(err);
                                });
                            } else {
                              this.respDeal({}, reject, `Invalid Verification ${title}`);
                            }
                          } else {
                            this.removeVerifer({ _id: foundVerifer._id })
                              .then((removed) => {
                                // resolve({ message: "Verfied Succesfully", success: true });
                                this.respDeal({}, reject, `${title} is Expired`);
                              })
                              .catch((err) => {
                                reject(err);
                              });
                          }
                        } else {
                          this.respDeal(
                            {},
                            reject,
                            `No Verfication Request For '${data.verificationOn}'`
                          );
                        }
                      })
                      .catch((err) => {
                        this.respDeal(err, reject, "Catch Error, Compairing Code");
                      });
                  })
                  .catch((err) => {
                    this.respDeal(err, reject, "Catch Error, Validation");
                  });
              });
        }

        this.varifyLinks = (data) => {
            return new Promise((resolve, reject) => {
                console.log("k;kkdsf;ksl;d");
                validateLinkValidator
                  .validateAsync(data)
                  .then((validated) => {
                    console.log("1");
                    let title = titleCase(data.verificationType);
                      VerificationModal.findOne({
                          verificationOn: data.verificationOn,
                          personType: data.personType,
                    })
                      .then(async (foundVerifer) => {
                        if (foundVerifer) {
                              this.removeVerifer({ _id: foundVerifer._id })
                                .then((removed) => {
                                  resolve({
                                    message: "Verified Succesfully",
                                    success: true,
                                  });
                                })
                                .catch((err) => {
                                  reject(err);
                                });
                        } else {
                          this.respDeal(
                            {},
                            reject,
                            `No Verfication Request For '${data.verificationOn}'`
                          );
                        }
                      })
                      .catch((err) => {
                        this.respDeal(err, reject, "Catch Error, Compairing Code");
                      });
                  })
                  .catch((err) => {
                    this.respDeal(err, reject, "Catch Error, Validation");
                  });
              });
        }

    }
}
const MyVerificationController = new VerficatioCalss();
module.exports = MyVerificationController;