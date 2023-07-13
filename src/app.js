import express from 'express';
import cron from 'node-cron';
import bodyParser from 'body-parser';
import { Configuration, OpenAIApi } from 'openai';
import { getRows, createRow, updateRow, sendText } from './services/index.js';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import fs from 'node:fs';
import https from 'node:https';
import 'dotenv/config';

const app = express();
app.use(bodyParser.json());

ffmpeg.setFfmpegPath(ffmpegPath.path);

const {
  WHATSAPP_API_URL,
  WHATSAPP_TEXT,
  OPENAI_API_KEY,
  SYSTEM_PROMPT,
  CRON_SCHEDULE,
} = process.env;

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/new-task', (req, res) => {
  const { payload } = req.body;
  console.log('[SISTEM] > Yeni görev isteği alındı.');

  if (!fs.existsSync('./audios')) {
    fs.mkdirSync('./audios');
    console.log('[SISTEM] > audios klasörü oluşturuldu.');
  }

  if (payload.hasMedia) {
    const mediaUrl = WHATSAPP_API_URL + payload.mediaUrl;
    console.log('[SISTEM] > Medya dosyası indiriliyor.');

    https.get(mediaUrl, (response) => {
      const fileStream = fs.createWriteStream('./audios/audio.oga');
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        console.log('[SISTEM] > Medya dosyası indirildi.');

        ffmpeg(fs.createReadStream('./audios/audio.oga'))
          .toFormat('mp3')
          .on('error', (err) => {
            console.error(
              '[SISTEM] > ffmpeg ile ses dönüştürülürken hata oluştu:',
              err
            );
          })
          .on('progress', () => {
            console.log('[SISTEM] > ffmpeg dönüşümü devam ediyor');
          })
          .on('end', async () => {
            console.log('[SISTEM] > ffmpeg dönüşümü tamamlandı.');

            try {
              const resp = await openai.createTranscription(
                fs.createReadStream('./audios/audio.mp3'),
                'whisper-1'
              );
              console.log(
                '[SISTEM] > Ses transkripti alındı: ',
                resp.data.text
              );

              const completion = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: [
                  {
                    role: 'system',
                    content: SYSTEM_PROMPT.replace(/\\n/g, '\n'),
                  },
                  {
                    role: 'user',
                    content: resp.data.text,
                  },
                ],
              });

              let completionMessage =
                completion.data.choices[0].message.content;
              console.log(
                '[SISTEM] > Transkript analiz edildi: ',
                completionMessage
              );

              let isJsonValid = /^[\],:{}\s]*$/.test(
                completionMessage
                  .replace(/\\["\\\/bfnrtu]/g, '@')
                  .replace(
                    /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                    ']'
                  )
                  .replace(/(?:^|:|,)(?:\s*\[)+/g, '')
              );

              if (!isJsonValid) {
                console.error(
                  '[SISTEM] > JSON parse edilemedi, lütfen tekrar deneyin.'
                );
                sendText('JSON parse edilemedi, lütfen tekrar deneyin.');
              }

              const json = JSON.parse(completionMessage);

              getRows()
                .then((data) => {
                  console.log(data)
                  if (data.total > 0) {
                    const row = data.data.find(
                      (row) =>
                        row.TARIH ===
                        new Date().toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'numeric',
                          year: 'numeric',
                        })
                    );

                    if (row) {
                      const row_id = row.row_id;

                      updateRow({
                        row_id,
                        TARIH: new Date().toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'numeric',
                          year: 'numeric',
                        }),
                        SAAT: json.totalHours,
                        DURUM: json.tasks
                          .map((task) => {
                            return `${task.name} ${task.description} (${task.hours} saat)`;
                          })
                          .join('\n'),
                      });
                    } else {
                      createRow([
                        [
                          new Date().toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'numeric',
                            year: 'numeric',
                          }),
                          json.totalHours,
                          json.tasks
                            .map((task) => {
                              return `${task.name} ${task.description} (${task.hours} saat)`;
                            })
                            .join('\n'),
                        ],
                      ]);
                    }
                  } else {
                    createRow([
                      [
                        new Date().toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'numeric',
                          year: 'numeric',
                        }),
                        json.totalHours,
                        json.tasks
                          .map((task) => {
                            return `${task.name} ${task.description} (${task.hours} saat)`;
                          })
                          .join('\n'),
                      ],
                    ]);
                  }
                  console.log(
                    '[SISTEM] > Excel ekleme/güncellem işlemi tamamlandı.'
                  );
                })
                .catch((error) => {
                  console.error('[SISTEM] > API hata:', error.message);
                });
            } catch (error) {
              console.error('[SISTEM] > API hata:', error.message);
            }
          })
          .saveToFile('./audios/audio.mp3');
      });
    });
  }

  return res.status(200).json({ status: 'ok' });
});

cron.schedule(
  CRON_SCHEDULE,
  () => {
    sendText(WHATSAPP_TEXT);
    console.log('[SISTEM] > Cron job çalıştırıldı.');
  },
  {
    timezone: 'Europe/Istanbul',
  }
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[SISTEM] > Server listening on port http://localhost:${PORT}`);
});
