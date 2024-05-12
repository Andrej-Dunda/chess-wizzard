import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './TournamentControlPanel.scss'
import React from 'react'
import { faAnglesLeft, faAnglesRight, faFlagCheckered } from '@fortawesome/free-solid-svg-icons'
import { useTournaments } from '../../contexts/TournamentsProvider'

const TournamentControlPanel = () => {
  const { changeTournamentPhase, selectedTournament, changeTournamentRound, isAnyResultNull } = useTournaments();
  const firstRound: boolean = selectedTournament?.round === 1;
  
  const backToRegistration = async () => {
    await changeTournamentRound(0)
    changeTournamentPhase('registration')
  }
  const previousRound = () => selectedTournament && changeTournamentRound(selectedTournament.round - 1)
  const nextRound = () => selectedTournament && changeTournamentRound(selectedTournament.round + 1)

  return (
    <div className="tournament-control-panel">
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
      <button className={`next-round-button dark${isAnyResultNull ? ' disabled' : ''}`} title={isAnyResultNull ? 'Vyplňte všechny výsledky!' : ''} onClick={nextRound}>
        Další kolo
        <FontAwesomeIcon icon={faAnglesRight} />
      </button>
    </div>
  )
}

export default TournamentControlPanel
