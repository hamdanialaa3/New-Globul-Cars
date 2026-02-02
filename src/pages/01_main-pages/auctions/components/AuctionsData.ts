export interface AuctionItem {
    id: string;
    region: 'usa' | 'de' | 'eu' | 'jp' | 'global';
    title: string;
    descKey: string;
    tagKey: string;
    tagClass: string;
    link: string;
    flagBg: string;
    badge: string;
    btnFlag: string;
}

export const AUCTIONS_DATA: AuctionItem[] = [
    // USA
    { id: 'copart', region: 'usa', title: 'Copart', descKey: 'desc_copart', tagKey: 'type_salvage', tagClass: 'us-tag', link: 'https://www.copart.com', flagBg: 'https://flagcdn.com/svg/us.svg', badge: 'https://flagcdn.com/svg/us.svg', btnFlag: 'https://flagcdn.com/w40/us.png' },
    { id: 'iaai', region: 'usa', title: 'IAAI', descKey: 'desc_iaai', tagKey: 'type_insurance', tagClass: 'us-tag', link: 'https://www.iaai.com', flagBg: 'https://flagcdn.com/svg/us.svg', badge: 'https://flagcdn.com/svg/us.svg', btnFlag: 'https://flagcdn.com/w40/us.png' },
    { id: 'manheim', region: 'usa', title: 'Manheim', descKey: 'desc_manheim', tagKey: 'type_wholesale', tagClass: 'us-tag', link: 'https://www.manheim.com', flagBg: 'https://flagcdn.com/svg/us.svg', badge: 'https://flagcdn.com/svg/us.svg', btnFlag: 'https://flagcdn.com/w40/us.png' },
    { id: 'impact', region: 'usa', title: 'Impact Auto', descKey: 'desc_impact', tagKey: 'type_canada', tagClass: 'us-tag', link: 'https://www.impactauto.ca', flagBg: 'https://flagcdn.com/svg/ca.svg', badge: 'https://flagcdn.com/svg/ca.svg', btnFlag: 'https://flagcdn.com/w40/ca.png' },
    
    // Germany
    { id: 'mobile', region: 'de', title: 'Mobile.de', descKey: 'desc_mobile', tagKey: 'type_marketplace', tagClass: 'de-tag', link: 'https://www.mobile.de', flagBg: 'https://flagcdn.com/svg/de.svg', badge: 'https://flagcdn.com/svg/de.svg', btnFlag: 'https://flagcdn.com/w40/de.png' },
    { id: 'autoscout', region: 'de', title: 'AutoScout24', descKey: 'desc_autoscout', tagKey: 'type_eu_wide', tagClass: 'de-tag', link: 'https://www.autoscout24.com', flagBg: 'https://flagcdn.com/svg/eu.svg', badge: 'https://flagcdn.com/svg/eu.svg', btnFlag: 'https://flagcdn.com/w40/eu.png' },

    // Europe
    { id: 'openlane', region: 'eu', title: 'Openlane', descKey: 'desc_adesa', tagKey: 'type_auction', tagClass: 'eu-tag', link: 'https://www.openlane.eu', flagBg: 'https://flagcdn.com/svg/eu.svg', badge: 'https://flagcdn.com/svg/eu.svg', btnFlag: 'https://flagcdn.com/w40/eu.png' },
    { id: 'bca', region: 'eu', title: 'BCA Europe', descKey: 'desc_bca', tagKey: 'type_remarketing', tagClass: 'eu-tag', link: 'https://www.bca.com', flagBg: 'https://flagcdn.com/svg/eu.svg', badge: 'https://flagcdn.com/svg/eu.svg', btnFlag: 'https://flagcdn.com/w40/eu.png' },
    { id: 'exleasing', region: 'eu', title: 'Exleasingcar', descKey: 'desc_exleasing', tagKey: 'type_leasing', tagClass: 'eu-tag', link: 'https://www.exleasingcar.com', flagBg: 'https://flagcdn.com/svg/eu.svg', badge: 'https://flagcdn.com/svg/eu.svg', btnFlag: 'https://flagcdn.com/w40/eu.png' },
    { id: 'kvd', region: 'eu', title: 'KVD Cars', descKey: 'desc_kvd', tagKey: 'type_nordic', tagClass: 'eu-tag', link: 'https://www.kvdcars.com', flagBg: 'https://flagcdn.com/svg/se.svg', badge: 'https://flagcdn.com/svg/se.svg', btnFlag: 'https://flagcdn.com/w40/se.png' },

    // Japan
    { id: 'sbt', region: 'jp', title: 'SBT Japan', descKey: 'desc_sbt', tagKey: 'type_export', tagClass: 'jp-tag', link: 'https://www.sbtjapan.com', flagBg: 'https://flagcdn.com/svg/jp.svg', badge: 'https://flagcdn.com/svg/jp.svg', btnFlag: 'https://flagcdn.com/w40/jp.png' },
    { id: 'beforward', region: 'jp', title: 'Be Forward', descKey: 'desc_beforward', tagKey: 'type_export', tagClass: 'jp-tag', link: 'https://www.beforward.jp', flagBg: 'https://flagcdn.com/svg/jp.svg', badge: 'https://flagcdn.com/svg/jp.svg', btnFlag: 'https://flagcdn.com/w40/jp.png' },
    { id: 'uss', region: 'jp', title: 'USS Auction', descKey: 'desc_uss', tagKey: 'type_auction', tagClass: 'jp-tag', link: 'http://www.ussnet.co.jp/en/', flagBg: 'https://flagcdn.com/svg/jp.svg', badge: 'https://flagcdn.com/svg/jp.svg', btnFlag: 'https://flagcdn.com/w40/jp.png' },

    // Global
    { id: 'autowini', region: 'global', title: 'Autowini', descKey: 'desc_autowini', tagKey: 'type_korea', tagClass: 'gl-tag', link: 'https://www.autowini.com', flagBg: 'https://flagcdn.com/svg/kr.svg', badge: 'https://flagcdn.com/svg/kr.svg', btnFlag: 'https://flagcdn.com/w40/kr.png' },
    { id: 'encar', region: 'global', title: 'Encar', descKey: 'desc_encar', tagKey: 'type_korea', tagClass: 'gl-tag', link: 'http://www.globalencar.com', flagBg: 'https://flagcdn.com/svg/kr.svg', badge: 'https://flagcdn.com/svg/kr.svg', btnFlag: 'https://flagcdn.com/w40/kr.png' },
    { id: 'emirates', region: 'global', title: 'Emirates', descKey: 'desc_emirates', tagKey: 'type_uae', tagClass: 'gl-tag', link: 'https://www.emiratesauction.com', flagBg: 'https://flagcdn.com/svg/ae.svg', badge: 'https://flagcdn.com/svg/ae.svg', btnFlag: 'https://flagcdn.com/w40/ae.png' },
];

export interface TranslationData {
    header_title: string;
    header_sub: string;
    search_placeholder: string;
    
    // Section Titles
    usa_title: string;
    de_title: string;
    eu_title: string;
    jp_title: string;
    global_title: string;
    
    // Stats
    stat_live: string;
    stat_sold: string;
    stat_bidders: string;
    stat_transit: string;
  
    // Types
    type_salvage: string;
    type_insurance: string;
    type_wholesale: string;
    type_marketplace: string;
    type_eu_wide: string;
    type_auction: string;
    type_leasing: string;
    type_canada: string;
    type_remarketing: string;
    type_nordic: string;
    type_export: string;
    type_korea: string;
    type_uae: string;
  
    // Descriptions
    desc_copart: string;
    desc_iaai: string;
    desc_manheim: string;
    desc_impact: string;
    desc_mobile: string;
    desc_autoscout: string;
    desc_adesa: string;
    desc_bca: string;
    desc_exleasing: string;
    desc_kvd: string;
    desc_sbt: string;
    desc_beforward: string;
    desc_uss: string;
    desc_autowini: string;
    desc_encar: string;
    desc_emirates: string;
  
    btn_visit: string;
    footer_rights: string;
    
    [key: string]: string; // Index signature for dynamic access
}

export type Lang = 'en' | 'bg';

export const AUCTION_TRANSLATIONS: Record<Lang, TranslationData> = {
    en: {
        header_title: "Global Auction Gateways",
        header_sub: "The ultimate directory for vehicle auctions from USA, Europe, Japan, and Korea.",
        search_placeholder: "Search for auction (e.g. Copart, Japan, Salvage)...",
        
        usa_title: "USA & North America",
        de_title: "German Market",
        eu_title: "Europe & Leasing",
        jp_title: "Japan Market",
        global_title: "Korea, UAE & Others",
        
        stat_live: "Live Auctions",
        stat_sold: "Sold Today (Global)",
        stat_bidders: "Active Bidders",
        stat_transit: "Vehicles in Transit",
  
        type_salvage: "Salvage & Used",
        type_insurance: "Insurance",
        type_wholesale: "Wholesale",
        type_marketplace: "Marketplace",
        type_eu_wide: "EU Wide",
        type_auction: "Dealer Auction",
        type_leasing: "Ex-Leasing",
        type_canada: "Canadian Auction",
        type_remarketing: "Remarketing",
        type_nordic: "Nordic Auction",
        type_export: "Global Exporter",
        type_korea: "South Korea",
        type_uae: "Middle East",
  
        desc_copart: "The world's largest online car auction. Huge inventory of repairable vehicles.",
        desc_iaai: "Premium insurance auto auctions. Great for parts or restoration projects.",
        desc_manheim: "Largest wholesale marketplace. Mostly for licensed dealers.",
        desc_impact: "Leading salvage auction in Canada. Good for specific market needs.",
        
        desc_mobile: "Germany's biggest vehicle market. Essential for finding specific German cars.",
        desc_autoscout: "Pan-European marketplace with a heavy focus on German inventory.",
        
        desc_adesa: "Professional platform for car traders across Europe. Formerly Adesa.",
        desc_bca: "Europe's largest vehicle remarketing company with auctions in multiple countries.",
        desc_exleasing: "Vehicles directly from banks and leasing companies across EU.",
        desc_kvd: "Sweden's largest marketplace. Great for winter-spec vehicles and Volvos.",
  
        desc_sbt: "One of the largest global used car exporters. Huge stock ready for shipping.",
        desc_beforward: "Popular choice for export. Competitive prices and reliable shipping.",
        desc_uss: "The largest auction group in Japan. Requires a registered agent to bid.",
  
        desc_autowini: "The leading marketplace for Korean cars (Hyundai, Kia) for export.",
        desc_encar: "Korea's largest used car trading platform. Massive domestic inventory.",
        desc_emirates: "Leading auction in UAE. Luxury cars and government fleet sales.",
  
        btn_visit: "Visit Website",
        footer_rights: "All Rights Reserved."
    },
    bg: {
        header_title: "Глобални Автомобилни Търгове",
        header_sub: "Крайната директория за автомобилни търгове от САЩ, Европа, Япония и Корея.",
        search_placeholder: "Търсете търг (напр. Copart, Япония, Salvage)...",
  
        usa_title: "САЩ и Северна Америка",
        de_title: "Немски Пазар",
        eu_title: "Европа и Лизинг",
        jp_title: "Японски Пазар",
        global_title: "Корея, ОАЕ и Други",
        
        stat_live: "Активни Търгове",
        stat_sold: "Продадени Днес (Глобално)",
        stat_bidders: "Активни Купувачи",
        stat_transit: "Автомобили на път",
  
        type_salvage: "Употребявани & Salvage",
        type_insurance: "Застрахователни",
        type_wholesale: "Търговия на едро",
        type_marketplace: "Обяви",
        type_eu_wide: "Цяла Европа",
        type_auction: "Дилърски Търгове",
        type_leasing: "Върнати от Лизинг",
        type_canada: "Канадски Търг",
        type_remarketing: "Ремаркетинг",
        type_nordic: "Скандинавски Пазар",
        type_export: "Глобален Износител",
        type_korea: "Южна Корея",
        type_uae: "Близък Изток",
  
        desc_copart: "Най-големият онлайн търг в света. Огромен избор на автомобили за ремонт.",
        desc_iaai: "Премиум застрахователни търгове. Чудесни за части или реставрация.",
        desc_manheim: "Най-големият пазар на едро. Основно за лицензирани дилъри.",
        desc_impact: "Водещ търг за salvage автомобили в Канада.",
  
        desc_mobile: "Най-големият пазар в Германия. Основен източник за немски коли.",
        desc_autoscout: "Паневропейски пазар със силен фокус върху немския инвентар.",
  
        desc_adesa: "Професионална платформа за търговци в Европа. Бившата Adesa.",
        desc_bca: "Най-голямата компания за ремаркетинг в Европа с търгове в много страни.",
        desc_exleasing: "Автомобили директно от банки и лизингови компании в ЕС.",
        desc_kvd: "Най-големият пазар в Швеция. Страхотен за зимни автомобили и Волво.",
  
        desc_sbt: "Един от най-големите износители. Огромен склад готов за доставка.",
        desc_beforward: "Популярен избор за експорт. Конкурентни цени и надеждна доставка.",
        desc_uss: "Най-голямата аукционна група в Япония. Изисква се регистриран агент.",
  
        desc_autowini: "Водещият пазар за корейски автомобили (Hyundai, Kia) за износ.",
        desc_encar: "Най-голямата платформа за употребявани коли в Корея. Огромен инвентар.",
        desc_emirates: "Водещ търг в ОАЕ. Луксозни коли и правителствени разпродажби.",
  
        btn_visit: "Към Сайта",
        footer_rights: "Всички права запазени."
    }
};
