import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTournaments } from '../../contexts/TournamentsProvider'
import './PlaytimeTournamentWindow.scss'
import React from 'react'
import { faAnglesLeft, faAnglesRight, faFlagCheckered } from '@fortawesome/free-solid-svg-icons';
import ResultsWindow from './playtime-windows/results-window/ResultsWindow';
import MatchesWindow from './playtime-windows/matches-window/MatchesWindow';

const PlaytimeTournamentWindow = () => {
  const { changeTournamentPhase, selectedTournament, changeTournamentRound } = useTournaments();
  const [showResults, setShowResults] = React.useState<boolean>(true);
  const firstRound: boolean = selectedTournament?.round === 1;

  const backToRegistration = async () => {
    await changeTournamentRound(0)
    changeTournamentPhase('registration')
  }
  const previousRound = () => selectedTournament && changeTournamentRound(selectedTournament.round - 1)
  const nextRound = () => selectedTournament && changeTournamentRound(selectedTournament.round + 1)

  return (
    <div className='playtime-tournament-window'>
      <div className="tournament-window-header">
        <h5 className="tournament-title">{selectedTournament?.name}</h5>
        <div className="results-toggle">
          <button className={`show-results-button toggle-button${showResults ? ' active' : ''}`} onClick={() => setShowResults(true)}>{firstRound ? 'Startovní listina' : 'Výsledky'}</button>
          <button className={`show-matches-button toggle-button${!showResults ? ' active' : ''}`} onClick={() => setShowResults(false)}>Nasazení</button>
        </div>
        <span className='tournament-round'>{selectedTournament && selectedTournament.round}. kolo</span>
      </div>
      <div className="tournament-window-body">
        {showResults ? <ResultsWindow /> : <MatchesWindow />}
        <div className="control-panel">
          {
            firstRound ? <button className='back-to-registration-button dark' onClick={backToRegistration}>
              <FontAwesomeIcon icon={faAnglesLeft} />
              Zpět k registraci
            </button>
            : (
              <>
                <button className="previous-round-button dark" onClick={previousRound}>
                  <FontAwesomeIcon icon={faAnglesLeft} />
                  Zpět k předchozímu kolu
                </button>
                <button className='finish-tournament-button dark' onClick={() => changeTournamentPhase('finished')}>
                  Ukončit turnaj
                  <FontAwesomeIcon icon={faFlagCheckered} />
                </button>
              </>
            )
          }
          <button className="next-round-button dark" onClick={nextRound}>
            Další kolo
            <FontAwesomeIcon icon={faAnglesRight} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlaytimeTournamentWindow
