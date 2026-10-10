import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Overview from './pages/Overview';
import LabourData from './pages/LabourData';
import SkillDemand from './pages/SkillDemand';
import Forecasting from './pages/Forecasting';
import GapAnalysis from './pages/GapAnalysis';
import Training from './pages/Training';
import GeoIntelligence from './pages/GeoIntelligence';
import Reports from './pages/Reports';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="labour-data" element={<LabourData />} />
          <Route path="skill-demand" element={<SkillDemand />} />
          <Route path="forecasting" element={<Forecasting />} />
          <Route path="gap-analysis" element={<GapAnalysis />} />
          <Route path="training" element={<Training />} />
          <Route path="geo" element={<GeoIntelligence />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
