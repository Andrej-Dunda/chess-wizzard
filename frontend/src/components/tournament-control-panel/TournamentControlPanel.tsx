import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './TournamentControlPanel.scss'
import React from 'react'
import { faAnglesLeft, faAnglesRight, faFlagCheckered } from '@fortawesome/free-solid-svg-icons'
import { useTournaments } from '../../contexts/TournamentsProvider'

const TournamentControlPanel = () => {
  const { changeTournamentPhase, selectedTournament, changeTournamentRound, isAnyResultNull } = useTournaments();
  const firstRound: boolean = selectedTournament?.currentRound === 1;
  
  const backToRegistration = async () => {
    await changeTournamentRound('previous')
    changeTournamentPhase('registration')
  }

  return (
    <div className="tournament-control-panel">
      {
        firstRound ? <button className='back-to-registration-button dark' onClick={backToRegistration}>
          <FontAwesomeIcon icon={faAnglesLeft} />
          Zpět k registraci
        </button>
        : (
          <>
            <button className="previous-round-button dark" onClick={() => changeTournamentRound('previous')}>
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
      <button className={`next-round-button dark${isAnyResultNull ? ' disabled' : ''}`} title={isAnyResultNull ? 'Vyplňte všechny výsledky!' : ''} onClick={() => changeTournamentRound('next')}>
        Další kolo
        <FontAwesomeIcon icon={faAnglesRight} />
      </button>
    </div>
  )
}

export default TournamentControlPanel
