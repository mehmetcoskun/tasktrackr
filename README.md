# TaskTrackr Nedir?

TaskTrackr, bir mesai saat hesaplayıcısıdır. Verilen bir cümleyi analiz ederek toplam çalışma sürenizi ve saat bazında yaptığınız görevleri döndürür. Ayrıca, her gün saat 23:00'te bir hatırlatma mesajı gönderir ve gönderdiğiniz ses kaydını Whisper aracılığıyla transkribe dönüştürerek analiz eder. Elde edilen transkripti JSON formatında bir çıktı üreterek Excel'e kaydeder.

WhatsApp entegrasyonu için .env dosyasında belirttiğiniz WHATSAPP_API_URL'ine post isteği gönderir. Bunun için [whatsapp-web.js](https://wwebjs.dev/) WhatsApp kütüphanesini kullanabilirsiniz. Oluşturduğunuz endpointi WHATSAPP_API_URL'e tanımlamanız yeterli olacaktır.

## Bilgisayarınızda Çalıştırın

Projeyi klonlayın

```bash
  git clone https://link-to-project
```

Proje dizinine gidin

```bash
  cd my-project
```

Projeyi çalıştırmak için aşağıdaki komutu çalıştırın

```bash
  yarn dev
```

## Ortam Değişkenleri

Bu projeyi çalıştırmak için aşağıdaki ortam değişkenlerini .env dosyanıza eklemeniz gerekecek

`WHATSAPP_API_URL=`

`WHATSAPP_CHAT_ID="905555555555@c.us"`

`WHATSAPP_TEXT="Gün sonu raporunu gönder!"`

`WHATSAPP_SESSION=`

`OPENAI_API_KEY="sk-xxx"`

`SYSTEM_PROMPT='Sen bir mesai saati hesaplayıcısın, sana verilen cümleyi analiz et ve toplam kaç saat çalıştığımı ayrıca saat bazlı ne yaptığımı JSON formatında döndür\n\nÖrnek JSON:\n{\n  totalHours: 4,\n  tasks: [\n    {\n      name: "Project Name 1",\n      description: "Description 1",\n      hours: 1,\n    },\n    {\n      name: "Project Name 2",\n      description: "Description 2",\n      hours: 2,\n    },\n  ],\n}\n\nGeriye sadece JSON formatında sonuç döndür!'`

`NO_CODE_GOOGLE_SHEET_API_URL=`

`CRON_SCHEDULE="0 23 * * *"`
