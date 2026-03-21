export function register(config?: { onUpdate?: (registration: ServiceWorkerRegistration) => void }) {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`; // Caminho relativo ao build
        navigator.serviceWorker
          .register(swUrl)
          .then(registration => {
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker == null) return;
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('Novo conteúdo disponível; por favor, atualize.');
                    if (config && config.onUpdate) config.onUpdate(registration);
                  } else {
                    console.log('Conteúdo armazenado para uso offline.');
                  }
                }
              };
            };
          })
          .catch(error => console.error('Erro ao registrar o service worker:', error));
      });
    }
  }
  
  export function unregister() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.unregister();
      });
    }
  }