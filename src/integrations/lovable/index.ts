import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { supabase } from "../supabase/client";

const lovableAuth = createLovableAuth({
  oauthBrokerUrl: "https://oauth.lovable.app/initiate",
});

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

// Use your Lovable project UUID or set VITE_LOVABLE_PROJECT_ID in your environment
const LOVABLE_PROJECT_ID =
  import.meta.env.VITE_LOVABLE_PROJECT_ID || "915a1677-b2c9-4f5c-bba4-64ee8af1042a";

export const lovable = {
  auth: {
    signInWithOAuth: async (
      provider: "google" | "apple" | "microsoft" | "lovable",
      opts?: SignInOptions,
    ) => {
      const result = await lovableAuth.signInWithOAuth(provider, {
        ...opts,
        extraParams: {
          ...opts?.extraParams,
          project_id: LOVABLE_PROJECT_ID,
        },
      });

      if (result.redirected) {
        return result;
      }

      if (result.tokens) {
        await supabase.auth.setSession(result.tokens);
      }

      return result;
    },
  },
};
