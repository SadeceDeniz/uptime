require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const express = require('express');

// HTTP sunucusunu başlat
const app = express();
const port = process.env.PORT || 3000; // Portu çevre değişkenlerinden veya varsayılan olarak 3000'den al

app.get('/', (req, res) => {
  res.send('Bot çalışıyor!');
});

app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const URLS_FILE_PATH = path.join(__dirname, 'urls.json');
const CHECK_INTERVAL = 30000; // 30 saniye
const CHANNEL_ID = '1257608204423139339'; // Log kanalınızın ID'sini buraya ekleyin

// URL'leri JSON dosyasından oku
const getUrls = () => {
    try {
        const data = fs.readFileSync(URLS_FILE_PATH);
        const json = JSON.parse(data);
        return json.urls || [];
    } catch (err) {
        console.error('Error reading URLs file:', err);
        return [];
    }
};

// URL'leri JSON dosyasına yaz
const saveUrls = (urls) => {
    try {
        fs.writeFileSync(URLS_FILE_PATH, JSON.stringify({ urls }, null, 2));
    } catch (err) {
        console.error('Error writing URLs file:', err);
    }
};

// URL'leri kontrol etme
const URLS_TO_CHECK = getUrls();

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

client.once('ready', () => {
    console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);
});

client.on('messageCreate', async (message) => {
     if (message.author.bot) return; // Botun kendine cevap vermesini önleyin

    if (message.content.startsWith('A!linkekle ')) {
        const newUrl = message.content.replace('A!linkekle ', '').trim();
        if (!newUrl) {
            message.channel.send('Lütfen geçerli bir URL girin.');
            return;
        }

        console.log(`Adding URL: ${newUrl}`); // Debug mesajı
        // URL'yi ekle
        const urls = getUrls();
        if (!urls.includes(newUrl)) {
            urls.push(newUrl);
            saveUrls(urls);
            message.channel.send(`URL başarıyla eklendi: ${newUrl}`);
        } else {
            message.channel.send('Bu URL zaten listede.');
        }
    }

    if (message.content.startsWith('A!linksil ')) {
        const urlToRemove = message.content.replace('A!linksil ', '').trim();
        if (!urlToRemove) {
            message.channel.send('Lütfen geçerli bir URL girin.');
            return;
        }

        console.log(`Removing URL: ${urlToRemove}`); // Debug mesajı
        // URL'yi sil
        let urls = getUrls();
        const urlIndex = urls.indexOf(urlToRemove);
        if (urlIndex !== -1) {
            urls.splice(urlIndex, 1);
            saveUrls(urls);
            message.channel.send(`URL başarıyla silindi: ${urlToRemove}`);
        } else {
            message.channel.send('Bu URL listede bulunmuyor.');
        }
    }
});

client.login(process.env.BOT_TOKEN);
