import React from 'react';
import './App.scss';
import { Route, Routes } from 'react-router-dom'
import TournamentsOverview from './pages/TournamentsOverview';
import Layout from './pages/Layout';
import TournamentWindow from './pages/TournamentWindow';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<TournamentsOverview />} />
        <Route path='tournament' element={<TournamentWindow />} />
      </Route>
    </Routes>
  );
}

export default App;
