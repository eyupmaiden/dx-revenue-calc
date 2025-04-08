import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';

const RevenueCalculator = () => {
  const [experimentDays, setExperimentDays] = useState(14);
  const [controlRevenue, setControlRevenue] = useState(1000);
  const [variantRevenue, setVariantRevenue] = useState(1200);
  const [chartData, setChartData] = useState([]);
  const [annualProjection, setAnnualProjection] = useState({
    rawValue: 0,
    afterNovelty: 0,
    lowerRange: 0,
    upperRange: 0
  });
  const containerRef = useRef(null);

  // Calculate annual projection with novelty effect
  useEffect(() => {
    if (experimentDays <= 0) return;

    // Calculate daily revenue difference
    const dailyRevenueDifference = variantRevenue - controlRevenue;
    
    // Raw annual value (simple extrapolation)
    const rawAnnualValue = (dailyRevenueDifference / experimentDays) * 365;
    
    // Apply 25% novelty effect reduction over a year
    const afterNoveltyEffect = rawAnnualValue * 0.75;
    
    // Calculate the range (70% - 100% of total after novelty)
    const lowerRange = afterNoveltyEffect * 0.7;
    const upperRange = afterNoveltyEffect;
    
    setAnnualProjection({
      rawValue: rawAnnualValue,
      afterNovelty: afterNoveltyEffect,
      lowerRange: lowerRange,
      upperRange: upperRange
    });

    // Generate non-linear reduction data for chart
    // Using a cubic function to model the novelty effect decline
    const data = [];
    for (let month = 0; month <= 12; month++) {
      // Non-linear decay formula (cubic function)
      // Starts at 100% efficacy and ends at 75% efficacy
      const progress = month / 12;
      const efficacyPercentage = 100 - (25 * (progress * progress * progress + progress) / 2);
      
      // Calculate the projected value for this month with current efficacy
      const monthlyValue = rawAnnualValue / 12 * (efficacyPercentage / 100);
      
      data.push({
        month: month,
        efficacy: efficacyPercentage,
        projectedValue: monthlyValue
      });
    }
    
    setChartData(data);
  }, [experimentDays, controlRevenue, variantRevenue]);

  const formatCurrency = (value) => {
    return `£${value.toLocaleString('en-GB', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  const exportAsImage = () => {
    if (!containerRef.current) return;
    
    html2canvas(containerRef.current).then(canvas => {
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'digital-experience-revenue-calculator.png';
      link.click();
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md" ref={containerRef} style={{backgroundColor: "#FFFFFF", color: "#2B0573"}}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{color: "#2B0573"}}>Digital Experience Annual Revenue Calculator</h1>
        <button 
          onClick={exportAsImage}
          className="px-4 py-2 rounded hover:opacity-90 flex items-center"
          style={{backgroundColor: "#FFFF00", color: "#2B0573"}}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
          Save as Image
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1" style={{color: "#2B0573"}}>Experiment Duration (days)</label>
          <input
            type="number"
            min="1"
            value={experimentDays}
            onChange={(e) => setExperimentDays(Math.max(1, Number(e.target.value)))}
            className="w-full p-2 border rounded"
            style={{borderColor: "#6325F4"}}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1" style={{color: "#2B0573"}}>Control Revenue (£)</label>
          <input
            type="number"
            min="0"
            value={controlRevenue}
            onChange={(e) => setControlRevenue(Math.max(0, Number(e.target.value)))}
            className="w-full p-2 border rounded"
            style={{borderColor: "#6325F4"}}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1" style={{color: "#2B0573"}}>Variant Revenue (£)</label>
          <input
            type="number"
            min="0"
            value={variantRevenue}
            onChange={(e) => setVariantRevenue(Math.max(0, Number(e.target.value)))}
            className="w-full p-2 border rounded"
            style={{borderColor: "#6325F4"}}
          />
        </div>
      </div>
      
      <div className="bg-opacity-25 p-4 rounded-lg mb-6" style={{backgroundColor: "#E8E4FF"}}>
        <h2 className="text-xl font-semibold mb-2" style={{color: "#2B0573"}}>Annual Projection</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="mb-1"><span className="font-medium" style={{color: "#2B0573"}}>Raw Annual Value:</span> {formatCurrency(annualProjection.rawValue)}</p>
            <p className="mb-1"><span className="font-medium" style={{color: "#2B0573"}}>After Novelty Effect (75%):</span> {formatCurrency(annualProjection.afterNovelty)}</p>
            <p className="text-lg font-bold mt-2" style={{color: "#6325F4"}}>Estimated Annual Range: {formatCurrency(annualProjection.lowerRange)} - {formatCurrency(annualProjection.upperRange)}</p>
          </div>
          <div>
            <p className="text-sm mb-1">Daily Revenue Increase: {formatCurrency((variantRevenue - controlRevenue) / experimentDays)}</p>
            <p className="text-sm mb-1">Experiment Lift: {((variantRevenue / controlRevenue - 1) * 100).toFixed(2)}%</p>
            <p className="text-sm">Assumes 25% reduction in efficacy over a year due to novelty effect</p>
          </div>
        </div>
      </div>
      
      <div className="mb-2">
        <h2 className="text-xl font-semibold mb-2" style={{color: "#2B0573"}}>Efficacy Reduction Over Time</h2>
        <p className="text-sm mb-4">Non-linear reduction in efficacy due to novelty effect (100% → 75%)</p>
      </div>
      
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              label={{ value: 'Month', position: 'insideBottom', offset: -5 }} 
              tickFormatter={(value) => value === 0 ? 'Start' : value === 12 ? 'Year End' : value}
            />
            <YAxis 
              yAxisId="left"
              orientation="left"
              label={{ value: 'Efficacy (%)', angle: -90, position: 'insideLeft' }}
              domain={[70, 100]}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              label={{ value: 'Projected Value (£)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip formatter={(value, name) => {
              if (name === 'efficacy') return [`${value.toFixed(1)}%`, 'Efficacy'];
              return [formatCurrency(value), 'Monthly Value'];
            }} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="efficacy"
              stroke="#2B0573"
              strokeWidth={2}
              name="Efficacy (%)"
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="projectedValue"
              stroke="#6325F4"
              strokeWidth={2}
              name="Monthly Value (£)"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 mb-6 p-4 border rounded-lg" style={{borderColor: "#CFECFF", backgroundColor: "#CFECFF", color: "#2B0573"}}>
        <h3 className="font-bold mb-2" style={{color: "#2B0573"}}>Important Seasonality Considerations</h3>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>This projection assumes consistent performance across seasons. If your test ran during peak or low season, results may not represent annual performance.</li>
          <li>Consider when your test was conducted — Q4 holiday results typically don't extrapolate well to Q2.</li>
          <li>For businesses with strong seasonal patterns (retail, travel, education), apply additional caution to these projections.</li>
          <li>If possible, compare to year-on-year data rather than just previous periods to account for seasonal fluctuations.</li>
          <li>For high-stakes decisions, consider running follow-up tests during different seasonal periods.</li>
        </ul>
      </div>

      <div className="mt-6 text-sm" style={{color: "#6325F4"}}>
        <p>* This calculator applies a non-linear 25% reduction in efficacy over a year to account for novelty effect.</p>
        <p>* The projected annual value range represents 70-100% of the novelty-adjusted value to account for uncertainty.</p>
      </div>
    </div>
  );
};

export default RevenueCalculator;