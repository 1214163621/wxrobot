const CryptoJS = require("crypto-js");
const axios = require('axios')
// const fetch = require('node-fetch')
const reallyrelaxedjson = require('really-relaxed-json')
function getGPTPLUSkey() {
    let nn = Math.floor(new Date().getTime() / 1e3);
    const fD = e => {
        let t = CryptoJS.enc.Utf8.parse(e)
            , o = CryptoJS.AES.encrypt(t, '14487141bvirvvG', {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            });
        return o.toString()
    }
    return fD(nn);
}
let parentID_gptplus;
const gptplus = async (your_qus) => {
    let ops = {};
    if (parentID_gptplus) {
        ops = { parentMessageId: parentID_gptplus };
    }

    let data = JSON.stringify({
        secret: getGPTPLUSkey(),
        top_p: 1,
        prompt: your_qus,
        systemMessage: "You are ChatGPT, the version is GPT3.5, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.",
        temperature: 0.8,
        options: ops
    })
    try {
        return await axios.post(`https://api.gptplus.one/chat-process`, data, {
            headers: {
                "Content-Type": "text",
                "Referer": "https://gpt.gogpt.site/",
                "origin": "https://gpt.gogpt.site",
                "accept": "text/plain, */*"
            },
            // responseType: "stream"
        })
    } catch (error) {
        console.error(error)
    }
}

const stra = async () => {
    let stream = await gptplus('你好')

    // let fresponse = reallyrelaxedjson.toJs("["+stream+"]")
    // stream = JSON.stringify(stream)
    console.log(111,stream);
    let nn = "[" + stream + "]"
    console.log(nn);
    let fresponse = reallyrelaxedjson.toJson(nn)

    console.log(fresponse[0])

    console.log(typeof (stream));
    // let str2 = '[' + stream.replace('}{', '},{') + ']'
    // console.log(222, str2);
    // let result = "";
    // const reader = stream.response.getReader();
    // console.log(reader.read)
    // let finalResult;
    // reader.read().then(function processText({ done, value }) {
    //     if (done) {
    //         return;
    //     }
    //     const chunk = value;
    //     result += chunk;
    //     try {
    //         // console.log(normalArray)
    //         let byteArray = new Uint8Array(chunk);
    //         let decoder = new TextDecoder('utf-8');
    //         console.log(decoder.decode(byteArray))
    //         let jsonLines = decoder.decode(byteArray).split("\n");
    //         let nowResult = JSON.parse(jsonLines[jsonLines.length - 1])

    //         if (nowResult.text) {
    //             console.log(nowResult)
    //             finalResult = nowResult.text
    //             showAnserAndHighlightCodeStr(finalResult)
    //         }
    //         if (nowResult.id) {
    //             parentID_gptplus = nowResult.id;
    //         }
    //     } catch (e) {
    //     }
    //     return reader.read().then(processText);
    // })
}


console.log(stra())