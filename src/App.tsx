import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Briefing from './pages/Briefing'
import DecisionEngine from './pages/DecisionEngine'
import InteractiveGraph from './pages/InteractiveGraph'
import HealthOps from './pages/HealthOps'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="briefing" element={<Briefing />} />
        <Route path="decision-engine" element={<DecisionEngine />} />
        <Route path="graph" element={<InteractiveGraph />} />
        <Route path="ops" element={<HealthOps />} />
      </Route>
    </Routes>
  )
}
