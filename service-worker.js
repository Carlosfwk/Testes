const CACHE_NAME = 'fertilizante-relatorio-v1'; // Mude 'v1' para 'v2', 'v3' etc., ao atualizar os arquivos para forçar o cache.
// ATENÇÃO: SUBSTITUA '/relatorio-fertilizante/' PELO NOME DO SEU REPOSITÓRIO NO GITHUB!
const BASE_PATH = '/Testes/'; 

const urlsToCache = [
    `${BASE_PATH}`, // A própria raiz do site (que geralmente aponta para index.html)
    `${BASE_PATH}index.html`,
    `${BASE_PATH}manifest.json`,
    `${BASE_PATH}service-worker.js`, // O Service Worker também deve ser cacheado
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', // Cacheia o jsPDF
    // Adicione aqui os ícones se você os criar (com o BASE_PATH)
    // `${BASE_PATH}icon-192x192.png`,
    // `${BASE_PATH}icon-512x512.png`
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Cache aberto durante a instalação');
                return cache.addAll(urlsToCache); // Adiciona todos os URLs listados ao cache
            })
            .catch(error => {
                console.error('Service Worker: Falha ao cachear URLs durante a instalação:', error);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request) // Tenta encontrar a requisição no cache
            .then((response) => {
                // Se encontrou no cache, retorna a resposta do cache
                if (response) {
                    console.log('Service Worker: Servindo do cache para:', event.request.url);
                    return response;
                }
                // Se não encontrou no cache, faz a requisição à rede
                console.log('Service Worker: Requisitando da rede para:', event.request.url);
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Opcional: Cachear novas requisições (útil para imagens dinâmicas, etc.)
                        // Cuidado ao usar em larga escala para não estourar o cache.
                        // if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                        //     let responseToCache = networkResponse.clone();
                        //     caches.open(CACHE_NAME).then((cache) => {
                        //         cache.put(event.request, responseToCache);
                        //     });
                        // }
                        return networkResponse;
                    });
            })
            .catch(() => {
                // Se a requisição falhar (offline e não no cache), pode retornar uma página offline personalizada
                // console.log('Service Worker: Falha na requisição e não encontrado no cache. Retornando página offline.');
                // return caches.match(`${BASE_PATH}offline.html`); // Exemplo: se você tivesse uma página offline.html
            })
    );
});

self.addEventListener('activate', (event) => {
    // O evento 'activate' é disparado quando o Service Worker é ativado.
    // É um bom lugar para limpar caches antigos.
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deletando cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
