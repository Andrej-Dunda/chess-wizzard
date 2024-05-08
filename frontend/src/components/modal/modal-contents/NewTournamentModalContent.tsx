import { useTournaments } from '../../../contexts/TournamentsProvider';
import './NewTournamentModalContent.scss'
import React, { useState } from 'react'

const NewTournamentModalContent = () => {
  const [newTournamentName, setNewTournamentName] = useState<string>('')
  const { postTournament } = useTournaments();

  const submitNewTournament = () => {
    postTournament(newTournamentName)
  }

  return (
    <div className='new-tournament-modal-content'>
      <input type="text" value={newTournamentName} onChange={(e) => setNewTournamentName(e.target.value)} />
      <button className="submit-button" onClick={submitNewTournament}>Vytvořit turnaj</button>
    </div>
  )
}

export default NewTournamentModalContent
