import './MatchesWindow.scss'
import React from 'react'

const MatchesWindow = () => {
  return (
    <section className='matches-window'>
      <h4>Nasazení</h4>
      <div className="matches">
        <div className="matches-wrapper">
          <div className="match">
            <span className="player-name">Andrej</span>
            <span className="player-name">Jirka</span>
          </div>
          <div className="match">
            <span className="player-name">Honza</span>
            <span className="player-name">Kuba</span>
          </div>
          <div className="match">
            <span className="player-name">Lukáš</span>
            <span className="player-name">Martin</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MatchesWindow
