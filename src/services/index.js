import { get, post, put } from './services.js';

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const NO_CODE_GOOGLE_SHEET_API_URL = process.env.NO_CODE_GOOGLE_SHEET_API_URL;
const WHATSAPP_CHAT_ID = process.env.WHATSAPP_CHAT_ID;
const WHATSAPP_SESSION = process.env.WHATSAPP_SESSION;

const getRows = () => get(NO_CODE_GOOGLE_SHEET_API_URL);
const createRow = (data) => {
  console.log('[SISTEM] > Excel satırı oluşturuluyor: ', data);
  return post(NO_CODE_GOOGLE_SHEET_API_URL, 'POST', data)
    .then(() => sendText('Görevleriniz başarıyla KAYDEDİLDİ.'))
    .catch((error) => console.log('Excel eklenirken hata oluştu', error));
};
const updateRow = (data) => {
  console.log('[SISTEM] > Excel satırı güncelleniyor: ', data);
  return put(NO_CODE_GOOGLE_SHEET_API_URL, 'PUT', data)
    .then(() => sendText('Görevleriniz başarıyla GÜNCELLENDİ.'))
    .catch((error) => console.log('Excel güncellenirken hata oluştu', error));
};
const sendText = (text) => {
  console.log('[SISTEM] > Whatsapp mesajı gönderiliyor: ', text);
  return post(`${WHATSAPP_API_URL}/api/sendText`, 'POST', {
    chatId: WHATSAPP_CHAT_ID,
    text: text,
    session: WHATSAPP_SESSION,
  });
};

export { getRows, createRow, updateRow, sendText };
