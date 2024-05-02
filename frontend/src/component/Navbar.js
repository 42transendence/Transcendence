import { Popover } from 'bootstrap'; // eslint-disable-line no-unused-vars
import NavLink from '@component/NavLink.js';

const NavBar = () => {
  const links = [
    {
      text: 'Home',
      path: '/',
      classList: ['nav-link', 'fs-1'],
    },
    {
      text: 'Profile',
      path: '/profile',
      classList: ['nav-link', 'fs-1'],
    },
    {
      text: 'Play Game',
      path: '/',
      classList: ['nav-link', 'fs-1'],
    },
    {
      text: 'Friends',
      path: '/',
      classList: ['nav-link', 'fs-1'],
    },
    {
      text: 'Logout',
      path: '/login',
      classList: ['nav-link', 'fs-1'],
    },
  ];

  const NavLinks = links.map((link) => NavLink(link).outerHTML).join('');

  return `
    <div class="position-absolute bottom-0 start-0">
      <div class="collapse collapse-horizontal" id="collapseWidthExample">
        <div class="card card-body bg-black bg-gradient bg-opacity-75 border-4 border-black menubar">
          <nav class="nav flex-column">
            ${NavLinks}
          </nav>
        </div>
      </div>
      <button class="btn btn-dark fs-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapseWidthExample" aria-expanded="false" aria-controls="collapseWidthExample">
        Menu
      </button>
    </div>
  `;
};

export default NavBar;
