const argv = require('process').argv;
const puppeteer = require('puppeteer');

(async () => {
    const interval = +argv[2] || 60;

    const connect = async() => {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        page.setViewport({ width: 1920, height: 1080 });

        try {
            await page.goto('http://r.wi2.mobi/login');
            await page.click('#button_next_page');
            await page.waitFor('#button_accept');
            await page.click('#button_accept');
        } finally {
            await browser.close();
        }
    };

    for (;;) {
        let retriesLeft = -1;

        for (;;) {
            try {
                await connect();

                console.log(`[${new Date}] Connected`);

                // in case of false positive, keep trying
                retriesLeft = 5;
            } catch (e) {
                console.log(`[${new Date}] Failed to connect (${retriesLeft})`);

                if (!retriesLeft--) {
                    console.log(`[${new Date}] Will try to reconnect in ${interval} minutes`);
                    break;
                }

                await new Promise((resolve) => setTimeout(resolve, 1000 * 10));
            }
        }

        // one minute has already been spent retrying
        await new Promise((resolve) => setTimeout(resolve, 1000 * 60 * (interval - 1)));
    }
})();
