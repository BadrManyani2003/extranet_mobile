/**
 * Charge les variables d'environnement depuis le fichier `.env` statique à la racine du serveur.
 * Permet d'injecter des configurations de production à la volée sans recompiler l'application.
 */
export async function loadEnv(): Promise<void> {
  try {
    // Récupère le fichier .env déployé à côté de index.html
    const response = await fetch('/.env');
    if (!response.ok) {
      console.warn('⚠️ Aucun fichier /.env trouvé sur le serveur. Utilisation des variables de build.');
      return;
    }

    const text = await response.text();
    const env: Record<string, string> = {};

    // Analyse du format KEY=VALUE du fichier .env
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Ignore les lignes vides et les commentaires
      if (!trimmed || trimmed.startsWith('#')) continue;

      const firstEqual = trimmed.indexOf('=');
      if (firstEqual === -1) continue;

      const key = trimmed.substring(0, firstEqual).trim();
      let val = trimmed.substring(firstEqual + 1).trim();

      // Supprime les guillemets si présents
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }

      // Seules les variables préfixées par VITE_ sont exposées
      if (key.startsWith('VITE_')) {
        env[key] = val;
      }
    }

    // Injection dans l'objet global window
    (window as any).APP_ENV = env;
    console.log('✅ Variables d\'environnement dynamiques chargées :', env);
  } catch (error) {
    console.warn('⚠️ Échec du chargement de /.env depuis le serveur. Utilisation des variables de build.', error);
  }
}
