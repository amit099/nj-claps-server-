class CallPacket{
    constructor(type, to, from, attempt= 0){
        this.type = type;
        this.to = to;
        this.from = from;
        this.attempt = attempt;
    }
}
module.exports = CallPacket;