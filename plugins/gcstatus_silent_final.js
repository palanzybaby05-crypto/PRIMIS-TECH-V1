let handler = async (m, { conn, args }) => {
let type = (args[0] || '').toLowerCase()
if (type === 'open' || type === 'not_announcement') {
await conn.groupSettingUpdate(m.chat, 'not_announcement')
} else if (type === 'close' || type === 'announcement') {
await conn.groupSettingUpdate(m.chat, 'announcement')
}
}
handler.command = ['gcstatus','gcfullpp','groupstatus']
handler.group = true
handler.admin = true
handler.botAdmin = true
export default handler
