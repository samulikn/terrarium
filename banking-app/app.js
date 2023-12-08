//***** Constants *****/
const storageKey = 'savedAccount';
const API_ROOT = "//localhost:5000/api";

let state = Object.freeze({
    account: null
});

let height = 0;
let width = 0;

const routes = {
    '/login': { templateId: 'login' },
    '/dashboard': { templateId: 'dashboard', init: refreshDashboard },
    '/limit': { templateId: 'limit', init: refreshCredit }
};
//**********/

//***** Routes *****/
function updateRoute() {
    const path = window.location.pathname;
    const route = routes[path];

    if (!route) {
        return navigate('/login');
    }
 
    const template = document.getElementById(route.templateId);

    const view = template.content.cloneNode(true);
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(view);
    document.title = 'Bank App ' + route.templateId;

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

function logout() {
    updateState('account', null);
    navigate('/login');
}
//**********/

//***** API's *****/
async function sendRequest(api, method, body) {
    try {
        const response = await fetch(API_ROOT + api, {
            method: method || 'GET',
            headers: body ? { 'Content-Type': 'application/json' } : undefined,
            body: body
        });
        return await response.json();
    } catch (error) {
        return { error: error.message || 'Unknown error' };
    }
}

async function createAccount(account) {
    return sendRequest('/accounts', 'POST', account);
}

async function getAccount(user) {
    return sendRequest('/accounts/' + encodeURIComponent(user));
}

async function addTransaction(user, transactionData) {
    return sendRequest('/accounts/' + encodeURIComponent(user) + '/transactions', 'POST', transactionData);
}

async function updateLimit(user) {
    const limit = dailyLimit.limitAmount.value;
    const jsonLimitData = JSON.stringify({ "limitAmount": limit });

    return sendRequest('/accounts/' + encodeURIComponent(user), 'PATCH', jsonLimitData);
}
//**********/

//***** Register/Login page *****/
async function register() {
    const registerForm = document.getElementById('registerForm');
    const formData = new FormData(registerForm);
    const data = Object.fromEntries(formData);
    const jsonData = JSON.stringify(data);

    const accountData = await createAccount(jsonData);

    if (accountData.error) {
        return updateElement('registerError', accountData.error);
    }

    updateState('account', accountData);

    navigate('/dashboard');
}

async function login() {
    const loginForm = document.getElementById('loginForm')
    const user = loginForm.username.value;
    const accountData = await getAccount(user);

    if (accountData.error) {
        return updateElement('loginError', accountData.error);
    }

    updateState('account', accountData);

    navigate('/dashboard');
}
//**********/

//***** Needs to rewrite*/
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
        transactions();
    }

    document.addEventListener('keydown', (event) => {
        if (event.code == 'Escape') {
            closeTransactionDialog();
        }
    });
      
}

function showTransactionForm() { 
    console.log('Im here')
    const transactionForm = document.getElementById('transactionDialog');
    const transactionDate = document.getElementById('transactionDate');
    transactionForm.style.display = 'block';
    transactionDate.focus();
}
//**********/

//***** Dashboard *****/
async function refreshDashboard() {
    await updateAccountData();
    updateDashboard();

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

async function transactions() {
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

    const accountData = await getAccount(user);

    updateElement('balance', accountData.balance.toFixed(2));
    
    const transactionsRows = document.createDocumentFragment();
    for (const transaction of accountData.transactions) {
        const transactionRow = createTransactionRow(transaction);
        transactionsRows.appendChild(transactionRow);
    }
    updateElement('transactions', transactionsRows);
}

function closeTransactionDialog() {
    const modal = document.getElementById('transactionDialog');
    updateElement('transactionError', '');
    modal.style.display = 'none';
} 
//**********/ 

//***** Credit *****/
async function limit() {
    const user = state.account.user;
    const accountData = await updateLimit(user);

    if (accountData.error) {
        return updateElement('creditError', accountData.error);
    }

    updateState('account', accountData);

    updateElement('prevLimit', accountData.limitAmount);
}

async function refreshCredit() {
    await updateAccountData();
    updateCredit();
}
//**********/

//***** Update elements/account data */
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

function updateState(property, newData) {
    state = Object.freeze({
        ...state,
        [property]: newData
    });

    localStorage.setItem(storageKey, JSON.stringify(state.account));
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
//**********/

//***** Drag/drop interface */
function getPageSize() {
    width = window.innerWidth;
    height = window.innerHeight;
};

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
//***********/

function init() {
    const savedState = localStorage.getItem(storageKey);

    if (savedState) {
        updateState('account', JSON.parse(savedState));
    }

    window.onpopstate = () => updateRoute();
    updateRoute();
}

init();