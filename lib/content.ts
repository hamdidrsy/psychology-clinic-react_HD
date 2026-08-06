export const contentNotice =
  "Bu sayfadaki uzmanlık, hizmet ve iletişim metinleri yayın öncesi Hasan Durusoy tarafından doğrulanacaktır.";

export type ServiceContent = {
  slug: string;
  title: string;
  summary: string;
  intro: string;
  suitableFor: string[];
  process: string[];
  relatedArticleSlugs: string[];
};

export const services: ServiceContent[] = [
  {
    slug: "bireysel-gorusmeler",
    title: "Bireysel Görüşmeler",
    summary:
      "Kişinin ihtiyaçlarını ve başvuru nedenini anlamaya odaklanan, sınırları açık görüşme süreci.",
    intro:
      "Bireysel görüşmelerin kapsamı, yöntemi ve uygunluğu ilk değerlendirmede birlikte ele alınır. Bu metin bir tanı veya sonuç vaadi içermez.",
    suitableFor: [
      "Görüşme süreci hakkında bilgi almak isteyen yetişkinler",
      "Yaşadığı güçlüğü güvenli bir çerçevede ele almak isteyen kişiler",
      "Hangi hizmetin uygun olduğundan emin olmayan ziyaretçiler",
    ],
    process: [
      "Randevu talebi iletilir; bu adım kesin randevu oluşturmaz.",
      "Klinik uygun kanal üzerinden geri dönüş yapar.",
      "İlk görüşmede ihtiyaç, beklenti ve çalışma çerçevesi değerlendirilir.",
    ],
    relatedArticleSlugs: ["psikolojik-destek-surecine-baslarken"],
  },
  {
    slug: "cevrim-ici-gorusmeler",
    title: "Çevrim İçi Görüşmeler",
    summary:
      "Uygunluk değerlendirmesinin ardından güvenli iletişim koşullarıyla yürütülmesi planlanan görüşmeler.",
    intro:
      "Çevrim içi görüşmenin kişiye ve başvuru nedenine uygunluğu önceden değerlendirilir. Platform, gizlilik ve fiziksel ortam koşulları görüşme öncesinde açıklanır.",
    suitableFor: [
      "Kliniğe fiziksel erişimi sınırlı olan kişiler",
      "Gizli ve kesintisiz bir görüşme ortamı sağlayabilen yetişkinler",
      "Çevrim içi formatın sınırlarını önceden değerlendirmek isteyenler",
    ],
    process: [
      "Randevu talebinde çevrim içi görüşme tercihi belirtilir.",
      "Uygunluk ve teknik koşullar klinik tarafından değerlendirilir.",
      "Onaylanan kanal ve görüşme bilgileri güvenli biçimde paylaşılır.",
    ],
    relatedArticleSlugs: ["cevrim-ici-gorusme-oncesi-hazirlik"],
  },
  {
    slug: "ilk-gorusme-ve-degerlendirme",
    title: "İlk Görüşme ve Değerlendirme",
    summary:
      "Başvuru nedenini, beklentileri ve uygun çalışma çerçevesini birlikte netleştirmeye yönelik ilk adım.",
    intro:
      "İlk görüşme, kişinin beklentileriyle sunulan hizmetin kapsamını karşılıklı olarak değerlendirmeyi amaçlar. Devam kararı otomatik değildir.",
    suitableFor: [
      "Sürecin nasıl işlediğini öğrenmek isteyenler",
      "Hangi görüşme biçiminin uygun olabileceğini değerlendirenler",
      "Çalışma sınırları ve gizlilik hakkında soru sormak isteyenler",
    ],
    process: [
      "Kısa ve veri minimizasyonlu bir talep iletilir.",
      "Geri dönüşte uygunluk ve zamanlama konuşulur.",
      "İlk görüşmede beklentiler, sınırlar ve sonraki adımlar netleştirilir.",
    ],
    relatedArticleSlugs: ["ilk-gorusmede-neler-konusulur"],
  },
];

export type ArticleContent = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  paragraphs: { heading: string; body: string[] }[];
  relatedServiceSlug: string;
};

export const articles: ArticleContent[] = [
  {
    slug: "psikolojik-destek-surecine-baslarken",
    title: "Psikolojik destek sürecine başlarken",
    excerpt:
      "İlk iletişimden önce hizmet kapsamını, beklentileri ve çalışma koşullarını değerlendirmeye yardımcı kısa bir rehber.",
    category: "Sürece Başlarken",
    publishedAt: "2026-08-06",
    updatedAt: "2026-08-06",
    readingTime: "4 dakika",
    relatedServiceSlug: "bireysel-gorusmeler",
    paragraphs: [
      {
        heading: "Beklentilerinizi düşünün",
        body: [
          "İlk görüşmeden önce bütün ayrıntıları açıklamak zorunda değilsiniz. Süreçten ne beklediğinizi ve hangi konularda bilgi almak istediğinizi birkaç cümleyle düşünmek yeterli olabilir.",
          "Randevu talep formunda özel nitelikli sağlık bilgisi paylaşmak yerine, iletişim kurulabilmesi için gereken asgari bilgileri vermek daha güvenlidir.",
        ],
      },
      {
        heading: "Çalışma çerçevesini sorun",
        body: [
          "Görüşme biçimi, gizlilik sınırları, süre, iptal koşulları ve iletişim yöntemi gibi konuları sormak doğal ve önemlidir. Bu bilgiler, hizmetin ihtiyacınıza uygun olup olmadığını değerlendirmenize yardımcı olur.",
        ],
      },
      {
        heading: "Acil durumlar için doğru kanalı kullanın",
        body: [
          "Bir web sitesindeki randevu formu acil yardım kanalı değildir. Kendinizin veya bir başkasının güvenliğiyle ilgili acil risk varsa bulunduğunuz yerdeki güncel resmi acil yardım kanallarına başvurun.",
        ],
      },
    ],
  },
  {
    slug: "cevrim-ici-gorusme-oncesi-hazirlik",
    title: "Çevrim içi görüşme öncesi hazırlık",
    excerpt:
      "Gizlilik, bağlantı ve fiziksel ortam açısından görüşme öncesinde değerlendirilebilecek temel noktalar.",
    category: "Çevrim İçi Görüşme",
    publishedAt: "2026-08-06",
    updatedAt: "2026-08-06",
    readingTime: "3 dakika",
    relatedServiceSlug: "cevrim-ici-gorusmeler",
    paragraphs: [
      {
        heading: "Gizli ve kesintisiz bir alan seçin",
        body: [
          "Konuşmaların başkaları tarafından duyulmayacağı, mümkünse kapısı kapanan ve görüşme boyunca kesintiye uğramayacağınız bir alan seçin. Kulaklık kullanmak ses gizliliğine yardımcı olabilir.",
        ],
      },
      {
        heading: "Teknik koşulları önceden kontrol edin",
        body: [
          "İnternet bağlantısını, mikrofonu, kamerayı ve cihaz şarjını görüşmeden önce kontrol edin. Kullanılacak platform ve bağlantı bilgileri yalnız klinik tarafından doğrulanan kanaldan gelmelidir.",
        ],
      },
      {
        heading: "Uygunluğu birlikte değerlendirin",
        body: [
          "Çevrim içi format her durum veya kişi için uygun olmayabilir. Uygunluk, ilk iletişim ve değerlendirme sırasında uzmanla birlikte ele alınır.",
        ],
      },
    ],
  },
  {
    slug: "ilk-gorusmede-neler-konusulur",
    title: "İlk görüşmede neler konuşulur?",
    excerpt:
      "İlk görüşmenin amacı, olası konu başlıkları ve soru sorma hakkınız üzerine genel bilgiler.",
    category: "İlk Görüşme",
    publishedAt: "2026-08-06",
    updatedAt: "2026-08-06",
    readingTime: "4 dakika",
    relatedServiceSlug: "ilk-gorusme-ve-degerlendirme",
    paragraphs: [
      {
        heading: "Başvuru nedeni ve beklentiler",
        body: [
          "İlk görüşmede sizi görüşmeye getiren neden, güncel ihtiyaçlarınız ve süreçten beklentileriniz genel hatlarıyla ele alınabilir. Paylaşımın kapsamı çalışma çerçevesi içinde ve karşılıklı iletişimle ilerler.",
        ],
      },
      {
        heading: "Süreç ve sınırlar",
        body: [
          "Gizlilik, görüşme sıklığı, iletişim yöntemi ve hizmetin sınırları açıklanır. Anlaşılmayan veya kaygı uyandıran konularda soru sorabilirsiniz.",
        ],
      },
      {
        heading: "Sonraki adım",
        body: [
          "İlk görüşme sonunda devam biçimi, başka bir hizmete yönlendirme ihtiyacı veya düşünmek için zaman ayırma seçenekleri değerlendirilebilir. İlk görüşme, belirli bir sonucun garantisi değildir.",
        ],
      },
    ],
  },
];

export const faqs = [
  {
    question: "Randevu talebi gönderince randevum kesinleşir mi?",
    answer:
      "Hayır. Form yalnızca iletişim ve randevu talebi oluşturur. Tarih ve saat, klinik geri dönüş yaptıktan sonra karşılıklı olarak netleşir.",
  },
  {
    question: "Formda sağlık bilgisi paylaşmalı mıyım?",
    answer:
      "Hayır. Formda ayrıntılı sağlık öyküsü, tanı, kimlik numarası veya özel nitelikli bilgi paylaşmayın. İletişim kurulması için gereken asgari bilgi yeterlidir.",
  },
  {
    question: "Çevrim içi görüşme herkes için uygun mudur?",
    answer:
      "Her durum için uygun olmayabilir. Kişinin ihtiyacı, gizlilik koşulları ve hizmet kapsamı ilk iletişim sırasında değerlendirilir.",
  },
  {
    question: "Görüşmeler gizli midir?",
    answer:
      "Gizlilik ilkeleri ve yasal/etik sınırlar görüşme sürecinin başında açıklanır. Nihai metin klinik ve hukuk onayından sonra burada yayımlanacaktır.",
  },
  {
    question: "Bu site acil yardım için kullanılabilir mi?",
    answer:
      "Hayır. Randevu formu sürekli izlenen bir acil yardım kanalı değildir. Acil risk durumunda bulunduğunuz yerdeki güncel resmi acil yardım kanallarına başvurun.",
  },
  {
    question: "Geri dönüş ne kadar sürer?",
    answer:
      "Klinik çalışma saatleri ve hedef geri dönüş süresi henüz doğrulanmadı. Onaylanan süre yayınlanana kadar belirli bir yanıt süresi taahhüt edilmemektedir.",
  },
] as const;

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}
