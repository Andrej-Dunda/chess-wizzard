import { useModal } from '../../../contexts/ModalProvider';
import { useTournaments } from '../../../contexts/TournamentsProvider';
import './NewTournamentModalContent.scss'
import React, { useEffect, useRef, useState } from 'react'

const NewTournamentModalContent = () => {
  const [newTournamentName, setNewTournamentName] = useState<string>('')
  const [newTournamentRoundsCount, setNewTournamentRoundsCount] = useState<number>(7)
  const { postTournament } = useTournaments();
  const { closeModal } = useModal();
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.getElementById('new-tournament-name-input')?.focus()
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        submitButtonRef.current && submitButtonRef.current.click()
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submitNewTournament = () => {
    postTournament(newTournamentName, newTournamentRoundsCount)
    setNewTournamentName('')
    setNewTournamentRoundsCount(1)
    closeModal()
  }

  return (
    <div className='new-tournament-modal-content'>
      <div className="header">
        <h2 className='h2'>Nový turnaj</h2>
        <label className='rounds-count-label' htmlFor="new-tournament-rounds-count-input">
          <span>Počet kol:</span>
          <input
            type="number"
            id='new-tournament-rounds-count-input'
            value={newTournamentRoundsCount}
            onChange={(e) => setNewTournamentRoundsCount(parseInt(e.target.value))}
            min={1}
            max={15}
          />
        </label>
      </div>
      <input
        type="text"
        id='new-tournament-name-input'
        value={newTournamentName}
        onChange={(e) => setNewTournamentName(e.target.value)}
        placeholder='Název turnaje'
      />
      <button className="submit-button dark" onClick={submitNewTournament} ref={submitButtonRef}>Vytvořit turnaj</button>
    </div>
  )
}

export default NewTournamentModalContent
