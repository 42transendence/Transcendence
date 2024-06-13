const PlayerInfo = ({ id, name, profileImg, win, lose }) => {
  if (!name) {
    return `
    <div class="col-md-8 align-self-center text-start fs-7">
      <div class="text-break">
        <div class="row">
          <span class="text-info text-opacity-75">Player ${id}</span>
        </div>
        <div class="row">
          <span>WAITING...</span>
        </div>
        <div class="row">
          <span>...</span>
        </div>
      </div>
    </div>
    `;
  }
  return `
    <div class="col-md-8 align-self-center text-start fs-7">
      <div class="text-break">
        <div class="row">
          <span class="text-info text-opacity-75">Player ${id}</span>
        </div>
        <div class="row">
          <span>${name || '...'}</span>
        </div>
        <div class="row">
          <span>${win || 0}W/${lose || 0}L</span>
        </div>
      </div>
    </div>
    <div class="col-md-4 align-content-center">
      <div class="ratio ratio-1x1">
        <img src="${profileImg}" onerror="this.src='/img/profile_fallback.jpg';" class="img-fluid" alt="profile" style="object-fit: cover;" />
      </div>
    </div>
  `;
};

export default PlayerInfo;
