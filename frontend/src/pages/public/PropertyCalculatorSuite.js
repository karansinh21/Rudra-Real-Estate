import React, { useState } from 'react';
import { Calculator, TrendingUp, PiggyBank, Home, DollarSign, BarChart, PieChart } from 'lucide-react';

const PropertyCalculatorSuite = () => {
  const [activeCalculator, setActiveCalculator] = useState('emi');
  
  // EMI Calculator State
  const [emiData, setEmiData] = useState({
    loanAmount: 5000000,
    interestRate: 8.5,
    tenure: 20
  });
  
  // ROI Calculator State
  const [roiData, setRoiData] = useState({
    purchasePrice: 5000000,
    currentValue: 7000000,
    rentalIncome: 25000,
    expenses: 5000,
    holdingPeriod: 3
  });
  
  // Affordability Calculator State
  const [affordData, setAffordData] = useState({
    monthlyIncome: 100000,
    existingEMI: 15000,
    downPayment: 1000000,
    interestRate: 8.5,
    tenure: 20
  });

  const calculateEMI = () => {
    const P = emiData.loanAmount;
    const r = emiData.interestRate / 12 / 100;
    const n = emiData.tenure * 12;
    
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalAmount = emi * n;
    const totalInterest = totalAmount - P;
    
    return { emi, totalAmount, totalInterest };
  };

  const calculateROI = () => {
    const appreciation = roiData.currentValue - roiData.purchasePrice;
    const appreciationPercent = (appreciation / roiData.purchasePrice) * 100;
    const annualRental = (roiData.rentalIncome - roiData.expenses) * 12;
    const totalRental = annualRental * roiData.holdingPeriod;
    const rentalYield = (annualRental / roiData.purchasePrice) * 100;
    const totalReturn = appreciation + totalRental;
    const roi = (totalReturn / roiData.purchasePrice) * 100;
    
    return { appreciation, appreciationPercent, annualRental, totalRental, rentalYield, totalReturn, roi };
  };

  const calculateAffordability = () => {
    const maxEMI = (affordData.monthlyIncome * 0.5) - affordData.existingEMI;
    const r = affordData.interestRate / 12 / 100;
    const n = affordData.tenure * 12;
    
    const maxLoan = (maxEMI * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
    const maxProperty = maxLoan + affordData.downPayment;
    
    return { maxEMI, maxLoan, maxProperty };
  };

  const emi = calculateEMI();
  const roi = calculateROI();
  const afford = calculateAffordability();

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const SliderInput = ({ label, value, onChange, min, max, step, suffix }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        <span className="text-lg font-bold text-blue-600">
          {suffix === '₹' ? formatCurrency(value) : `${value}${suffix}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{suffix === '₹' ? formatCurrency(min) : `${min}${suffix}`}</span>
        <span>{suffix === '₹' ? formatCurrency(max) : `${max}${suffix}`}</span>
      </div>
    </div>
  );

  const ResultCard = ({ icon: Icon, label, value, color }) => (
    <div className={`p-6 rounded-xl bg-gradient-to-br ${color} text-white`}>
      <Icon className="w-8 h-8 mb-3 opacity-80" />
      <div className="text-sm opacity-90 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Property Financial Calculators</h1>
          <p className="text-xl text-gray-600">Plan your property investment with precision</p>
        </div>

        {/* Calculator Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-2 mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCalculator('emi')}
            className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${
              activeCalculator === 'emi'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <Calculator className="w-5 h-5" />
            EMI Calculator
          </button>
          <button
            onClick={() => setActiveCalculator('roi')}
            className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${
              activeCalculator === 'roi'
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            ROI Calculator
          </button>
          <button
            onClick={() => setActiveCalculator('afford')}
            className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${
              activeCalculator === 'afford'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <PiggyBank className="w-5 h-5" />
            Affordability
          </button>
        </div>

        {/* EMI Calculator */}
        {activeCalculator === 'emi' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Calculator className="w-8 h-8 text-blue-600" />
                Home Loan EMI Calculator
              </h2>
              
              <div className="space-y-6">
                <SliderInput
                  label="Loan Amount"
                  value={emiData.loanAmount}
                  onChange={(e) => setEmiData({...emiData, loanAmount: parseInt(e.target.value)})}
                  min={100000}
                  max={50000000}
                  step={100000}
                  suffix="₹"
                />
                
                <SliderInput
                  label="Interest Rate (Annual)"
                  value={emiData.interestRate}
                  onChange={(e) => setEmiData({...emiData, interestRate: parseFloat(e.target.value)})}
                  min={5}
                  max={15}
                  step={0.1}
                  suffix="%"
                />
                
                <SliderInput
                  label="Loan Tenure"
                  value={emiData.tenure}
                  onChange={(e) => setEmiData({...emiData, tenure: parseInt(e.target.value)})}
                  min={1}
                  max={30}
                  step={1}
                  suffix=" Years"
                />
              </div>
            </div>

            <div className="space-y-6">
              <ResultCard
                icon={DollarSign}
                label="Monthly EMI"
                value={formatCurrency(emi.emi)}
                color="from-blue-600 to-blue-700"
              />
              <ResultCard
                icon={Home}
                label="Total Amount Payable"
                value={formatCurrency(emi.totalAmount)}
                color="from-purple-600 to-purple-700"
              />
              <ResultCard
                icon={BarChart}
                label="Total Interest"
                value={formatCurrency(emi.totalInterest)}
                color="from-pink-600 to-pink-700"
              />
              
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Loan Breakdown</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Principal Amount</span>
                      <span className="font-semibold">{((emiData.loanAmount / emi.totalAmount) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                        style={{ width: `${(emiData.loanAmount / emi.totalAmount) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Interest Amount</span>
                      <span className="font-semibold">{((emi.totalInterest / emi.totalAmount) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-500 to-pink-600"
                        style={{ width: `${(emi.totalInterest / emi.totalAmount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ROI Calculator */}
        {activeCalculator === 'roi' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                Return on Investment Calculator
              </h2>
              
              <div className="space-y-6">
                <SliderInput
                  label="Purchase Price"
                  value={roiData.purchasePrice}
                  onChange={(e) => setRoiData({...roiData, purchasePrice: parseInt(e.target.value)})}
                  min={100000}
                  max={50000000}
                  step={100000}
                  suffix="₹"
                />
                
                <SliderInput
                  label="Current Value"
                  value={roiData.currentValue}
                  onChange={(e) => setRoiData({...roiData, currentValue: parseInt(e.target.value)})}
                  min={roiData.purchasePrice}
                  max={roiData.purchasePrice * 3}
                  step={100000}
                  suffix="₹"
                />
                
                <SliderInput
                  label="Monthly Rental Income"
                  value={roiData.rentalIncome}
                  onChange={(e) => setRoiData({...roiData, rentalIncome: parseInt(e.target.value)})}
                  min={0}
                  max={200000}
                  step={1000}
                  suffix="₹"
                />
                
                <SliderInput
                  label="Monthly Expenses"
                  value={roiData.expenses}
                  onChange={(e) => setRoiData({...roiData, expenses: parseInt(e.target.value)})}
                  min={0}
                  max={50000}
                  step={500}
                  suffix="₹"
                />
                
                <SliderInput
                  label="Holding Period"
                  value={roiData.holdingPeriod}
                  onChange={(e) => setRoiData({...roiData, holdingPeriod: parseInt(e.target.value)})}
                  min={1}
                  max={20}
                  step={1}
                  suffix=" Years"
                />
              </div>
            </div>

            <div className="space-y-6">
              <ResultCard
                icon={TrendingUp}
                label="Capital Appreciation"
                value={`${formatCurrency(roi.appreciation)} (${roi.appreciationPercent.toFixed(1)}%)`}
                color="from-green-600 to-green-700"
              />
              <ResultCard
                icon={PiggyBank}
                label="Total Rental Income"
                value={formatCurrency(roi.totalRental)}
                color="from-blue-600 to-blue-700"
              />
              <ResultCard
                icon={BarChart}
                label="Rental Yield (Annual)"
                value={`${roi.rentalYield.toFixed(2)}%`}
                color="from-purple-600 to-purple-700"
              />
              <ResultCard
                icon={PieChart}
                label="Total ROI"
                value={`${roi.roi.toFixed(1)}%`}
                color="from-pink-600 to-pink-700"
              />
              
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Investment Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Initial Investment</span>
                    <span className="font-semibold">{formatCurrency(roiData.purchasePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Value</span>
                    <span className="font-semibold">{formatCurrency(roiData.currentValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Returns</span>
                    <span className="font-semibold text-green-600">{formatCurrency(roi.totalReturn)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="text-gray-900 font-bold">Net Gain</span>
                    <span className="font-bold text-green-600">{formatCurrency(roi.totalReturn)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Affordability Calculator */}
        {activeCalculator === 'afford' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <PiggyBank className="w-8 h-8 text-purple-600" />
                Property Affordability Calculator
              </h2>
              
              <div className="space-y-6">
                <SliderInput
                  label="Monthly Income"
                  value={affordData.monthlyIncome}
                  onChange={(e) => setAffordData({...affordData, monthlyIncome: parseInt(e.target.value)})}
                  min={25000}
                  max={500000}
                  step={5000}
                  suffix="₹"
                />
                
                <SliderInput
                  label="Existing EMI (if any)"
                  value={affordData.existingEMI}
                  onChange={(e) => setAffordData({...affordData, existingEMI: parseInt(e.target.value)})}
                  min={0}
                  max={100000}
                  step={1000}
                  suffix="₹"
                />
                
                <SliderInput
                  label="Down Payment Available"
                  value={affordData.downPayment}
                  onChange={(e) => setAffordData({...affordData, downPayment: parseInt(e.target.value)})}
                  min={0}
                  max={10000000}
                  step={100000}
                  suffix="₹"
                />
                
                <SliderInput
                  label="Interest Rate (Annual)"
                  value={affordData.interestRate}
                  onChange={(e) => setAffordData({...affordData, interestRate: parseFloat(e.target.value)})}
                  min={5}
                  max={15}
                  step={0.1}
                  suffix="%"
                />
                
                <SliderInput
                  label="Loan Tenure"
                  value={affordData.tenure}
                  onChange={(e) => setAffordData({...affordData, tenure: parseInt(e.target.value)})}
                  min={5}
                  max={30}
                  step={1}
                  suffix=" Years"
                />
              </div>
            </div>

            <div className="space-y-6">
              <ResultCard
                icon={Home}
                label="Max Property Value You Can Afford"
                value={formatCurrency(afford.maxProperty)}
                color="from-purple-600 to-purple-700"
              />
              <ResultCard
                icon={DollarSign}
                label="Maximum Loan Amount"
                value={formatCurrency(afford.maxLoan)}
                color="from-blue-600 to-blue-700"
              />
              <ResultCard
                icon={Calculator}
                label="Maximum EMI (50% of income)"
                value={formatCurrency(afford.maxEMI)}
                color="from-green-600 to-green-700"
              />
              
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">Financial Overview</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Available for EMI</span>
                      <span className="font-semibold">{formatCurrency(afford.maxEMI)}</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-600"
                        style={{ width: `${(afford.maxEMI / affordData.monthlyIncome) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Existing EMI</span>
                      <span className="font-semibold">{formatCurrency(affordData.existingEMI)}</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 to-red-600"
                        style={{ width: `${(affordData.existingEMI / affordData.monthlyIncome) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Income</span>
                      <span className="font-semibold">{formatCurrency(affordData.monthlyIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recommended for EMI</span>
                      <span className="font-semibold text-green-600">{formatCurrency(affordData.monthlyIncome * 0.5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Savings/Other Expenses</span>
                      <span className="font-semibold">{formatCurrency(affordData.monthlyIncome * 0.5)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCalculatorSuite;