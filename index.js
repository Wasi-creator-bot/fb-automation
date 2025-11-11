const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const { delay, randomChoice } = require('./utils');
const config = require('./config.json');

async function start() {
    // Load AppState
    if(!fs.existsSync('appstate.json')) {
        console.log("⚠️ appstate.json missing!");
        process.exit(1);
    }
    const appstate = await fs.readJson('appstate.json');

    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setCookie(...appstate);

    console.log("✅ Logged in using AppState");

    let actionsCount = 0;
    while(true) {
        for(const groupId of config.groups) {
            const groupUrl = `https://www.facebook.com/groups/${groupId}/`;

            await page.goto(groupUrl, { waitUntil: 'networkidle2' });

            // Like posts
            if(config.likePosts) {
                const posts = await page.$$('[role="article"]');
                for(const post of posts) {
                    if(actionsCount >= config.maxActionsPerHour) break;
                    try {
                        const likeBtn = await post.$('div[aria-label="Like"]');
                        if(likeBtn) {
                            await likeBtn.click();
                            actionsCount++;
                            console.log(`Liked a post in group ${groupId}`);
                            await delay(2000 + Math.random()*3000);
                        }
                    } catch(e){ console.log(e); }
                }
            }

            // Comment posts
            if(config.commentPosts) {
                const posts = await page.$$('[role="article"]');
                for(const post of posts) {
                    if(actionsCount >= config.maxActionsPerHour) break;
                    try {
                        const commentBox = await post.$('div[aria-label="Write a comment"]');
                        if(commentBox) {
                            await commentBox.click();
                            await page.keyboard.type(randomChoice(config.comments));
                            await page.keyboard.press('Enter');
                            actionsCount++;
                            console.log(`Commented on a post in group ${groupId}`);
                            await delay(3000 + Math.random()*4000);
                        }
                    } catch(e){ console.log(e); }
                }
            }

            await delay(config.checkInterval * 1000);
        }
    }

    // await browser.close(); // never closes for 24/7
}

start().catch(console.error);