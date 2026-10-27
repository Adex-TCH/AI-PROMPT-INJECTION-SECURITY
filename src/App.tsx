import { useState } from 'react';
import type { DemonstrationResult, ScenarioType, TestResult } from './types';
import { classifyAttack, getMitigation, insecureAssistant, scenarios, secureAssistant, visibleVault } from './security';
import { runAllTests } from './tests';
import './App.css';

export default function App() {
  const [scenario, setScenario] = useState<ScenarioType>('direct');
  const [prompt, setPrompt] = useState('');
  const [document, setDocument] = useState('');
  const [history, setHistory] = useState<DemonstrationResult[]>([]);
  const [tests, setTests] = useState<TestResult[] | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const selected = scenarios[scenario];
  const latest = history[0];
  const execute = () => {
    const actualPrompt = prompt.trim() || selected.prompt;
    const actualDocument = scenario === 'indirect' ? document.trim() || selected.document : undefined;
    const result: DemonstrationResult = {
      id: `${Date.now()}-${Math.random()}`, timestamp: Date.now(), scenario, userPrompt: actualPrompt,
      insecureResponse: insecureAssistant(actualPrompt, actualDocument),
      secureResponse: secureAssistant(actualPrompt, actualDocument),
      classification: classifyAttack(actualPrompt, actualDocument),
    };
    setHistory((items) => [result, ...items].slice(0, 6));
  };
  const reset = () => { setScenario('direct'); setPrompt(''); setDocument(''); setHistory([]); setTests(null); setShowHistory(false); };

  return <div className="app-shell">
    <header className="topbar"><div className="brand-mark">LAB</div><div><p className="eyebrow">GENERATIVE AI · SECURITY EXERCISE</p><h1>AI Prompt Injection Security Lab</h1></div><span className="simulation-pill"><i /> SIMULATION ONLY</span></header>
    <main>
      <section className="intro"><div><p className="eyebrow">CONTROLLED CLASSROOM DEMO</p><h2>Instructions are not permissions.</h2><p>Compare a deliberately vulnerable assistant with an application-secured simulation. Every secret below is fictional.</p></div><div className="intro-stat"><strong>04</strong><span>SCENARIOS</span><b>·</b><strong>07</strong><span>LIVE CHECKS</span></div></section>
      <div className="workspace">
        <aside className="panel controls">
          <div className="panel-heading"><div><span className="step">01 / PLAYGROUND</span><h2>Build a request</h2></div><span className="live-dot">READY</span></div>
          <label htmlFor="scenario">Attack scenario</label>
          <select id="scenario" value={scenario} onChange={(e) => { setScenario(e.target.value as ScenarioType); setPrompt(''); setDocument(''); }}>
            {Object.entries(scenarios).map(([key, item]) => <option value={key} key={key}>{item.name}</option>)}
          </select>
          <p className="field-hint">{selected.description}</p>
          <label htmlFor="prompt">User prompt <span>UNTRUSTED INPUT</span></label>
          <textarea id="prompt" rows={4} value={prompt} placeholder={selected.prompt} onChange={(e) => setPrompt(e.target.value)} />
          {scenario === 'indirect' && <><label htmlFor="document">Retrieved document <span>UNTRUSTED DATA</span></label><textarea id="document" rows={4} value={document} placeholder={selected.document} onChange={(e) => setDocument(e.target.value)} /><p className="field-hint">Leave blank to load the sample with an embedded instruction.</p></>}
          <div className="quick-load"><span>LOAD SAMPLE</span><button onClick={() => setPrompt(selected.prompt)}>Use scenario prompt ↗</button></div>
          <div className="button-row"><button className="primary-button" onClick={execute}>Run comparison <span>→</span></button><button className="reset-button" onClick={reset}>Reset</button></div>
          <div className="vault"><div className="vault-heading"><span className="lock">▣</span><div><h3>Fictional data vault</h3><small>RESTRICTED · DEMO ONLY</small></div></div><div className="vault-secret"><span>CONFIDENTIAL CODE</span><strong>{visibleVault.code}</strong></div><div className="vault-foot"><span>Records: {visibleVault.records}</span><span>Never supplied to secured response logic</span></div></div>
          <div className="allowlist"><span>APPLICATION TOOL ALLOWLIST</span><div>{visibleVault.allowedTools.map((tool) => <code key={tool}>{tool}</code>)}</div></div>
        </aside>
        <section className="results-column">
          <div className="panel output-panel"><div className="panel-heading"><div><span className="step">02 / EXECUTION</span><h2>Side-by-side results</h2></div>{latest && <span className="classification-tag">{latest.classification}</span>}</div>
            {latest ? <><div className="prompt-strip"><span>INPUT</span><p>{latest.userPrompt}</p></div><div className="response-grid">
              <ResponseCard title="Vulnerable assistant" mode="INSECURE MODE" response={latest.insecureResponse} />
              <ResponseCard title="Application-secured" mode="SECURED MODE" response={latest.secureResponse} secure />
            </div><div className="mitigation"><span>CONTROL APPLIED</span><p>{getMitigation(latest.classification)}</p></div></> : <div className="empty-results"><div className="empty-symbol">↗</div><h3>Waiting for a request</h3><p>Choose a scenario and run the comparison to see both assistant behaviors.</p></div>}
          </div>
          <div className="panel test-panel"><div className="panel-heading"><div><span className="step">03 / VERIFICATION</span><h2>Repeatable security checks</h2></div><button className="run-tests" onClick={() => setTests(runAllTests())}>Run all tests <span>→</span></button></div>
            {tests ? <><div className="test-summary"><strong>{tests.filter((t) => t.passed).length}<small>/{tests.length}</small></strong><span>checks passed from executed simulation logic</span><b className={tests.every((t) => t.passed) ? 'all-pass' : 'has-fail'}>{tests.every((t) => t.passed) ? 'ALL PASS' : 'CHECK FAILURES'}</b></div><div className="test-table"><div className="test-head"><span>TEST CASE</span><span>EXPECTED / ACTUAL</span><span>RESULT</span></div>{tests.map((test) => <div className="test-row" key={test.id}><div><strong>{test.name}</strong><small>{test.description}</small></div><div><small>EXPECTED · {test.expected}</small><small>ACTUAL · {test.actual}</small></div><b className={test.passed ? 'pass' : 'fail'}>{test.passed ? 'PASS' : 'FAIL'}</b></div>)}</div></> : <div className="test-placeholder"><span>7</span><p>Attack and benign cases will run against both response paths. Results are calculated on demand.</p></div>}
          </div>
        </section>
      </div>
      <section className="bottom-grid"><div className="panel concept-panel"><span className="step">SECURITY MODEL</span><h2>What changes in secured mode?</h2><div className="concepts"><article><b>01</b><h3>Untrusted stays untrusted</h3><p>User prompts and retrieved documents are treated as data. Embedded instructions cannot change application policy.</p></article><article><b>02</b><h3>Authorization outside generation</h3><p>The secured response path receives no vault secret. Policy denies restricted actions before generating a response.</p></article><article><b>03</b><h3>Tools use an allowlist</h3><p>Only general answers and public document reads are permitted. An attacker cannot grant additional tool access.</p></article></div></div><div className="panel history-panel"><div className="panel-heading"><div><span className="step">SESSION LOG</span><h2>Recent runs <small>{history.length}</small></h2></div><button className="text-button" onClick={() => setShowHistory(!showHistory)}>{showHistory ? 'Hide' : 'Show'} ↗</button></div>{history.length === 0 ? <p className="history-empty">No runs yet. Your comparisons will appear here.</p> : <div className="history-list">{(showHistory ? history : history.slice(0, 3)).map((item) => <div className="history-item" key={item.id}><span className={item.insecureResponse.disclosedSecret || item.insecureResponse.unauthorizedAccess ? 'history-risk' : 'history-ok'}>{item.insecureResponse.disclosedSecret || item.insecureResponse.unauthorizedAccess ? 'VULNERABLE' : 'CLEAR'}</span><div><strong>{item.classification}</strong><small>{item.userPrompt}</small></div><time>{new Date(item.timestamp).toLocaleTimeString()}</time></div>)}</div>}</div></section>
      <p className="disclaimer"><b>SIMULATION LIMITATION</b> These deterministic outcomes demonstrate security design principles. They do not test or prove the safety of a real language model.</p>
    </main><footer><span>AI PROMPT INJECTION SECURITY LAB</span><span>LOCAL · OFFLINE-READY · EDUCATIONAL USE</span></footer>
  </div>;
}

function ResponseCard({ title, mode, response, secure = false }: { title: string; mode: string; response: DemonstrationResult['secureResponse']; secure?: boolean }) {
  const vulnerable = response.disclosedSecret || response.unauthorizedAccess;
  return <article className={`response-card ${secure ? 'secured' : 'insecure'}`}><div className="response-title"><div><span className="mode-label">{mode}</span><h3>{title}</h3></div><span className={`outcome ${secure ? response.blockedReason ? 'blocked' : 'protected' : vulnerable ? 'exposed' : 'normal'}`}>{secure ? response.blockedReason ? 'PREVENTED' : 'SAFE RESPONSE' : vulnerable ? 'DISCLOSURE' : 'RESPONDED'}</span></div><p>{response.response}</p>{response.blockedReason && <small className="reason">↳ {response.blockedReason}</small>}</article>;
}
