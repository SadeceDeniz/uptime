require('dotenv').config(); // .env dosyasını yükle
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

// Kontrol edilecek URL'ler
const URLS_TO_CHECK = [
    process.env.URL_TO_CHECK, // .env dosyasından alınan URL
    'https://akeno-n3cn.onrender.com/',
    'https://riasa.onrender.com/',
    'https://tokumeihgbotu-1.onrender.com',  // Yeni link 1
    'https://yeni-link2.com/'   // Yeni link 2
];

const CHANNEL_ID = '1257608204423139339'; // Belirtilen kanal ID'si
const CHECK_INTERVAL = 30000; // Kontrol aralığı (30 saniye)

client.once('ready', () => {
    console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);

    // Her 30 saniyede bir uptime kontrolü yap
    setInterval(async () => {
        for (const url of URLS_TO_CHECK) {
            try {
                const response = await axios.get(url);
                if (response.status === 200) {
                    const channel = await client.channels.fetch(CHANNEL_ID);
                    channel.send(`✅ ${url} çalışıyor!`);
                }
            } catch (error) {
                const channel = await client.channels.fetch(CHANNEL_ID);
                channel.send(`❌ ${url} çalışmıyor!`);
            }
        }
    }, CHECK_INTERVAL);
});

client.on('messageCreate', async (message) => {
    if (message.content === '!uptime') {
        for (const url of URLS_TO_CHECK) {
            try {
                const response = await axios.get(url);
                if (response.status === 200) {
                    message.channel.send(`✅ ${url} çalışıyor!`);
                }
            } catch (error) {
                message.channel.send(`❌ ${url} çalışmıyor!`);
            }
        }
    }
});

client.login(process.env.BOT_TOKEN); // .env dosyasından bot tokenini al
