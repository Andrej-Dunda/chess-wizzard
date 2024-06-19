import { useTournaments } from '../../contexts/TournamentsProvider'
import './PlaytimeTournamentWindow.scss'
import React, { useEffect, useState } from 'react'
import ResultsWindow from './playtime-windows/results-window/ResultsWindow';
import MatchesWindow from './playtime-windows/matches-window/MatchesWindow';
import { useNav } from '../../contexts/NavigationProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import TournamentRoundsWindow from './finished-tournament-windows/TournamentRoundsWindow';

const PlaytimeTournamentWindow = () => {
  const { selectedTournament, getMatches } = useTournaments();
  const [openWindow, setOpenWindow] = useState<string>('matches');
  const firstRound: boolean = selectedTournament?.currentRound === 1;
  const { toHome } = useNav();

  useEffect(() => {
    getMatches();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='playtime-tournament-window'>
      <div className="tournament-window-header">
        <h5 className="tournament-title">{selectedTournament?.name}</h5>
        <div className="results-toggle">
          <button className={`show-matches-button toggle-button dark${openWindow === 'matches' ? ' active' : ''}`} onClick={() => openWindow !== 'matches' && setOpenWindow('matches')}>Nasazení</button>
          <button className={`show-results-button toggle-button dark${openWindow === 'results' ? ' active' : ''}`} onClick={() => openWindow !== 'results' && setOpenWindow('results')}>{firstRound ? 'Startovní listina' : 'Výsledky'}</button>
          <button className={`show-previous-rounds-button toggle-button dark${openWindow === 'previous-rounds' ? ' active' : ''}`} onClick={() => openWindow !== 'previous-rounds' && setOpenWindow('previous-rounds')}>Předchozí kola</button>
        </div>
        <FontAwesomeIcon className='home-button' onClick={toHome} icon={faHome} />
      </div>
      <div className="tournament-window-body">
        {openWindow === 'results' && <ResultsWindow />}
        {openWindow === 'matches' && <MatchesWindow />}
        {openWindow === 'previous-rounds' && <TournamentRoundsWindow />}
      </div>
    </div>
  )
}

export default PlaytimeTournamentWindow
