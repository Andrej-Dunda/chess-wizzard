import './RegistrationTournamentWindow.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react'
import { faHome, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useTournaments } from '../../contexts/TournamentsProvider';
import { iTournamentPlayer } from '../../interfaces/tournaments-interface';
import { useNav } from '../../contexts/NavigationProvider';

const RegistrationTournamentWindow = () => {
  const { selectedTournament, tournamentPlayers, addTournamentPlayer, removeTournamentPlayer, changeTournamentPhase, changeTournamentRound } = useTournaments();
  const newPlayerInputRef = useRef<HTMLInputElement>(null);
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const grayscale900 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-900').trim();
  const { toHome } = useNav();

  useEffect(() => {
    newPlayerInputRef.current?.focus()
  })

  const onNewPlayerInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && submitNewPlayer()

  const submitNewPlayer = () => {
    if (!newPlayerName.trim()) return newPlayerInputRef.current?.focus()

    selectedTournament && addTournamentPlayer(newPlayerName)
    setNewPlayerName('')
    newPlayerInputRef.current?.focus()
  }

  const removePlayer = (playerId: number) => {
    selectedTournament && removeTournamentPlayer(playerId)
  }

  const startTournament = async () => {
    await changeTournamentRound('next')
    await changeTournamentPhase('playtime')
  }

  return (
    <div className='registration-tournament-window'>
      <div className="tournament-window-header">
        <h5 className="tournament-title">{selectedTournament?.name}</h5>
        <FontAwesomeIcon className='home-button' onClick={toHome} icon={faHome} />
      </div>
      <div className="tournament-window-body">
        <section className="players-section">
          <h4>Hráči</h4>
          <div className="new-player-input-wrapper">
            <input
              type="text"
              className='new-player-input'
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Zadejte jméno hráče a stiskněte Enter pro přidání..."
              ref={newPlayerInputRef}
              onKeyDown={onNewPlayerInputKeyDown}
            />
            <span className="icon-wrapper" onClick={submitNewPlayer}>
              <FontAwesomeIcon icon={faPlus} color={grayscale900} className='add-icon' />
            </span>
          </div>
          {tournamentPlayers.length ? (
            <>
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
              {tournamentPlayers.length > 1 && (
                <button className="close-registration-button dark" onClick={startTournament}>Uzavřít registraci hráčů</button>
              )}
            </>
          ) : (
            <span>Zatím žádní hráči...</span>
          )}
        </section>
      </div>
    </div>
  )
}

export default RegistrationTournamentWindow
