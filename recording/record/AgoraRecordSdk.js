const EventEmitter = require("events").EventEmitter;
const agora = require("./agorasdk");
const path = require("path");

class AgoraRecordSdk extends EventEmitter {
    constructor() {
        super();
        this.recording = new agora.NodeRecordingSdk();
        this.prepareEvents();
    }

    joinChannel(key, name, uid, appid, cfgPath) {
        let binPath = path.join(__dirname, "./");
        return this.recording.joinChannel(key, name, binPath, appid, uid, cfgPath);
    }

    setMixLayout(layout) {
        return this.recording.setMixLayout(layout);
    }

    prepareEvents() {
        this.recording.onEvent("error", (code, stat) => {
            this.fireEvents("error", {code, stat})
        });
        this.recording.onEvent("joinchannel", (channel, uid) => {
            this.fireEvents("joinchannel", {channel, uid})
        });
        this.recording.onEvent("userjoin", (uid) => {
            this.fireEvents("userjoin", {uid})
        });
        this.recording.onEvent("userleave", (uid, reason) => {
            this.fireEvents("userleave", {uid, reason})
        });
        this.recording.onEvent("leavechannel", reason => {
            this.fireEvents("leavechannel", {reason})
        });
    }

    fireEvents(event, args) {
        setImmediate(() => {
            this.emit(event, args)
        })
    }

    leaveChannel() {
        return this.recording.leaveChannel();
    }
}

module.exports = AgoraRecordSdk;