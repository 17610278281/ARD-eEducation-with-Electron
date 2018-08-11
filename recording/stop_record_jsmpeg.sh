
usage() { echo "Usage: $0 [-c <channel name>] [-i <app id>] [-s <session id>]" 1>&2; exit 1; }

while getopts ":s:c:i:" o; do
    case "${o}" in
        s)
            session_id=${OPTARG}
            ;;
        c)
            cname=${OPTARG}
            ;;
        i)
            appid=${OPTARG}
            ;;
        *)
            usage
            ;;
    esac
done
shift $((OPTIND-1))


if [ -z "${cname}" ] || [ -z "${appid}" ] || [ -z "${session_id}" ]; then
    usage
else
    #ok to go
    # ps aux | grep -ie  Agora_EDU2_Recording_SDK_for_Linux/samples/cpp/release/bin/recorder\ --appid\ ${APP_ID}.*\ --channel\ ${CHANNEL_NAME}.*\ | awk '{print $2}' | xargs kill -s 2
    # rm -rf ./output/${APP_ID}-${CHANNEL_NAME}-${TS}
    kill -s 2 $(< ./output/${appid}-${cname}-${session_id}/pid)
fi

