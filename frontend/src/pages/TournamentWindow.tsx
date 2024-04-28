import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTournaments } from '../contexts/TournamentsProvider'
import './TournamentWindow.scss'
import React, { useRef, useState } from 'react'
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { iParticipant } from '../interfaces/tournaments-interface';

const TournamentWindow = () => {
  const { selectedTournament, putTournament } = useTournaments();
  const newParticipantInputRef = useRef<HTMLInputElement>(null);
  const [newParticipantName, setNewParticipantName] = useState<string>('');
  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();

  const generateRandomString = (length: number) => {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  const onNewParticipantInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!newParticipantName.trim()) {
        return
      }

      selectedTournament && putTournament(selectedTournament._id, selectedTournament.name, [...selectedTournament.participants, {_id: generateRandomString(10), name: newParticipantName}])
      setNewParticipantName('')
      newParticipantInputRef.current?.focus()
    }
  }

  const removeParticipant = (participantId: string) => {
    selectedTournament && putTournament(selectedTournament._id, selectedTournament.name, selectedTournament.participants.filter(participant => participant._id !== participantId))
  }

  return (
    <div className='tournament-window'>
      <div className="tournament-window-header">
        <h5 className="tournament-title">{selectedTournament?.name}</h5>
        <span className='tournament-date'>{selectedTournament?.date}</span>
      </div>
      <div className="tournament-window-body">
          <section className="participants-section">
          <h4>Účastníci turnaje</h4>
          <input
            type="text"
            className='new-participant-input'
            value={newParticipantName}
            onChange={(e) => setNewParticipantName(e.target.value)}
            placeholder="Nový účastník..."
            ref={newParticipantInputRef}
            onKeyDown={onNewParticipantInputKeyDown}
          />
          {selectedTournament?.participants.length ? (
          <div className="participants">
            <div className="participants-wrapper">
              {selectedTournament?.participants.sort().map((participant: iParticipant, index) => (
                <div key={index} className="participant">
                  <span className="participant-name">{participant.name}</span>
                  <FontAwesomeIcon icon={faXmark} color={grayscale900} className='remove-icon' onClick={() => removeParticipant(participant._id)} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <span>Zatím žádní účastníci...</span>
        )}
        </section>
      </div>
    </div>
  )
}

export default TournamentWindow
