// Wallet.az OAuth utility - DRY implementation for direct popup login

// PKCE helpers
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function isSecureContext(): boolean {
  return typeof crypto !== 'undefined' && crypto.subtle !== undefined;
}

async function generateCodeChallenge(verifier: string): Promise<{ challenge: string; method: 'S256' | 'plain' }> {
  if (isSecureContext()) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const challenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    return { challenge, method: 'S256' };
  }
  return { challenge: verifier, method: 'plain' };
}

interface WalletLoginOptions {
  locale?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Opens Wallet.az OAuth popup directly (single step)
 * Use this for immediate login without intermediate modal
 */
export async function openWalletLogin(options: WalletLoginOptions = {}): Promise<void> {
  const { locale = 'az', onSuccess, onError } = options;

  try {
    const codeVerifier = generateCodeVerifier();
    const { challenge: codeChallenge, method: codeChallengeMethod } = await generateCodeChallenge(codeVerifier);
    const state = generateUUID();

    sessionStorage.setItem('wallet_code_verifier', codeVerifier);
    sessionStorage.setItem('wallet_oauth_state', state);

    const WALLET_URL = process.env.NEXT_PUBLIC_WALLET_URL || 'http://100.89.150.50:3011';
    const CLIENT_ID = process.env.NEXT_PUBLIC_WALLET_CLIENT_ID || '';
    const REDIRECT_URI = `${window.location.origin}/auth/wallet/callback`;

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: 'profile:name profile:email profile:phone verification:read wallet:charge',
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
      response_type: 'code',
    });

    const authUrl = `${WALLET_URL}/${locale}/oauth/authorize?${params}`;
    const width = 420;
    const height = 520;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const popup = window.open(authUrl, 'wallet_login', `width=${width},height=${height},left=${left},top=${top}`);

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'oauth_success') {
        window.removeEventListener('message', handleMessage);
        popup?.close();
        window.dispatchEvent(new Event('authStateChanged'));

        if (onSuccess) {
          onSuccess();
        } else {
          window.location.reload();
        }
      } else if (event.data?.type === 'oauth_error' || event.data?.type === 'oauth_denied') {
        window.removeEventListener('message', handleMessage);
        popup?.close();
        if (onError) {
          onError(event.data?.message || 'Login failed');
        }
      }
    };
    window.addEventListener('message', handleMessage);

    if (!popup) {
      window.removeEventListener('message', handleMessage);
      if (onError) {
        onError('popup_blocked');
      }
    }
  } catch (err: any) {
    console.error('[Wallet Login] Error:', err);
    if (onError) {
      onError(err.message || 'Login failed');
    }
  }
}

/**
 * Get current locale from pathname
 */
export function getLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/');
  const possibleLocale = segments[1];
  if (['en', 'ru'].includes(possibleLocale)) {
    return possibleLocale;
  }
  return 'az';
}
