import { useTournaments } from '../../../contexts/TournamentsProvider';
import { iTournamentPlayer } from '../../../interfaces/tournaments-interface'
import PlayerNameComponent from '../../player-name-component/PlayerNameComponent';
import './PlayerHistoryModalContent.scss'

const PlayerHistoryModalContent = ({ player }: { player: iTournamentPlayer }) => {
  const { allTournamentMatches, formatNumber } = useTournaments();
  const playerMatches = allTournamentMatches.map(matches => {
    const match = matches.find(match => {
      return match.whitePlayer.id === player.id || match.blackPlayer.id === player.id
    });
    return match;
  }).sort((a, b) => (a?.round || 0) - (b?.round || 0));

  return (
    <div className='player-history-modal-content'>
      <h4 className="player-name">{player.name}</h4>

      <div className='player-data'>
        <div className='player-data-row'>
          <div className="data-wrapper">
            <span className='label'>Startovní číslo:</span>
            <span className='value'>{player.startPosition}</span>
          </div>
          <div className="data-wrapper">
            <span className='label'>Body:</span>
            <span className='value'>{formatNumber(player.score)}</span>
          </div>
        </div>
        <div className='player-data-row'>
          <div className="data-wrapper">
            <span className='label'>Bucholz:</span>
            <span className='value'>{player.bucholz}</span>
          </div>
          <div className="data-wrapper">
            <span className='label'>Sonnenborn-Berger:</span>
            <span className='value'>{player.sonnenbornBerger}</span>
          </div>
        </div>
      </div>

      <div className="player-matches-wrapper">
        <table className="player-matches-table">
          <thead>
            <tr className='heading-row'>
              <td className='width-s'>Kolo</td>
              <td className='width-s'>Barva</td>
              <td className='opponent-name'>Protihráč</td>
              <td className='width-s'>Výsledek</td>
            </tr>
          </thead>
          <tbody>
            {playerMatches.map((match, index) => {
              return (
                <tr key={index} className='match-row'>
                  <td className='width-s'>{match && match.round}</td>
                  <td className='color'><div><div className={`${player.colorSequence[index]}`}></div></div></td>
                  <td className='opponent-name'>{match && match.whitePlayer.id === player.id ? <PlayerNameComponent playerId={match.blackPlayer.id} /> : match && <PlayerNameComponent playerId={match.whitePlayer.id} />}</td>
                  <td className='width-s'>
                    {
                      !match?.result ? '-' : match?.result === 0.5 ? '½'
                      : match?.whitePlayer.id === player.id ? match?.result === 1 ? '1' : '0'
                      : match?.result === 1 ? '0' : '1'
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PlayerHistoryModalContent
