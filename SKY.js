const fs = require('fs');
const path = require('path');
const axios = require('axios');

// ====== PATHS ======
const CONFIG_PATH = path.join(process.cwd(), 'config.json');
const IMAGES_DIR = path.join(process.cwd(), 'bot.bot');
const VIDEO_PATH = path.join(process.cwd(), 'data', 'ptt_saved.mp4');

// ====== CONFIG LOAD ======
let config = {};
if (fs.existsSync(CONFIG_PATH)) {
    try { config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')); } catch (e) { console.error(e); }
}

// ====== HELPERS ======
function getEliteNumbers() {
    const eliteList = config.vipNumbers || config.elite || config.vip || [];
    return eliteList.map(num => num.toString().replace(/[^0-9]/g, ''));
}
function isElite(number) { return getEliteNumbers().includes(number.toString().replace(/[^0-9]/g, '')); }
function extractPureNumber(jid) { return jid ? jid.toString().replace(/[^0-9]/g, '').split(':')[0] : ''; }
function getRandomImage() {
    if (!fs.existsSync(IMAGES_DIR)) return null;
    const files = fs.readdirSync(IMAGES_DIR).filter(f => ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(f).toLowerCase()));
    return files.length > 0 ? path.join(IMAGES_DIR, files[Math.floor(Math.random() * files.length)]) : null;
}

module.exports = {
    name: "اوت",
    alias: ["off", "lockdown", "تعطيل"],
    category: "admin",
    desc: "🔒 قفل وطرد سريع",

    run: async (sock, msg, { reply }) => {
        try {
            const groupJid = msg.key.remoteJid;
            const senderJid = msg.key.participant || msg.key.remoteJid;
            const senderNumber = extractPureNumber(senderJid);
            const botNumber = extractPureNumber(sock.user.id || sock.user.jid);

            if (!groupJid.endsWith('@g.us')) return await reply('❌ هذا الأمر يعمل فقط في القروبات.');
            if (!isElite(senderNumber)) return await reply('❌ هذا الأمر مخصص لأعضاء النخبة فقط!');

            await sock.sendMessage(groupJid, { react: { text: '🫦', key: msg.key } });

            const groupMetadata = await sock.groupMetadata(groupJid);
            const participants = groupMetadata.participants;
            const eliteNumbers = getEliteNumbers();

            // ====== التعديل هنا ======
            // تصحيح منطق سحب الإشراف
            const allAdmins = participants.filter(p => {
                const number = extractPureNumber(p.id);
                // التحقق من الإشراف بدقة
                const isAdmin = p.admin === 'admin' || p.admin === 'superadmin' || p.admin === true;
                const isNotElite = !eliteNumbers.includes(number);
                const isNotBot = number !== botNumber;
                // استثناء المشرف العام إذا أردت (اختياري)
                const isNotSuperAdmin = p.admin !== 'superadmin';
                return isAdmin && isNotElite && isNotBot && isNotSuperAdmin;
            }).map(p => p.id);

            if (allAdmins.length > 0) {
                await sock.groupParticipantsUpdate(groupJid, allAdmins, 'demote');
            }

            await sock.groupSettingUpdate(groupJid, 'announcement');
            await sock.groupUpdateSubject(groupJid, 'مزروفـ🇸🇩داكس');
            await sock.groupUpdateDescription(groupJid, ` ╔═━────━❖♛❖━────━═╗
  خلاص يبيبي حطيت ايدي على ذا الفرع🫦   
\nتبي تعرف كيف انزرفت؟شوف هنا بننزل كل شي قريب\n https://chat.whatsapp.com/FlpLe0qFq3q796nQs5GIq5?s=cl&p=a&ilr=1\nhttps://whatsapp.com/channel/0029Vb8dVm27DAWyFdKNRo22\n?\n
╚═━────━❖♛❖━────━═╝`);
            
            const randomImage = getRandomImage();
            if (randomImage && typeof sock.updateProfilePicture === 'function') {
                try {
                    await sock.updateProfilePicture(groupJid, { url: randomImage });
                } catch (e) {
                    console.error('فشل تغيير صورة القروب:', e.message);
                }
            }

            const allMembers = participants.map(p => p.id);
            const messageText = `𝙎𝙀𝙍𝘼𝙁! 
آل فينرو/سيراف لو اتحدو بصير عظمه 
اتن#كلت? وا تبي تاخذ حقك? تعال هيا وا اخذ حقك 
╔═━────━❖♛❖━────━═╗
      https://whatsapp.com/channel/0029Vb8dVm27DAWyFdKNRo22
╚═━────━❖♛❖━────━═╝
آل فنيرو🫦تنك$يلا بلا حدود`;
            await sock.sendMessage(groupJid, { text: messageText, mentions: allMembers });

            try {
                let videoBuffer;
                if (fs.existsSync(VIDEO_PATH)) {
                    videoBuffer = fs.readFileSync(VIDEO_PATH);
                } else {
                    const response = await axios.get('https://files.catbox.moe/j16yny.mp4', { responseType: 'arraybuffer' });
                    videoBuffer = Buffer.from(response.data);
                }
                await sock.sendMessage(groupJid, { video: videoBuffer, mimetype: 'video/mp4', ptv: true });
            } catch (e) {
                console.error('فشل إرسال الفيديو:', e.message);
            }

            const nonEliteMembers = participants.filter(p => {
                const number = extractPureNumber(p.id);
                // استثناء المشرف العام (superadmin/owner) لأنه لا يمكن طرده
                return !eliteNumbers.includes(number) && number !== botNumber && p.admin !== 'superadmin';
            }).map(p => p.id);
            
            if (nonEliteMembers.length > 0) {
                await sock.groupParticipantsUpdate(groupJid, nonEliteMembers, 'remove');
            }

            console.log('✅ تم تنفيذ الأمر!');
        } catch (error) {
            console.error('❌ خطأ:', error);
            await reply(`❌ حدث خطأ: ${error.message}`);
        }
    }
};
