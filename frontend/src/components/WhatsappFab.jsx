import { useSettings } from '../hooks/useSettings'
import { WhatsappIcon } from './Icons'

export default function WhatsappFab() {
  const { settings } = useSettings()
  if (!settings.whatsappUrl) return null

  return (
    <a
      className="fab"
      href={settings.whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      title="تواصل معنا عبر واتساب"
    >
      <WhatsappIcon />
    </a>
  )
}
