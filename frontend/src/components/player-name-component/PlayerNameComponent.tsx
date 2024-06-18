import { useModal } from '../../contexts/ModalProvider';
import { useTournaments } from '../../contexts/TournamentsProvider';
import { iTournamentPlayer } from '../../interfaces/tournaments-interface'
import PlayerHistoryModalContent from '../modal/modal-contents/PlayerHistoryModalContent';
import './PlayerNameComponent.scss'
import React from 'react'

const PlayerNameComponent = ({ playerId }: {playerId: number}) => {
  const { showModal } = useModal();
  const { tournamentPlayers } = useTournaments();
  const player = tournamentPlayers.find(player => player.id === playerId) as iTournamentPlayer;

  return (
    <span className='player-name-component' onClick={() => showModal(<PlayerHistoryModalContent player={player} />)}>
      {player.name}
    </span>
  )
}

export default PlayerNameComponent
