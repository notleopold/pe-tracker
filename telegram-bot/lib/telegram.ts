const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function sendMessage(text: string): Promise<boolean> {
  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHANNEL_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
        link_preview_options: { show_above_text: false },
      }),
    })
    const data = await res.json() as { ok: boolean; description?: string }
    if (!data.ok) {
      console.error('Telegram error:', data.description)
      return false
    }
    return true
  } catch (err) {
    console.error('Failed to send Telegram message:', err)
    return false
  }
}

// Send multiple messages with a delay to avoid rate limits
export async function sendMessages(texts: string[]): Promise<number> {
  let sent = 0
  for (const text of texts) {
    const ok = await sendMessage(text)
    if (ok) sent++
    await sleep(1500) // 1.5s between messages (Telegram limit: 20/min per chat)
  }
  return sent
}
