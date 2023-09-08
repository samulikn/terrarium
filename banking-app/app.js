let state = Object.freeze({
    account: null
});
const storageKey = 'savedAccount';
const API_ROOT = "//localhost:5000/api";

let height = 0;
let width = 0;

const routes = {
    '/login': { templateId: 'login' },
    '/dashboard': { templateId: 'dashboard', init: refreshDashboard },
    '/limit': { templateId: 'limit', init: refreshCredit }
};


function updateRoute() {
    const path = window.location.pathname;
    const route = routes[path];

    if (!route) {
        return navigate('/dashboard');
    }
 
    const template = document.getElementById(route.templateId);

    const view = template.content.cloneNode(true);
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(view);
    document.title = 'Bank App ' + template.id;

    if (typeof route.init === 'function') {
        route.init();
    }
}

function navigate(path) {
    window.history.pushState({}, path, path);
    updateRoute();
}

function onLinkClick(event) {
    event.preventDefault();
    navigate(event.target.href);
}

async function register() {
    const registerForm = document.getElementById('registerForm');
    const formData = new FormData(registerForm);
    const data = Object.fromEntries(formData);
    const jsonData = JSON.stringify(data);

    const result = await createAccount(jsonData);

    if (result.error) {
        return updateElement('registerError', result.error);
    }

    // console.log('Account created!', result);

    updateState('account', result);

    navigate('/dashboard');
}

async function createAccount(account) {
    try {
        const response = await fetch(`${API_ROOT}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: account
        });
        return await response.json();
    } catch (error) {
        return { error: error.message || 'Unknown error' };
    }
}

async function login() {
    const loginForm = document.getElementById('loginForm')
    const user = loginForm.username.value;
    const data = await getAccount(user);

    if (data.error) {
        return updateElement('loginError', data.error);
    }

    updateState('account', data);

    navigate('/dashboard');
}

async function getAccount(user) {
    try {
        const response = await fetch(`${API_ROOT}/accounts/` + encodeURIComponent(user));
        return await response.json();
    } catch (error) {
        return { error: error.message || 'Unknown error' };
    }
}

function updateElement(id, textOrNode) {
    const element = document.getElementById(id);
    element.textContent = '';
    element.append(textOrNode);
}

function updateDashboard() {
    const account = state.account;

    if (!account) {
        return logout();
    }

    updateElement('description', account.description);
    updateElement('balance', account.balance.toFixed(2));
    updateElement('currency', account.currency);

    const transactionsRows = document.createDocumentFragment();
    for (const transaction of account.transactions) {
        const transactionRow = createTransactionRow(transaction);
        transactionsRows.appendChild(transactionRow);
    }
    updateElement('transactions', transactionsRows);

    const dialogBox = document.getElementById('transactionDialog');
    const dialogHeader = document.getElementById('dialogHeader');
 
    getPageSize();
    
    DraggingHandler(dialogHeader, dialogBox);
    
    function getPageSize() {
        width = window.innerWidth;
        height = window.innerHeight;
    };
}

function onClickEvent(event) { 
    event.preventDefault();

    const transactionForm = document.getElementById('transactionDialog');
    const showTransactionForm = document.getElementById('showTransactionDialog');
    const cancelTransaction = document.getElementById('closeTransactionDialog');
    const saveTransaction = document.getElementById('sendTransaction');

    const transactionDate = document.getElementById('transactionDate');

    if (event.target == cancelTransaction) {
        closeTransactionDialog();
    }
    
    if (event.target == showTransactionForm) {
        
        transactionForm.style.display = 'block';
        transactionDate.focus();
    }
    
    if (event.target == saveTransaction) { 
        sendTransaction();
    }

    document.addEventListener('keydown', (event) => {
        if (event.code == 'Escape') {
            closeTransactionDialog();
        }
    });
      
}

function closeTransactionDialog() {
    const modal = document.getElementById('transactionDialog');
    updateElement('transactionError', '');
    modal.style.display = 'none';
} 

function createTransactionRow(transaction) {
    const template = document.getElementById('transaction');
    const transactionRow = template.content.cloneNode(true);
    const tr = transactionRow.querySelector('tr');
    tr.children[0].textContent = transaction.date;
    tr.children[1].textContent = transaction.object;
    tr.children[2].textContent = transaction.amount.toFixed(2);
    return transactionRow;
}

async function sendTransaction() {
    const transactionForm = document.getElementById('transactionDetails');
    const formData = new FormData(transactionForm);
    const data = Object.fromEntries(formData);
    const jsonData = JSON.stringify(data);

    const user = state.account.user;
    const result = await addTransaction(user, jsonData);

    if (result.error) {
        return updateElement('transactionError', result.error);
    }

    closeTransactionDialog(transactionForm);

    const updatedData = await getAccount(user);

    updateElement('balance', updatedData.balance.toFixed(2));
    
    const transactionsRows = document.createDocumentFragment();
    for (const transaction of updatedData.transactions) {
        const transactionRow = createTransactionRow(transaction);
        transactionsRows.appendChild(transactionRow);
    }
    updateElement('transactions', transactionsRows);


}
 
async function addTransaction(user, transactionData) {
    try { 
        const response = await fetch(`${API_ROOT}/accounts/` + encodeURIComponent(user) + '/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: transactionData
        });
        return await response.json();
    } catch (error) {
        return { error: error.message || 'Unknown error' };
    }
    // console.log(user, data)
}

function DraggingHandler(dialogHeader, dialogBox) {
    var relX = 0, relY = 0, absX = 0, absY = 0;
    
    if (dialogHeader) {
        dialogHeader.onmousedown = pointerDrag;
    }

    function pointerDrag(e) {
        // e = e || window.event;
        e.preventDefault();
        absX = Math.round(e.clientX);
        absY = Math.round(e.clientY);
        document.onmouseup = stopElementDrag;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        // e = e || window.event;
        e.preventDefault();

        const boundingDialogbox = dialogBox.getBoundingClientRect()

        let x = Math.round(e.clientX);
        let y = Math.round(e.clientY);
        relX = absX - x;
        relY = absY - y;
        absX = x;
        

        const isGoingBelowBottom = relY < 0 && (boundingDialogbox.bottom - relY) > height;
        const isGoingAboveTop = relY > 0 && (boundingDialogbox.top - relY) < 0;

        if (isGoingBelowBottom || isGoingAboveTop) {
            relY = 0
        } else {
            absY = y;
            dialogBox.style.top = dialogBox.offsetTop - relY + "px";
        }

        const isGoingOutsideLeft = relX < 0 && (boundingDialogbox.right - relX) > width;
        const isGoingOutsideRight = relX > 0 && (boundingDialogbox.left - relX) < 0;

        if (isGoingOutsideLeft || isGoingOutsideRight) {
            relX = 0
        } else {
            absX = x;
            dialogBox.style.left = dialogBox.offsetLeft - relX + "px";;
        }
    }

    function stopElementDrag() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function updateCredit() {
    const account = state.account;
    if (!account) {
        return logout();
    }

    updateElement('limitCurrency', account.currency);
    updateElement('limitAmount', account.limitAmount);
    updateElement('prevLimit', account.limitAmount);
    updateElement('prevLimitCurrency', account.currency);

}

async function saveLimit() {
    const user = state.account.user;
    const accountData = await modifyLimit(user);

    if (accountData.error) {
        return updateElement('creditError', accountData.error);
    }

    updateState('account', accountData);

    updateElement('prevLimit', accountData.limitAmount);
}

async function modifyLimit(user) { 
    const limit = dailyLimit.limitAmount.value;
    try {
        const response = await fetch(`${API_ROOT}/accounts/` + encodeURIComponent(user), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "limitAmount": limit })
        });
        return await response.json();
    } catch (error) {
        return { error: error.message || 'Unknown error' };

    }
}


 // save account data in local storage
function updateState(property, newData) {
    state = Object.freeze({
        ...state,
        [property]: newData
    });

    localStorage.setItem(storageKey, JSON.stringify(state.account));

    //console.log(state)
}

function logout() {
    updateState('account', null);
    navigate('/login');
}

async function updateAccountData() {
    const account = state.account;
    if (!account) {
        return logout();
    }

    const data = await getAccount(account.user);
    if (data.error) {
        return logout();
    }

    updateState('account', data);
}

async function refreshDashboard() {
    await updateAccountData();
    updateDashboard();

}

async function refreshCredit() {
    await updateAccountData();
    updateCredit();

}

function init() {
    const savedAccountData = localStorage.getItem(storageKey);
    // console.log(savedAccountData)
    if (savedAccountData) {
        updateState('account', JSON.parse(savedAccountData));
    }

    window.onpopstate = () => updateRoute();
    updateRoute();
}

init();