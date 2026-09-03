// Abertura do Banco Local IndexedDB
const request = indexedDB.open('ATER_Offline_DB', 1);
let dbOffline;

request.onupgradeneeded = (e) => {
  dbOffline = e.target.result;
  if (!dbOffline.objectStoreNames.contains('filaAtividades')) {
    dbOffline.createObjectStore('filaAtividades', { keyPath: 'id', autoIncrement: true });
  }
};

request.onsuccess = (e) => { dbOffline = e.target.result; };

// Salva atividade no cache local caso esteja sem rede
function salvarOffline(dadosAtividade) {
  const transaction = dbOffline.transaction(['filaAtividades'], 'readwrite');
  const store = transaction.objectStore('filaAtividades');
  store.add({ ...dadosAtividade, timestamp: new Date() });

  alert('⚠️ Sem conexão. Atividade salva no dispositivo e será sincronizada automaticamente ao ficar online!');
}

// Sincroniza a fila local com o Google Apps Script quando a conexão é restabelecida
async function sincronizarComServidor() {
  if (!navigator.onLine || !dbOffline) return;

  const transaction = dbOffline.transaction(['filaAtividades'], 'readwrite');
  const store = transaction.objectStore('filaAtividades');
  const requestAll = store.getAll();

  requestAll.onsuccess = () => {
    const fila = requestAll.result;
    if (fila.length === 0) return;

    fila.forEach((item) => {
      google.script.run
        .withSuccessHandler(() => {
          // Remover do banco offline após confirmação de envio
          const delTx = dbOffline.transaction(['filaAtividades'], 'readwrite');
          delTx.objectStore('filaAtividades').delete(item.id);
          console.log(`Atividade ${item.id} sincronizada com sucesso.`);
        })
        .salvarAtividadeServidor(item);
    });
  };
}

// Event Listeners globais de estado da rede
window.addEventListener('online', sincronizarComServidor);