class BroadcastConstants{
    static MICROPHONE = {
        MUTE: 0,
        UNMUTE: 1,
        UNMUTE_REQUEST: 2
    }
    static MEMBER_ROLES = {
        AUDIANCE: 0,
        BROADCASTER: 1
    }

    static BROADCAST_REQUEST_STATUS = {
        PENDING: 0,
        ACCEPTED: 1, 
        REJECTED: 2,
        UNMARKED: 3
    }
    static VIDEO_ENABLED_STATUS = {
        DISABLED: 0,
        ENABLED: 1
    }
  
    static ONLINE_STATUS = {
        OFFLINE: 0, 
        ONLINE: 1
    }
    static ROOM_ACTIONS = {
        OnMicStatus: "onMicStatus", 
        OnMemberRole: "onMemberRole", 
        OnBroadcastRequest: "onBroadcastRequest", 
        OnVideoStatus: "onVideoStatus"
    }
    static TRIBE_INVITE_STATUS = {
        PENDING: 0,
        ACCEPTED: 1, 
        REJECTED: 2,
    }
}
module.exports = BroadcastConstants;