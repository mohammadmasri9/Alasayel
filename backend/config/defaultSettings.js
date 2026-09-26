// Website content used until an admin changes it in Website Settings.
// These match the original hard-coded site, so nothing changes visually
// before the first edit. Default images live in frontend/public.

export const DEFAULT_IMAGES = {
  logo: '/logo.png',
  heroImage: '/PortraitLogoPresenting.png',
  aboutImage: '/HomePic.png',
  eventBanner: null, // no banner by default
}

export const IMAGE_FIELDS = Object.keys(DEFAULT_IMAGES)

export const DEFAULT_SETTINGS = {
  // Identity
  siteName: 'مركز الأصايل للفروسية',
  siteNameEn: 'Al-Asayel Equestrian Center',
  tagline: 'شغفٌ بالخيل… أصالةٌ تُصنع في الميدان',
  slogan: 'أصالةٌ في الخيل… شغفٌ في الميدان… وطموحٌ نحو المستقبل.',
  footerAbout:
    'وجهة متخصصة لرياضة الفروسية في قلب مدينة أريحا، تجمع بين شغف الخيل، التدريب، المنافسة، والفعاليات الرياضية.',

  // Home hero
  heroBadge: 'أريحا — فلسطين',
  heroTitle: 'مركز الأصايل',
  heroTitleHighlight: 'للفروسية',
  heroDescription:
    'وجهة متخصصة لرياضة الفروسية تجمع بين شغف الخيل، التدريب، المنافسة، والفعاليات الرياضية، في بيئة تهدف إلى تطوير الفارس والارتقاء بمستوى الفروسية.',

  // Home "about" section. Paragraphs are separated by a blank line.
  aboutTitle: 'الأصايل… أكثر من مجرد',
  aboutTitleHighlight: 'مركز للفروسية',
  aboutDescription:
    'نحن نؤمن بأن الفروسية ليست مجرد رياضة، بل هي علاقة تجمع الإنسان بالخيل، وتعلّم الفارس الانضباط، التركيز، المسؤولية، والثقة.\n\n' +
    'ومن هنا، نسعى إلى بناء مجتمع فروسية حقيقي يجمع الفرسان والمدربين ومربي الخيل ومحبي هذه الرياضة، ويمنح المواهب الشابة فرصة للتعلم والتطور والوصول إلى المنافسات المحلية والدولية.',

  // Contact
  contactPhone: '+970 598 895 481',
  whatsappNumber: '+970 598 895 481',
  contactEmail: 'alasayelequestriancenter@gmail.com',
  address: 'أريحا — فلسطين',
  openingHours: [
    { day: 'السبت — الخميس', time: '8:00 صباحًا — 7:00 مساءً' },
    { day: 'الجمعة', time: '2:00 ظهرًا — 7:00 مساءً' },
  ],
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d847.3344304601623!2d35.47212753928004!3d31.84302404046551!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1789972156732!5m2!1sen!2s',
  mapLinkUrl:
    'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent('مركز الأصايل للفروسية أريحا'),

  // Social (empty = hidden on the site)
  socialLinks: {
    facebook: 'https://www.facebook.com/share/1CYvBCerpK/?mibextid=wwXIfr',
    instagram: 'https://www.instagram.com/alasayel.ec',
    youtube: '',
    tiktok: 'https://www.tiktok.com/@alasayel_equestrian_',
  },
}
