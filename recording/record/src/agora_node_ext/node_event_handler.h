/*
* Copyright (c) 2017 Agora.io
* All rights reserved.
* Proprietry and Confidential -- Agora.io
*/

/*
*  Created by Wang Yongli, 2017
*/

#ifndef AGORA_NODE_EVENT_HANDLER_H
#define AGORA_NODE_EVENT_HANDLER_H

#include "IAgoraRecordingEngine.h"
#include "agora_node_ext.h"
#include <unordered_map>
#include <string>
#include <uv.h>
#include "node_napi_api.h"
namespace agora {
    namespace recording {
#define RTC_EVENT_JOIN_CHANNEL "joinchannel"
#define RTC_EVENT_LEAVE_CHANNEL "leavechannel"
#define RTC_EVENT_ERROR "error"
#define RTC_EVENT_USER_JOINED "userjoined"
#define RTC_EVENT_USER_OFFLINE "userleaved"
        class NodeRecordingSdk;
        class NodeEventHandler
        {
        public:
            struct NodeEventCallback
            {
                Persistent<Function> callback;
                Persistent<Object> js_this;
            };
        public:
            NodeEventHandler(NodeRecordingSdk* pEngine);
            ~NodeEventHandler();
            
            void addEventHandler(const std::string& eventName, Persistent<Object>& obj, Persistent<Function>& callback);

        private:
            std::unordered_map<std::string, NodeEventCallback*> m_callbacks;
            NodeRecordingSdk* m_engine;
        };
    }
}

#endif
