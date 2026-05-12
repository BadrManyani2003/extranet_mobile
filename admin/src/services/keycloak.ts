import Keycloak from 'keycloak-js';

/**
 * Expert Keycloak Configuration & Service
 * Handles authentication, token refreshing, and user profiles.
 */
class KeycloakService {
  private static instance: KeycloakService;
  private keycloak: Keycloak;
  private isInitialized: boolean = false;

  private constructor() {
    this.keycloak = new Keycloak({
      url: import.meta.env.VITE_KEYCLOAK_URL,
      realm: import.meta.env.VITE_KEYCLOAK_REALM,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    });
  }

  public static getInstance(): KeycloakService {
    if (!KeycloakService.instance) {
      KeycloakService.instance = new KeycloakService();
    }
    return KeycloakService.instance;
  }

  /**
   * Initializes Keycloak and sets up token refresh timer
   */
  public async init(onAuthenticated: () => void): Promise<void> {
    if (this.isInitialized) return;

    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'login-required',
        checkLoginIframe: false,
        pkceMethod: 'S256',
      });
      
      if (authenticated) {
        console.log('🔑 Authenticated User ID (id_auth):', this.keycloak.subject);
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
    // Refresh token 30 seconds before it expires
    setInterval(async () => {
      try {
        const refreshed = await this.keycloak.updateToken(30);
        if (refreshed) {
          console.log('✅ Token refreshed successfully');
        }
      } catch (error) {
        console.error('❌ Failed to refresh token:', error);
        this.login(); // Force login if refresh fails
      }
    }, 10000); // Check every 10s
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
    await this.keycloak.logout({
      redirectUri: window.location.origin,
    });
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