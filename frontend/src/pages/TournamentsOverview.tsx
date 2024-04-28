import EllipsisMenuButton from '../components/buttons/ellipsis-menu-button/EllipsisMenuButton';
import DeleteModalContent from '../components/modal/modal-contents/DeleteModalContent';
import EditTournamentModalContent from '../components/modal/modal-contents/EditTournamentModalContent';
import NewTournamentModalContent from '../components/modal/modal-contents/NewTournamentModalContent';
import { useModal } from '../contexts/ModalProvider';
import { useNav } from '../contexts/NavigationProvider';
import { useTournaments } from '../contexts/TournamentsProvider';
import { iTournament } from '../interfaces/tournaments-interface';
import './TournamentsOverview.scss'
import { faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TournamentsOverview = () => {
  const { showModal } = useModal();
  const { toTournament } = useNav();
  const { setSelectedTournament, tournaments, deleteTournament } = useTournaments();
  const grayscale300 = getComputedStyle(document.documentElement).getPropertyValue('--grayscale-300').trim();

  const openNewTournamentModal = () => {
    showModal(<NewTournamentModalContent />)
  }

  const openTournament = (tournament: iTournament) => {
    setSelectedTournament(tournament)
    toTournament()
  }

  const openDeleteTournamentModal = (tournament: iTournament) => {
    showModal(
      <DeleteModalContent
        onSubmit={() => deleteTournament(tournament._id)}
        submitButtonLabel='Smazat'
        cancelButtonLabel='Zrušit'
        title={`Smazat turnaj "${tournament.name}"?`}
        content='Opravdu chcete smazat tento turnaj? Tato akce je nevratná!'
      />
    )
  }

  const openEditTournamentModal = (tournament: iTournament) => {
    showModal(<EditTournamentModalContent tournament={tournament} />)
  }

  return (
    <div className="tournaments-overview">
      <h1 className='h1'>Turnaje</h1>
      <div className="tournaments">
        {
          tournaments.map((tournament: iTournament, index: number) => {
            return (
              <div key={index} className="tournament-button">
                <header>
                  <EllipsisMenuButton menuOptions={[
                    {
                      name: 'Smazat',
                      icon: faTrash,
                      onClick: () => openDeleteTournamentModal(tournament)
                    },
                    {
                      name: 'Upravit',
                      icon: faEdit,
                      onClick: () => openEditTournamentModal(tournament)
                    }
                  ]} />
                </header>
                <div className="tournament-button-body" onClick={() => openTournament(tournament)} title={tournament.name}>
                  <h5>
                    {tournament.name}
                  </h5>
                </div>
              </div>
            )
          })
        }
        <button type='button' className="add-tournament-button" onClick={openNewTournamentModal}>
          <FontAwesomeIcon icon={faPlus} className='edit-icon' size="2x" color={grayscale300} />
        </button>
      </div>
    </div>
  )
}

export default TournamentsOverview
