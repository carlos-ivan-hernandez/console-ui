import {type ReactNode, useEffect, useRef, useState} from 'react';

const NO_LINES: ReactNode[] = [];

type Step = 'user' | 'password' | 'busy';

interface HistoryLine {
  id: number;
  text: string;
  kind?: 'error' | 'dim';
}

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
export const LoginScreen = ({
  banner,
  intro = NO_LINES,
  onSignIn,
  userLabel = 'login',
  userType = 'email',
}: LoginScreenProps) => {
  const [step, setStep] = useState<Step>('user');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [history, setHistory] = useState<HistoryLine[]>([]);
  const userRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'user') userRef.current?.focus();
    if (step === 'password') passwordRef.current?.focus();
  }, [step]);

  const submit = async () => {
    if (step === 'user') {
      if (user.trim()) setStep('password');
      return;
    }
    if (step !== 'password' || !password) return;
    setStep('busy');
    const error = await onSignIn(user.trim(), password);
    if (error) {
      setHistory(h => [
        ...h,
        {id: h.length, text: `${userLabel}: ${user.trim()}`},
        {id: h.length + 1, text: 'password:'},
        {id: h.length + 2, text: `Login incorrect: ${error}`, kind: 'error'},
        {id: h.length + 3, text: ''},
      ]);
      setPassword('');
      setStep('password');
    }
  };

  return (
    <div
      className='login'
      onMouseUp={() => {
        // Clicking anywhere puts the caret back on the active prompt, as in a terminal.
        if (globalThis.getSelection()?.toString()) return;
        (step === 'user' ? userRef : passwordRef).current?.focus();
      }}
    >
      {banner && <pre className='login-banner'>{banner}</pre>}
      {intro.map((line, i) => (
        <p
          // Static lines; position is their identity.
          // oxlint-disable-next-line react/no-array-index-key
          key={i}
          className='dim'
        >
          {line}
        </p>
      ))}
      {intro.length > 0 && <br />}
      {history.map(line => (
        <p
          key={line.id}
          className={line.kind}
        >
          {line.text || ' '}
        </p>
      ))}
      <form
        onSubmit={e => {
          e.preventDefault();
          void submit();
        }}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            setPassword('');
            setStep('user');
          }
        }}
      >
        <label className='prompt-line'>
          <span>{userLabel}: </span>
          <input
            ref={userRef}
            className='prompt-input'
            type={userType}
            name={userType === 'email' ? 'email' : 'username'}
            autoComplete='username'
            spellCheck={false}
            value={user}
            readOnly={step !== 'user'}
            onChange={e => setUser(e.target.value)}
            aria-label={userLabel}
          />
        </label>
        {step !== 'user' && (
          <label className='prompt-line'>
            <span>password: </span>
            <input
              ref={passwordRef}
              className='prompt-input'
              type='password'
              name='password'
              autoComplete='current-password'
              value={password}
              readOnly={step === 'busy'}
              onChange={e => setPassword(e.target.value)}
              aria-label='Password'
            />
          </label>
        )}
        {step === 'busy' && <p className='dim'>Authenticating…</p>}
        {/* Lets Enter submit in browsers that need a submit control. */}
        <button
          type='submit'
          hidden
        />
      </form>
    </div>
  );
};
