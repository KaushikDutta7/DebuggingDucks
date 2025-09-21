import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const TruthGuardAI: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || window.innerWidth;
    const height = mountRef.current.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // simple particles
    const geo = new THREE.BufferGeometry();
    const count = 200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 20;
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({ size: 0.08, color: 0x66b2ff, transparent: true, opacity: 0.8 });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    let rafId: number;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      points.rotation.y += 0.0015;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = mountRef.current?.clientWidth || window.innerWidth;
      const h = mountRef.current?.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  const performFactCheck = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    // simple local mock analysis
    await new Promise((r) => setTimeout(r, 800));
    const text = inputText.toLowerCase();
    let classification = 'insufficient_evidence';
    let score = 0.5;
    const evidenceDetails: any[] = [];
    if (text.includes('nasa') || text.includes('according to')) {
      classification = 'likely_true';
      score = 0.78;
      evidenceDetails.push({ title: 'Authoritative source', snippet: 'NASA reports warming trends.', link: 'https://nasa.gov', credibility: { isCredible: true, type: 'authoritative', domain: 'nasa.gov' }, stance: { supports: true } });
    } else if (text.includes('bleach') || text.includes('cure')) {
      classification = 'verified_false';
      score = 0.92;
      evidenceDetails.push({ title: 'Debunking study', snippet: 'Health authorities warn against bleach.', link: 'https://cdc.gov', credibility: { isCredible: true, type: 'authoritative', domain: 'cdc.gov' }, stance: { contradicts: true } });
    }

    const analysisObj = {
      verdict: { classification, score, uncertaintyScore: 1 - score, confidenceInterval: [Math.max(0, score - 0.1), Math.min(1, score + 0.1)], conflictingEvidence: false, evidenceCount: evidenceDetails.length, requiresHumanReview: score < 0.6 },
      claims: [inputText.slice(0,200)],
      explanation: { summary: classification === 'insufficient_evidence' ? 'Not enough evidence.' : (classification === 'verified_false' ? 'Strongly contradicted by health authorities.' : 'Supported by authoritative sources.'), evidenceBreakdown: { supportingEvidence: evidenceDetails.filter(e=>e.stance?.supports).length, contradictingEvidence: evidenceDetails.filter(e=>e.stance?.contradicts).length, credibleSources: evidenceDetails.filter(e=>e.credibility?.isCredible).length, totalSources: evidenceDetails.length, credibilityRatio: evidenceDetails.length>0 ? evidenceDetails.filter(e=>e.credibility?.isCredible).length/evidenceDetails.length : 0 }, sourcesFound: evidenceDetails.map(e=>e.credibility?.type) },
      processingStages: ['Claim Extraction','Local Analysis'],
      searchPowered: false,
      analysisTimestamp: new Date().toISOString(),
      evidenceDetails
    };

    setAnalysisResult(analysisObj);
    setIsAnalyzing(false);
  };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div ref={mountRef} style={{ position: 'fixed', inset: 0, zIndex: -10 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: -5 }} />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 960, margin: '0 auto', padding: 24, color: '#fff' }}>
        <h1 style={{ fontSize: 36, marginBottom: 12 }}>TruthGuard AI (Demo)</h1>
        <p style={{ color: '#cbd5e1', marginBottom: 16 }}>Enter a claim and click "Start AI Analysis" — this demo runs local analysis only.</p>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{ width: '100%', height: 160, padding: 12, borderRadius: 10, background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}
          placeholder="Paste a claim or text to analyze..."
        />

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={performFactCheck}
            disabled={!inputText.trim() || isAnalyzing}
            style={{ padding: '10px 20px', background: '#0ea5e9', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', opacity: !inputText.trim() || isAnalyzing ? 0.6 : 1 }}
          >
            {isAnalyzing ? 'Analyzing...' : 'Start AI Analysis'}
          </button>

          <button
            onClick={() => setInputText('According to NASA, global temperatures have increased by 1.1 degrees Celsius since pre-industrial times.')}
            style={{ padding: '10px 16px', background: 'transparent', color: '#fff', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
          >
            Sample
          </button>
        </div>

        {analysisResult && (
          <div style={{ marginTop: 18, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
            <div style={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                Verdict: {String(analysisResult.verdict.classification).split('_').map((w: string) => w[0].toUpperCase() + w.slice(1)).join(' ')}
              </div>
              <div style={{ fontWeight: 700 }}>{Math.round((analysisResult.verdict.score || 0) * 100)}%</div>
            </div>
            <div style={{ color: '#cbd5e1', marginTop: 8 }}>{analysisResult.explanation?.summary || analysisResult.explanation}</div>

            {analysisResult.evidenceDetails && analysisResult.evidenceDetails.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Evidence</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {analysisResult.evidenceDetails.map((ev: any, i: number) => (
                    <div key={i} style={{ padding: 10, borderRadius: 8, background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{ev.title}</div>
                        <div style={{ color: '#cbd5e1', fontSize: 13 }}>{ev.snippet}</div>
                        <a href={ev.link} target="_blank" rel="noreferrer" style={{ color: '#7dd3fc', fontSize: 12 }}>{ev.credibility?.domain || ev.link}</a>
                      </div>
                      <div>
                        <div style={{ padding: '4px 8px', borderRadius: 999, background: ev.credibility?.isCredible ? 'rgba(34,197,94,0.12)' : 'rgba(156,163,175,0.12)', color: ev.credibility?.isCredible ? '#86efac' : '#cbd5e1', fontWeight: 700, fontSize: 12 }}>
                          {ev.credibility?.type ? ev.credibility.type.toUpperCase() : (ev.credibility?.isCredible ? 'CREDIBLE' : 'UNKNOWN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TruthGuardAI;
