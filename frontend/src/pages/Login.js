import PageComponent from '@component/PageComponent.js';
import RegisterFormItem from '@component/form/RegisterFormItem';
import Header from '@component/text/Header';
import LoginPageButtons from '@component/button/LoginPageButtons';
import ModalComponent from '@component/modal/ModalComponent';
import BasicButton from '@component/button/BasicButton';
import LoginForm from '@component/form/LoginForm';
import { Modal } from 'bootstrap';
import Regex from '@/constants/Regex';
import Fetch from '@/utils/Fetch';
import Router from '@/utils/Router';
import TokenManager from '@/utils/TokenManager';
import ToastHandler from '@/utils/ToastHandler';

class Login extends PageComponent {
  constructor() {
    super();
    this.setTitle('Login');
    this.email = '';
    this.code = new URLSearchParams(window.location.search).get('code');
  }

  async render() {
    const LoginHeader = Header({
      title: 'PONG!',
      subtitle: "- The World's best retro pong game",
    });
    const LoginModal = ModalComponent({
      borderColor: 'mint',
      title: 'WAIT!',
      modalId: 'loginModal',
      content: LoginForm(),
      buttonList: ['submitBtn'],
    });
    const LoginBtn = BasicButton({
      id: 'loginBtn',
      text: 'Login',
      classList: 'btn btn-outline-light fs-13 px-5',
      type: 'submit',
      form: 'login-form',
    });

    return `
      ${LoginHeader}
      <div class="d-flex justify-content-center align-items-center h-85">
        <div class="d-flex flex-column justify-content-around align-items-center h-90 py-3">
          <div class="d-flex flex-column justify-content-center align-content-center">
            <form id="login-form" class="mb-5">
              ${RegisterFormItem('row py-3', 'email-login', 'EMAIL', 'text', 'name @ mail', 'email')}
              ${RegisterFormItem('row py-3', 'password-login', 'PASSWORD', 'password', 'PASSWORD', 'current-password')}
            </form>
              ${LoginBtn}
          </div>
          <div>
            ${LoginPageButtons()}
          </div>
        </div>
          ${LoginModal}
      </div>
      `;
  }

  async get2FACode() {
    const email = document.getElementById('email-login').value;
    const password = document.getElementById('password-login').value;
    const loginModal = Modal.getOrCreateInstance('#loginModal');
    if (!email || !password) {
      ToastHandler.setToast('Please enter your email and password');
      return;
    }
    if (Regex.email.test(email) === false) {
      ToastHandler.setToast('Invalid Email Address');
      return;
    }
    await Fetch.post('/login/email/login/', { email, password })
      .then((res) => {
        loginModal.show();
        ToastHandler.setToast(res.message || 'Verification code Sent');
      })
      .catch((err) => {
        ToastHandler.setToast(`${err.message || 'Login Failed'}`);
      });
  }

  async getAccessToken() {
    const loginModal = Modal.getOrCreateInstance('#loginModal');
    const email = document.getElementById('email-login').value;
    const passcode = document.getElementById('passcode').value;

    if (!passcode) {
      ToastHandler.setToast('Please enter your passcode');
      return;
    }
    if (Regex.passcode.test(passcode) === false) {
      ToastHandler.setToast('Invalid Passcode');
      return;
    }

    await Fetch.post('/login/email/login/verify/', { email, code: passcode })
      .then((data) => {
        TokenManager.storeToken(data.access_token);
        loginModal.hide();
        Router.navigateTo('/');
        ToastHandler.setToast(data.message || 'Login Successful');
      })
      .catch((err) => {
        ToastHandler.setToast(`${err.message || 'Verification Failed'}`);
      });
  }

  handleTwoFactorSubmitEvent = async (e) => {
    e.preventDefault();
    await this.getAccessToken();
  };

  handleLoginSubmitEvent = async (e) => {
    e.preventDefault();
    await this.get2FACode();
  };

  addLoginSubmitEvent() {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', this.handleLoginSubmitEvent);
  }

  removeLoginSubmitEvent() {
    const loginForm = document.getElementById('login-form');
    loginForm.removeEventListener('submit', this.handleLoginSubmitEvent);
  }

  add2FASubmitEvent() {
    const twoFactorLoginForm = document.getElementById('login-code-form');
    twoFactorLoginForm.addEventListener(
      'submit',
      this.handleTwoFactorSubmitEvent
    );
  }

  remove2FASubmitEvent() {
    const twoFactorLoginForm = document.getElementById('login-code-form');
    twoFactorLoginForm.removeEventListener(
      'submit',
      this.handleTwoFactorSubmitEvent
    );
  }

  handle2FALogin() {
    const loginModal = document.getElementById('loginModal');
    this.addLoginSubmitEvent();

    loginModal.addEventListener('show.bs.modal', () => {
      this.removeLoginSubmitEvent();
      this.add2FASubmitEvent();
    });

    loginModal.addEventListener('hide.bs.modal', () => {
      this.remove2FASubmitEvent();
      this.addLoginSubmitEvent();
    });
  }

  // TODO: 서버 응답 에러 분기 처리
  submitRegisterForm() {
    document
      .getElementById('registerForm')
      .addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target.elements;
        const email = form.email.value;
        const username = form.nick.value;
        const password = form.password.value;
        const passwordRe = form.passwordRe.value;
        if (!email || !username || !password || !passwordRe) {
          ToastHandler.setToast('Please fill in all fields');
          return;
        }
        if (Regex.email.test(email) === false || email.length > 200) {
          ToastHandler.setToast('Invalid Email Address');
          return;
        }
        if (Regex.nickname.test(username) === false) {
          ToastHandler.setToast('Nickname must be 2-10 characters');
          return;
        }

        if (password.length < 8) {
          ToastHandler.setToast('Password must be at least 8 characters');
          return;
        }
        if (password.search(/[a-zA-Z]/) === -1) {
          ToastHandler.setToast('Password must contain at least one letter');
          return;
        }
        if (password.search(/[0-9]/) === -1) {
          ToastHandler.setToast('Password must contain at least one number');
          return;
        }

        if (password !== passwordRe) {
          ToastHandler.setToast('Password does not match');
          return;
        }

        const registerModal = Modal.getOrCreateInstance('#registerModal');
        const verifyModal = Modal.getOrCreateInstance('#emailVerifyModal');

        await Fetch.post('/login/email/register/', {
          email,
          username: username.toLowerCase(),
          password,
        })
          .then(() => {
            this.email = email;
            ToastHandler.setToast('Registration Successful');
            document.getElementById('registerForm').reset();
            registerModal.hide();
            verifyModal.show();
          })
          .catch((err) => {
            this.email = '';
            ToastHandler.setToast(`${err.message || 'Registration Failed'}`);
          });
      });
  }

  submitEmailVerifyForm() {
    document
      .getElementById('emailVerifyForm')
      .addEventListener('submit', async (e) => {
        e.preventDefault();
        const { email } = this;
        const code = document.getElementById('emailCode').value;

        const verifyModal = Modal.getOrCreateInstance('#emailVerifyModal');
        await Fetch.post('/login/email/register/verify/', { email, code })
          .then((res) => {
            ToastHandler.setToast(
              res.message || 'Email Verification Successful'
            );
            document.getElementById('emailVerifyForm').reset();
            verifyModal.hide();
            this.email = '';
          })
          .catch((err) => {
            ToastHandler.setToast(`${err.message || 'Verification Failed'}`);
          });
      });
  }

  async handle42Login() {
    await Fetch.get(`/login/intra/callback/?code=${this.code}`)
      .then((data) => {
        TokenManager.storeToken(data.access_token);
        Router.navigateTo('/');
        ToastHandler.setToast(data.message || '42 Login Successful');
      })
      .catch((err) => {
        ToastHandler.setToast('42 Login Failed');
        TokenManager.clearToken();
        Router.navigateTo('/login');
        ToastHandler.setToast(`${err.message || '42 Login Failed'}`);
      });
  }

  async afterRender() {
    // 42 로그인
    if (this.code) {
      await this.handle42Login();
      return;
    }
    // 2FA 로그인
    this.handle2FALogin();
    // 회원가입
    this.submitRegisterForm();
    this.submitEmailVerifyForm();
  }
}

export default Login;
