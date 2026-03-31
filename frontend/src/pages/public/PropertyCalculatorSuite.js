import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, TrendingUp, PiggyBank, IndianRupee, BarChart3, ArrowLeft } from 'lucide-react';

const C = {
  bg:      '#F9F6F2',
  card:    '#FFFFFF',
  border:  '#EDE8E3',
  primary: '#C84B00',
  pLight:  '#FEF3EE',
  pBorder: 'rgba(200,75,0,0.15)',
  text:    '#1A0800',
  sub:     '#6B5748',
  muted:   '#9C8B7A',
  serif:   'Georgia, "Times New Roman", serif',
  sans:    "'DM Sans', 'Segoe UI', system-ui, sans-serif",
};

const fmt = (n) => {
  if (!n || isNaN(n)) return '–';
  if (n >= 10000000) return `₹${(n/10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n/100000).toFixed(1)} L`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
};

const TABS = [
  { id:'emi',    label:'EMI Calculator', Icon:Calculator,  color:C.primary },
  { id:'roi',    label:'ROI Calculator', Icon:TrendingUp,   color:'#059669' },
  { id:'afford', label:'Affordability',  Icon:PiggyBank,    color:'#d97706' },
];

const Slider = ({ label, value, onChange, min, max, step, fmt: fmtFn }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom:22 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <span style={{ fontSize:13, fontWeight:600, color:C.sub, fontFamily:C.sans }}>{label}</span>
        <span style={{ fontSize:14, fontWeight:800, color:C.primary, fontFamily:C.serif }}>{(fmtFn||fmt)(value)}</span>
      </div>
      <div style={{ position:'relative', height:20, display:'flex', alignItems:'center' }}>
        <div style={{ position:'absolute', width:'100%', height:6, borderRadius:99, background:C.border, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:C.primary, borderRadius:99, transition:'width 0.15s', boxShadow:`0 0 8px rgba(200,75,0,0.35)` }}/>
        </div>
        <input type="range" min={min} max={max} step={step} value={value} onChange={onChange}
          style={{ width:'100%', position:'relative', zIndex:1, WebkitAppearance:'none', background:'transparent', cursor:'pointer', margin:0, height:20 }}/>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginTop:4, fontSize:10, color:C.muted, fontFamily:C.sans }}>
        <span>{(fmtFn||fmt)(min)}</span><span>{(fmtFn||fmt)(max)}</span>
      </div>
    </div>
  );
};

const ResultCard = ({ Icon, label, value, color, delay = 0 }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'22px 24px', animation:`resultReveal 0.45s cubic-bezier(.34,1.56,.64,1) ${delay}ms both`, borderLeft:`3px solid ${color}` }}>
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
      <div style={{ width:36, height:36, borderRadius:12, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon size={18} color={color}/>
      </div>
      <span style={{ fontSize:12, color:C.muted, fontWeight:600, fontFamily:C.sans }}>{label}</span>
    </div>
    <p style={{ fontFamily:C.serif, fontSize:26, fontWeight:700, color, margin:0 }}>{value}</p>
  </div>
);

const ProgressRow = ({ label, val, pct, color }) => (
  <div style={{ marginBottom:14 }}>
    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6, fontFamily:C.sans }}>
      <span style={{ color:C.muted }}>{label}</span>
      <span style={{ fontWeight:700, color:C.text }}>{fmt(val)}</span>
    </div>
    <div style={{ height:8, background:C.border, borderRadius:99, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${Math.min(100,pct)}%`, background:color, borderRadius:99, transition:'width 0.8s cubic-bezier(.22,1,.36,1)', animation:'barGrow 0.8s cubic-bezier(.22,1,.36,1) both' }}/>
    </div>
  </div>
);

export default function PropertyCalculatorSuite() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('emi');
  const [emi, setEmi] = useState({ loan:5000000, rate:8.5, tenure:20 });
  const [roi, setRoi] = useState({ purchase:5000000, current:7000000, rental:25000, expenses:5000, holding:3 });
  const [aff, setAff] = useState({ income:100000, existingEmi:15000, down:1000000, rate:8.5, tenure:20 });

  const calcEmi = () => {
    const P=emi.loan, r=emi.rate/12/100, n=emi.tenure*12;
    const e=(P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1);
    return { e, total:e*n, interest:e*n-P };
  };
  const calcRoi = () => {
    const appn=roi.current-roi.purchase;
    const appPct=(appn/roi.purchase)*100;
    const annRental=(roi.rental-roi.expenses)*12;
    const totRental=annRental*roi.holding;
    const yield_=(annRental/roi.purchase)*100;
    const totalRet=appn+totRental;
    const roiPct=(totalRet/roi.purchase)*100;
    return { appn, appPct, annRental, totRental, yield_, totalRet, roiPct };
  };
  const calcAff = () => {
    const maxEmi_=aff.income*.5-aff.existingEmi;
    const r=aff.rate/12/100, n=aff.tenure*12;
    const maxLoan=(maxEmi_*(Math.pow(1+r,n)-1))/(r*Math.pow(1+r,n));
    return { maxEmi:maxEmi_, maxLoan, maxProp:maxLoan+aff.down };
  };

  const E=calcEmi(), R=calcRoi(), A=calcAff();

  return (
    <div style={{ background:C.bg, minHeight:'100vh', fontFamily:C.sans }}>

      {/* Hero */}
      <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-30%', left:'50%', transform:'translateX(-50%)', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(200,75,0,0.05) 0%, transparent 65%)', pointerEvents:'none' }}/>

        {/* ✅ Back button */}
        <div style={{ maxWidth:800, margin:'0 auto', padding:'20px 20px 0' }}>
          <button onClick={() => navigate(-1)}
            style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:C.muted, fontSize:13, fontWeight:600, fontFamily:C.sans, padding:0 }}
            onMouseEnter={e => e.currentTarget.style.color=C.primary}
            onMouseLeave={e => e.currentTarget.style.color=C.muted}>
            <ArrowLeft size={15}/> Back
          </button>
        </div>

        <div style={{ maxWidth:800, margin:'0 auto', padding:'32px 20px 40px', textAlign:'center', position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:C.pLight, border:`1px solid ${C.pBorder}`, borderRadius:99, padding:'7px 18px', marginBottom:20, animation:'fadeIn 0.5s ease' }}>
            <Calculator size={13} color={C.primary}/>
            <span style={{ color:C.primary, fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:C.sans }}>Financial Tools · Rudra Real Estate</span>
          </div>
          <h1 style={{ fontFamily:C.serif, fontSize:'clamp(2rem,5vw,3rem)', color:C.text, fontWeight:700, marginBottom:10, animation:'slideUp 0.6s ease 0.1s both' }}>
            Property <em style={{ fontStyle:'italic', color:C.primary }}>Calculators</em>
          </h1>
          <p style={{ color:C.sub, fontSize:15, fontFamily:C.serif, marginBottom:32, animation:'slideUp 0.6s ease 0.2s both' }}>
            Plan your investment with precision.
          </p>

          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', animation:'slideUp 0.6s ease 0.3s both' }}>
            {TABS.map(({ id, label, Icon, color }) => (
              <button key={id} onClick={() => setTab(id)}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 22px', borderRadius:14, border:`2px solid ${tab===id?color:C.border}`, background:tab===id?(id==='emi'?C.pLight:id==='roi'?'#ecfdf5':'#fffbeb'):C.card, cursor:'pointer', transition:'all 0.2s', fontWeight:700, fontSize:13, color:tab===id?color:C.muted, fontFamily:C.sans, boxShadow:tab===id?`0 4px 12px ${color}22`:'none', transform:tab===id?'translateY(-1px)':'none' }}>
                <Icon size={15}/> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'36px 20px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))', gap:24 }}>

          {/* Inputs */}
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:24, padding:'28px', animation:'panelSlide 0.5s cubic-bezier(.22,1,.36,1) both' }}>
            {tab==='emi' && (<>
              <h2 style={{ fontFamily:C.serif, fontSize:20, fontWeight:700, color:C.text, margin:'0 0 24px', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36,height:36,borderRadius:12,background:C.pLight,display:'flex',alignItems:'center',justifyContent:'center' }}><Calculator size={18} color={C.primary}/></div> Home Loan EMI
              </h2>
              <Slider label="Loan Amount" value={emi.loan} onChange={e=>setEmi({...emi,loan:+e.target.value})} min={500000} max={50000000} step={100000}/>
              <Slider label="Interest Rate (Annual)" value={emi.rate} onChange={e=>setEmi({...emi,rate:+e.target.value})} min={5} max={15} step={0.1} fmt={v=>`${v}%`}/>
              <Slider label="Loan Tenure" value={emi.tenure} onChange={e=>setEmi({...emi,tenure:+e.target.value})} min={1} max={30} step={1} fmt={v=>`${v} yrs`}/>
            </>)}
            {tab==='roi' && (<>
              <h2 style={{ fontFamily:C.serif, fontSize:20, fontWeight:700, color:C.text, margin:'0 0 24px', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36,height:36,borderRadius:12,background:'#ecfdf5',display:'flex',alignItems:'center',justifyContent:'center' }}><TrendingUp size={18} color='#059669'/></div> Return on Investment
              </h2>
              <Slider label="Purchase Price" value={roi.purchase} onChange={e=>setRoi({...roi,purchase:+e.target.value})} min={500000} max={50000000} step={100000}/>
              <Slider label="Current Market Value" value={roi.current} onChange={e=>setRoi({...roi,current:+e.target.value})} min={roi.purchase} max={roi.purchase*4} step={100000}/>
              <Slider label="Monthly Rental Income" value={roi.rental} onChange={e=>setRoi({...roi,rental:+e.target.value})} min={0} max={200000} step={1000}/>
              <Slider label="Monthly Expenses" value={roi.expenses} onChange={e=>setRoi({...roi,expenses:+e.target.value})} min={0} max={50000} step={500}/>
              <Slider label="Holding Period" value={roi.holding} onChange={e=>setRoi({...roi,holding:+e.target.value})} min={1} max={20} step={1} fmt={v=>`${v} yrs`}/>
            </>)}
            {tab==='afford' && (<>
              <h2 style={{ fontFamily:C.serif, fontSize:20, fontWeight:700, color:C.text, margin:'0 0 24px', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36,height:36,borderRadius:12,background:'#fffbeb',display:'flex',alignItems:'center',justifyContent:'center' }}><PiggyBank size={18} color='#d97706'/></div> Affordability Check
              </h2>
              <Slider label="Monthly Income" value={aff.income} onChange={e=>setAff({...aff,income:+e.target.value})} min={25000} max={500000} step={5000}/>
              <Slider label="Existing EMI" value={aff.existingEmi} onChange={e=>setAff({...aff,existingEmi:+e.target.value})} min={0} max={100000} step={1000}/>
              <Slider label="Down Payment" value={aff.down} onChange={e=>setAff({...aff,down:+e.target.value})} min={0} max={10000000} step={100000}/>
              <Slider label="Interest Rate" value={aff.rate} onChange={e=>setAff({...aff,rate:+e.target.value})} min={5} max={15} step={0.1} fmt={v=>`${v}%`}/>
              <Slider label="Tenure" value={aff.tenure} onChange={e=>setAff({...aff,tenure:+e.target.value})} min={5} max={30} step={1} fmt={v=>`${v} yrs`}/>
            </>)}
          </div>

          {/* Results */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {tab==='emi' && (<>
              <ResultCard Icon={IndianRupee} label="Monthly EMI"           value={fmt(E.e)}       color={C.primary} delay={0}/>
              <ResultCard Icon={BarChart3}   label="Total Amount Payable"  value={fmt(E.total)}   color='#2563eb'   delay={60}/>
              <ResultCard Icon={TrendingUp}  label="Total Interest Paid"   value={fmt(E.interest)}color='#dc2626'   delay={120}/>
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'20px 22px', animation:'resultReveal 0.45s cubic-bezier(.34,1.56,.64,1) 180ms both' }}>
                <p style={{ fontWeight:700, color:C.text, margin:'0 0 14px', fontSize:13, fontFamily:C.sans }}>Loan Breakdown</p>
                <ProgressRow label="Principal" val={emi.loan}   pct={emi.loan/E.total*100}   color={C.primary}/>
                <ProgressRow label="Interest"  val={E.interest} pct={E.interest/E.total*100} color='#dc2626'/>
              </div>
            </>)}
            {tab==='roi' && (<>
              <ResultCard Icon={TrendingUp}  label="Capital Appreciation"  value={`${fmt(R.appn)} (${R.appPct.toFixed(1)}%)`} color='#059669' delay={0}/>
              <ResultCard Icon={PiggyBank}   label="Total Rental Income"   value={fmt(R.totRental)} color='#2563eb' delay={60}/>
              <ResultCard Icon={BarChart3}   label="Rental Yield (Annual)" value={`${R.yield_.toFixed(2)}%`} color={C.primary} delay={120}/>
              <ResultCard Icon={IndianRupee} label="Total ROI"             value={`${R.roiPct.toFixed(1)}%`} color='#d97706' delay={180}/>
            </>)}
            {tab==='afford' && (<>
              <ResultCard Icon={IndianRupee} label="Max Property Value"    value={fmt(A.maxProp)} color='#d97706' delay={0}/>
              <ResultCard Icon={Calculator}  label="Maximum Loan Eligible" value={fmt(A.maxLoan)} color='#2563eb' delay={60}/>
              <ResultCard Icon={BarChart3}   label="Max EMI (50% income)"  value={fmt(A.maxEmi)}  color='#059669' delay={120}/>
              <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'20px 22px', animation:'resultReveal 0.45s cubic-bezier(.34,1.56,.64,1) 180ms both' }}>
                <p style={{ fontWeight:700, color:C.text, margin:'0 0 14px', fontSize:13, fontFamily:C.sans }}>Income Allocation</p>
                <ProgressRow label="Available for new EMI"  val={A.maxEmi}        pct={(A.maxEmi/aff.income)*100}        color='#059669'/>
                <ProgressRow label="Existing commitments"   val={aff.existingEmi} pct={(aff.existingEmi/aff.income)*100} color='#dc2626'/>
              </div>
            </>)}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeIn       { from{opacity:0} to{opacity:1} }
        @keyframes slideUp      { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes panelSlide   { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
        @keyframes resultReveal { from{opacity:0;transform:scale(0.88) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes barGrow      { from{width:0} }
        input[type=range] { -webkit-appearance:none; background:transparent; }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance:none; width:18px; height:18px; border-radius:50%;
          background:${C.primary}; cursor:pointer; border:3px solid #fff;
          box-shadow:0 0 0 2px ${C.primary}; margin-top:-6px;
        }
        input[type=range]::-webkit-slider-runnable-track { height:6px; }
        input[type=range]::-moz-range-thumb {
          width:18px; height:18px; border-radius:50%;
          background:${C.primary}; cursor:pointer; border:3px solid #fff;
        }
      `}</style>
    </div>
  );
}