import { useTournaments } from '../../contexts/TournamentsProvider'
import './PlaytimeTournamentWindow.scss'
import React from 'react'
import ResultsWindow from './playtime-windows/results-window/ResultsWindow';
import MatchesWindow from './playtime-windows/matches-window/MatchesWindow';
import { useNav } from '../../contexts/NavigationProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

const PlaytimeTournamentWindow = () => {
  const { selectedTournament } = useTournaments();
  const [showResults, setShowResults] = React.useState<boolean>(true);
  const firstRound: boolean = selectedTournament?.round === 1;
  const { toHome } = useNav();

  return (
    <div className='playtime-tournament-window'>
      <div className="tournament-window-header">
        <h5 className="tournament-title">{selectedTournament?.name}</h5>
        <div className="results-toggle">
          <button className={`show-results-button toggle-button dark${showResults ? ' active' : ''}`} onClick={() => setShowResults(true)}>{firstRound ? 'Startovní listina' : 'Výsledky'}</button>
          <button className={`show-matches-button toggle-button dark${!showResults ? ' active' : ''}`} onClick={() => setShowResults(false)}>Nasazení</button>
        </div>
        <FontAwesomeIcon className='home-button' onClick={toHome} icon={faHome} />
      </div>
      <div className="tournament-window-body">
        {showResults ? <ResultsWindow /> : <MatchesWindow />}
      </div>
    </div>
  )
}

export default PlaytimeTournamentWindow
