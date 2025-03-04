const makeWASocket = require('@whiskeysockets/baileys').default;
const { useSingleFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');

const { state, saveState } = useSingleFileAuthState('./session.json');

async function startBot() {
  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (connection === 'open') {
      console.log('✅ PINk QUEEN MD Bot Connected Successfully!');
    } else if (connection === 'close') {
      console.log('❌ Connection lost. Restarting...');
      startBot();
    }
  });

  // Pairing Code Function
  async function getPairingCode() {
    const phoneNumber = '94712345678'; // <--- ඔබේ WhatsApp Number එක මෙතන දමන්න (Country Code සමඟ)
    const code = await sock.requestPairingCode(phoneNumber);
    console.log(`🔗 Pairing Code: ${code}`);
  }

  getPairingCode(); // Pairing Code Print කරන්න

  sock.ev.on('messages.upsert', async (msg) => {
    const m = msg.messages[0];
    if (!m.message) return;

    const text = m.message.conversation || m.message.extendedTextMessage?.text || '';
    console.log(`📩 New Message: ${text}`);

    if (text.toLowerCase() === '!ping') {
      await sock.sendMessage(m.key.remoteJid, { text: 'Pong! 🏓' });
    }
  });
}

startBot();
