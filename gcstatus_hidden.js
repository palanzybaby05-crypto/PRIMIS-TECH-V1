const { bot } = require('../lib/');

bot(
  {
    pattern: 'gcstatus',
    desc: 'Silent status to groups (hidden)',
    type: 'whatsapp',
  },
  async (message, match, m, client) => {
    try {
      let isStatus = false;
      let media = null;
      let text = '';

      // Check if replying to status or image/video
      if (m.quoted) {
        const q = m.quoted;
        const qType = q.type || '';
        
        if (qType.includes('image') || qType.includes('video')) {
          media = await q.download();
          text = q.message || match || '';
          isStatus = true;
        } else {
          text = q.message || '';
          isStatus = true;
        }
      } else if (match) {
        text = match;
        isStatus = true;
      } else if (message.reply_message) {
        text = message.reply_message.text || '';
      }

      if (!text && !media && !match) {
        // Do NOT send error message - stay silent, or only reply to owner
        return;
      }

      const statusJid = 'status@broadcast';
      let buffer = media;

      // If text only status
      if (!buffer && text) {
        // Send to all groups - NO reply, NO success message
        const groups = await client.groupFetchAllParticipating();
        const groupIds = Object.keys(groups);

        for (let id of groupIds) {
          await client.sendMessage(id, { text: text });
          await new Promise(r => setTimeout(r, 1000)); // 1 sec delay to avoid ban
        }
        // NO client.sendMessage with success - completely hidden
        return;
      }

      // If media status
      if (buffer) {
        const groups = await client.groupFetchAllParticipating();
        const groupIds = Object.keys(groups);
        
        for (let id of groupIds) {
          if (media && text) {
            // Check if image or video
            if (m.quoted && m.quoted.type && m.quoted.type.includes('video')) {
              await client.sendMessage(id, { video: buffer, caption: text });
            } else {
              await client.sendMessage(id, { image: buffer, caption: text });
            }
          } else if (buffer) {
            if (m.quoted && m.quoted.type && m.quoted.type.includes('video')) {
              await client.sendMessage(id, { video: buffer });
            } else {
              await client.sendMessage(id, { image: buffer });
            }
          }
          await new Promise(r => setTimeout(r, 1000));
        }
        return; // Silent - no success message
      }

    } catch (e) {
      // Silent error - no message to group
      console.log(e);
    }
  }
);
