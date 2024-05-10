import { useTournaments } from '../../contexts/TournamentsProvider'
import './PlaytimeTournamentWindow.scss'
import React from 'react'

const PlaytimeTournamentWindow = () => {
  const { changeTournamentPhase } = useTournaments();

  return (
    <div className='playtime-tournament-window'>
      playtime tournament window
      <button className='finish-tournament-button dark' onClick={() => changeTournamentPhase('finished')}>finish tournament</button>
      <button className='back-to-registration dark' onClick={() => changeTournamentPhase('registration')}>back to registration</button>
    </div>
  )
}

export default PlaytimeTournamentWindow
