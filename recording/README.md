# Recording Server
> Intergrate [Agora Recording SDK](https://docs.agora.io/cn/2.1.1/addons/Recording/Quickstart%20Guides/recording_c++?platform=C%2B%2B) to provide RESTful API for recording control 

## How to use

First, you should go to [Agora Recording SDK](https://docs.agora.io/cn/2.1.1/addons/Recording/Quickstart%20Guides/recording_c++?platform=C%2B%2B) to download our Recording SDK. Unzip and rename it as 'Agora_EDU2_Recording_SDK_for_Linux'. Move it to '/server'.

Then just install dependency and start server.js.

```bash
# install dependency
npm install
# e.g. use pm2 to start server
pm2 start server.js
```