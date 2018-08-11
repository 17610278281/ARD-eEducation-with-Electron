// const ps = require('ps-node');
const exec = require('child_process').exec;
const logger = require('./logger').get('monitor');

let ProcessMonitor = {};
ProcessMonitor.check = (manager) => {
    exec("ps aux | grep /recorder", (error, stdout, stderr) => {
        logger.info(`executing process check...${error} >>> ${stderr}`)
        // logger.info(stdout);
        let lines = stdout.split("\n");
        let processes = [];

        lines.forEach(line => {
            if(line.includes("Agora_EDU2_Recording_SDK_for_Linux")){
                let argsMap = {};
                let trimmed = line.replace(/\s\s+/g, " ");
                //recording session
                logger.info(`start processing ${trimmed}`);
                let line_items = trimmed.split(" ");
                let currentKey = null;
                for (var i = 0; i < line_items.length; i++) {
                    if (line_items[i].startsWith("--")) {
                        currentKey = line_items[i].substr(2);
                        continue;
                    }
                    if (currentKey !== null) {
                        argsMap[currentKey] = line_items[i];
                        currentKey = null;
                    }
                }
                argsMap["pid"] = line_items[1];

                let appid = argsMap.appId || "";
                let channel = argsMap.channel || "";
                let pid = argsMap.pid || "";

                processes.push(argsMap);
            }
        });
        manager.validate(processes);
    });
}


module.exports = ProcessMonitor;