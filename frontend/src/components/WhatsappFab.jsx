import { site } from '../data/site'
import { WhatsappIcon } from './Icons'

export default function WhatsappFab() {
  return (
    <a
      className="fab"
      href={site.whatsapp}
      target="_blank"
      rel="noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      title="تواصل معنا عبر واتساب"
    >
      <WhatsappIcon />
    </a>
  )
}
