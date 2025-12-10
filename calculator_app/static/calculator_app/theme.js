document.addEventListener('DOMContentLoaded', () => {
    const display = document.querySelector('.calc-display');
    const historyDiv = document.getElementById('calc_history');
    const historyToggle = document.getElementById('history_toggle');
    const buttons = document.querySelectorAll('button');
    const indicator1 = document.getElementById('indicator1');
    const indicator2 = document.getElementById('indicator2');
    const indicator3 = document.getElementById('indicator3');
    const bar = document.getElementById('bar');
    let currentInput = '';
    let history = []; // Session-only, cleared on refresh
    let historyVisible = false;
    let shouldClearOnNextInput = false; // Flag to clear result before new input

    // Load saved theme only (history is session-based)
    const savedTheme = localStorage.getItem('calculatorTheme') || '1';
    setTheme(savedTheme);

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        e.preventDefault();

        // Numbers and operators
        if (/^[0-9]$/.test(e.key)) {
            handleInput(e.key);
        } else if (e.key === '.') {
            handleInput('.');
        } else if (e.key === '+' || e.key === '-' || e.key === '/' || e.key === '*') {
            handleInput(e.key === '*' ? 'x' : e.key);
        } else if (e.key === 'Enter' || e.key === '=') {
            handleEquals();
        } else if (e.key === 'Backspace') {
            handleDelete();
        } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
            handleReset();
        }
    });

    // History toggle functionality
    historyToggle.addEventListener('click', () => {
        historyVisible = !historyVisible;
        if (historyVisible) {
            historyDiv.classList.add('show');
            historyDiv.classList.remove('hide');
            historyToggle.classList.add('open');
        } else {
            historyDiv.classList.remove('show');
            historyDiv.classList.add('hide');
            historyToggle.classList.remove('open');
        }
    });

    // Theme switching - click on indicators
    indicator1.addEventListener('click', () => {
        setTheme('1');
        localStorage.setItem('calculatorTheme', '1');
    });

    indicator2.addEventListener('click', () => {
        setTheme('2');
        localStorage.setItem('calculatorTheme', '2');
    });

    indicator3.addEventListener('click', () => {
        setTheme('3');
        localStorage.setItem('calculatorTheme', '3');
    });

    function setTheme(themeNumber) {
        // Move the bar based on theme
        if (themeNumber === '1') {
            bar.style.left = '8px';
            bar.style.transform = 'none';
            document.body.removeAttribute('data-theme');
        } else if (themeNumber === '2') {
            bar.style.left = '50%';
            bar.style.transform = 'translateX(-50%)';
            document.body.setAttribute('data-theme', '2');
        } else if (themeNumber === '3') {
            bar.style.left = 'calc(100% - 24px)';
            bar.style.transform = 'none';
            document.body.setAttribute('data-theme', '3');
        }
    }

    function displayHistory() {
        if (history.length === 0) {
            historyDiv.innerHTML = '<div style="opacity: 0.5;">No history yet</div>';
            return;
        }

        // Show last 5 calculations
        const recentHistory = history.slice(-5).reverse();
        historyDiv.innerHTML = recentHistory.map(item =>
            `<div>${item}</div>`
        ).join('');
    }

    function addToHistory(expression, result) {
        const historyEntry = `${expression} = ${result}`;
        history.push(historyEntry);

        // Keep only last 10 calculations
        if (history.length > 10) {
            history.shift();
        }

        // Update history display (but don't auto-show)
        displayHistory();
    }

    function handleInput(value) {
        // If we just got a result, clear it before accepting new input
        if (shouldClearOnNextInput) {
            currentInput = '';
            shouldClearOnNextInput = false;
        }

        // Prevent multiple decimals in a row
        const lastOperatorIndex = Math.max(
            currentInput.lastIndexOf('+'),
            currentInput.lastIndexOf('-'),
            currentInput.lastIndexOf('x'),
            currentInput.lastIndexOf('/')
        );
        const currentNumber = currentInput.substring(lastOperatorIndex + 1);

        if (value === '.' && currentNumber.includes('.')) return;

        currentInput += value;
        display.innerText = currentInput;
    }

    function handleDelete() {
        currentInput = currentInput.slice(0, -1);
        display.innerText = currentInput;
        shouldClearOnNextInput = false; // Cancel clear flag when manually editing
    }

    function handleReset() {
        currentInput = '';
        display.innerText = '';
        shouldClearOnNextInput = false;
    }

    function handleEquals() {
        if (!currentInput) return;

        const expressionForDisplay = currentInput;

        // Send to backend
        fetch('/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': getCSRFToken()
            },
            body: `expression=${encodeURIComponent(currentInput)}`
        })
            .then(response => response.json())
            .then(data => {
                if (data.result !== 'Error') {
                    display.innerText = data.result;
                    addToHistory(expressionForDisplay, data.result);
                    currentInput = data.result;
                    shouldClearOnNextInput = true; // Set flag to clear on next number input
                } else {
                    display.innerText = 'Error';
                    currentInput = '';
                    shouldClearOnNextInput = false;
                }
            });
    }

    // Calculator button logic
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.innerText;

            if (value === 'DEL') {
                handleDelete();
            } else if (value === 'RESET') {
                handleReset();
            } else if (value === '=') {
                handleEquals();
            } else {
                handleInput(value);
            }
        });
    });

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function getCSRFToken() {
        // Try to get from hidden input first (most reliable)
        const csrfInput = document.querySelector('[name="csrfmiddlewaretoken"]');
        if (csrfInput) {
            return csrfInput.value;
        }
        // Fallback to cookie
        return getCookie('csrftoken');
    }
});
