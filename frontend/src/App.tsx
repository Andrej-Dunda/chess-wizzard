import React from 'react';
import './App.scss';
import { Route, Routes } from 'react-router-dom'
import TournamentsOverview from './pages/TournamentsOverview';
import Layout from './pages/Layout';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<TournamentsOverview />} />
      </Route>
    </Routes>
  );
}

export default App;
