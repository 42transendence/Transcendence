import PageComponent from '@component/PageComponent.js';
import NavLink from '@component/navigation/NavLink';
import BasicButton from '@component/button/BasicButton';
import Pagination from '@component/navigation/Pagination';
import Fetch from '@/utils/Fetch';

class JoinRoom extends PageComponent {
  constructor() {
    super();
    this.mode = 'rumble';
    this.currPage = 1;
    this.totalPage = 1;
    this.size = 5;
    this.setTitle('Join Room');
  }

  async getPageData() {
    const roomList =
      this.mode === 'rumble'
        ? await Fetch.get(
            `/rumbleList?_page=${this.currPage}&_limit=${this.size}`
          )
        : await Fetch.get(
            `/tournamentList?_page=${this.currPage}&_limit=${this.size}`
          );

    this.totalPage = 2; // TODO: totalPage 받아오기
    this.setPagination();

    return roomList
      .map((room) => {
        const text =
          this.mode === 'rumble'
            ? `[ ${room.title} ]`
            : `[ ${room.title} ] (${room.currentParty}/4)`;
        return NavLink({
          text,
          path: `/game/waiting?room=${room.id}&title=${room.title}&mode=${this.mode}`,
          classList: 'btn btn-no-outline-hover fs-11 btn-arrow',
        }).outerHTML;
      })
      .join('');
  }

  async render() {
    const RoomLinks = await this.getPageData();
    const reloadRoomBtn = BasicButton({
      id: 'reloadRoomBtn',
      text: '> Reload',
      classList:
        'btn fs-2 position-absolute top-0 end-0 mt-2 me-2 btn-no-outline-hover',
    });

    return `
      <div class="container h-100 p-3 game-room-border">
        <div class="d-flex justify-content-center position-relative">
          <h1 class="display-1 text-center">[ Room List ]</h1>
          ${reloadRoomBtn}
        </div>
        <nav class="nav nav-tabs">
          <button class="col btn btn-outline-light fs-1 active" id="rumbleTab" data-bs-toggle="tab" type="button">Rumble</button>
          <button class="col btn btn-outline-light fs-1" id="tournamentTab" data-bs-toggle="tab" type="button" >Tournament</button>
        </nav>
        <div class="d-flex flex-column h-75 justify-content-center">
          <div id="pageBody" class="tab-pane active d-flex flex-column flex-column overflow-auto h-100">
            ${RoomLinks}
          </div>
          ${Pagination({ currPage: this.currPage, totalPage: this.totalPage })}
        </div>
      </div>
      `;
  }

  async afterRender() {
    const pageBody = document.getElementById('pageBody');

    // 새로고침
    const reloadRoomBtn = document.getElementById('reloadRoomBtn');
    reloadRoomBtn.addEventListener('click', async () => {
      this.currPage = 1;
      pageBody.innerHTML = await this.getPageData();
    });

    // 탭
    const rumbleTab = document.getElementById('rumbleTab');
    const tournamentTab = document.getElementById('tournamentTab');
    rumbleTab.addEventListener('click', async () => {
      this.mode = 'rumble';
      this.currPage = 1;
      pageBody.innerHTML = await this.getPageData();
    });
    tournamentTab.addEventListener('click', async () => {
      this.mode = 'tournament';
      this.currPage = 1;
      pageBody.innerHTML = await this.getPageData();
    });

    this.onPaginationClick(this);
  }
}

export default JoinRoom;
