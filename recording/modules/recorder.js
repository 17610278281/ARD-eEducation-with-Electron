const logger = require("./logger").get("es");
const path = require("path");
const Utils = require("./utils");
const fs = require("fs");
const RecordSDK = require("../record/AgoraRecordSdk");
const exec = require("child_process").exec;

class RecorderManager {
    constructor() {
        this.recordings = {};
    }

    findRecorders(appid, channel) {
        let manager = this;
        let recorders = [];
        Object.keys(this.recordings).forEach(sid => {
            let recorder = manager.recordings[sid];
            if (appid === recorder.appid && channel === recorder.channel) {
                recorders.push(recorder);
            }
        });
        return recorders;
    }

    join(recorder, key, cfgpath) {
        return new Promise((resolve, reject) => {
            const { appid, channel, sdk, sessionid } = recorder;
            logger.info(`begin join channel`);
            sdk.once("error", ({err, stat}) => {
                logger.info(`error: ${err} ${stat}`);
                reject({ code: 433, message: `internal error: ${err}` });
            });
            sdk.on("joinchannel", ({channel, uid}) => {
                logger.info(`joined channel ${channel} ${uid}`);

                sdk.on("error", ({err, stat}) => {
                    logger.info(`recorder stopped with code ${err} stat ${stat}`)
                    this.stop(appid, channel, sessionid);
                });
                
                resolve();
            });
            sdk.on("userjoin", ({uid}) => {
                logger.info(`userjoin ${uid}`);
                recorder.uids.push(uid);
                this.updateLayout(recorder);
            });

            sdk.on("userleave", ({uid, reason}) => {
                logger.info(`userleave ${uid} reason ${reason}`);
                recorder.uids = recorder.uids.filter(item => item !== uid);
                this.updateLayout(recorder);
            });

            //set dummy layout
            this.updateLayout(recorder);


            sdk.joinChannel(key, channel, 0, appid, cfgpath);
        });
    }

    leave(recorder) {
        const { sdk } = recorder;
        sdk.on("leavechannel", ({reason}) => {
            logger.info(`leaving channel with code ${reason}`);
        });

        sdk.leaveChannel();
        return Promise.resolve();
    }

    updateLayout(recorder) {
        const {sdk, uids} = recorder;
        const sliced = Object.assign([], uids).splice(0, 4);
        let layout = {
            "canvasWidth": 640,
            "canvasHeight": 480,
            "backgroundColor": "#000000",
            "regionCount": sliced.length,
            "regions": []
        };

        switch (sliced.length) {
            case 0:
                break;
            case 1:
                layout.regions = [{
                    "x": 0,
                    "y": 0,
                    "width": 640,
                    "height": 480,
                    "zOrder": 1,
                    "alpha": 1,
                    "uid": sliced[0]
                }];
                break;
            case 2:
                layout.regions = [{
                    "x": 0,
                    "y": 0,
                    "width": 320,
                    "height": 480,
                    "zOrder": 1,
                    "alpha": 1,
                    "uid": sliced[0]
                }, {
                    "x": 320,
                    "y": 0,
                    "width": 320,
                    "height": 480,
                    "zOrder": 1,
                    "alpha": 1,
                    "uid": sliced[1]
                }];
                break;
            case 3:
                layout.regions = [{
                    "x": 0,
                    "y": 0,
                    "width": 320,
                    "height": 240,
                    "zOrder": 1,
                    "alpha": 1,
                    "uid": sliced[0]
                }, {
                    "x": 320,
                    "y": 0,
                    "width": 320,
                    "height": 240,
                    "zOrder": 1,
                    "alpha": 1,
                    "uid": sliced[1]
                }, {
                    "x": 0,
                    "y": 240,
                    "width": 640,
                    "height": 240,
                    "zOrder": 1,
                    "alpha": 1,
                    "uid": sliced[2]
                }];
                break;
            case 4:
                layout.regions = [{
                    "x": 0,
                    "y": 0,
                    "width": 320,
                    "height": 240,
                    "zOrder": 1,
                    "alpha": 1,
                    "uid": sliced[0]
                }, {
                    "x": 320,
                    "y": 0,
                    "width": 320,
                    "height": 240,
                    "zOrder": 1,
                    "alpha": 1,
                    "uid": sliced[1]
                }, {
                    "x": 0,
                    "y": 240,
                    "width": 320,
                    "height": 240,
                    "zOrder": 1,
                    "alpha": 1,
                    "uid": sliced[2]
                }, {
                    "x": 320,
                    "y": 240,
                    "width": 320,
                    "height": 240,
                    "zOrder": 1,
                    "alpha": 1,
                    "uid": sliced[3]
                }];
                break;
        }
        sdk.setMixLayout(layout);
    }

    /** lifecycles */
    start(appid, channel, options) {
        let manager = this;

        return new Promise((resolve, reject) => {
            let key = options.key || undefined;
            let appliteDir = path.join(__dirname, "/rec/");
            let sessionid = Utils.rand(32);

            let script = `bash prepare_cfg.sh -i ${appid} -c ${channel} -s ${sessionid}`;
            logger.info(script);

            let folder = path.join(__dirname, `../output/${appid}-${channel}-${sessionid}/`);
            let ts = new Date();

            let recorder = {
                appid: appid,
                channel: channel,
                sdk: new RecordSDK(),
                sessionid: sessionid,
                ts: parseInt(ts.getTime() / 1000),
                path: folder,
                uids: []
            };
            manager.recordings[sessionid] = recorder;

            exec(script, (error, stdout, stderr) => {
                this.join(recorder, key, path.join(folder, "cfg.json")).then(() => {
                    logger.info(`recording started`);
                    resolve(recorder);
                }).catch(e => {
                    logger.error(e);
                    this.stop(appid, channel, sessionid);
                    reject(e);
                });
            });
        });
    }
    stop(appid, channel, sid) {
        let manager = this;
        let recorder = this.recordings[sid];

        if (!recorder) {
            return Promise.reject("unrecognized_sid");
        }

        if (recorder.appid !== appid || recorder.channel !== channel) {
            return Promise.reject("not_match_appid_channel");
        }

        return new Promise((resolve, reject) => {
            logger.info(`stopping recorder ${appid} ${channel} ${sid}`);
            this.leave(recorder);
            delete this.recordings[sid];
            let recorderList = [];
            Object.keys(this.recordings).forEach(key => {
                const r = this.recordings[key];
                const {sessionid, appid, channel} = r;
                recorderList.push({
                    appid: appid,
                    channel: channel,
                    session: sessionid
                });
            });
            logger.info(`stopped recorder, remaining recorders ${JSON.stringify(recorderList)}`);
            resolve();
        });
    }
}


module.exports = {
    RecorderManager: RecorderManager
};