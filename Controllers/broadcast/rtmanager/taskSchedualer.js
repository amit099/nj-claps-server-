const schedule = require('node-schedule');

class TasksSchedualer{




    constructor(){

        const MEMBER_WAITING_TIME = 30; /// seconds



        this.schedualRemoveMemberWithConditions = (userId) => {
            const currentDate = new Date();
            let userId = userId;
            currentDate.setSeconds(currentDate.getSeconds() + MEMBER_WAITING_TIME);
            const job = schedule.scheduleJob(currentDate, function(memberUserId){
                
                console.log(memberUserId);
                
            }.bind(null,userId));
        }
        this.schedualEndRoomWithConditions = () => {
            
        }
    }   
}
const MyTasksSchedualer = new TasksSchedualer();
module.export = MyTasksSchedualer;