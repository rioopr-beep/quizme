const INDEXNOW_KEY = 'cd28be9852cc4cd59e77a63169de3804';
const HOST = 'www.quizfrend.my.id';

export async function submitToIndexNow(urls: string[]): Promise<void> {
  if (urls.length === 0) return;

  try {
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });
  } catch (err) {
    console.error('IndexNow submit failed:', err);
  }
}
