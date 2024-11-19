import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../lib/supabase';

export function SupabaseAuthUI() {
  return (
    <div className="w-full max-w-sm">
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: 'rgb(99 102 241)',
                brandAccent: 'rgb(79 70 229)',
                inputBackground: 'rgba(255, 255, 255, 0.1)',
                inputText: 'white',
                inputPlaceholder: 'rgba(255, 255, 255, 0.5)',
              },
            },
          },
          style: {
            button: {
              background: 'rgb(99 102 241)',
              color: 'white',
              borderRadius: '0.5rem',
            },
            input: {
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              borderRadius: '0.5rem',
            },
            anchor: {
              color: 'rgb(199 210 254)',
            },
            message: {
              color: 'rgb(199 210 254)',
            },
            divider: {
              background: 'rgba(255, 255, 255, 0.1)',
            },
          },
        }}
        providers={['google', 'github']}
        redirectTo={window.location.origin}
        view="magic_link"
        localization={{
          variables: {
            sign_up: {
              email_label: 'Email address',
              password_label: 'Create a password',
              button_label: 'Create account',
              loading_button_label: 'Creating account...',
              social_provider_text: 'Sign in with {{provider}}',
              link_text: 'Don\'t have an account? Sign up',
              confirmation_text: 'Check your email for the confirmation link',
            },
          },
        }}
      />
    </div>
  );
}