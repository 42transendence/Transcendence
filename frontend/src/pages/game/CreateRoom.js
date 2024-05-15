import PageComponent from '@component/PageComponent.js';

class CreateRoom extends PageComponent {
  constructor() {
    super();
    this.setTitle('Create Room');
  }

  async render() {
    return `
      <div class="container h-100 p-3 game-room-border">
        <h1 class="display-1 text-center">[ Room Setting ]</h1>
        <div>
          create room
        </div>
      </div>
      `;
  }
}

export default CreateRoom;
