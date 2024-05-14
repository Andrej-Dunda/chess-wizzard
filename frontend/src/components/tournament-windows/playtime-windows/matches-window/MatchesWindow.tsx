import { useTournaments } from '../../../../contexts/TournamentsProvider'
import TournamentControlPanel from '../../../tournament-control-panel/TournamentControlPanel';
import './MatchesWindow.scss'

const MatchesWindow = () => {
  const { matches, setResult, selectedMatchIndex, setSelectedMatchIndex, selectedTournament } = useTournaments();

  const formatNumber = (num: number) => {
    if (num === 0.5) return '½';
    const integerPart = Math.floor(num);
    const decimalPart = num - integerPart;
    if (decimalPart === 0.5) {
      return `${integerPart}½`;
    } else {
      return num;
    }
  }

  return (
    <section className='matches-window'>
      <h4 className='h4'>Nasazení {selectedTournament && selectedTournament.currentRound}. kola</h4>
      <div className="results-control-panel">
        <button className="results-control-button dark" onClick={() => setResult(1)}>1  :  0</button>
        <button className="results-control-button dark" onClick={() => setResult(0.5)}>½  :  ½</button>
        <button className="results-control-button dark" onClick={() => setResult(0)}>0  :  1</button>
      </div>
      <div className="matches-wrapper">
        <table className="matches">
          <thead>
            <tr className="matches-heading">
              <th className="board-number width-s text-center">Stůl</th>
              <th className="start-position width-s text-center">St.č.</th>
              <th className="name text-left">Bílý</th>
              <th className="score text-center">B</th>
              <th className="result text-center">Výsledek</th>
              <th className="score text-center">B</th>
              <th className="name text-left">Černý</th>
              <th className="start-position width-s text-center">St.č.</th>
            </tr>
          </thead>
          <tbody>
            {
              matches.map((match, index) => (
                <tr key={index} className={`match${selectedMatchIndex === index ? ' selected' : ''}`} onClick={() => setSelectedMatchIndex(index)}>
                  <td className="board-number width-s text-center">{match.boardNumber}</td>
                  <td className="start-position width-s text-center">{match.whitePlayer.startPosition}</td>
                  <td className="name text-left">{match.whitePlayer.name}</td>
                  <td className="score text-center">{formatNumber(match.whitePlayer.score)}</td>
                  <td className="result text-center">
                    {
                      match.result !== null ?
                      match.result === 0.5 ? '½  :  ½' : `${match.result} : ${Math.abs(match.result - 1)}`
                      : ':'
                    }
                   </td>
                  <td className="score text-center">{formatNumber(match.blackPlayer.score)}</td>
                  <td className="name text-left">{match.blackPlayer.name}</td>
                  <td className="start-position width-s text-center">{match.blackPlayer.startPosition}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
      <TournamentControlPanel />
    </section>
  )
}

export default MatchesWindow
