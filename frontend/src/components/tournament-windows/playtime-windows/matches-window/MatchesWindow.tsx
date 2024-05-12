import { useTournaments } from '../../../../contexts/TournamentsProvider'
import './MatchesWindow.scss'

const MatchesWindow = () => {
  const { matches, setResult,selectedMatchIndex, setSelectedMatchIndex } = useTournaments();

  return (
    <section className='matches-window'>
      <h4 className='h4'>Nasazení</h4>
      <div className="results-control-panel">
        <button className="results-control-button dark" onClick={() => setResult(1)}>1  :  0</button>
        <button className="results-control-button dark" onClick={() => setResult(0.5)}>½  :  ½</button>
        <button className="results-control-button dark" onClick={() => setResult(0)}>0  :  1</button>
      </div>
      <div className="matches-wrapper">
        <table className="matches">
          <thead>
            <tr className="matches-heading">
              <th className="board-number width-s text-right">Č.</th>
              <th className="start-position width-s text-right">St.č.</th>
              <th className="name text-left">Bílý</th>
              <th className="score text-center">B</th>
              <th className="result text-center">Výsledek</th>
              <th className="score text-center">B</th>
              <th className="name text-left">Černý</th>
              <th className="start-position width-s text-right">St.č.</th>
            </tr>
          </thead>
          <tbody>
            {
              matches.map((match, index) => (
                <tr key={index} className={`match${selectedMatchIndex === index ? ' selected' : ''}`} onClick={() => setSelectedMatchIndex(index)}>
                  <td className="board-number width-s text-right">{match.boardNumber}</td>
                  <td className="start-position width-s text-right">{match.whitePlayer.startPosition}</td>
                  <td className="name text-left">{match.whitePlayer.name}</td>
                  <td className="score text-center">{match.whitePlayer.score}</td>
                  <td className="result text-center">
                    {
                      match.result !== null ?
                      match.result === 0.5 ? '½  :  ½' : `${match.result} : ${Math.abs(match.result - 1)}`
                      : ':'
                    }
                   </td>
                  <td className="score text-center">{match.blackPlayer.score}</td>
                  <td className="name text-left">{match.blackPlayer.name}</td>
                  <td className="start-position width-s text-right">{match.blackPlayer.startPosition}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default MatchesWindow