import { useTournaments } from '../../contexts/TournamentsProvider'
import './PlaytimeTournamentWindow.scss'
import React from 'react'

const PlaytimeTournamentWindow = () => {
  const { selectedTournament, getTournament } = useTournaments();

  const finishTournament = async () => {
    console.log('finish tournament')
    if (selectedTournament) {
      await window.api.changeTournamentPhase({ id: selectedTournament.id, phase: 'finished' })
      getTournament(selectedTournament.id)
    }
  }

  return (
    <div className='playtime-tournament-window'>
      playtime tournament window
      <button onClick={finishTournament}>finish tournament</button>
    </div>
  )
}

export default PlaytimeTournamentWindow
