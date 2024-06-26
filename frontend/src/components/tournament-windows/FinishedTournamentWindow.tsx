import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTournaments } from '../../contexts/TournamentsProvider'
import './FinishedTournamentWindow.scss'
import React, { useState } from 'react'
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { useNav } from '../../contexts/NavigationProvider';
import FinalResultsWindow from './finished-tournament-windows/FinalResultsWindow';
import TournamentRoundsWindow from './finished-tournament-windows/TournamentRoundsWindow';

const FinishedTournamentWindow = () => {
  const { selectedTournament } = useTournaments();
  const { toHome } = useNav();
  const [showResults, setShowResults] = useState<boolean>(true);

  return (
    <div className='finished-tournament-window'>
      <div className="tournament-window-header">
        <h5 className="tournament-title">{selectedTournament?.name}</h5>
        <div className="results-toggle">
          <button className={`show-results-button toggle-button dark${showResults ? ' active' : ''}`} onClick={() => setShowResults(true)}>Výsledky</button>
          <button className={`show-matches-button toggle-button dark${!showResults ? ' active' : ''}`} onClick={() => setShowResults(false)}>Průběh turnaje</button>
        </div>
        <FontAwesomeIcon className='home-button' onClick={toHome} icon={faHome} />
      </div>
      <div className="finished-tournament-body">
        {
          showResults ? <FinalResultsWindow /> : <TournamentRoundsWindow />
        }
      </div>
    </div>
  )
}

export default FinishedTournamentWindow
