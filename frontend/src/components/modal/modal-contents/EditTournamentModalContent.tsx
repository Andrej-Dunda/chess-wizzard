import './EditTournamentModalContent.scss'
import React, { useEffect, useRef, useState } from 'react'
import ModalFooter from '../modal-footer/ModalFooter'
import { useModal } from '../../../contexts/ModalProvider'
import ErrorMessage from '../../error-message/ErrorMessage'
import { iTournament } from '../../../interfaces/tournaments-interface'
import { useTournaments } from '../../../contexts/TournamentsProvider'

type EditTournamentModalContentProps = {
  tournament: iTournament
}

const EditTournamentModalContent = ({tournament}: EditTournamentModalContentProps) => {
  const { closeModal } = useModal();
  const { putTournament } = useTournaments();
  const [newTournamentName, setNewTournamentName] = useState<string>(tournament.name)
  const [editTournamentModalError, setEditTournamentModalError] = useState<string>('')
  const newTournamentNameInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    newTournamentNameInputRef.current?.focus()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = () => {
    if (!newTournamentName.trim()) {
      setEditTournamentModalError('Pole Název turnaje nesmí být prázdné!')
      newTournamentNameInputRef.current?.focus()
      return
    }
    else if (newTournamentName.length > 50) {
      setEditTournamentModalError('Název turnaje nesmí být delší než 50 znaků!')
      newTournamentNameInputRef.current?.focus()
      return
    }
    else if (newTournamentName === tournament.name) {
      closeModal()
      return
    }

    putTournament(tournament.id, newTournamentName)
    closeModal()
  }

  const onInputChange = (e: any) => {
    setNewTournamentName(e.target.value)
  }

  return (
    <div className="edit-tournament-modal-content">
      <h1 className='title'>Upravit turnaj</h1>
      <div className='tournament-wrapper'>
        <div className="name-input-wrapper">
          <label htmlFor="tournament-name-input">Název turnaje:</label>
          <input
            type='text'
            id='tournament-name-input'
            name='tournament-name-input'
            value={newTournamentName}
            onChange={onInputChange}
            ref={newTournamentNameInputRef}
            maxLength={50}
          />
        </div>
      </div>
      <ErrorMessage content={editTournamentModalError} />
      <ModalFooter
        onClose={closeModal}
        onSubmit={handleSubmit}
        submitButtonLabel='Uložit'
        cancelButtonLabel='Zrušit'
      />
    </div>
  )
}

export default EditTournamentModalContent
