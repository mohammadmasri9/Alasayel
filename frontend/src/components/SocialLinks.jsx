import { useSettings } from '../hooks/useSettings'
import { FacebookIcon, InstagramIcon, TiktokIcon, YoutubeIcon } from './Icons'

const NETWORKS = [
  ['facebook', 'فيسبوك', FacebookIcon],
  ['instagram', 'إنستغرام', InstagramIcon],
  ['youtube', 'يوتيوب', YoutubeIcon],
  ['tiktok', 'تيك توك', TiktokIcon],
]

// Social buttons from Website Settings. Empty links are not shown.
export default function SocialLinks() {
  const { settings } = useSettings()
  const links = NETWORKS.filter(([key]) => settings.socialLinks?.[key])
  if (links.length === 0) return null

  return (
    <div className="socials">
      {links.map(([key, label, Icon]) => (
        <a key={key} className="social-btn" href={settings.socialLinks[key]} target="_blank" rel="noreferrer" aria-label={label}>
          <Icon />
        </a>
      ))}
    </div>
  )
}
