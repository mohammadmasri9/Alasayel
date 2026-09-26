import mongoose from 'mongoose'

// A single document (key: 'main') holding all editable website content.
// A field that is missing/null means "use the default" from
// config/defaultSettings.js.
const image = { type: new mongoose.Schema({ url: String, publicId: String }, { _id: false }), default: null }
const text = { type: String, default: null }

const websiteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },

    siteName: text,
    siteNameEn: text,
    tagline: text,
    slogan: text,
    footerAbout: text,
    logo: image,

    heroBadge: text,
    heroTitle: text,
    heroTitleHighlight: text,
    heroDescription: text,
    heroImage: image,

    aboutTitle: text,
    aboutTitleHighlight: text,
    aboutDescription: text,
    aboutImage: image,

    eventBanner: image,

    contactPhone: text,
    whatsappNumber: text,
    contactEmail: text,
    address: text,
    openingHours: { type: [{ day: String, time: String, _id: false }], default: undefined },
    mapEmbedUrl: text,
    mapLinkUrl: text,

    socialLinks: {
      facebook: text,
      instagram: text,
      youtube: text,
      tiktok: text,
    },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, minimize: false },
)

export default mongoose.model('WebsiteSettings', websiteSettingsSchema)
