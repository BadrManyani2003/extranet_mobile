import Keycloak from 'keycloak-js'

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
}

const keycloak = new Keycloak(keycloakConfig)

export const initKeycloak = (onAuthenticated: () => void) => {
  keycloak.init({ 
    onLoad: 'login-required',
    checkLoginIframe: false,
    pkceMethod: 'S256'
  })
    .then((authenticated) => {
      if (authenticated) {
        console.log(keycloak.subject)
        // Nettoyer l'URL des paramètres Keycloak (#state, #code, etc.)
        const url = new URL(window.location.href);
        url.hash = ''; // Supprimer le fragment qui contient les infos Keycloak
        window.history.replaceState({}, document.title, url.toString());
        
        onAuthenticated()
      } else {
        keycloak.login()
      }
    })
    .catch((err) => {
      console.error('❌ Keycloak init error:', err)
    })
}

export default keycloak
