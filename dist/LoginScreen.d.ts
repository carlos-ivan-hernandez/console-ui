import { type ReactNode } from 'react';
export interface LoginScreenProps {
    /** ASCII art at the top, in the accent color. */
    banner?: string;
    /** Dim lines under the banner, e.g. `myapp 0.1.0 · tty1`. */
    intro?: ReactNode[];
    /** Resolves to an error message, or null on success (then swap this screen out). */
    onSignIn: (user: string, password: string) => Promise<string | null>;
    /** Prompt for the first field. Default `login`. */
    userLabel?: string;
    /** Input type for the first field. Default `email`. */
    userType?: 'email' | 'text';
}
/**
 * A getty-style sign-in: `login:` then `password:`, each answered with Enter;
 * Esc starts over. Both fields live in one form so password managers can fill them.
 */
export declare const LoginScreen: ({ banner, intro, onSignIn, userLabel, userType, }: LoginScreenProps) => import("react").JSX.Element;
