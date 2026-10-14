 import { Client } from 'meowsab';
import { group, access } from "./system/control.js";
import UltraDB from "./system/UltraDB.js";
import sub from './sub.js';

/* =========== Client ========== */
const client = new Client({
  phoneNumber: '963982202146', // Bot number
  prefix: [".", "/", "!"],
  fromMe: false, 
  owners: [{
  "name": "SKY",
  "jid": "https://wa.me/208968043516029",
  "lid": "216647327604814@lid"
},
  {
  "name": "R∆yGumo",
  "jid": "201201609786@s.whatsapp.net",
  "lid": "198269162545375@lid"
}
          , {
  "name": "Hedes",
  "jid": "201037731259@s.whatsapp.net",
  "lid": "@lid"
             }

  ],
  settings: { noWelcome: false },
  commandsPath: './plugins'
});

client.onGroupEvent(group);
client.onCommandAccess(access);

/* =========== Database ========== */
if (!global.db) {
    global.db = new UltraDB();
}

/* =========== Config ========== */
const { config } = client;
config.info = { 
  nameBot: "𝑆𝐼𝑀O", 
  nameChannel: "✦『 𝑻𝒘𝒊𝒍𝒊𝒈𝒉𝒕 𝑻𝒆𝒂𝒎 』✦", 
  idChannel: "120363409255768764@newsletter",
  urls: {
    repo: "https://github.com/deveni0/Pomni-AI",
    api: "https://emam-api.web.id",
    channel: "https://whatsapp.com/channel/0029VaQim2bAu3aPsRVaDq3v"
  },
  copyright: { 
    pack: 'Simo', 
    author: 'S'
  },
  images: [
    "https://files.catbox.moe/4gchpq.jpg",
    "https://files.catbox.moe/4gchpq.jpg",
    "https://files.catbox.moe/4gchpq.jpg"
  ]
};

/* =========== Start ========== */
client.start();

setTimeout(async () => {
if (client.commandSystem) { 
sub(client)
  }
}, 2000);


/* =========== Catch Errors ========== */
process.on('uncaughtException', (e) => {
    if (e.message.includes('rate-overlimit')) {}
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err)
});


/* 
=========== Memory Monitor ========== 

setInterval(() => {
    const used = process.memoryUsage().rss / 1024 / 1024
    if (used > 800) {
        console.log(`🔄 Bot memory full (${used.toFixed(1)}MB), restarting...`)
        process.exit(1) 
    }
}, 300_000) 

*/
