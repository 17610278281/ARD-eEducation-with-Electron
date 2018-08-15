
usage() { echo "Usage: $0 [-c <channel name>] [-i <app id>] [-s <session id>]" 1>&2; exit 1; }

while getopts ":c:i:s:" o; do
    case "${o}" in
        c)
            CHANNEL_NAME=${OPTARG}
            ;;
        i)
            APP_ID=${OPTARG}
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
    # ps aux | grep -ie  Agora_SS_Recording_SDK_for_Linux/samples/cpp/release/bin/recorder\ --appid\ ${APP_ID}.*\ --channel\ ${CHANNEL_NAME}.*\ | awk '{print $2}' | xargs kill -s 2
    [ -d ./output ] || mkdir ./output
    rm -rf ./output/${APP_ID}-${CHANNEL_NAME}-${TS}
    [ -d ./output/${APP_ID}-${CHANNEL_NAME}-${TS} ] || mkdir ./output/${APP_ID}-${CHANNEL_NAME}-${TS}
    echo {\"Recording_Dir\":\"`pwd`/output/${APP_ID}-${CHANNEL_NAME}-${TS}\"} > ./output/${APP_ID}-${CHANNEL_NAME}-${TS}/cfg.json
fi

