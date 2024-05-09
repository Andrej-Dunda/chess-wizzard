import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTournaments } from '../contexts/TournamentsProvider'
import './TournamentWindow.scss'
import React, { useRef, useState } from 'react'
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { iTournamentPlayer } from '../interfaces/tournaments-interface';

const TournamentWindow = () => {
  const { selectedTournament, tournamentPlayers, addTournamentPlayer, removeTournamentPlayer } = useTournaments();
  const newPlayerInputRef = useRef<HTMLInputElement>(null);
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();

  const onNewPlayerInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!newPlayerName.trim()) {
        return
      }

      selectedTournament && addTournamentPlayer(selectedTournament.players_table_name, newPlayerName)
      setNewPlayerName('')
      newPlayerInputRef.current?.focus()
    }
  }

  const removePlayer = (playerId: number) => {
    selectedTournament && removeTournamentPlayer(selectedTournament.players_table_name, playerId)
  }

  return (
    <div className='tournament-window'>
      <div className="tournament-window-header">
        <h5 className="tournament-title">{selectedTournament?.name}</h5>
        <span className='tournament-date'>{selectedTournament && new Date(selectedTournament.date).toLocaleDateString()}</span>
      </div>
      <div className="tournament-window-body">
          <section className="players-section">
          <h4>Hráči</h4>
          <input
            type="text"
            className='new-player-input'
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Nový hráč..."
            ref={newPlayerInputRef}
            onKeyDown={onNewPlayerInputKeyDown}
          />
          {tournamentPlayers.length ? (
          <div className="players">
            <div className="players-wrapper">
              {tournamentPlayers.sort().map((player: iTournamentPlayer, index) => (
                <div key={index} className="player">
                  <span className="player-name">{player.name}</span>
                  <FontAwesomeIcon icon={faXmark} color={grayscale900} className='remove-icon' onClick={() => removePlayer(player.id)} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <span>Zatím žádní hráči...</span>
        )}
        </section>
      </div>
    </div>
  )
}

export default TournamentWindow
