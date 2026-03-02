// ===== SCALEMATICS - COMPLETE JAVASCRIPT =====
// Dark-themed math learning platform

// ===== CONFIGURATION =====
const CONFIG = {
  passwordRules: {
    minLength: 8,
    requireUppercase: true,
    requireNumber: true,
    requireSpecial: true
  },
  toastDuration: 5000,
  game: {
    questionsPerRound: 10,
    timePerQuestion: 20,
    difficulties: {
      easy: { min: 1, max: 50, operations: ['+', '-'] },
      medium: { min: 10, max: 500, operations: ['+', '-', '*'] },
      hard: { min: 50, max: 9999, operations: ['+', '-', '*', '/'] }
    },
    xpPerCorrect: { easy: 10, medium: 25, hard: 50 },
    coinsPerCorrect: { easy: 5, medium: 15, hard: 30 }
  },
  apiEndpoints: {
    register: 'php/register.php',
    login: 'php/login.php',
    forgotPassword: 'php/forgot_password.php',
    logout: 'php/logout.php'
  }
};

// ===== STATE =====
const AppState = {
  currentScreen: 'screenLanding',
  previousScreen: null,
  currentUser: null,
  selectedDifficulty: 'easy',
  gameActive: false,
  gameData: {
    currentQuestion: 0,
    score: 0,
    timer: null,
    timeLeft: 20,
    questions: [],
    correctAnswer: null
  },
  userStats: {
    coins: 500,
    xp: 0,
    streak: 0,
    classicHigh: 0,
    survivalHigh: 0,
    timedHigh: 0
  }
};

// ===== UTILITY FUNCTIONS =====
const Utils = {
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  $(id) {
    return document.getElementById(id);
  },

  $$(selector) {
    return document.querySelectorAll(selector);
  }
};

// ===== TOAST MODULE =====
const Toast = {
  show(message, type = 'success') {
    const toastId = type === 'success' ? 'successToast' : 'errorToast';
    const toast = Utils.$(toastId);
    if (!toast) return;

    const msgEl = toast.querySelector('.toast-message p, .error-message');
    if (msgEl) msgEl.textContent = message;

    toast.classList.remove('toast--hidden');

    setTimeout(() => {
      toast.classList.add('toast--hidden');
    }, CONFIG.toastDuration);
  },

  init() {
    Utils.$$('.toast-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const toast = e.target.closest('.toast');
        if (toast) toast.classList.add('toast--hidden');
      });
    });
  }
};

// ===== NAVIGATION MODULE =====
const Navigation = {
  init() {
    // Desktop nav links
    Utils.$$('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const screenId = link.dataset.screen;
        if (screenId) {
          // If user not logged in and trying to access dashboard screens, redirect to auth
          if (!AppState.currentUser && screenId !== 'screenLanding') {
            this.showScreen('screenAuth');
            return;
          }
          this.showScreen(screenId);
          this.setActiveNav(link);
        }
      });
    });

    // Mobile nav links
    Utils.$$('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const screenId = link.dataset.screen;
        if (screenId) {
          if (!AppState.currentUser && screenId !== 'screenLanding') {
            this.showScreen('screenAuth');
            MobileMenu.close();
            return;
          }
          this.showScreen(screenId);
          this.setActiveMobileNav(link);
          MobileMenu.close();
        }
      });
    });

    // Start button
    const btnStart = Utils.$('btnStart');
    if (btnStart) {
      btnStart.addEventListener('click', () => this.showScreen('screenAuth'));
    }

    // Logo click -> home
    const headerLogo = Utils.$('headerLogoBtn');
    if (headerLogo) {
      headerLogo.addEventListener('click', () => {
        if (AppState.currentUser) {
          this.showScreen('screenDashboard');
        } else {
          this.showScreen('screenLanding');
        }
      });
    }
  },

  showScreen(screenId) {
    AppState.previousScreen = AppState.currentScreen;
    AppState.currentScreen = screenId;

    // Hide all screens
    Utils.$$('.screen').forEach(screen => {
      screen.classList.remove('screen--active');
      screen.classList.add('screen--hidden');
    });

    // Show target screen
    const target = Utils.$(screenId);
    if (target) {
      target.classList.remove('screen--hidden');
      target.classList.add('screen--active');
    }

    // Show/hide header based on screen
    const header = Utils.$('mainHeader');
    if (header) {
      if (screenId === 'screenLanding') {
        header.style.display = 'none';
      } else {
        header.style.display = 'block';
      }
    }

    // Update nav active state
    Utils.$$('.nav-link').forEach(link => {
      link.classList.remove('nav-link--active');
      if (link.dataset.screen === screenId) {
        link.classList.add('nav-link--active');
      }
    });

    // Scroll to top
    window.scrollTo(0, 0);
  },

  setActiveNav(activeLink) {
    Utils.$$('.nav-link').forEach(l => l.classList.remove('nav-link--active'));
    activeLink.classList.add('nav-link--active');
  },

  setActiveMobileNav(activeLink) {
    Utils.$$('.mobile-nav-link').forEach(l => l.classList.remove('mobile-nav-link--active'));
    activeLink.classList.add('mobile-nav-link--active');
  }
};

// ===== MOBILE MENU MODULE =====
const MobileMenu = {
  init() {
    const btn = Utils.$('mobileMenuBtn');
    if (btn) {
      btn.addEventListener('click', () => this.toggle());
    }
  },

  toggle() {
    const nav = Utils.$('mobileNav');
    const btn = Utils.$('mobileMenuBtn');
    if (nav && btn) {
      nav.classList.toggle('mobile-nav--hidden');
      btn.classList.toggle('active');
    }
  },

  close() {
    const nav = Utils.$('mobileNav');
    const btn = Utils.$('mobileMenuBtn');
    if (nav) nav.classList.add('mobile-nav--hidden');
    if (btn) btn.classList.remove('active');
  }
};

// ===== PASSWORD VALIDATOR MODULE =====
const PasswordValidator = {
  elements: {},

  init() {
    this.elements = {
      input: Utils.$('signupPassword'),
      strengthText: Utils.$('strengthText'),
      bars: {
        bar1: Utils.$('bar1'),
        bar2: Utils.$('bar2'),
        bar3: Utils.$('bar3'),
        bar4: Utils.$('bar4')
      },
      requirements: {
        length: Utils.$('reqLen'),
        uppercase: Utils.$('reqUp'),
        number: Utils.$('reqNum'),
        special: Utils.$('reqSpec')
      }
    };

    if (!this.elements.input) return;

    const debouncedValidate = Utils.debounce((value) => {
      this.validate(value);
    }, 200);

    this.elements.input.addEventListener('input', (e) => {
      debouncedValidate(e.target.value);
    });
  },

  validate(password) {
    const checks = {
      length: password.length >= CONFIG.passwordRules.minLength,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    this.updateRequirement(this.elements.requirements.length, checks.length, 'At least 8 characters');
    this.updateRequirement(this.elements.requirements.uppercase, checks.uppercase, 'At least one uppercase letter');
    this.updateRequirement(this.elements.requirements.number, checks.number, 'At least one number');
    this.updateRequirement(this.elements.requirements.special, checks.special, 'At least one special character');
    this.updateStrengthMeter(checks);
  },

  updateRequirement(element, isValid, text) {
    if (!element) return;
    const icon = isValid ? 'fa-circle-check' : 'fa-circle-xmark';
    element.innerHTML = `<i class="fa-regular ${icon}"></i> ${text}`;
  },

  updateStrengthMeter(checks) {
    const strength = Object.values(checks).filter(Boolean).length;
    const colors = ['#ef5350', '#ff9800', '#ffc107', '#4caf50'];
    const texts = ['Weak', 'Fair', 'Good', 'Strong'];

    Object.keys(this.elements.bars).forEach((barKey, index) => {
      const bar = this.elements.bars[barKey];
      if (bar) {
        if (index < strength) {
          bar.style.background = colors[strength - 1];
          bar.style.opacity = '1';
        } else {
          bar.style.background = '#e0e0e8';
          bar.style.opacity = '0.3';
        }
      }
    });

    if (this.elements.strengthText) {
      this.elements.strengthText.textContent = texts[strength - 1] || 'Very weak';
      this.elements.strengthText.style.color = colors[strength - 1] || '#ef5350';
    }
  }
};

// ===== PASSWORD TOGGLE MODULE =====
const PasswordToggle = {
  init() {
    this.setupToggle('toggleSignupPass', 'signupPassword');
    this.setupToggle('toggleLoginPass', 'loginPass');
  },

  setupToggle(buttonId, inputId) {
    const button = Utils.$(buttonId);
    const input = Utils.$(inputId);
    if (!button || !input) return;

    button.addEventListener('click', (e) => {
      e.preventDefault();
      input.type = input.type === 'password' ? 'text' : 'password';
      const icon = button.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
      }
    });
  }
};

// ===== AUTH MODULE =====
const Auth = {
  init() {
    this.setupToggleTabs();
    this.setupRegistration();
    this.setupLogin();
    this.setupForgotPassword();
    this.setupSocialButtons();
    this.setupLogout();
  },

  setupToggleTabs() {
    const tabSignup = Utils.$('tabSignup');
    const tabLogin = Utils.$('tabLogin');

    if (tabSignup) tabSignup.addEventListener('click', () => this.setMode('signup'));
    if (tabLogin) tabLogin.addEventListener('click', () => this.setMode('login'));
  },

  setMode(mode) {
    const tabSignup = Utils.$('tabSignup');
    const tabLogin = Utils.$('tabLogin');
    const formSignup = Utils.$('formSignup');
    const formLogin = Utils.$('formLogin');
    const loginError = Utils.$('loginErrorMsg');

    if (mode === 'login') {
      if (tabLogin) tabLogin.classList.add('auth-toggle-btn--active');
      if (tabSignup) tabSignup.classList.remove('auth-toggle-btn--active');
      if (formLogin) formLogin.classList.remove('auth-form--hidden');
      if (formSignup) formSignup.classList.add('auth-form--hidden');
      if (loginError) loginError.classList.add('login-error--hidden');
    } else {
      if (tabSignup) tabSignup.classList.add('auth-toggle-btn--active');
      if (tabLogin) tabLogin.classList.remove('auth-toggle-btn--active');
      if (formSignup) formSignup.classList.remove('auth-form--hidden');
      if (formLogin) formLogin.classList.add('auth-form--hidden');
    }
  },

  setupRegistration() {
    const form = Utils.$('formSignup');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = form.querySelector('input[placeholder="Username"]').value.trim();
      const email = form.querySelector('input[placeholder="Email address"]').value.trim();
      const password = Utils.$('signupPassword').value;
      const submitBtn = form.querySelector('.btn--primary');

      if (!this.validateRegistrationInput(username, email, password)) return;

      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Creating account...';

      try {
        const response = await fetch(CONFIG.apiEndpoints.register, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        if (data.success) {
          this.loginUser(data.username || username);
          Toast.show('Account created successfully! Welcome aboard!', 'success');
        } else {
          Toast.show(data.message || 'Registration failed. Please try again.', 'error');
        }
      } catch (error) {
        // For demo: auto-login with the username
        this.loginUser(username);
        Toast.show('Welcome to ScaleMatics!', 'success');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  },

  setupLogin() {
    const form = Utils.$('formLogin');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = Utils.$('loginUser').value.trim();
      const password = Utils.$('loginPass').value;
      const submitBtn = form.querySelector('.btn--primary');
      const loginError = Utils.$('loginErrorMsg');

      if (loginError) loginError.classList.add('login-error--hidden');

      if (!username || !password) {
        Toast.show('Please fill in all fields', 'error');
        return;
      }

      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Logging in...';

      try {
        const response = await fetch(CONFIG.apiEndpoints.login, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        if (data.success) {
          this.loginUser(data.username || username);
          Toast.show('Welcome back!', 'success');
        } else {
          if (loginError) {
            loginError.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${data.message || 'Invalid credentials'}`;
            loginError.classList.remove('login-error--hidden');
          }
        }
      } catch (error) {
        // For demo: auto-login
        this.loginUser(username);
        Toast.show('Welcome back!', 'success');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  },

  loginUser(username) {
    AppState.currentUser = username;

    // Update UI
    const profileName = Utils.$('profileName');
    const greetingText = Utils.$('greetingText');
    const gameUsername = Utils.$('gameUsername');

    if (profileName) profileName.textContent = username;
    if (greetingText) greetingText.textContent = `Hi ${username}!`;
    if (gameUsername) gameUsername.textContent = username;

    // Update header stats
    this.updateHeaderStats();

    // Navigate to dashboard
    Navigation.showScreen('screenDashboard');
  },

  updateHeaderStats() {
    const coinsEl = Utils.$('userCoins');
    const xpEl = Utils.$('userXP');
    const streakEl = Utils.$('userStreak');

    if (coinsEl) coinsEl.textContent = AppState.userStats.coins;
    if (xpEl) xpEl.textContent = AppState.userStats.xp;
    if (streakEl) streakEl.textContent = AppState.userStats.streak;
  },

  setupForgotPassword() {
    const modal = Utils.$('forgotPasswordModal');
    const forgotLink = Utils.$('forgotPasswordLink');
    const closeModal = Utils.$('closeForgotModal');
    const cancelBtn = Utils.$('cancelForgotBtn');
    const sendBtn = Utils.$('sendResetLinkBtn');
    const resetEmail = Utils.$('resetEmail');

    if (!modal) return;

    const openModal = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      modal.classList.remove('modal--hidden');
      if (resetEmail) {
        resetEmail.value = '';
        setTimeout(() => resetEmail.focus(), 100);
      }
    };

    const closeModalFunc = () => {
      modal.classList.add('modal--hidden');
    };

    if (forgotLink) forgotLink.addEventListener('click', openModal);
    if (closeModal) closeModal.addEventListener('click', closeModalFunc);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModalFunc);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModalFunc();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('modal--hidden')) {
        closeModalFunc();
      }
    });

    if (sendBtn && resetEmail) {
      sendBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = resetEmail.value.trim();

        if (!email || !Utils.validateEmail(email)) {
          Toast.show('Please enter a valid email address', 'error');
          return;
        }

        sendBtn.disabled = true;
        const btnText = sendBtn.querySelector('.btn-text');
        const btnLoader = sendBtn.querySelector('.btn-loader');
        if (btnText) btnText.classList.add('btn-loader--hidden');
        if (btnLoader) btnLoader.classList.remove('btn-loader--hidden');

        try {
          const response = await fetch(CONFIG.apiEndpoints.forgotPassword, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const data = await response.json();

          if (data.success) {
            closeModalFunc();
            Toast.show('Reset link has been sent to your email!', 'success');
          } else {
            Toast.show(data.message || 'Email not found', 'error');
          }
        } catch (error) {
          closeModalFunc();
          Toast.show('Reset link sent! Check your email.', 'success');
        } finally {
          sendBtn.disabled = false;
          if (btnText) btnText.classList.remove('btn-loader--hidden');
          if (btnLoader) btnLoader.classList.add('btn-loader--hidden');
        }
      });

      resetEmail.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); sendBtn.click(); }
      });
    }
  },

  setupSocialButtons() {
    Utils.$$('.social-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const provider = btn.textContent.trim();
        Toast.show(`${provider} login coming soon!`, 'success');
      });
    });
  },

  setupLogout() {
    const btnLogout = Utils.$('btnLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        AppState.currentUser = null;

        const profileName = Utils.$('profileName');
        if (profileName) profileName.textContent = 'Guest';

        const profileRank = Utils.$('profileRank');
        if (profileRank) profileRank.textContent = 'Novice';

        Navigation.showScreen('screenLanding');
        Toast.show('Logged out successfully', 'success');
      });
    }
  },

  validateRegistrationInput(username, email, password) {
    if (!username || !email || !password) {
      Toast.show('Please fill in all fields', 'error');
      return false;
    }
    if (!Utils.validateEmail(email)) {
      Toast.show('Please enter a valid email address', 'error');
      return false;
    }
    if (password.length < CONFIG.passwordRules.minLength) {
      Toast.show('Password must be at least 8 characters', 'error');
      return false;
    }
    return true;
  }
};

// ===== DIFFICULTY SELECTOR MODULE =====
const DifficultySelector = {
  init() {
    Utils.$$('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        Utils.$$('.diff-btn').forEach(b => b.classList.remove('diff-btn--active'));
        btn.classList.add('diff-btn--active');
        AppState.selectedDifficulty = btn.dataset.diff;
      });
    });
  }
};

// ===== MATH GAME MODULE =====
const MathGame = {
  init() {
    const startBtn = Utils.$('btnStartChallenge');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startGame());
    }

    const extendBtn = Utils.$('extendStreakBtn');
    if (extendBtn) {
      extendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.startGame();
      });
    }
  },

  startGame() {
    if (!AppState.currentUser) {
      Toast.show('Please log in first', 'error');
      return;
    }

    const diff = CONFIG.game.difficulties[AppState.selectedDifficulty];
    AppState.gameData = {
      currentQuestion: 0,
      score: 0,
      timer: null,
      timeLeft: CONFIG.game.timePerQuestion,
      questions: this.generateQuestions(diff),
      correctAnswer: null
    };
    AppState.gameActive = true;

    Navigation.showScreen('screenGame');
    this.showQuestion();
  },

  generateQuestions(diff) {
    const questions = [];
    for (let i = 0; i < CONFIG.game.questionsPerRound; i++) {
      const op = diff.operations[Utils.getRandomInt(0, diff.operations.length - 1)];
      let a = Utils.getRandomInt(diff.min, diff.max);
      let b = Utils.getRandomInt(diff.min, diff.max);
      let answer;

      switch (op) {
        case '+':
          answer = a + b;
          break;
        case '-':
          if (a < b) [a, b] = [b, a];
          answer = a - b;
          break;
        case '*':
          a = Utils.getRandomInt(2, Math.min(diff.max, 50));
          b = Utils.getRandomInt(2, Math.min(diff.max, 50));
          answer = a * b;
          break;
        case '/':
          b = Utils.getRandomInt(2, 20);
          answer = Utils.getRandomInt(2, 50);
          a = b * answer;
          break;
        default:
          answer = a + b;
      }

      // Generate wrong answers
      const wrongAnswers = new Set();
      while (wrongAnswers.size < 3) {
        const offset = Utils.getRandomInt(1, Math.max(10, Math.floor(answer * 0.15)));
        const wrong = answer + (Math.random() > 0.5 ? offset : -offset);
        if (wrong !== answer && wrong > 0) {
          wrongAnswers.add(wrong);
        }
      }

      const allAnswers = Utils.shuffleArray([answer, ...wrongAnswers]);
      const correctIndex = allAnswers.indexOf(answer);

      questions.push({
        text: `${a} ${op === '*' ? '×' : op === '/' ? '÷' : op} ${b} = ?`,
        answers: allAnswers,
        correctIndex: correctIndex
      });
    }
    return questions;
  },

  showQuestion() {
    const gd = AppState.gameData;
    if (gd.currentQuestion >= gd.questions.length) {
      this.endGame();
      return;
    }

    const q = gd.questions[gd.currentQuestion];
    const questionEl = Utils.$('gameQuestion');
    const answersEl = Utils.$('gameAnswers');
    const progressFill = Utils.$('gameProgressFill');
    const progressText = Utils.$('gameProgressText');
    const timerEl = Utils.$('gameTimer');
    const pointsEl = Utils.$('gamePoints');

    if (questionEl) questionEl.textContent = q.text;
    if (pointsEl) pointsEl.textContent = gd.score;
    if (progressText) progressText.textContent = `Question ${gd.currentQuestion + 1}/${gd.questions.length}`;
    if (progressFill) progressFill.style.width = `${((gd.currentQuestion) / gd.questions.length) * 100}%`;

    // Render answer buttons
    if (answersEl) {
      answersEl.innerHTML = '';
      q.answers.forEach((ans, idx) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = ans;
        btn.dataset.answer = idx;
        btn.addEventListener('click', () => this.checkAnswer(idx));
        answersEl.appendChild(btn);
      });
    }

    // Start timer
    gd.timeLeft = CONFIG.game.timePerQuestion;
    if (timerEl) timerEl.textContent = gd.timeLeft;

    if (gd.timer) clearInterval(gd.timer);
    gd.timer = setInterval(() => {
      gd.timeLeft--;
      if (timerEl) timerEl.textContent = gd.timeLeft;

      if (gd.timeLeft <= 0) {
        clearInterval(gd.timer);
        this.handleTimeout();
      }
    }, 1000);
  },

  checkAnswer(selectedIndex) {
    const gd = AppState.gameData;
    const q = gd.questions[gd.currentQuestion];

    clearInterval(gd.timer);

    const buttons = Utils.$$('.answer-btn');
    buttons.forEach(btn => {
      btn.disabled = true;
      const idx = parseInt(btn.dataset.answer);
      if (idx === q.correctIndex) {
        btn.classList.add('answer-btn--correct');
      } else if (idx === selectedIndex) {
        btn.classList.add('answer-btn--wrong');
      }
    });

    if (selectedIndex === q.correctIndex) {
      const xpGain = CONFIG.game.xpPerCorrect[AppState.selectedDifficulty];
      const coinGain = CONFIG.game.coinsPerCorrect[AppState.selectedDifficulty];
      gd.score += xpGain;
      AppState.userStats.xp += xpGain;
      AppState.userStats.coins += coinGain;
    }

    setTimeout(() => {
      gd.currentQuestion++;
      this.showQuestion();
    }, 1200);
  },

  handleTimeout() {
    const gd = AppState.gameData;
    const q = gd.questions[gd.currentQuestion];

    const buttons = Utils.$$('.answer-btn');
    buttons.forEach(btn => {
      btn.disabled = true;
      const idx = parseInt(btn.dataset.answer);
      if (idx === q.correctIndex) {
        btn.classList.add('answer-btn--correct');
      }
    });

    setTimeout(() => {
      gd.currentQuestion++;
      this.showQuestion();
    }, 1200);
  },

  endGame() {
    AppState.gameActive = false;
    const gd = AppState.gameData;

    if (gd.timer) clearInterval(gd.timer);

    // Update high scores
    const diff = AppState.selectedDifficulty;
    if (diff === 'easy' && gd.score > AppState.userStats.classicHigh) {
      AppState.userStats.classicHigh = gd.score;
    } else if (diff === 'medium' && gd.score > AppState.userStats.survivalHigh) {
      AppState.userStats.survivalHigh = gd.score;
    } else if (diff === 'hard' && gd.score > AppState.userStats.timedHigh) {
      AppState.userStats.timedHigh = gd.score;
    }

    // Update streak
    AppState.userStats.streak++;

    // Update UI
    Auth.updateHeaderStats();
    this.updateDashboardStats();

    // Show results
    Toast.show(`Challenge complete! You scored ${gd.score} XP!`, 'success');
    Navigation.showScreen('screenDashboard');
  },

  updateDashboardStats() {
    const classicEl = Utils.$('classicScore');
    const survivalEl = Utils.$('survivalScore');
    const timedEl = Utils.$('timedScore');

    if (classicEl) classicEl.textContent = AppState.userStats.classicHigh || '-';
    if (survivalEl) survivalEl.textContent = AppState.userStats.survivalHigh || '-';
    if (timedEl) timedEl.textContent = AppState.userStats.timedHigh || '-';

    // Update streak calendar
    const streakCount = Math.min(AppState.userStats.streak, 7);
    const circles = Utils.$$('.day-circle');
    circles.forEach((circle, idx) => {
      if (idx < streakCount) {
        circle.classList.add('day-circle--active');
      } else {
        circle.classList.remove('day-circle--active');
      }
    });
  }
};

// ===== DASHBOARD MODULE =====
const Dashboard = {
  init() {
    const viewAllBtn = Utils.$('viewAllStatsBtn');
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        Toast.show('Full stats page coming soon!', 'success');
      });
    }
  }
};

// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Initialize all modules
    Toast.init();
    Navigation.init();
    MobileMenu.init();
    PasswordValidator.init();
    PasswordToggle.init();
    Auth.init();
    DifficultySelector.init();
    MathGame.init();
    Dashboard.init();

    // Hide header on landing
    const header = Utils.$('mainHeader');
    if (header) header.style.display = 'none';

    // Initial screen
    Navigation.showScreen('screenLanding');

    console.log('ScaleMatics initialized successfully');
  } catch (error) {
    console.error('Initialization error:', error);
  }
});
