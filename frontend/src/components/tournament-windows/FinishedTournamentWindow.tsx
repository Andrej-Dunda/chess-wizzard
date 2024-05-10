import { useTournaments } from '../../contexts/TournamentsProvider'
import './FinishedTournamentWindow.scss'
import React from 'react'

const FinishedTournamentWindow = () => {
  const { changeTournamentPhase } = useTournaments();

  return (
    <div className='finished-tournament-window'>
      finished tournament window
      <button className="back-to-playtime dark" onClick={() => changeTournamentPhase('playtime')}>Upravit poslední kolo</button>
    </div>
  )
}

export default FinishedTournamentWindow
