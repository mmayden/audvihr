/**
 * DisclaimerGate — two-step acceptance gate shown before app access.
 * Step 1: Age verification (18+ — lowest global legal age for prediction markets).
 * Step 2: Risk acknowledgement disclaimer.
 * Acceptance is persisted in localStorage so the gate only shows once.
 *
 * @param {React.ReactNode} children - app content rendered after acceptance
 */
import { useState } from 'react';

const LS_KEY = 'disclaimer_accepted';

/** Read acceptance state from localStorage. */
const readAccepted = () => {
  try {
    return localStorage.getItem(LS_KEY) === '1';
  } catch {
    return false;
  }
};

/** Write acceptance state to localStorage. */
const writeAccepted = () => {
  try {
    localStorage.setItem(LS_KEY, '1');
  } catch { /* no-op */ }
};

export const DisclaimerGate = ({ children }) => {
  const [accepted, setAccepted] = useState(readAccepted);
  const [step, setStep] = useState(1);

  if (accepted) return children;

  return (
    <div className="disclaimer-gate">
      <div className="disclaimer-card">
        <div className="disclaimer-wordmark">AUDWIHR</div>

        {step === 1 && (
          <>
            <p className="disclaimer-heading">Age Verification</p>
            <p className="disclaimer-text">
              You must be at least 18 years of age to access this tool.
              Prediction market participation is subject to local laws
              and regulations in your jurisdiction.
            </p>
            <button
              className="disclaimer-btn"
              onClick={() => setStep(2)}
            >
              I confirm I am 18 or older
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="disclaimer-heading">Risk Acknowledgement</p>
            <p className="disclaimer-text">
              This tool is for informational and research purposes only.
              Nothing presented here constitutes financial advice.
              Past performance does not guarantee future results.
              Trading and prediction markets involve substantial risk of
              loss. Only use capital you can afford to lose entirely.
              You are solely responsible for your own decisions.
            </p>
            <button
              className="disclaimer-btn"
              onClick={() => { writeAccepted(); setAccepted(true); }}
            >
              I understand and accept the risks
            </button>
            <button
              className="disclaimer-btn-back"
              onClick={() => setStep(1)}
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
};
