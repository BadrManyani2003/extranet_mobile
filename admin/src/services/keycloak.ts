import Keycloak from 'keycloak-js';

class KeycloakService {
  private static instance: KeycloakService;
  private keycloak: Keycloak;
  private isInitialized: boolean = false;

  private constructor() {
    this.keycloak = new Keycloak({
      url:      import.meta.env.VITE_KEYCLOAK_URL,
      realm:    import.meta.env.VITE_KEYCLOAK_REALM,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    });
  }

  public static getInstance(): KeycloakService {
    if (!KeycloakService.instance) {
      KeycloakService.instance = new KeycloakService();
    }
    return KeycloakService.instance;
  }

  public async init(onAuthenticated: () => void): Promise<void> {
    if (this.isInitialized) return;

    try {
      const authenticated = await this.keycloak.init({
        onLoad:           'login-required',
        pkceMethod:       'S256',
        checkLoginIframe: false,
      });

      if (authenticated) {
        this.isInitialized = true;
        this.setupTokenRefresh();
        this.cleanUrl();
        onAuthenticated();
      } else {
        await this.login();
      }
    } catch (error) {
      console.error('❌ Keycloak initialization failed:', error);
    }
  }

  private setupTokenRefresh(): void {
    setInterval(async () => {
      try {
        await this.keycloak.updateToken(30);
      } catch (error) {
        console.error('❌ Failed to refresh token:', error);
        this.login();
      }
    }, 10000);
  }

  private cleanUrl(): void {
    const url = new URL(window.location.href);
    url.hash = '';
    window.history.replaceState({}, document.title, url.toString());
  }

  public async login(): Promise<void> {
    await this.keycloak.login();
  }

  public async logout(): Promise<void> {
    await this.keycloak.logout({ redirectUri: window.location.origin });
  }

  public getToken(): string | undefined {
    return this.keycloak.token;
  }

  public getAuthenticated(): boolean {
    return this.keycloak.authenticated || false;
  }

  public getRoles(): string[] {
    return this.keycloak.realmAccess?.roles || [];
  }

  public hasRole(role: string): boolean {
    return this.keycloak.hasRealmRole(role);
  }

  public getUserProfile() {
    return this.keycloak.tokenParsed;
  }

  public getSubject(): string | undefined {
    return this.keycloak.subject;
  }

  public async updateToken(minValidity: number): Promise<boolean> {
    return await this.keycloak.updateToken(minValidity);
  }
}

export default KeycloakService.getInstance();