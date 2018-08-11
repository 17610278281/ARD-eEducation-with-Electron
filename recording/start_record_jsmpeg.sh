
usage() { echo "Usage: $0 [-c <channel name>] [-i <app id>] [-u <uid>] [-k <channel key>] [-s <session id>]" 1>&2; exit 1; }

while getopts ":c:i:u:k:s:" o; do
    case "${o}" in
        c)
            CHANNEL_NAME=${OPTARG}
            ;;
        i)
            APP_ID=${OPTARG}
            ;;
        k)
            CHANNEL_KEY=${OPTARG}
            ;;
        u)
            recorder=${OPTARG}
            ;;
        s)
            session_id=${OPTARG}
            ;;
        *)
            usage
            ;;
    esac
done
shift $((OPTIND-1))


TS=$session_id

if [ -z "${CHANNEL_NAME}" ] || [ -z "${APP_ID}" ] || [ -z "${session_id}" ]; then
    usage
else
    #ok to go
    # ps aux | grep -ie  Agora_EDU2_Recording_SDK_for_Linux/samples/cpp/release/bin/recorder\ --appid\ ${APP_ID}.*\ --channel\ ${CHANNEL_NAME}.*\ | awk '{print $2}' | xargs kill -s 2
    [ -d ./output ] || mkdir ./output
    rm -rf ./output/${APP_ID}-${CHANNEL_NAME}-${TS}
    [ -d ./output/${APP_ID}-${CHANNEL_NAME}-${TS} ] || mkdir ./output/${APP_ID}-${CHANNEL_NAME}-${TS}
    echo {\"Recording_Dir\":\"`pwd`/output/${APP_ID}-${CHANNEL_NAME}-${TS}\"} > ./output/${APP_ID}-${CHANNEL_NAME}-${TS}/cfg.json

    SCRIPT="nohup ./Agora_EDU2_Recording_SDK_for_Linux/samples/cpp/release/bin/recorder --appId ${APP_ID} --channel ${CHANNEL_NAME} --cfgFilePath ./output/${APP_ID}-${CHANNEL_NAME}-${TS}/cfg.json --appliteDir `pwd`/Agora_EDU2_Recording_SDK_for_Linux/bin/ --channelProfile 1"
    if [ -z "${CHANNEL_KEY}" ]; then
        echo "KEY_NOT_ENABLED"
    else
        SCRIPT="${SCRIPT} --channelKey ${CHANNEL_KEY}"
    fi
    SCRIPT="${SCRIPT} >> ./log/recorder.log 2>&1 &"
    echo $SCRIPT
    eval $SCRIPT
    echo $! > ./output/${APP_ID}-${CHANNEL_NAME}-${TS}/pid
    cat ./log/${APP_ID}-${CHANNEL_NAME}-${TS}.log
fi

