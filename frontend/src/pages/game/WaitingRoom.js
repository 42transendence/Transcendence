import PageComponent from '@component/PageComponent.js';
import PlayerCard from '@component/card/PlayerCard';
import OpenModalButton from '@component/button/OpenModalButton';
import ModalComponent from '@component/modal/ModalComponent';
import GameManual from '@component/contents/GameManual';
import SocketManager from '@/utils/SocketManager';
import Router from '@/utils/Router';
import ToastHandler from '@/utils/ToastHandler';

class WaitingRoom extends PageComponent {
  constructor() {
    super();
    this.setTitle('Waiting Room');
    const params = new URLSearchParams(document.location.search);
    this.roomTitle = '';
    this.roomMode = params.get('mode');
    this.players =
      this.roomMode === 'normal'
        ? [{ id: 1 }, { id: 2 }]
        : [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
  }

  async render() {
    const ManualButton = OpenModalButton({
      text: '> Manual',
      classList:
        'btn btn-no-outline-hover fs-2 position-absolute top-0 end-0 mt-2 me-2 d-none d-md-block',
      modalId: '#gameManualModal',
    });
    const GameManualModal = ModalComponent({
      borderColor: 'mint',
      title: 'How To Play',
      modalId: 'gameManualModal',
      content: GameManual(),
      buttonList: [],
    });
    return `
      ${GameManualModal}
      <div class="container h-100 p-3 game-room-border">
        <div class="d-flex flex-column h-100 position-relative">
          <h1 id="room-title" class="fs-15 text-center">Welcome to<br />[ ${this.roomTitle} ]</h1>
          ${ManualButton}
          <div class="container overflow-auto h-100">
            <div id="player-container" class="row row-cols-1 row-cols-md-2 g-1">
              ${this.players.map((player) => PlayerCard(player)).join('')}
            </div>
          </div>
        </div>
      </div>
      `;
  }

  addRoomTitle() {
    const roomTitle = document.getElementById('room-title');
    roomTitle.innerHTML = `Welcome to<br />[ ${this.roomTitle} ]`;
  }

  addPlayers() {
    this.players.forEach((player) => {
      const playerId = document.getElementById(`player${player.id}-id`);
      const playerName = document.getElementById(`player${player.id}-name`);
      const playerScore = document.getElementById(`player${player.id}-score`);
      const playerImg = document.getElementById(`player${player.id}-img`);
      playerId.innerHTML = `Player ${player.id}`;
      playerName.innerHTML = player.name || 'waiting...';
      playerScore.innerHTML = player.name
        ? `${player.win}W/${player.lose}L`
        : '...';
      playerImg.innerHTML = player.profileImg
        ? `<img src="${player.profileImg}" onerror="this.src='/img/profile_fallback.jpg';" class="img-fluid" alt="profile" style="object-fit: cover;" />`
        : '';
    });
  }

  makePlayerList(data) {
    const playerCount = this.roomMode === 'normal' ? 2 : 4;
    const players = [];
    for (let i = 0; i < playerCount; i += 1) {
      players.push({
        id: i + 1,
        name: data[`user${i}`],
        profileImg: data[`user${i}_image`],
        win: data[`user${i}_win`],
        lose: data[`user${i}_lose`],
      });
    }
    this.players = players;
  }

  async afterRender() {
    SocketManager.roomSocket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      this.roomTitle = data.room_name;
      this.addRoomTitle();
      switch (data.type) {
        case 'users':
          this.makePlayerList(data);
          this.addPlayers();
          break;
        case 'start_game':
          SocketManager.roomSocket.close();
          Router.navigateTo(
            `/game/play?id=${data.room_id}&mode=${this.roomMode}`
          );
          break;
        case 'error':
          console.error('Room Socket Error:', data.message);
          ToastHandler.setToast(data.message);
          SocketManager.roomSocket.close();
          history.back();
          break;
        default:
          // TODO: data 수정되면 조건문 삭제
          if (data.error) {
            console.error('Room Socket Error:', data.error);
            ToastHandler.setToast(data.error);
            SocketManager.roomSocket.close();
            history.back();
          }
          break;
      }
    };
  }
}

export default WaitingRoom;
